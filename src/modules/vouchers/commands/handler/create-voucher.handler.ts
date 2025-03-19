import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { Currency, Locale, VoucherStatus } from 'src/common/enum';
import { twoYearExpireDate } from 'src/common/expireDate';
import { generateRandomCode } from 'src/common/utils/randomCode.generator';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { UsersService } from 'src/modules/users/users.services';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { CreateVouchersCommand } from '../create-voucher.command';
import { Voucher } from '../../schema/voucher.schema';
import { PaymentPurpose } from 'src/services/payments/payments.type';
import { PaymentsService } from 'src/services/payments/payments.service';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';

@CommandHandler(CreateVouchersCommand)
export class CreateVouchersHandler
implements ICommandHandler<CreateVouchersCommand> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel('Voucher')
    private readonly VoucherModel: Model<Voucher>,
    private readonly paymentService: PaymentsService,
    private readonly usersService: UsersService,
    private readonly campaignService: CampaignService,
    private readonly externalApiService: ExternalApiServices,
  ) {}

  async execute(command: CreateVouchersCommand): Promise<any> {
    const { loggedInUser, body } = command;
    try {
      if (!body.assigneeEmail && !body.assigneePhone) {
        throw new BadRequestException(
          'Please enter email or phone number of assignee',
        );
      }

      const campId = (
        await this.campaignService.findAndReturn('code', body.campCode)
      )._id;

      const externalApiId = (
        await this.externalApiService.findByIdentifierId(body.identifierId)
      )._id;

      if (loggedInUser) {
        // set createdUserId as loggedInUserId
      }

      const [createdUserId, assigneeUserId] = await Promise.all([
        (await this.usersService.findByEmailOrNull(body.creatorEmail))?._id,
        (await this.usersService.findByEmailOrNull(body.assigneeEmail))?._id,
      ]);

      const voucherId: any = [];
      const totalAmount = body.noOfVoucher * body.amount;
      await Promise.all(
        Array.from({ length: body.noOfVoucher }).map(async () => {
          const randomCode = generateRandomCode(12);
          const code = body.campCode + randomCode;
          const newVoucher = new this.VoucherModel({
            noOfVoucher: body.noOfVoucher,
            amount: body.amount,
            remainingAmount: body.amount,
            status: VoucherStatus.ASSIGNED,
            code,
            campId,
            externalApiId,
            createdAt: new Date(),
            expireDate: twoYearExpireDate(),
            creatorInfo: {
              id: createdUserId,
              name: body.creatorName,
              countryCode: body.creatorPhone
                ? body.creatorCountryCode || '972'
                : null,
              phone: body.creatorPhone,
              email: body.creatorEmail,
              createdAt: new Date(),
            },
            assigneeInfo: {
              id: assigneeUserId,
              name: body.assigneeName,
              countryCode: body.assigneePhone
                ? body.assigneeCountryCode || '972'
                : null,
              phone: body.assigneePhone,
              email: body.assigneeEmail,
              assignedAt: new Date(),
            },
          });
          await newVoucher.save();
          await voucherId.push(newVoucher._id);
        }),
      );

      this.logger.info('[VOUCHER]: CREATED', { message: voucherId });

      const paymentLink = await this.paymentService.generateLink({
        amount: totalAmount,
        currency: Currency.ILS,
        purpose: PaymentPurpose.VOUCHER,
        id: voucherId,
        customerEmail: body.creatorEmail,
        customerName: body.creatorName,
        languagePreference: body?.languagePreference || Locale.ENGLISH,
      });

      this.logger.info('[VOUCHER]: PAYMENT LINK SENT', { message: voucherId });
      return paymentLink;
    } catch (err) {
      this.logger.error('[VOUCHER]: FAILED TO CREATE', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }
}
