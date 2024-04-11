/* eslint-disable no-plusplus */
import {
  BadRequestException,
  ForbiddenException,
  GoneException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { calculateTotalAmount } from 'src/common/calculate-amounts';
import { checkExpireDate, twoYearExpireDate } from 'src/common/expireDate';
import {
  EnglishTemplate,
  HebrewTemplate,
} from 'src/common/mailchimp/templateId';
import { paginationConfig } from 'src/common/pagination.config';
import { Voucher } from './schema/voucher.schema';
import {
  Currency,
  Locale,
  VoucherPaymentStatus,
  VoucherStatus,
} from 'src/common/enum';
import { ExternalApiPostQuery } from 'src/common/query-handler/externalapi-post.query';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { generateRandomCode } from 'src/common/utils/randomCode.generator';
import { remainingAmountCalculation } from 'src/common/utils/remaining-amount-calculation';
import {
  findManyByFilter,
  queryhandler,
  updateById,
  updateManyByIds,
  updateManyByManyFields,
} from 'src/core/helper/query-helper';
import { disSelect } from 'src/common/utils/select.handling';
import { ServerErrors } from 'src/common/constant';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';
import { PaymentsService } from 'src/services/payments/payments.service';
import { PaymentPurpose } from 'src/services/payments/payments.type';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { CampaignSegmentService } from 'src/modules/campaign-segments/campaignSegment.service';
import { UsersService } from 'src/modules/users/users.services';
import { UserType } from 'src/modules/users/users.type';
import {
  createVoucherDto,
  UpdateVoucherBalance,
} from 'src/modules/vouchers/dto';
import {
  AssignVoucherCommand,
  GetOneVoucherInterface,
  UpdateVoucherAfterPaymentInterface,
} from 'src/modules/vouchers/interface';
import {
  GetMyAssignedVouchersQuery,
  GetMyCreatedVouchersQuery,
  GetVoucherStatsQuery,
  GetMyVouchersExternalApiQuery,
  GetVoucherStatsGroupedQuery,
} from 'src/modules/vouchers/queries';

@Injectable()
export class VoucherService {
  constructor(
    @InjectModel('Voucher')
    private readonly VoucherModel: Model<Voucher>,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentService: PaymentsService,
    private readonly campaignService: CampaignService,
    private readonly campaignSegmentService: CampaignSegmentService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private mailchimpService: MailChimpService,
  ) {}

  async create(user: LoggedInUserInterface | null, dto: createVoucherDto) {
    try {
      const campaignId = (
        await this.campaignService.findAndReturn('code', dto.campCode)
      )._id;
      const createdByUserId
        = user?.email === dto?.email
          ? user?.id
          : (await this.usersService.findByEmailOrNull(dto.email))?._id;

      let i: number = 0;
      const voucherId: any = [];
      const totalAmount = dto.noOfVoucher * dto.amount;
      for (i = 0; i < dto.noOfVoucher; i++) {
        const randomCode = generateRandomCode(12);
        const code = dto.campCode + randomCode;
        const newVoucher = new this.VoucherModel({
          ...dto,
          code,
          remainingAmount: dto.amount,
          campId: campaignId,
          createdBy: createdByUserId,
          createdByEmail: createdByUserId ? null : dto.email,
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
        languagePreference: dto?.languagePreference || Locale.ENGLISH,
      });

      return paymentLink;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async createdBySuperadmin(
    user: LoggedInUserInterface,
    dto: createVoucherDto,
    identifierId?: string,
  ) {
    try {
      const campaignId = (
        await this.campaignService.findAndReturn('code', dto.campCode)
      )._id;
      const createdByUserId
        = user?.email === dto.email
          ? user?.id
          : (await this.usersService.findByEmailOrNull(dto.email))?._id;

      let i: number = 0;
      const vouchers: any = [];
      const voucherCodes: any = [];

      for (i = 0; i < dto.noOfVoucher; i++) {
        const randomCode = generateRandomCode(12);
        const code = dto.campCode + randomCode;
        const newVoucher = new this.VoucherModel({
          ...dto,
          code,
          remainingAmount: dto.amount,
          campId: campaignId,
          createdBy: createdByUserId,
          createdByEmail: createdByUserId ? null : dto.email,
          paymentStatus: VoucherPaymentStatus.PAID,
          identifierId,
        });
        newVoucher.save();
        vouchers.push(newVoucher);
        voucherCodes.push(code);
      }

      // send emails?
      const VOUCHERCODE = voucherCodes.map(code => `\n${code}`).toString();
      await this.mailchimpService.sendTransactionalEmail({
        to: dto.email,
        templatedId:
          dto.languagePreference === Locale.HEBREW
            ? HebrewTemplate.VoucherConfirmationNonLoggedIn
            : EnglishTemplate.VoucherConfirmationNonLoggedIn,
        mergeVars: {
          BUYERNAME: dto.name,
          VOUCHERCODE,
          VOUCHERAMOUNT: dto.amount,
        },
      });

      return vouchers;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async getOne(query: GetOneVoucherInterface) {
    try {
      const { code, externalApi, productId } = query;
      const select = disSelect;
      const populate = {
        path: 'campId',
        select: `${disSelect}`,
      };

      let findQuery: any = {
        code: code.trim(),
      };

      if (productId) {
        // get all the campId from campaignSegment the productId is associated to
        const campaignIds
          = await this.campaignSegmentService.getCampaignAssociatedToIds(
            productId,
            'products',
          );

        const campIds = Array.isArray(campaignIds)
          ? campaignIds.map(item => new mongoose.Types.ObjectId(item))
          : [new mongoose.Types.ObjectId(campaignIds)];

        findQuery = {
          ...findQuery,
          campId: { $in: campIds },
        };
      }

      const voucher = await this.VoucherModel.findOne(findQuery)
        .select(select)
        .populate(populate)
        .exec();

      if (!voucher) {
        throw new BadRequestException(ServerErrors.VOUCHER.NOT_FOUND);
      }

      if (voucher.expireDate) {
        const isAvailable = checkExpireDate(voucher.expireDate);

        if (!isAvailable) {
          throw new GoneException(ServerErrors.VOUCHER.EXPIRED);
        }
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
      const voucher = await this.VoucherModel.findById(id)
        .select(select)
        .populate(populate)
        .exec();

      if (!voucher) {
        throw new BadRequestException(ServerErrors.VOUCHER.NOT_FOUND);
      }

      if (voucher.expireDate) {
        const isAvailable = checkExpireDate(voucher.expireDate);

        if (!isAvailable) {
          throw new GoneException(ServerErrors.VOUCHER.EXPIRED);
        }
      }

      return voucher;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async getVouchersCreatedByMe(
    userId: string,
    queries: GetMyCreatedVouchersQuery,
  ) {
    const {
      page,
      limit,
      search,
      campId,
      productId,
      createdStartDate,
      createdEndDate,
      expiryStartDate,
      expiryEndDate,
      ...query
    } = queries;

    const queryPage = Number(page) || paginationConfig.page;
    const queryLimit = Number(limit) || paginationConfig.limit;

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

    if (createdStartDate && createdEndDate) {
      const startDate = new Date(createdStartDate);
      const endDate = new Date(createdEndDate);

      findQuery = {
        ...findQuery,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    if (expiryStartDate && expiryEndDate) {
      const startDate = new Date(expiryStartDate);
      const endDate = new Date(expiryEndDate);

      findQuery = {
        ...findQuery,
        expireDate: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const voucher = await queryhandler<Voucher>(this.VoucherModel, {
      findQuery,
      select,
      page: queryPage,
      limit: queryLimit,
      populate,
      populate1,
    });

    return voucher;
  }

  async getVouchersAssignedToMe(
    userId: string,
    queries: GetMyAssignedVouchersQuery | GetMyVouchersExternalApiQuery,
  ) {
    const {
      page, limit, search, campId, productId, ...query
    } = queries;

    const queryPage = Number(page) || paginationConfig.page;
    const queryLimit = Number(limit) || paginationConfig.limit;

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
      campIdsFromProductId
        = await this.campaignSegmentService.getCampaignAssociatedToIds(
          productId,
          'products',
        );

      if (!campIdsFromProductId?.length) {
        return {
          totalData: 0,
        };
      }
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
    const voucher = await queryhandler<Voucher>(this.VoucherModel, {
      findQuery,
      select,
      page: queryPage,
      limit: queryLimit,
      populate,
      populate1,
    });
    return voucher;
  }

  async getVoucherCreatedByMe(
    userId: string,
    queries: GetMyAssignedVouchersQuery | GetMyVouchersExternalApiQuery,
  ) {
    const {
      page, limit, search, campId, productId, ...query
    } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    const select = disSelect;

    let findQuery: any = {
      ...query,
      createdBy: userId,
      paymentStatus: VoucherPaymentStatus.PAID,
    };
    delete findQuery?.identifierId;

    const populate = {
      path: 'campId',
      select: `${disSelect}`,
    };
    let populate1: {};

    let campIdsFromProductId;
    if (productId) {
      // get all the campId from campaignSegment the productId is associated to
      campIdsFromProductId
        = await this.campaignSegmentService.getCampaignAssociatedToIds(
          productId,
          'products',
        );
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

    const voucher = await queryhandler<Voucher>(this.VoucherModel, {
      findQuery,
      select,
      page: queryPage,
      limit: queryLimit,
      populate,
      populate1,
    });
    return voucher;
  }

  async assignUser(command: AssignVoucherCommand) {
    const { loggedInUser, body } = command;
    const select = disSelect;

    const [availableVoucher, assignedUser] = await Promise.all([
      this.VoucherModel.findOne({
        code: body.code,
        paymentStatus: VoucherPaymentStatus.PAID,
        $and: [
          {
            $or: [{ expireDate: null }, { expireDate: { $gte: new Date() } }],
          },
          {
            $or: [
              {
                createdBy: loggedInUser.id,
                assignedTo: null,
                waitingUserEmail: null,
              },
              { assignedTo: loggedInUser.id },
            ],
          },
        ],
      })
        .select(select)
        .exec(),
      this.usersService.findByEmailOrNull(body.email),
    ]);

    if (!availableVoucher) {
      throw new NotFoundException(ServerErrors.VOUCHER.CANNOT_ASSIGN);
    }

    const updateField = {
      assignedTo: assignedUser ? assignedUser._id : null,
      waitingUserEmail: assignedUser ? null : body.email,
      status: VoucherStatus.ASSIGNED,
      updatedBy: loggedInUser.id,
      expireDate: availableVoucher.expireDate
        ? availableVoucher.expireDate
        : twoYearExpireDate(),
    };

    const assignedVoucher = await updateById<Voucher>(
      this.VoucherModel,
      availableVoucher._id,
      updateField,
    );

    if (!assignedVoucher) {
      throw new NotFoundException(ServerErrors.VOUCHER.CANNOT_ASSIGN);
    }

    await this.mailchimpService.sendTransactionalEmail({
      to: body.email,
      templatedId:
        body?.languagePreference === Locale.HEBREW
          ? HebrewTemplate.VoucherAssignedToYou
          : EnglishTemplate.VoucherAssignedToYou,
      mergeVars: {
        FULLNAME: `${loggedInUser.firstName} ${loggedInUser.lastName}`,
        VOUCHERCODE: body.code,
        VOUCHERAMOUNT: assignedVoucher.remainingAmount,
      },
    });

    return assignedVoucher;
  }

  async update(id: mongoose.Types.ObjectId[], updateField: object) {
    try {
      const updateVoucher = await updateManyByIds<Voucher>(
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

  async updateAfterPaymentSuccess(command: UpdateVoucherAfterPaymentInterface) {
    try {
      await this.update(command.ids, command.updateField);

      const voucherDetails = await findManyByFilter<Voucher>(
        this.VoucherModel,
        { _id: command.ids },
      );

      // send emails

      if (voucherDetails[0].createdBy) {
        await this.mailchimpService.sendTransactionalEmail({
          to: command.voucherOwnerEmail,
          templatedId:
            command.languagePreference === Locale.HEBREW
              ? HebrewTemplate.VoucherConfirmation
              : EnglishTemplate.VoucherConfirmation,
          mergeVars: {
            FNAME: command.voucherOwnerName,
          },
        });
      }

      if (voucherDetails[0].createdByEmail) {
        const voucherCodes = voucherDetails
          .map(doc => `\n${doc.code}`)
          .toString();

        await this.mailchimpService.sendTransactionalEmail({
          to: command.voucherOwnerEmail,
          templatedId:
            command.languagePreference === Locale.HEBREW
              ? HebrewTemplate.VoucherConfirmationNonLoggedIn
              : EnglishTemplate.VoucherConfirmationNonLoggedIn,
          mergeVars: {
            BUYERNAME: command.voucherOwnerName,
            VOUCHERCODE: voucherCodes,
            VOUCHERAMOUNT: voucherDetails[0].amount,
          },
        });
      }
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async updateAfterPaymentFailure(command: UpdateVoucherAfterPaymentInterface) {
    try {
      await this.update(command.ids, command.updateField);
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async findByIds(ids: string[]): Promise<Voucher[]> {
    const populate = {
      path: 'campId',
      select: `${disSelect}`,
    };
    const voucherIds = await this.VoucherModel.find({ _id: { $in: ids } })
      .populate(populate)
      .exec();

    return voucherIds;
  }

  async findByValidIds(ids: string[]): Promise<Voucher[]> {
    try {
      const populate = {
        path: 'campId',
        select: `${disSelect}`,
      };
      const voucherIds = await this.VoucherModel.find({
        $and: [
          { _id: { $in: ids } },
          { paymentStatus: VoucherPaymentStatus.PAID },
          { remainingAmount: { $gt: 0 } },
          {
            $or: [{ expireDate: null }, { expireDate: { $gte: new Date() } }],
          },
        ],
      })
        .populate(populate)
        .exec();

      return voucherIds;
    } catch (error) {
      exceptionHandling(error);
    }
  }

  async updateVoucherAmount(
    loggedInUserId: string | null,
    voucherId: string,
    totalAmount: number,
  ) {
    const voucher = await this.getOneById(voucherId);

    if (voucher.paymentStatus !== VoucherPaymentStatus.PAID) {
      throw new UnprocessableEntityException(ServerErrors.VOUCHER.UNPAID);
    }

    if (voucher.expireDate) {
      const isAvailable = checkExpireDate(voucher.expireDate);

      if (!isAvailable) {
        return;
      }
    }

    const remainingAmount = remainingAmountCalculation(
      voucher.remainingAmount,
      totalAmount,
    );
    const amountToBeRedeemed = remainingAmountCalculation(
      totalAmount,
      voucher.remainingAmount,
    );

    const updatedField = {
      updatedBy: loggedInUserId,
      updatedAt: new Date(),
      remainingAmount,
      expireDate: voucher?.expireDate
        ? voucher?.expireDate
        : twoYearExpireDate(),
    };

    const updatedVoucher = await this.VoucherModel.findOneAndUpdate(
      { _id: voucherId },
      updatedField,
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
    user: LoggedInUserInterface | null,
  ) {
    const campId = (
      await this.campaignService.findAndReturn('code', dto.campCode)
    )._id;
    const createdByUserId
      = user?.email === dto?.email
        ? user?.id
        : (await this.usersService.findByEmailOrNull(dto.email))?._id;

    let i: number = 0;
    const voucherId: any = [];
    const totalAmount = dto.noOfVoucher * dto.amount;
    for (i = 0; i < dto.noOfVoucher; i++) {
      const randomCode = generateRandomCode(12);
      const code = dto.campCode + randomCode;
      const newVoucher = new this.VoucherModel({
        ...dto,
        code,
        remainingAmount: dto.amount,
        campId,
        createdBy: createdByUserId,
        createdByEmail: createdByUserId ? null : dto.email,
        identifierId: query.identifierId,
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
      languagePreference: dto?.languagePreference || Locale.ENGLISH,
    });

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
      throw new UnprocessableEntityException(
        ServerErrors.VOUCHER.CANNOT_UPDATE_BALANCE,
      );
    }

    const remainingAmount = remainingAmountCalculation(
      voucher.remainingAmount,
      body.amount,
    );
    const amountToBeRedeemed = remainingAmountCalculation(
      body.amount,
      voucher.remainingAmount,
    );

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

  async updateAmountAfterOrderFailed(vouchers: any) {
    await Promise.all(
      vouchers.map(async voucherDetail => {
        await this.VoucherModel.findOneAndUpdate(
          { _id: voucherDetail.id },
          {
            $set: { updatedAt: new Date() },
            $inc: { remainingAmount: +voucherDetail.redeemedAmount },
          },
          { new: true },
        );
      }),
    );
  }

  async updateVoucherCreatedDetails(email: string, userId: string) {
    const filterQuery = {
      createdByEmail: email,
    };

    const updateField = {
      createdBy: userId,
      createdByEmail: null,
      updatedBy: userId,
      updatedAt: new Date(),
    };

    await updateManyByManyFields<Voucher>(
      this.VoucherModel,
      filterQuery,
      updateField,
    );
  }

  async updateVoucherAssignedDetails(email: string, userId: string) {
    const filterQuery = {
      waitingUserEmail: email,
    };

    const updateField = {
      assignedTo: userId,
      waitingUserEmail: null,
      updatedBy: userId,
      updatedAt: new Date(),
    };

    await updateManyByManyFields<Voucher>(
      this.VoucherModel,
      filterQuery,
      updateField,
    );
  }

  async getStats(
    loggedInUser: LoggedInUserInterface,
    query: GetVoucherStatsQuery,
  ) {
    const {
      createdStartDate,
      createdEndDate,
      expiryStartDate,
      expiryEndDate,
      groupByCampaign,
      ...queries
    } = query;

    let findQuery: any = {
      ...queries,
      paymentStatus: VoucherPaymentStatus.PAID,
    };

    if (
      loggedInUser.role === UserType.DMOADMIN
      || loggedInUser.role === UserType.DMO
    ) {
      // find dmo
      const dmoId = loggedInUser.dmo.id;

      // get all the campId from campaignSegment the dmoId is associated to
      const campaignIds
        = await this.campaignSegmentService.getCampaignAssociatedToIds(
          dmoId.toString(),
          'DMOs',
        );

      const campIds = Array.isArray(campaignIds)
        ? campaignIds.map(item => new mongoose.Types.ObjectId(item))
        : [new mongoose.Types.ObjectId(campaignIds)];

      findQuery = {
        ...findQuery,
        campId: { $in: campIds },
      };
    }

    if (loggedInUser.role === UserType.TRAVELLER) {
      findQuery = {
        ...findQuery,
        createdBy: loggedInUser.id,
      };
    }

    if (createdStartDate && createdEndDate) {
      const startDate = new Date(createdStartDate);
      const endDate = new Date(createdEndDate);
      endDate.setDate(endDate.getDate() + 1);

      if (startDate >= endDate) {
        throw new BadRequestException(
          `Created ${ServerErrors.DATE_IS_NOT_LESS}`,
        );
      }

      findQuery = {
        ...findQuery,
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      };
    }

    if (expiryStartDate && expiryEndDate) {
      const startDate = new Date(expiryStartDate);
      const endDate = new Date(expiryEndDate);
      endDate.setDate(endDate.getDate() + 1);

      if (startDate >= endDate) {
        throw new BadRequestException(
          `Expiry ${ServerErrors.DATE_IS_NOT_LESS}`,
        );
      }

      findQuery = {
        ...findQuery,
        expireDate: {
          $gte: startDate,
          $lt: endDate,
        },
      };
    }

    if (/true/.test(groupByCampaign)) {
      const groupedByCampId = await this.VoucherModel.aggregate([
        { $match: findQuery },
        {
          $lookup: {
            from: 'campaigns',
            localField: 'campId',
            foreignField: '_id',
            as: 'camp',
          },
        },
        { $unwind: '$camp' },
        {
          $group: {
            _id: '$camp._id',
            name: { $first: '$camp.name' },
            totalNumberOfVoucher: { $sum: 1 },
            totalValueOfVoucher: { $sum: '$amount' },
            totalAmountToRedeem: { $sum: '$remainingAmount' },
          },
        },
      ]);

      return groupedByCampId;
    }

    const populate = {
      path: 'campId',
      select: `${disSelect}`,
    };

    const voucher = await queryhandler<Voucher>(this.VoucherModel, {
      findQuery,
      select: disSelect,
      populate,
    });

    const totalAmountToRedeem = await calculateTotalAmount(
      'remainingAmount',
      voucher.data,
    );
    const totalValueOfVoucher = await calculateTotalAmount(
      'amount',
      voucher.data,
    );

    return {
      totalNumberOfVoucher: voucher.totalData,
      totalValueOfVoucher,
      totalAmountToRedeem,
    };
  }

  async getAllVoucherbyAdmin(user: LoggedInUserInterface, query: any) {
    let findQuery = {};
    const populate = {
      path: 'campId assignedTo',
      select: `${disSelect} `,
    };

    console.log(query);

    const select = `${disSelect} -code`;

    if (user.role === UserType.DMOADMIN) {
      // find dmo
      const dmoId = user.dmo.id;

      // get all the campId from campaignSegment the dmoId is associated to
      const campaignIds
        = await this.campaignSegmentService.getCampaignAssociatedToIds(
          dmoId.toString(),
          'DMOs',
        );

      const campIds = Array.isArray(campaignIds)
        ? campaignIds.map(item => new mongoose.Types.ObjectId(item))
        : [new mongoose.Types.ObjectId(campaignIds)];

      findQuery = {
        ...findQuery,
        campId: { $in: campIds },
      };
    }

    const voucher = await queryhandler<Voucher>(this.VoucherModel, {
      findQuery,
      select,
      populate,
    });

    return voucher;
  }

  async getVoucherStatsGrouped(
    loggedInUser: LoggedInUserInterface,
    query: GetVoucherStatsGroupedQuery,
  ) {
    const {
      createdStartDate,
      createdEndDate,
      expiryStartDate,
      expiryEndDate,
      campId,
      ...queries
    } = query;

    let findQuery: any = {
      ...queries,
      paymentStatus: VoucherPaymentStatus.PAID,
    };

    let queryCampId: any[] = campId;

    if (
      loggedInUser.role === UserType.DMOADMIN
      || loggedInUser.role === UserType.DMO
    ) {
      const dmoId = loggedInUser.dmo.id;

      // get all the campId from campaignSegment the dmoId is associated to
      const campaignIds
        = await this.campaignSegmentService.getCampaignAssociatedToIds(
          dmoId.toString(),
          'DMOs',
        );

      const campIds = Array.isArray(campaignIds)
        ? campaignIds.map(item => new mongoose.Types.ObjectId(item))
        : [new mongoose.Types.ObjectId(campaignIds)];

      queryCampId = campId?.length ? [...campIds, ...campId] : campIds;
    }

    if (queryCampId) {
      const queryCampIds = Array.isArray(queryCampId)
        ? queryCampId
        : [new mongoose.Types.ObjectId(queryCampId)];
      findQuery = {
        ...findQuery,
        campId: { $in: queryCampIds },
      };
    }

    if (loggedInUser.role === UserType.TRAVELLER) {
      findQuery = {
        ...findQuery,
        createdBy: loggedInUser.id,
      };
    }

    if (createdStartDate && createdEndDate) {
      const startDate = new Date(createdStartDate);
      const endDate = new Date(createdEndDate);
      endDate.setDate(endDate.getDate() + 1);

      if (startDate >= endDate) {
        throw new BadRequestException(
          `Created ${ServerErrors.DATE_IS_NOT_LESS}`,
        );
      }

      findQuery = {
        ...findQuery,
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      };
    }

    if (expiryStartDate && expiryEndDate) {
      const startDate = new Date(expiryStartDate);
      const endDate = new Date(expiryEndDate);
      endDate.setDate(endDate.getDate() + 1);

      if (startDate >= endDate) {
        throw new BadRequestException(
          `Expiry ${ServerErrors.DATE_IS_NOT_LESS}`,
        );
      }

      findQuery = {
        ...findQuery,
        expireDate: {
          $gte: startDate,
          $lt: endDate,
        },
      };
    }

    const groupedByCampIdAndDate = await this.VoucherModel.aggregate([
      { $match: findQuery },
      {
        $lookup: {
          from: 'campaigns',
          localField: 'campId',
          foreignField: '_id',
          as: 'camp',
        },
      },
      { $unwind: '$camp' },
      {
        $group: {
          _id: {
            campId: '$camp._id',
            createdAt: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            name: '$camp.name',
          },
          totalNumberOfVouchers: { $sum: 1 },
          totalValueOfVoucher: { $sum: '$amount' },
          totalAmountToRedeem: { $sum: '$remainingAmount' },
        },
      },
      {
        $group: {
          _id: '$_id.campId',
          name: { $first: '$_id.name' },
          vouchersByDate: {
            $push: {
              createdAt: '$_id.createdAt',
              totalNumberOfVouchers: '$totalNumberOfVouchers',
              totalValueOfVoucher: '$totalValueOfVoucher',
              totalAmountToRedeem: '$totalAmountToRedeem',
            },
          },
        },
      },
      { $unwind: '$vouchersByDate' },
      { $sort: { 'vouchersByDate.createdAt': 1 } },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          vouchersByDate: { $push: '$vouchersByDate' },
        },
      },
    ]);

    return groupedByCampIdAndDate;
  }
}
