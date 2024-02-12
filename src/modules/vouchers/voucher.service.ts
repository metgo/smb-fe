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

import { EnglishTemplate, HebrewTemplate } from 'src/common/mailchimp/templateId';
import { paginationConfig } from 'src/common/pagination.config';
import { Voucher } from './schema/voucher.schema';
import { Currency, Locale, PaymentStatus, VoucherPaymentStatus } from 'src/common/enum';
import { ExternalApiPostQuery } from 'src/common/query-handler/externalapi-post.query';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { generateRandomCode } from 'src/common/utils/randomCode.generator';
import { remainingAmountCalculation } from 'src/common/utils/remaining-amount-calculation';
import { queryhandler, updateMany, updateWhere } from 'src/core/helper/query-helper';
import { disSelect } from 'src/common/utils/select.handling';
import { ServerErrors } from 'src/common/constant';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';
import { PaymentsService } from 'src/services/payments/payments.service';
import { PaymentPurpose } from 'src/services/payments/payments.type';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { CampaignSegmentService } from 'src/modules/campaign-segments/campaignSegment.service';
import { UsersService } from 'src/modules/users/users.services';
import {
  createVoucherDto, UpdateVoucherBalance,
} from 'src/modules/vouchers/dto';
import { AssignVoucherCommand, GetOneVoucherInterface } from 'src/modules/vouchers/interface';
import { GetMyAssignedVouchersQuery, GetMyCreatedVouchersQuery, GetMyVouchersExternalApiQuery } from 'src/modules/vouchers/queries';

@Injectable()
export class VoucherService {
  constructor(
    @InjectModel('Voucher')
    private readonly VoucherModel: Model<Voucher>,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentService: PaymentsService,
    private readonly campaignService: CampaignService,
    private readonly campaignSegmentService: CampaignSegmentService,
    private readonly usersService: UsersService,
    private mailchimpService: MailChimpService,
  ) { }

  // eslint-disable-next-line consistent-return
  async create(
    dto: createVoucherDto,
    user: LoggedInUserInterface,
    campaignId?: mongoose.Types.ObjectId,
  ) {
    try {
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
          createdBy: user?.id || null,
        });
        newVoucher.save();
        voucherId.push(newVoucher._id);
      }

      const paymentLink = await this.paymentService.generateLink({
        amount: totalAmount,
        currency: Currency.ILS,
        purpose: PaymentPurpose.VOUCHER,
        id: voucherId,
        customerEmail: dto.email,
        customerName: dto.name,
        loggedInUserLanguagePreference: user.languagePreference,
      });

      return paymentLink;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  // eslint-disable-next-line consistent-return
  async getOne(query: GetOneVoucherInterface) {
    try {
      const { code, externalApi, productId } = query;
      const select = disSelect;
      const populate = {
        path: 'campId',
        select: `${disSelect}`,
      };

      let findQuery:any = {
        code,
      };

      if (productId) {
        // get all the campId from campaignSegment the productId is associated to
        const campaignIds = await this.campaignSegmentService.getCampaignAssociatedToProduct(productId);

        const campIds = Array.isArray(campaignIds)
          ? campaignIds.map(item => new mongoose.Types.ObjectId(item))
          : [new mongoose.Types.ObjectId(campaignIds)];

        findQuery = {
          ...findQuery,
          campId: { $in: campIds },
        };
      }

      const voucher = await this.VoucherModel
        .findOne(findQuery)
        .select(select)
        .populate(populate)
        .exec();
      if (!voucher) {
        throw new BadRequestException(ServerErrors.VOUCHER.NOT_FOUND);
      }

      if (voucher.paymentStatus !== VoucherPaymentStatus.PAID) {
        throw new ForbiddenException(ServerErrors.VOUCHER.UNPAID);
      }

      if (externalApi) {
        return {
          id: voucher._id,
          remainingAmount: voucher.remainingAmount,
          expireDate: voucher.expireDate,
          paymentStatus: voucher.paymentStatus,
          status: voucher.status,
        };
      }
      return voucher;
    } catch (err) {
      exceptionHandling(err);
    }
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

  async getVouchersCreatedByMe(userId: string, queries: GetMyCreatedVouchersQuery) {
    const {
      page, limit, campId, search, productId, ...query
    } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    const select = disSelect;

    let findQuery: any = { ...query, createdBy: userId };

    const populate = {
      path: 'campId',
      select: `${disSelect}`,
    };
    let populate1: {};

    if (campId) {
      const campIds = Array.isArray(campId)
        ? campId.map(item => new mongoose.Types.ObjectId(item))
        : [new mongoose.Types.ObjectId(campId)];

      findQuery = {
        ...findQuery,
        campId: { $in: campIds },
      };
    }

    if (search) {
      findQuery = {
        ...findQuery,
        name: { $regex: search, $options: 'i' },
      };
    }

    const voucher = await queryhandler<Voucher>(
      this.VoucherModel,
      {
        findQuery,
        select,
        page: queryPage,
        limit: queryLimit,
        populate,
        populate1,
      },
    );

    return voucher;
  }

  async getVouchersAssignedToMe(userId: string, queries: GetMyAssignedVouchersQuery | GetMyVouchersExternalApiQuery) {
    const {
      page, limit, search, campId, productId, ...query
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

    let campIdsFromProductId;
    if (productId) {
      // get all the campId from campaignSegment the productId is associated to
      campIdsFromProductId = await this.campaignSegmentService.getCampaignAssociatedToProduct(productId);
    }

    if (campId) {
      let campIds = Array.isArray(campId)
        ? campId.map(item => new mongoose.Types.ObjectId(item))
        : [new mongoose.Types.ObjectId(campId)];

      if (campIdsFromProductId) {
        campIds = [...campIds, campIdsFromProductId];
      }
      findQuery = {
        ...findQuery,
        campId: { $in: campIds },
      };
    }

    if (!campId && campIdsFromProductId?.length) {
      findQuery = {
        ...findQuery,
        campId: { $in: campIdsFromProductId },
      };
    }

    if (search) {
      findQuery = {
        ...findQuery,
        name: { $regex: search, $options: 'i' },
      };
    }
    const voucher = await queryhandler<Voucher>(
      this.VoucherModel,
      {
        findQuery,
        select,
        page: queryPage,
        limit: queryLimit,
        populate,
        populate1,
      },

    );
    return voucher;
  }

  async getVoucherCreatedByMe(userId: string, queries: GetMyAssignedVouchersQuery | GetMyVouchersExternalApiQuery) {
    const {
      page, limit, search, campId, productId, ...query
    } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    const select = disSelect;

    let findQuery: any = { ...query, createdBy: userId, paymentStatus: PaymentStatus.SUCCESS };
    delete findQuery?.identifierId;

    const populate = {
      path: 'campId',
      select: `${disSelect}`,
    };
    let populate1: {};

    let campIdsFromProductId;
    if (productId) {
      // get all the campId from campaignSegment the productId is associated to
      campIdsFromProductId = await this.campaignSegmentService.getCampaignAssociatedToProduct(productId);
    }

    if (campId) {
      let campIds = Array.isArray(campId)
        ? campId.map(item => new mongoose.Types.ObjectId(item))
        : [new mongoose.Types.ObjectId(campId)];

      if (campIdsFromProductId) {
        campIds = [...campIds, campIdsFromProductId];
      }
      findQuery = {
        ...findQuery,
        campId: { $in: campIds },
      };
    }

    if (!campId && campIdsFromProductId?.length) {
      findQuery = {
        ...findQuery,
        campId: { $in: campIdsFromProductId },
      };
    }

    if (search) {
      findQuery = {
        ...findQuery,
        name: { $regex: search, $options: 'i' },
      };
    }

    console.log(findQuery);
    const voucher = await queryhandler<Voucher>(
      this.VoucherModel,
      {
        findQuery,
        select,
        page: queryPage,
        limit: queryLimit,
        populate,
        populate1,
      },

    );
    return voucher;
  }

  async assignUser(command: AssignVoucherCommand) {
    const {
      code, updateField, loggedInUserEmail, user,
    } = command;
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
      to: email,
      templatedId: user?.languagePreference === Locale.HEBREW
        ? HebrewTemplate.VoucherAssignedToYou
        : EnglishTemplate.VoucherAssignedToYou,
      mergeVars: {
        FNAME: name,
        VOUCHERCREATER: loggedInUserEmail,
        USERNAME: email,
        PASSWORD: '',
      },
    });

    return assignUser;
  }

  async update(id: mongoose.Types.ObjectId[], updateField: object) {
    try {
      const updateVoucher = await updateMany<Voucher>(
        this.VoucherModel,
        '_id',
        id,
        updateField,
      );

      if (!updateVoucher) {
        throw new BadRequestException(ServerErrors.VOUCHER.NOT_FOUND);
      }
    } catch (err) {
      exceptionHandling(err);
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

  // eslint-disable-next-line consistent-return
  async findByValidIds(ids: string[]): Promise<Voucher[]> {
    try {
      const populate = {
        path: 'campId',
        select: `${disSelect}`,
      };
      const voucherIds = await this.VoucherModel.find({ _id: { $in: ids } }).populate(populate).exec();
      return voucherIds;
    } catch (error) {
      if (error?.name === 'CastError' && error?.kind === 'ObjectId') {
        throw new BadRequestException(`${error?.model?.modelName} ${ServerErrors.INVALID_ID}`);
      }
      exceptionHandling(error);
    }
  }

  async updateVoucherAmount(loggedInUserId: string | null, voucherId: string, totalAmount: number) {
    const voucher = await this.getOneById(voucherId);

    if (voucher.paymentStatus !== VoucherPaymentStatus.PAID) {
      throw new UnprocessableEntityException(ServerErrors.VOUCHER.UNPAID);
    }

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
    user: LoggedInUserInterface,
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
        createdBy: user.id,
        identifierId: query.identifierId,
      });
      newVoucher.save();
      voucherId.push(newVoucher._id);
    }

    // eslint-disable-next-line no-unused-vars
    const [createdUser, paymentLink] = await Promise.all([
      this.usersService.createByExternalApi({
        email: dto.email,
        password: nanoid(9),
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
        countryCode: '',
      }),
      this.paymentService.generateLink({
        amount: totalAmount,
        currency: Currency.ILS,
        purpose: PaymentPurpose.VOUCHER,
        id: voucherId,
        customerEmail: dto.email,
        customerName: dto.name,
        loggedInUserLanguagePreference: user.languagePreference,
      }),
    ]);

    return paymentLink;
  }

  async updateVoucherAmountByExternalApi(
    loggedInUserId: string,
    query: ExternalApiPostQuery,
    body: UpdateVoucherBalance,
  ) {
    const voucher = await this.getOneById(body.voucherId);

    if (voucher.paymentStatus !== VoucherPaymentStatus.PAID) {
      throw new UnprocessableEntityException(ServerErrors.VOUCHER.UNPAID);
    }

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
