/* eslint-disable prefer-const */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-plusplus */
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { nanoid } from 'nanoid';

import { paginationConfig } from 'src/common/pagination.config';
import { Voucher } from './schema/voucher.schema';
import {
  FilterQuery, createVoucherDto,
} from './dto';
import { Currency, VoucherPaymentStatus } from 'src/common/enum';
import { ExternalApiFilterQuery } from 'src/common/query-handler/external-api-filter.query';
import { ExternalApiPostQuery } from 'src/common/query-handler/externalapi-post.query';
import { generateRandomCode } from 'src/common/utils/randomCode.generator';
import { remainingAmountCalculation } from 'src/common/utils/remaining-amount-calculation';
import { queryhandler, updateMany, updateWhere } from 'src/core/helper/query-helper';
import { disSelect } from 'src/common/utils/select.handling';
import { ServerErrors } from 'src/common/constant';
import { UpdateFieldInterface } from './interface';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';
import { PaymentsService } from 'src/services/payments/payments.service';
import { PaymentPurpose } from 'src/services/payments/payments.type';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { User } from 'src/modules/users/schema/users.schema';
import { UsersService } from 'src/modules/users/users.services';
import { UpdateVoucherBalance } from 'src/modules/vouchers/dto/update-voucher-balance.dto';

@Injectable()
export class VoucherService {
  constructor(
    @InjectModel('Voucher')
    private readonly VoucherModel: Model<Voucher>,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentService: PaymentsService,
    private readonly campaignService: CampaignService,
    private readonly usersService: UsersService,
    private mailchimpService: MailChimpService,
  ) { }

  async create(
    dto: createVoucherDto,
    userId: string | null,
    campaignId?: mongoose.Types.ObjectId,
  ) {
    let i: number = 0;
    const voucherId: any = [];
    const totalAmount = dto.noOfVoucher * dto.amount;
    for (i = 0; i < dto.noOfVoucher; i++) {
      const randomCode = generateRandomCode(12);
      const code = dto?.campCode ? dto.campCode + randomCode : `TAV8${randomCode}`;
      const newVoucher = new this.VoucherModel({
        ...dto,
        code,
        remainingAmount: dto.amount,
        campId: campaignId || null,
        createdBy: userId,
      });
      newVoucher.save();
      voucherId.push(newVoucher._id);
    }

    const paymentLink = await this.paymentService.generateLink(totalAmount, Currency.ILS, PaymentPurpose.VOUCHER, voucherId);

    if (dto.email) {
      await this.mailchimpService.sendTransactionalEmail({
        subject: 'Payment Success | Voucher - MetGo',
        to: dto.email,
        text: `Dear ${dto.name}, \n Your payment has been successfully received.`,
      });

      await this.mailchimpService.sendTransactionalEmail({
        subject: 'Voucher Confirmed - MetGo',
        to: dto.email,
        text: `Dear ${dto.name}, \n ${dto.noOfVoucher} vouchers with campaign code - ${dto.campCode} has been created successfully. Each voucher's worth is ${dto.amount}.`,
      });
    }

    return paymentLink;
  }

  async getOne(code: string, externalApi?:boolean) {
    const select = disSelect;
    const populate = {
      path: 'campId',
      select: `${disSelect}`,
    };
    const voucher = await this.VoucherModel.findOne({ code }).select(select).populate(populate).exec();
    if (!voucher) {
      throw new BadRequestException(ServerErrors.VOUCHER.NOT_FOUND);
    }

    if (voucher.paymentStatus !== VoucherPaymentStatus.PAID) {
      throw new ForbiddenException(ServerErrors.VOUCHER.UNPAID);
    }

    if (externalApi) {
      return {
        remainingAmount: voucher.remainingAmount,
        expireDate: voucher.expireDate,
        paymentStatus: voucher.paymentStatus,
        status: voucher.status,
      };
    }
    return voucher;
  }

  async getOneById(id: string): Promise<Voucher> {
    try {
      const select = disSelect;
      const populate = {
        path: 'campId',
        select: `${disSelect}`,
      };
      const voucher = await this.VoucherModel.findById(id).select(select).populate(populate).exec();

      return voucher;
    } catch (err) {
      throw new BadRequestException(ServerErrors.VOUCHER.NOT_FOUND);
    }
  }

  async getMy(userId: string, queries: FilterQuery, assignedToMe?: boolean) {
    const {
      page, limit, search, ...query
    } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    const select = disSelect;

    let findQuery: any = { ...query, createdBy: userId };
    delete findQuery?.identifierId;

    const populate = {
      path: 'campId',
      select: `${disSelect}`,
    };
    let populate1: {};

    if (assignedToMe) {
      findQuery = {
        ...findQuery,
        assignedTo: new mongoose.Types.ObjectId(userId),
      };
      delete findQuery?.createdBy;
      delete findQuery?.status;
    }

    if (search) {
      findQuery = {
        ...findQuery,
        name: { $regex: search, $options: 'i' },
      };
    }

    const voucher = await queryhandler<Voucher>(
      this.VoucherModel,
      findQuery,
      select,
      queryPage,
      queryLimit,
      populate,
      populate1,
    );
    return voucher;
  }

  async getMyVoucherForExternalApi(userId: string, queries: ExternalApiFilterQuery) {
    const {
      page, limit, ...query
    } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    const select = disSelect;

    let findQuery: any = { ...query, assignedTo: userId };
    delete findQuery?.identifierId;

    const populate = {
      path: 'campId',
      select: `${disSelect}`,
    };
    let populate1: {};

    const voucher = await queryhandler<Voucher>(
      this.VoucherModel,
      findQuery,
      select,
      queryPage,
      queryLimit,
      populate,
      populate1,
    );
    return voucher;
  }

  async assignUser(code: string, updateField: UpdateFieldInterface, user?: User | null) {
    const filterQuery = {
      code,
      assignedTo: null,
    };
    const assignUser = await updateWhere<Voucher>(this.VoucherModel, filterQuery, updateField);

    if (!assignUser) {
      throw new NotFoundException(ServerErrors.VOUCHER.NOT_FOUND);
    }

    const email = user ? user?.email : updateField.waitingUserEmail;
    const name = user ? user?.firstName : 'User';
    await this.mailchimpService.sendTransactionalEmail({
      subject: 'Voucher Assigned - MetGo',
      to: email,
      text: `Dear ${name}, \n Voucher with campaign code - ${code} has been assigned to you.`,
    });

    return assignUser;
  }

  async update(id: mongoose.Types.ObjectId[], updateField: object) {
    const updateVoucher = await updateMany<Voucher>(
      this.VoucherModel,
      '_id',
      id,
      updateField,
    );

    if (!updateVoucher) {
      throw new BadRequestException(ServerErrors.VOUCHER.NOT_FOUND);
    }
  }

  async findByIds(ids: string[]): Promise<Voucher[]> {
    const populate = {
      path: 'campId',
      select: `${disSelect}`,
    };
    const voucherIds = await this.VoucherModel.find({ _id: { $in: ids } }).populate(populate).exec();

    return voucherIds;
  }

  async updateVoucherAmount(loggedInUserId: string | null, voucherId: string, totalAmount: number) {
    const voucher = await this.getOneById(voucherId);

    const remainingAmount = remainingAmountCalculation(voucher.remainingAmount, totalAmount);
    const amountToBeRedeemed = remainingAmountCalculation(totalAmount, voucher.remainingAmount);

    const updatedVoucher = await this.VoucherModel.findOneAndUpdate(
      { _id: voucherId },
      {
        updatedBy: loggedInUserId,
        updatedAt: new Date(),
        remainingAmount,
      },
      { new: true },
    );

    if (!updatedVoucher) {
      throw new NotFoundException(ServerErrors.VOUCHER.NOT_FOUND);
    }

    return {
      amountToBeRedeemed,
      redeemedAmount: totalAmount - amountToBeRedeemed,
    };
  }

  async purchaseVoucherForExternalApi(
    dto: createVoucherDto,
    query: ExternalApiPostQuery,
    userId: string,
  ) {
    const campaign = await this.campaignService.findAndReturn('code', dto.campCode);

    let i: number = 0;
    const voucherId: any = [];
    const totalAmount = dto.noOfVoucher * dto.amount;
    for (i = 0; i < dto.noOfVoucher; i++) {
      const randomCode = generateRandomCode(12);
      const code = dto?.campCode ? dto.campCode + randomCode : `TAV8${randomCode}`;
      const newVoucher = new this.VoucherModel({
        ...dto,
        code,
        remainingAmount: dto.amount,
        campId: campaign._id,
        createdBy: userId,
        identifierId: query.identifierId,
      });
      newVoucher.save();
      voucherId.push(newVoucher._id);
    }

    const [user, paymentLink] = await Promise.all([
      this.usersService.createByExternalApi({
        email: dto.email,
        password: nanoid(9),
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
        countryCode: '',
      }),
      this.paymentService.generateLink(
        totalAmount,
        Currency.ILS,
        PaymentPurpose.VOUCHER,
        voucherId,
      ),
    ]);

    if (paymentLink && dto.email) {
      await this.mailchimpService.sendTransactionalEmail({
        subject: 'Voucher Assigned - MetGo',
        to: user.email,
        text: `Dear ${user.firstName}, \n ${dto.noOfVoucher} vouchers with campaign code - ${dto.campCode} has been assigned to you. Each voucher's worth is ${dto.amount}.`,
      });
    }

    return paymentLink;
  }

  async updateVoucherAmountByExternalApi(
    loggedInUserId: string,
    query: ExternalApiPostQuery,
    body: UpdateVoucherBalance,
  ) {
    const voucher = await this.getOneById(body.voucherId);

    if (body.amount > voucher.remainingAmount) {
      throw new UnprocessableEntityException(ServerErrors.VOUCHER.CANNOT_UPDATE_BALANCE);
    }

    const remainingAmount = remainingAmountCalculation(voucher.remainingAmount, body.amount);
    const amountToBeRedeemed = remainingAmountCalculation(body.amount, voucher.remainingAmount);

    await this.VoucherModel.findOneAndUpdate(
      { _id: body.voucherId },
      {
        updatedBy: loggedInUserId,
        updatedAt: new Date(),
        remainingAmount,
        identifierId: query.identifierId,
      },
      { new: true },
    );

    return {
      amountToBeRedeemed,
      redeemedAmount: body.amount - amountToBeRedeemed,
    };
  }
}
