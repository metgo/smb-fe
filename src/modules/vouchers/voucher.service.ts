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
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { checkExpireDate, twoYearExpireDate } from 'src/common/expireDate';
import {
  DynamicHebrewTemplate,
  EnglishTemplate,
  HebrewTemplate,
} from 'src/common/mailchimp/templateId';
import { Voucher } from './schema/voucher.schema';
import {
  Locale,
  SortByTimePeriod,
  VoucherPaymentStatus,
  VoucherStatus,
} from 'src/common/enum';
import { PaymentRequiredException } from 'src/common/exception/payment-required';
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
import { ServerErrors, emailDefaultTemplate } from 'src/common/constant';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';
import { OrdersService } from 'src/modules/orders/orders.services';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { ProductsService } from 'src/modules/products/products.services';
import { UsersService } from 'src/modules/users/users.services';
import { UserType } from 'src/modules/users/users.type';
import {
  PromoDetailDto,
  RewardVouchersByCampaignDto,
} from 'src/modules/vouchers/dto';
import { FreezeVoucherDTO } from 'src/modules/vouchers/dto/freeze-voucher.dto';
import {
  AssignVoucherCommand,
  GetOneVoucherInterface,
  UpdateVoucherAfterPaymentInterface,
} from 'src/modules/vouchers/interface';
import {
  GetVoucherStatsGroupedQuery,
  GetVouchersByAdminQuery,
} from 'src/modules/vouchers/queries';
import { ConfigService } from 'src/services/config/config.service';
import { RewardsService } from 'src/modules/rewards/rewards.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';
import { CartService } from 'src/modules/cart/cart.service';
import { SmsService } from 'src/services/sms/sms.service';

@Injectable()
export class VoucherService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel('Voucher')
    private readonly VoucherModel: Model<Voucher>,
    private readonly configService: ConfigService,
    private readonly campaignService: CampaignService,
    private readonly externalApiServices: ExternalApiServices,
    private readonly orderService: OrdersService,
    private readonly smsService: SmsService,
    private readonly rewardService: RewardsService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private mailchimpService: MailChimpService,
    private productService: ProductsService,
    private cartService: CartService,
  ) {}

  async createdBySuperadmin(
    user: LoggedInUserInterface,
    dto: CreateVoucherDto,
    identifierId?: string,
  ) {
    try {
      const campaignId = (
        await this.campaignService.findCampaignAndReturn('code', dto.campCode)
      )._id;
      const createdByUserId
        = user?.email === dto.email
          ? user?.id
          : (await this.usersService.findByEmailOrNull(dto.email))?._id;

      const vouchers: any = [];
      const voucherCodes: any = [];

      const externalApiId = (
        await this.externalApiServices.findByFieldName(
          'identifierId',
          identifierId,
        )
      )._id;

      await Promise.all(
        Array.from({ length: dto.noOfVoucher }).map(async () => {
          const randomCode = generateRandomCode(12);
          const code = dto.campCode + randomCode;
          const newVoucher = new this.VoucherModel({
            ...dto,
            code,
            remainingAmount: dto.amount,
            campId: campaignId,
            createdBy: createdByUserId,
            createdAt: new Date(),
            createdByEmail: createdByUserId ? null : dto.email,
            paymentStatus: VoucherPaymentStatus.PAID,
            externalApiId,
          });
          await newVoucher.save();
          await vouchers.push(newVoucher);
          await voucherCodes.push(code);
        }),
      );

      this.logger.info('[EXTERNAL_API_VOUCHERS]: CREATED BY SUPERADMIN', {
        message: voucherCodes,
      });

      // send emails?
      const VOUCHERCODE = await voucherCodes
        .map(code => `\n${code}`)
        ?.toString();
      await this.mailchimpService.sendTransactionalEmail({
        to: dto?.email,
        templatedId:
          dto?.languagePreference === Locale.HEBREW
            ? HebrewTemplate.VoucherConfirmationNonLoggedIn
            : EnglishTemplate.VoucherConfirmationNonLoggedIn,
        mergeVars: {
          BUYERNAME: dto?.name,
          VOUCHERCODE,
          VOUCHERAMOUNT: dto?.amount,
        },
      });

      return vouchers;
    } catch (err) {
      this.logger.error('[VOUCHERS]: FAILED TO CREATE VOUCHERS BY SUPERADMIN', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async createdBySuperadminNewTemplate(
    user: LoggedInUserInterface,
    dto: CreateVoucherDto,
    identifierId?: string,
  ) {
    try {
      const campaignId = (
        await this.campaignService.findCampaignAndReturn('code', dto.campCode)
      )._id;
      const createdByUserId
        = user?.email === dto.email
          ? user?.id
          : (await this.usersService.findByEmailOrNull(dto.email))?._id;

      const vouchers: any = [];
      const voucherCodes: any = [];

      const externalApiId = (
        await this.externalApiServices.findByFieldName(
          'identifierId',
          identifierId,
        )
      )._id;

      await Promise.all(
        Array.from({ length: dto.noOfVoucher }).map(async () => {
          const randomCode = generateRandomCode(12);
          const code = dto.campCode + randomCode;
          const newVoucher = new this.VoucherModel({
            ...dto,
            code,
            remainingAmount: dto.amount,
            campId: campaignId,
            createdBy: createdByUserId,
            createdAt: new Date(),
            createdByEmail: createdByUserId ? null : dto.email,
            paymentStatus: VoucherPaymentStatus.PAID,
            externalApiId,
          });
          await newVoucher.save();
          await vouchers.push(newVoucher);
          await voucherCodes.push(code);
        }),
      );

      this.logger.info(
        '[EXTERNAL_API_VOUCHERS]: CREATED BY SUPERADMIN NEW TEMPLATE',
        {
          message: voucherCodes,
        },
      );

      // send emails?
      const VOUCHERCODE = await voucherCodes
        .map(code => `\n${code}`)
        ?.toString();
      await this.mailchimpService.sendTransactionalEmail({
        to: dto?.email,
        templatedId:
          dto?.languagePreference === Locale.HEBREW
            ? HebrewTemplate.VoucherConfirmationNonLoggedInNewTemplate
            : EnglishTemplate.VoucherConfirmationNonLoggedInNewTemplate,
        mergeVars: {
          BUYERNAME: dto?.name,
          VOUCHERCODE,
          VOUCHERAMOUNT: dto?.amount,
        },
      });

      return vouchers;
    } catch (err) {
      this.logger.error(
        '[EXTERNAL_API_VOUCHERS]: FAILED TO CREATE VOUCHERS BY SUPERADMIN NEW TEMPLATE',
        {
          err: err.message,
        },
      );
      exceptionHandling(err);
    }
  }

  async createVouchersByCampaign(
    loggedInUser: LoggedInUserInterface,
    body: RewardVouchersByCampaignDto,
    identifierId: string,
  ) {
    try {
      const assignedUserEmail = await this.usersService.findByEmailOrNull(
        body.email,
      );

      const campaignReward: any = await this.campaignService.findRewardByCampId(
        body.campId,
      );

      if (!campaignReward?.rewardId) {
        throw new BadRequestException(
          ServerErrors.CAMPAIGN.EXPIRED_OR_REWARD_DONT_EXIST,
        );
      }

      if (
        campaignReward.rewardId.totalVoucherCreated
          >= campaignReward.rewardId.voucherLimit
        || campaignReward.rewardId.totalVoucherCreated + body.noOfVoucher
          > campaignReward.rewardId.voucherLimit
      ) {
        throw new UnprocessableEntityException(
          ServerErrors.VOUCHER.LIMIT_EXCEEDED,
        );
      }

      const externalApiId = (
        await this.externalApiServices.findByFieldName(
          'identifierId',
          identifierId,
        )
      )._id;

      const voucherCodes: any = [];
      const vouchers: any = [];

      await Promise.all(
        Array.from({ length: body.noOfVoucher }).map(async () => {
          const randomCode = generateRandomCode(12);
          const code = campaignReward.code + randomCode;
          const newVoucher = new this.VoucherModel({
            name: body.name,
            createdBy: loggedInUser.id,
            createdAt: new Date(),
            amount: campaignReward?.rewardId?.amount,
            code,
            remainingAmount: campaignReward?.rewardId?.amount,
            paymentStatus: VoucherPaymentStatus.PAID,
            status: VoucherStatus.ASSIGNED,
            waitingUserEmail: assignedUserEmail?._id ? null : body.email,
            externalApiId,
            assignedTo: assignedUserEmail?._id ? assignedUserEmail._id : null,
            campId: body.campId,
            assignedAt: new Date(),
          });
          await newVoucher.save();
          await voucherCodes.push(code);
          await vouchers.push(newVoucher);
        }),
      );

      this.logger.info('[EXTERNAL_API_REWARD_VOUCHER_BY_CAMPAIGN]: CREATED', {
        message: voucherCodes,
      });

      // updateRewardLimit
      await this.rewardService.updateUsage(
        campaignReward.rewardId._id,
        body.noOfVoucher,
      );

      // send emails?
      const VOUCHERCODE = await voucherCodes
        .map(code => `\n${code}`)
        ?.toString();
      await this.mailchimpService.sendTransactionalEmail({
        to: body?.email,
        templatedId:
          body.languagePreference === Locale.HEBREW
            ? DynamicHebrewTemplate.VOUCHER_FOR_CAMPAIGN
            : DynamicHebrewTemplate.VOUCHER_FOR_CAMPAIGN,
        mergeVars: {
          FNAME: body?.name,
          CAMPAIGN: campaignReward?.name,
          SLOGAN: campaignReward?.slogan,
          VOUCHERCODE,
          VOUCHERAMOUNT: campaignReward?.rewardId?.amount,
          WEBSITE: campaignReward?.link,
          LOGO1:
            campaignReward?.dmoIds[0]?.logoPath
            || emailDefaultTemplate.SIDE_LOGO,
          LOGO2: emailDefaultTemplate.MAIN_LOGO,
          LOGO3: campaignReward?.logoPath || emailDefaultTemplate.SIDE_LOGO,
          PRIMARY_BG_COLOR: emailDefaultTemplate.PRIMARY_BG_COLOR,
          PRIMARY_TEXT_COLOR: emailDefaultTemplate.PRIMARY_TEXT_COLOR,
          IMAGE1: emailDefaultTemplate.IMAGE1,
          IMAGE2:
            campaignReward?.dmoIds[0]?.imagePath || emailDefaultTemplate.IMAGE2,
          IMAGE3: campaignReward?.imagePath || emailDefaultTemplate.IMAGE3,
        },
      });

      return vouchers;
    } catch (err) {
      this.logger.error(
        '[EXTERNAL_API_REWARD_VOUCHER_BY_CAMPAIGN]: FAILED TO CREATE',
        {
          err: err.message,
        },
      );
      exceptionHandling(err);
    }
  }

  async getOneByCodeAndProduct(query: GetOneVoucherInterface) {
    try {
      const { code, productId } = query;

      const productDetail = await this.productService.findOne(productId);

      const findQuery: any = {
        code: code.trim(),
        isDeleted: false,
      };

      const populate = {
        path: 'campId',
        select: 'code name dmoIds productIds businessIds',
      };

      const voucher: any = await this.VoucherModel.findOne(findQuery)
        .select('_id code remainingAmount expireDate paymentStatus campId')
        .populate(populate)
        .exec();

      if (!voucher) {
        throw new BadRequestException(ServerErrors.VOUCHER.NOT_FOUND);
      }

      const campDetails = voucher?.campId;

      if (
        !campDetails?.productIds?.length
        && !campDetails?.businessIds?.length
        && !campDetails?.dmoIds?.length
      ) {
        throw new ForbiddenException(
          'This voucher cannot be used for this product',
        );
      }

      if (
        !campDetails.dmoIds.includes(productDetail?.dmoId?._id)
        && !campDetails.businessIds.includes(productDetail?.businessId)
        && !campDetails.productIds.includes(productDetail?._id)
      ) {
        throw new ForbiddenException(
          'This voucher cannot be used for this product',
        );
      }

      if (voucher.paymentStatus !== VoucherPaymentStatus.PAID) {
        throw new PaymentRequiredException(ServerErrors.VOUCHER.UNPAID);
      }

      if (voucher.expireDate) {
        const isAvailable = checkExpireDate(voucher.expireDate);

        if (!isAvailable) {
          throw new GoneException(ServerErrors.VOUCHER.EXPIRED);
        }
      }

      if (!voucher.remainingAmount) {
        throw new UnprocessableEntityException(ServerErrors.VOUCHER.NO_BALANCE);
      }

      return {
        _id: voucher._id,
        code: voucher.code,
        remainingAmount: voucher.remainingAmount,
        expireDate: voucher.expireDate,
        paymentStatus: voucher.paymentStatus,
      };
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async getOneByCode(code: string) {
    try {
      const select = disSelect;
      const populate = {
        path: 'campId assignedTo',
        select: `${disSelect}`,
      };

      const findQuery = {
        code: code.trim(),
      };

      const voucher: any = await this.VoucherModel.findOne(findQuery)
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

      return {
        external_id: voucher._id,
        code: voucher.code,
        current_balance: voucher.remainingAmount,
        expiry_date: voucher.expireDate,
        metadata: {
          customer_data: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+972-50-1234567',
          },
          company_data: {
            company_name: 'Best Coffee Co.',
            company_id: '12345',
            contact_email: 'support@bestcoffee.com',
          },
        },
        purchase_details: {
          purchased_by: {
            name: voucher.createdBy,
            email: voucher.createdByEmail,
          },
          purchase_date: voucher.createdAt,
          payment_method: 'Credit Card',
        },
      };
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

  // async getVouchersCreatedByMe(userId: string, queries: GetMyVouchersQuery) {
  //   const {
  //     page,
  //     limit,
  //     search,
  //     campId,
  //     productId,
  //     createdStartDate,
  //     createdEndDate,
  //     expiryStartDate,
  //     expiryEndDate,
  //     identifierId,
  //     ...query
  //   } = queries;

  //   const queryPage = page ? Number(page) : paginationConfig.page;
  //   const queryLimit = limit ? Number(limit) : paginationConfig.limit;

  //   const select = disSelect;

  //   let findQuery: any = {
  //     ...query,
  //     createdBy: userId,
  //     paymentStatus: VoucherPaymentStatus.PAID,
  //   };

  //   const populate = {
  //     path: 'campId',
  //     select: `${disSelect}`,
  //   };

  //   let campIdsFromProductId;
  //   if (productId) {
  //     const dmoOfProduct = (await this.productService.findOne(productId))?.dmoId
  //       ?._id;

  //     if (dmoOfProduct) {
  //       // find campIds of this dmo
  //       campIdsFromProductId
  //         = await this.campaignService.getCampaignAssociatedToIds(
  //           dmoOfProduct,
  //           'dmoIds',
  //         );
  //     }
  //   }

  //   if (campId) {
  //     let campIds = Array.isArray(campId)
  //       ? campId.map(item => item)
  //       : [campId];

  //     if (campIdsFromProductId) {
  //       const campIdsFromProductIds = Array.isArray(campIdsFromProductId)
  //         ? campIdsFromProductId.map(item => item?.toString())
  //         : [campIdsFromProductId];

  //       campIds = [...campIds, ...campIdsFromProductIds];
  //     }

  //     const campsId = getUniqueSet(campIds);

  //     findQuery = {
  //       ...findQuery,
  //       campId: { $in: campsId },
  //     };
  //   }

  //   if (!campId && productId) {
  //     findQuery = {
  //       ...findQuery,
  //       campId: { $in: campIdsFromProductId },
  //     };
  //   }

  //   if (search) {
  //     findQuery = {
  //       ...findQuery,
  //       name: { $regex: search, $options: 'i' },
  //     };
  //   }

  //   if (createdStartDate && createdEndDate) {
  //     const startDate = new Date(createdStartDate);
  //     const endDate = new Date(createdEndDate);

  //     findQuery = {
  //       ...findQuery,
  //       createdAt: {
  //         $gte: startDate,
  //         $lte: endDate,
  //       },
  //     };
  //   }

  //   if (expiryStartDate && expiryEndDate) {
  //     const startDate = new Date(expiryStartDate);
  //     const endDate = new Date(expiryEndDate);

  //     findQuery = {
  //       ...findQuery,
  //       expireDate: {
  //         $gte: startDate,
  //         $lte: endDate,
  //       },
  //     };
  //   }

  //   const voucher = await queryhandler<Voucher>(this.VoucherModel, {
  //     findQuery,
  //     select,
  //     page: queryPage,
  //     limit: queryLimit,
  //     populate,
  //   });
  //   return voucher;
  // }

  // async getVouchersAssignedToMe(
  //   userId: string,
  //   queries: GetMyAssignedVouchersQuery,
  // ) {
  //   const {
  //     page, limit, search, campId, productId, ...query
  //   } = queries;

  //   const queryPage = Number(page) || paginationConfig.page;
  //   const queryLimit = Number(limit) || paginationConfig.limit;

  //   const select = disSelect;

  //   let findQuery: any = { ...query, assignedTo: userId };

  //   const populate = {
  //     path: 'campId',
  //     select: `${disSelect}`,
  //   };
  //   let populate1: {};

  //   let campIdsFromProductId;
  //   if (productId) {
  //     const dmoOfProduct = (await this.productService.findOne(productId))?.dmoId
  //       ?._id;

  //     if (dmoOfProduct) {
  //       // find campIds of this dmo
  //       campIdsFromProductId
  //         = await this.campaignService.getCampaignAssociatedToIds(
  //           dmoOfProduct,
  //           'dmoIds',
  //         );
  //     }
  //   }

  //   if (campId) {
  //     let campIds = Array.isArray(campId)
  //       ? campId.map(item => item)
  //       : [campId];

  //     if (campIdsFromProductId) {
  //       const campIdsFromProductIds = Array.isArray(campIdsFromProductId)
  //         ? campIdsFromProductId.map(item => item?.toString())
  //         : [campIdsFromProductId];

  //       campIds = [...campIds, ...campIdsFromProductIds];
  //     }

  //     const campsId = getUniqueSet(campIds);

  //     findQuery = {
  //       ...findQuery,
  //       campId: { $in: campsId },
  //     };
  //   }

  //   if (!campId && productId) {
  //     findQuery = {
  //       ...findQuery,
  //       campId: { $in: campIdsFromProductId },
  //     };
  //   }

  //   if (search) {
  //     findQuery = {
  //       ...findQuery,
  //       name: { $regex: search, $options: 'i' },
  //     };
  //   }

  //   const voucher = await queryhandler<Voucher>(this.VoucherModel, {
  //     findQuery,
  //     select,
  //     page: queryPage,
  //     limit: queryLimit,
  //     populate,
  //     populate1,
  //   });
  //   return voucher;
  // }

  // async getVoucherCreatedByMe(
  //   userId: string,
  //   queries: GetMyAssignedVouchersQuery,
  // ) {
  //   const {
  //     page, limit, search, campId, productId, ...query
  //   } = queries;

  //   const queryPage = page ? Number(page) : paginationConfig.page;
  //   const queryLimit = limit ? Number(limit) : paginationConfig.limit;

  //   const select = disSelect;

  //   let findQuery: any = {
  //     ...query,
  //     createdBy: userId,
  //     paymentStatus: VoucherPaymentStatus.PAID,
  //   };
  //   delete findQuery?.identifierId;

  //   const populate = {
  //     path: 'campId',
  //     select: `${disSelect}`,
  //   };
  //   let populate1: {};

  //   let campIdsFromProductId;
  //   if (productId) {
  //     const dmoOfProduct = (await this.productService.findOne(productId))?.dmoId
  //       ?._id;

  //     if (dmoOfProduct) {
  //       // find campIds of this dmo
  //       campIdsFromProductId
  //         = await this.campaignService.getCampaignAssociatedToIds(
  //           dmoOfProduct,
  //           'dmoIds',
  //         );
  //     }
  //   }

  //   if (campId) {
  //     let campIds = Array.isArray(campId)
  //       ? campId.map(item => item)
  //       : [campId];

  //     if (campIdsFromProductId) {
  //       const campIdsFromProductIds = Array.isArray(campIdsFromProductId)
  //         ? campIdsFromProductId.map(item => item?.toString())
  //         : [campIdsFromProductId];

  //       campIds = [...campIds, campIdsFromProductIds];
  //     }

  //     const campsId = getUniqueSet(campIds);
  //     findQuery = {
  //       ...findQuery,
  //       campId: { $in: campsId },
  //     };
  //   }

  //   if (!campId && productId) {
  //     findQuery = {
  //       ...findQuery,
  //       campId: { $in: campIdsFromProductId },
  //     };
  //   }

  //   if (search) {
  //     findQuery = {
  //       ...findQuery,
  //       name: { $regex: search, $options: 'i' },
  //     };
  //   }

  //   const voucher = await queryhandler<Voucher>(this.VoucherModel, {
  //     findQuery,
  //     select,
  //     page: queryPage,
  //     limit: queryLimit,
  //     populate,
  //     populate1,
  //   });
  //   return voucher;
  // }

  async assignVoucher(command: AssignVoucherCommand) {
    try {
      const { loggedInUser, body } = command;
      const select = disSelect;

      const populate = {
        path: 'campId',
        select: `${disSelect}`,
        populate: {
          path: 'dmoIds',
          select: `${disSelect}`,
        },
      };

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
          .populate(populate)
          .exec(),
        this.usersService.findByEmailOrNull(body.email),
      ]);

      if (!availableVoucher) {
        throw new NotFoundException(ServerErrors.VOUCHER.CANNOT_ASSIGN);
      }

      const updateField = {
        assignedTo: assignedUser ? assignedUser._id : null,
        assignedAt: new Date(),
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
      this.logger.info('[VOUCHER]: ASSIGNED', {
        message: assignedVoucher,
      });

      const campaign: any = availableVoucher?.campId;

      await this.mailchimpService.sendTransactionalEmail({
        to: body?.email,
        templatedId: DynamicHebrewTemplate.VoucherAssignedToYou,
        mergeVars: {
          CAMPAIGN: campaign?.name,
          FNAME: `${loggedInUser?.firstName} ${loggedInUser?.lastName}`,
          ENTITY: campaign?.dmoIds[0]?.name,
          WEBSITE: campaign?.link,
          SLOGAN: campaign?.slogan,
          VOUCHERCODE: body?.code,
          VOUCHERAMOUNT: assignedVoucher?.remainingAmount,
          LOGO1:
            campaign?.dmoIds[0]?.logoPath || emailDefaultTemplate.SIDE_LOGO,
          LOGO2: emailDefaultTemplate.MAIN_LOGO,
          LOGO3: campaign?.logoPath || emailDefaultTemplate.SIDE_LOGO,
          PRIMARY_BG_COLOR: emailDefaultTemplate.PRIMARY_BG_COLOR,
          PRIMARY_TEXT_COLOR: emailDefaultTemplate.PRIMARY_TEXT_COLOR,
          IMAGE1: emailDefaultTemplate.IMAGE1,
          IMAGE2: campaign?.dmoIds[0]?.imagePath || emailDefaultTemplate.IMAGE2,
          IMAGE3: campaign?.imagePath || emailDefaultTemplate.IMAGE3,
        },
      });

      return assignedVoucher;
    } catch (err) {
      this.logger.error('[VOUCHER]: FAILED TO ASSIGN VOUCHER', {
        err: err.message,
      });
      exceptionHandling(err);
    }
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

      this.logger.info('[VOUCHER]: UPDATED', { message: updateVoucher });
    } catch (err) {
      this.logger.error('[VOUCHER]: FAILED TO UPDATE', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async updateAfterPaymentSuccess(command: UpdateVoucherAfterPaymentInterface) {
    try {
      const ENV_NAME = this.configService.get('ENV_NAME');

      await this.update(command.ids, command.updateField);

      const voucherDetails: Voucher[] = await findManyByFilter<Voucher>(
        this.VoucherModel,
        { _id: command.ids },
      );

      this.logger.info('[VOUCHER]: UPDATED AFTER PAYMENT', {
        message: voucherDetails,
      });
      // send emails

      const voucherCodes = voucherDetails
        .map(doc => `\n${doc.code}`)
        ?.toString();

      const link
        = ENV_NAME === 'prod'
          ? `https://tav-8.co.il/product?utm_source=sms&utm_medium=tav8&voucherId=${voucherDetails[0]?.code}`
          : `https://tav8.metgo.app/product?utm_source=sms&utm_medium=tav8&voucherId=${voucherDetails[0]?.code}`;

      if (voucherDetails[0]?.assigneeInfo?.email) {
        await this.mailchimpService.sendTransactionalEmail({
          to: voucherDetails[0]?.assigneeInfo?.email,
          templatedId:
            command?.languagePreference === Locale.HEBREW
              ? HebrewTemplate.VoucherConfirmationNonLoggedIn
              : EnglishTemplate.VoucherConfirmationNonLoggedIn,
          mergeVars: {
            BUYERNAME: voucherDetails[0]?.assigneeInfo?.name,
            VOUCHERCODE: voucherCodes,
            VOUCHERAMOUNT: voucherDetails[0]?.amount,
            MESSAGE: voucherDetails[0]?.message,
            REDIRECT_LINK: link,
          },
        });
      }

      if (voucherDetails[0]?.assigneeInfo?.phone) {
        const countryCode
          = voucherDetails[0]?.assigneeInfo?.countryCode || '972';
        await this.smsService.sendSms({
          firstName: voucherDetails[0]?.assigneeInfo?.name,
          lastName: '',
          phone: `+${countryCode}${voucherDetails[0]?.assigneeInfo?.phone}`,
          message: `שלום רב ${voucherDetails[0]?.assigneeInfo?.name} \n קיבלת לאחרונה תו מתנה של תו-8 - אתר המתנות מעוטף עזה והנגב המערבי \n !אנו מזמינים אותך לממש אותו \n ${voucherDetails[0]?.message} \n \n ${voucherDetails[0]?.remainingAmount} :יתרת השובר שלך \n ${voucherCodes} :קוד השובר שלך  \n \n לכניסה לאתר תו8 ומימוש התו יש להכנס לכאן>> ${link} \n \n ,כאן עבורך לכל שאלה \n צוות תו-8`,
          sender: 'TAV8',
          subject: 'Voucher',
        });
      }

      return voucherDetails;
    } catch (err) {
      this.logger.error('[VOUCHER]: FAILED TO UPDATE AFTER PAYMENT SUCCESS', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async updateAfterPaymentFailure(command: UpdateVoucherAfterPaymentInterface) {
    try {
      await this.update(command.ids, command.updateField);
      this.logger.info('[VOUCHER]: UPDATED AFTER PAYMENT FAILURE', {
        message: command.ids,
      });
    } catch (err) {
      this.logger.error('[VOUCHER]: FAILED TO UPDATE AFTER PAYMENT FAILURE', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async updateVoucherPostPaymentUpdate(
    voucherIds: string[],
    paymentStatus: VoucherPaymentStatus,
    loggedInUser?: LoggedInUserInterface,
  ) {
    try {
      const updateField = {
        paymentStatus,
        updatedAt: new Date(),
        updatedBy: loggedInUser?.id,
      };
      const updateVouchers = await updateManyByIds<Voucher>(
        this.VoucherModel,
        '_id',
        voucherIds,
        updateField,
      );

      if (!updateVouchers) {
        throw new BadRequestException(ServerErrors.VOUCHER.NOT_FOUND);
      }

      this.logger.info('[VOUCHER]: UPDATED AFTER PAYMENT FAILURE', {
        message: voucherIds,
      });
    } catch (err) {
      this.logger.error('[VOUCHER]: FAILED TO UPDATE AFTER PAYMENT FAILURE', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async findByIds(ids: string[]): Promise<Voucher[]> {
    const populate = {
      path: 'campId externalApiId',
      select: `${disSelect}`,
    };
    const voucherIds = await this.VoucherModel.find({ _id: { $in: ids } })
      .populate(populate)
      .exec();

    return voucherIds;
  }

  async freezeVouchers(
    command: FreezeVoucherDTO,
    loggedInUser: LoggedInUserInterface,
  ) {
    try {
      if (!command?.voucher?.length) {
        throw new BadRequestException('Please enter vouchers');
      }

      const voucherIds = command.voucher?.map(voucher => voucher.id);
      const vouchers = await this.findByValidIds(voucherIds);

      if (!vouchers?.length) {
        throw new BadRequestException('Please enter valid vouchers');
      }

      const updatedVouchers = await Promise.all(
        vouchers?.map(async voucher => {
          const commandVoucher = command.voucher.find(
            v => v.id.toString() === voucher._id.toString(),
          );
          if (voucher?.remainingAmount < commandVoucher?.amount) {
            throw new BadRequestException(
              'The provided amount is greater than available amount',
            );
          }
          if (voucher?.remainingAmount >= commandVoucher?.amount) {
            const updateField = {
              remainingAmount:
                voucher?.remainingAmount - commandVoucher?.amount,
              $push: {
                freeze: {
                  cartId: command.cartId,
                  amount: commandVoucher.amount,
                },
              },
              updatedAt: new Date(),
              updatedBy: loggedInUser?.id,
            };

            const updatedVoucher = await this.VoucherModel.findByIdAndUpdate(
              voucher._id,
              updateField,
              { new: true },
            );
            this.logger.info('[VOUCHER]: FREEZED', { message: updatedVoucher });
            return updatedVoucher;
          }
        }),
      );

      return updatedVouchers;
    } catch (err) {
      this.logger.error('[VOUCHER]: FAILED TO FREEZE VOUCHER', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async deleteFreezeVouchersPostSuccess(
    vouchers: { id: string; redeemedAmount: number }[],
    orderId: string,
    loggedInUser: LoggedInUserInterface,
  ) {
    try {
      await Promise.all(
        vouchers.map(async voucherDetail => {
          const cart = await this.cartService.findOneByOrderId(orderId);
          await this.VoucherModel.findOneAndUpdate(
            { _id: voucherDetail.id },
            {
              $set: { updatedAt: new Date(), updatedBy: loggedInUser?.id },
              $pull: { freeze: { cartId: cart._id } },
            },
            { new: true },
          );
        }),
      );
      this.logger.info('[VOUCHER]: UPDATED AFTER ORDER FAILED', {
        message: vouchers,
      });
    } catch (err) {
      this.logger.error('[VOUCHER]: FAILED TO UPDATE AFTER ORDER FAILED', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async reimburseFreezeVouchersPostFailure(
    vouchers: { id: string; redeemedAmount: number }[],
    orderId: string,
    loggedInUser: LoggedInUserInterface,
  ) {
    try {
      const cart = await this.cartService.findOneByOrderId(orderId);

      await Promise.all(
        vouchers.map(async voucherDetail => {
          await this.VoucherModel.updateOne(
            { _id: voucherDetail.id },
            [
              {
                $set: {
                  updatedAt: new Date(),
                  updatedBy: loggedInUser?.id,
                  remainingAmount: {
                    $add: [
                      '$remainingAmount',
                      {
                        $ifNull: [
                          {
                            $arrayElemAt: [
                              {
                                $map: {
                                  input: {
                                    $filter: {
                                      input: '$freeze',
                                      as: 'f',
                                      cond: { $eq: ['$$f.cartId', cart._id] },
                                    },
                                  },
                                  as: 'filteredFreeze',
                                  in: '$$filteredFreeze.amount',
                                },
                              },
                              0,
                            ],
                          },
                          0,
                        ],
                      },
                    ],
                  },
                  freeze: {
                    $filter: {
                      input: '$freeze',
                      as: 'f',
                      cond: { $ne: ['$$f.cartId', cart._id] }, // Remove the matching cartId from freeze
                    },
                  },
                },
              },
            ],
            { new: true },
          );
        }),
      );
      this.logger.info('[VOUCHER]: UPDATED AFTER ORDER FAILED', {
        message: vouchers,
      });
    } catch (err) {
      this.logger.error('[VOUCHER]: FAILED TO UPDATE AFTER ORDER FAILED', {
        err: err.message,
      });
      exceptionHandling(err);
    }
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
      this.logger.error('[ORDER-VOUCHER]: FAILED TO FIND VALID VOUCHERS', {
        err: error.message,
      });
      exceptionHandling(error);
    }
  }

  async updateVoucherAmount(
    loggedInUserId: string | null,
    voucherId: string,
    totalAmount: number,
  ) {
    try {
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

      this.logger.info('[VOUCHER]: AMOUNT UPDATED', {
        message: updatedVoucher,
      });

      return {
        amountToBeRedeemed,
        redeemedAmount: totalAmount - amountToBeRedeemed,
      };
    } catch (err) {
      this.logger.error('[VOUCHER]: FAILED TO UPDATE AMOUNT', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async updateAmountAfterOrderFailed(vouchers: any) {
    try {
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
      this.logger.info('[VOUCHER]: UPDATED AFTER ORDER FAILED', {
        message: vouchers,
      });
    } catch (err) {
      this.logger.error('[VOUCHER]: FAILED TO UPDATE AFTER ORDER FAILED', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async updateVoucherCreatedDetails(email: string, userId: string) {
    try {
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
      this.logger.info(
        '[VOUCHER]: UPDATED VOUCHER CREATED DETAILS AFTER REGISTER',
      );
    } catch (err) {
      this.logger.error(
        '[VOUCHER]: FAILED TO UPDATE VOUCHER CREATED DETAILS AFTER REGISTER',
        {
          err: err.message,
        },
      );
      exceptionHandling(err);
    }
  }

  async updateVoucherAssignedDetails(email: string, userId: string) {
    try {
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
      this.logger.info(
        '[VOUCHER]: UPDATED VOUCHER ASSIGNED DETAILS AFTER REGISTER',
      );
    } catch (err) {
      this.logger.error(
        '[VOUCHER]: FAILED TO UPDATE VOUCHER ASSIGNED DETAILS AFTER REGISTER',
        {
          err: err.message,
        },
      );
      exceptionHandling(err);
    }
  }

  async triggerReward(loggedInUser: LoggedInUserInterface, orderId: string) {
    const orderDetail = await this.orderService.findOneById(orderId);

    const rewardDetail = await this.campaignService.findRewardByCampId(
      orderDetail.campId,
    );

    // create voucher
    return rewardDetail;
  }

  async getAllVoucherbyAdmin(
    user: LoggedInUserInterface,
    query: GetVouchersByAdminQuery,
  ) {
    const {
      search, page, limit, dmoId, ...queries
    } = query;
    let findQuery: any = queries;

    const populate = {
      path: 'campId assignedTo',
      select: `${disSelect} `,
    };

    if (search) {
      const users = await this.usersService.findByRegex(search, [
        'email',
        'firstName',
        'lastName',
      ]);
      const usersString = users?.map(item => item._id?.toString());

      findQuery = {
        ...findQuery,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { waitingUserEmail: { $regex: search, $options: 'i' } },
          { createdByEmail: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
          { assignedTo: { $in: users } },
          { createdBy: { $in: usersString } },
        ],
      };
    }

    const select = `${disSelect} -code`;

    let dmo = dmoId;
    if (
      user.role === UserType.DMOADMIN
      || user.role === UserType.DMO
      || user.role === UserType.AUTHORITY_ADMIN
      || user.role === UserType.AUTHORITY
    ) {
      dmo = user.dmo.id;
    }

    if (dmo) {
      // get campIds dmoId is associated to
      const campaignIds = await this.campaignService.getCampaignAssociatedToIds(
        dmo,
        'dmoIds',
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
      page: Number(page),
      limit: Number(limit),
    });

    return voucher;
  }

  async getVoucherStats(
    loggedInUser: LoggedInUserInterface,
    query: GetVoucherStatsGroupedQuery,
  ) {
    const {
      createdStartDate,
      createdEndDate,
      expiryStartDate,
      expiryEndDate,
      campId,
      sortBy,
      dmoId,
      campaignType,
      ...queries
    } = query;

    let findQuery: any = {
      ...queries,
      paymentStatus: VoucherPaymentStatus.PAID,
    };

    let queryCampId: any[] = campId;
    let dmo;

    if (dmoId) {
      dmo = dmoId;
    }
    if (
      loggedInUser.role === UserType.DMOADMIN
      || loggedInUser.role === UserType.DMO
      || loggedInUser.role === UserType.AUTHORITY
      || loggedInUser.role === UserType.AUTHORITY_ADMIN
    ) {
      dmo = loggedInUser.dmo.id;
    }

    if (!campId?.length && dmo && campaignType) {
      // get campIds dmoId is associated to
      const campaignIds = await this.campaignService.getStatsVoucher(
        dmo,
        'dmoIds',
        campaignType,
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

    if (!queryCampId && campaignType) {
      const campaignIds = await this.campaignService.getIdsByType(campaignType);

      const queryCampIds = Array.isArray(campaignIds)
        ? campaignIds
        : [new mongoose.Types.ObjectId(campaignIds)];

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

    if (sortBy) {
      let format = {
        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
      };
      if (sortBy === SortByTimePeriod.WEEKLY) {
        format = { $dateToString: { format: '%Y-%U', date: '$createdAt' } };
      }

      if (sortBy === SortByTimePeriod.MONTHLY) {
        format = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
      }

      if (sortBy === SortByTimePeriod.YEARLY) {
        format = { $dateToString: { format: '%Y', date: '$createdAt' } };
      }

      const groupedByDates = await this.VoucherModel.aggregate([
        { $match: findQuery },
        {
          $group: {
            _id: format,
            totalNumberOfVouchers: { $sum: 1 },
            totalAssignedVouchers: {
              $sum: {
                $cond: [{ $eq: ['$status', VoucherStatus.ASSIGNED] }, 1, 0],
              },
            },
            totalValueOfVoucher: { $sum: '$amount' },
            totalAmountToRedeem: { $sum: '$remainingAmount' },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return groupedByDates;
    }

    const unGroupedVouchers = await this.VoucherModel.aggregate([
      { $match: findQuery },
      {
        $group: {
          _id: null,
          totalNumberOfVouchers: { $sum: 1 },
          totalAssignedVouchers: {
            $sum: {
              $cond: [{ $eq: ['$status', VoucherStatus.ASSIGNED] }, 1, 0],
            },
          },
          totalValueOfVoucher: { $sum: '$amount' },
          totalAmountToRedeem: { $sum: '$remainingAmount' },
        },
      },
      {
        $project: {
          _id: 0,
          totalNumberOfVouchers: 1,
          totalValueOfVoucher: 1,
          totalAmountToRedeem: 1,
        },
      },
    ]);

    return unGroupedVouchers;
  }

  async scheduledEmailToRedeemableVoucherOwners() {
    const ENV_NAME = this.configService.get('ENV_NAME');

    if (ENV_NAME === 'prod') {
      const currentDate = new Date();

      const vouchers = await this.VoucherModel.find({
        paymentStatus: VoucherPaymentStatus.PAID,
        remainingAmount: { $gt: 0 },
        deletedAt: null,
        deletedBy: null,
        waitingUserEmail: { $exists: true, $ne: null },
        status: VoucherStatus.ASSIGNED,
        $or: [
          { expireDate: { $exists: false } },
          { expireDate: null },
          { expireDate: { $gte: currentDate } },
        ],
      });

      let noOfEmailSent: number = 0;

      await Promise.all(
        vouchers.map(async voucher => {
          const createdDate = new Date(voucher.createdAt);

          if (currentDate.getDate() === createdDate.getDate()) {
            const emailSent
              = await this.mailchimpService.sendTransactionalEmail({
                to: voucher?.waitingUserEmail,
                templatedId: HebrewTemplate.REEDEMABLE_VOUCHER_REMINDER,
                mergeVars: {
                  BUYERNAME: voucher?.name,
                  VOUCHERCODE: voucher?.code,
                  VOUCHERAMOUNT: voucher?.remainingAmount,
                  VOUCHERACTUALAMOUNT: voucher?.amount,
                },
              });

            if (emailSent[0].status === 'sent') {
              await this.VoucherModel.findOneAndUpdate(
                { _id: voucher.id },
                { $inc: { reminderCount: 1 } },
                { new: true },
              );
            }

            noOfEmailSent += 1;
          }
        }),
      );

      const message = `${noOfEmailSent} emails were sent successfully`;
      console.log(message);

      return {
        message,
      };
    }
  }

  async sendVoucherDetailEmail(id: string) {
    try {
      const populate = {
        path: 'assignedTo',
        select: `${disSelect}`,
      };

      const voucher = await this.VoucherModel.findOne({
        _id: id,
        deletedAt: null,
        deletedBy: null,
      }).populate(populate);

      const assignedTo: any = voucher?.assignedTo;

      const emailRecipient = assignedTo?.email || voucher?.waitingUserEmail;

      if (emailRecipient) {
        await this.mailchimpService.sendTransactionalEmail({
          to: emailRecipient,
          templatedId: HebrewTemplate.REEDEMABLE_VOUCHER_REMINDER,
          mergeVars: {
            BUYERNAME: voucher?.name,
            VOUCHERCODE: voucher?.code,
            VOUCHERAMOUNT: voucher?.remainingAmount,
            VOUCHERACTUALAMOUNT: voucher?.amount,
          },
        });
      }

      this.logger.info('[VOUCHER]: SENT EMAIL OF VOUCHER DETAIL', {
        message: voucher,
      });
      return voucher;
    } catch (err) {
      this.logger.error('[VOUCHER]: FAILED TO SEND EMAIL OF VOUCHER DETAIL', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async sendPromotionalEmailToVoucherOwner(
    body: PromoDetailDto,
    amount?: number,
    campIds?: string[],
  ) {
    try {
      const populate = {
        path: 'assignedTo',
        select: `${disSelect}`,
      };

      let query: any = {
        deletedAt: null,
        deletedBy: null,
        remainingAmount: { $gte: amount || 20 },
      };

      if (campIds && campIds?.length > 0) {
        query = {
          ...query,
          campId: { $in: campIds },
        };
      }

      const vouchers = await this.VoucherModel.find(query).populate(populate);

      const eligibleVouchers = vouchers.map(async voucher => {
        const assignedTo: any = voucher?.assignedTo;

        const emailRecipient = assignedTo?.email || voucher?.waitingUserEmail;

        if (emailRecipient) {
          await this.mailchimpService.sendTransactionalEmail({
            to: emailRecipient,
            templatedId: HebrewTemplate.VOUCHER_PROMOTIONAL,
            mergeVars: {
              NAME: voucher?.name,
              VOUCHERCODE: voucher?.code,
              VOUCHERACTUALAMOUNT: voucher?.amount,
              VOUCHERAMOUNT: voucher?.remainingAmount,
            },
          });

          const promoDetails = {
            promoName: body.promoName,
            date: new Date(),
          };

          await this.VoucherModel.updateOne(
            { _id: voucher._id },
            {
              $push: { promoDetails },
            },
          );

          this.logger.info('[VOUCHER]: SPECIAL OFFER EMAIL SENT TO VOUCHER', {
            message: voucher,
          });
        }

        return voucher;
      });

      const results = await Promise.allSettled(eligibleVouchers);

      this.logger.info(
        '[VOUCHER]: All emails sent successfully for special event',
        {
          count: results.length,
        },
      );

      return { message: 'Emails sent successfully', count: results?.length };
    } catch (err) {
      this.logger.error(
        '[VOUCHER]: FAILED TO SEND EMAIL SPECIAL OFFER TO VOUCHERS',
        {
          err: err.message,
        },
      );
      exceptionHandling(err);
    }
  }
}
