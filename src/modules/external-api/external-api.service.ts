/* eslint-disable no-undef */
import {
  BadRequestException,
  ForbiddenException,
  GoneException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ObjectId } from 'typeorm';

import { ServerErrors } from 'src/common/constant';
import {
  CampaignStatus,
  Currency,
  Locale,
  PaymentStatus,
  VoucherPaymentStatus,
  VoucherStatus,
} from 'src/common/enum';
import { checkExpireDate, twoYearExpireDate } from 'src/common/expireDate';
import { getUniqueSet } from 'src/common/get-unique-set';
import {
  EnglishTemplate,
  HebrewTemplate,
} from 'src/common/mailchimp/templateId';
import { paginationConfig } from 'src/common/pagination.config';
import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { generateRandomCode } from 'src/common/utils/randomCode.generator';
import { generateRandomIdentifier } from 'src/common/utils/random-identifierId-generator';
import { remainingAmountCalculation } from 'src/common/utils/remaining-amount-calculation';
import { disSelect } from 'src/common/utils/select.handling';
import {
  findOneByFieldName,
  findOneByFieldNames,
  findOneByIDPopulate,
  queryhandler,
  updateById,
} from 'src/core/helper/query-helper';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { Business } from 'src/modules/business/schema/business.schema';
import { BusinessStatus } from 'src/modules/business/business.type';
import { BussSubCategory } from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { Campaign } from 'src/modules/campaign/schema/campaign.schema';
import {
  CreateCampaignDto,
  CreateExternalApiDTO,
  CreateVoucherDto,
  ExternalApiRegisterRequest,
  RewardVouchersByCampaignDto,
} from 'src/modules/external-api/dto';
import { CreateOrderCommand } from 'src/modules/external-api/interface/create-order.interface';
import { CreateOrderProductCommand } from 'src/modules/external-api/interface/create-order-product.interface';
import { AssignVoucherCommand } from 'src/modules/external-api/interface/assign-voucher.interface';
import { CreateRewardCommand } from 'src/modules/external-api/interface/create-reward.interface';
import { GetOneVoucherInterface } from 'src/modules/external-api/interface/get-one-voucher.interface';
import {
  ExternalApiPostQuery,
  GetAllCategoriesQuery,
  GetAllProductsQuery,
  GetMyVouchersQuery,
} from 'src/modules/external-api/queries';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
import { Order } from 'src/modules/orders/schema/orders.schema';
import { OrderStatus, PaymentMode } from 'src/modules/orders/orders.type';
import { OrderProduct } from 'src/modules/order-product/schema/order-product.schema';
import { Product } from 'src/modules/products/schema/products.schema';
import { ProductStatus } from 'src/modules/products/products.type';
import { Rewards } from 'src/modules/rewards/schema/rewards.schema';
import { UsersService } from 'src/modules/users/users.services';
import { Voucher } from 'src/modules/vouchers/schema/voucher.schema';
import { GcpBucketService } from 'src/services/gcp-bucket/gcp-bucket.services';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';
import { PaymentPurpose } from 'src/services/payments/payments.type';
import { PaymentsService } from 'src/services/payments/payments.service';

@Injectable()
export class ExternalApiServices {
  constructor(
    @InjectModel('Business')
    private BusinessModel: Model<Business>,
    @InjectModel('BussCategory')
    private BussCategoryModel: Model<BussCategory>,
    @InjectModel(BussSubCategory.name)
    private BussSubCategoryModel: Model<BussSubCategory>,
    @InjectModel('Campaign')
    private CampaignModel: Model<Campaign>,
    @InjectModel(ExternalApi.name)
    private readonly ExternalApiModel: Model<ExternalApi>,
    @InjectModel(Order.name)
    private OrderModel: Model<Order>,
    @InjectModel(OrderProduct.name)
    private OrderProductsModel: Model<OrderProduct>,
    @InjectModel(Product.name)
    private ProductModel: Model<Product>,
    @InjectModel(Rewards.name)
    private RewardModel: Model<Rewards>,
    @InjectModel('Voucher')
    private readonly VoucherModel: Model<Voucher>,
    private readonly gcpBucketServices: GcpBucketService,
    private readonly mailchimpService: MailChimpService,
    private userService: UsersService,
    private readonly paymentService: PaymentsService,
  ) {}

  async create(loggedInUser: string, body: CreateExternalApiDTO) {
    const companyDetails = {
      name: body.companyName,
      phone: body.companyPhone,
      email: body.companyEmail,
      address: body.companyAddress,
    };
    const newExternalApi = new this.ExternalApiModel({
      ...body,
      companyDetails,
      createdBy: loggedInUser,
      identifierId: generateRandomIdentifier(
        body.companyName.substring(0, 4),
        18,
      ),
    });
    return newExternalApi.save();
  }

  async getAll(queries: CommonFilterQuery) {
    const { page, limit, ...query } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;
    const select = `${disSelect}`;

    let findQuery: {};
    let populate: {};
    let populate1: {};

    if (query.search) {
      findQuery = {
        name: { $regex: query.search, $options: 'i' },
      };
    }

    const externalApi = await queryhandler<ExternalApi>(this.ExternalApiModel, {
      findQuery,
      select,
      page: queryPage,
      limit: queryLimit,
      populate,
      populate1,
    });

    return externalApi;
  }

  async getById(id: string) {
    const select = `${disSelect}`;

    const externalApiDetail = await this.ExternalApiModel.findById(id)
      .select(select)
      .exec();

    return externalApiDetail;
  }

  async update(
    loggedInUserId: string,
    externalApiId: string,
    body: CreateExternalApiDTO,
  ) {
    const companyDetails = {
      name: body.companyName,
      phone: body.companyPhone,
      email: body.companyEmail,
      address: body.companyAddress,
    };

    const updateField = { ...body, companyDetails, updatedBy: loggedInUserId };

    const updatedExternalApi = await updateById<ExternalApi>(
      this.ExternalApiModel,
      externalApiId,
      updateField,
    );

    if (!updatedExternalApi) {
      throw new NotFoundException(ServerErrors.EXTERNAL_API.NOT_FOUND);
    }
    return updatedExternalApi;
  }

  async softDelete(loggedInUserId: string, externalApiId: string) {
    const updateField = {
      isDeleted: true,
      deletedAt: new Date(),
      updatedBy: loggedInUserId,
      deletedBy: loggedInUserId,
    };

    const externalApi = await updateById<ExternalApi>(
      this.ExternalApiModel,
      externalApiId,
      updateField,
    );
    if (!externalApi) {
      throw new NotFoundException(ServerErrors.EXTERNAL_API.NOT_FOUND);
    }
    return externalApi;
  }

  async findByFieldName(fieldName: keyof ExternalApi, items: string) {
    const externalApi = await findOneByFieldName<ExternalApi>(
      this.ExternalApiModel,
      fieldName,
      items,
    );
    if (!externalApi) {
      throw new ForbiddenException(ServerErrors.FORBIDDEN);
    }
    return externalApi;
  }

  async createVouchersByCampaign(
    loggedInUser: LoggedInUserInterface,
    body: RewardVouchersByCampaignDto,
    identifierId: string,
  ) {
    try {
      const assignedUserEmail = await this.userService.findByEmailOrNull(
        body.email,
      );

      const campaignReward: any = await this.findRewardByCampId(body.campId);

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
        await this.findByFieldName('identifierId', identifierId)
      )._id;

      let i: number = 0;
      const voucherCodes: any = [];
      const vouchers: any = [];

      // eslint-disable-next-line no-plusplus
      for (i = 0; i < body.noOfVoucher; i++) {
        const randomCode = generateRandomCode(12);
        const code = campaignReward.code + randomCode;
        const newVoucher = new this.VoucherModel({
          name: body.name,
          createdBy: loggedInUser.id,
          amount: campaignReward?.rewardId?.amount,
          code,
          remainingAmount: campaignReward?.rewardId?.amount,
          paymentStatus: VoucherPaymentStatus.PAID,
          status: VoucherStatus.ASSIGNED,
          waitingUserEmail: assignedUserEmail?._id ? null : body.email,
          externalApiId,
          assignedTo: assignedUserEmail?._id ? assignedUserEmail._id : null,
          campId: body.campId,
        });
        newVoucher.save();
        voucherCodes.push(code);
        vouchers.push(newVoucher);
      }

      // updateRewardLimit
      await this.deductRewardUsage(
        campaignReward.rewardId._id,
        body.noOfVoucher,
      );

      // send emails?
      const VOUCHERCODE = voucherCodes.map(code => `\n${code}`).toString();
      await this.mailchimpService.sendTransactionalEmail({
        to: body.email,
        templatedId:
          body.languagePreference === Locale.HEBREW
            ? HebrewTemplate.VoucherConfirmationNonLoggedIn
            : EnglishTemplate.VoucherConfirmationNonLoggedIn,
        mergeVars: {
          BUYERNAME: body.name,
          VOUCHERCODE,
          VOUCHERAMOUNT: campaignReward.rewardId.amount,
        },
      });

      return vouchers;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async registerUser(body: ExternalApiRegisterRequest) {
    const externalApi = await this.findByFieldName(
      'identifierId',
      body.identifierId,
    );
    const { identifierId, ...rest } = body;
    const newBody = { ...rest, externalApiId: externalApi._id };
    const user = await this.userService.create(newBody);

    return user;
  }

  async getAllCategories(query: GetAllCategoriesQuery) {
    const select = disSelect;
    const populateCategories = {
      path: 'icon iconBnW',
      select: `${disSelect}`,
    };

    const categories = await this.BussCategoryModel.find({
      deletedAt: { $in: [null] },
    })
      .sort({ createdAt: -1 })
      .lean()
      .select(select)
      .populate(populateCategories)
      .exec();

    if (query.locale === Locale.HEBREW) {
      categories.map(category => {
        // eslint-disable-next-line no-param-reassign
        category.name = category?.hebrewName || category.name;
        return { ...category };
      });
    }

    let categoriesWithSubCategories = [];
    const populateSubCategories = {
      path: 'icon',
      select: `${disSelect}`,
    };
    const selectSubCategories = `${disSelect} -bussCategoryId`;

    await Promise.all(
      categories.map(async category => {
        const categoryWithSubCategory: any = category;

        categoryWithSubCategory.sub_categories
          = await this.BussSubCategoryModel.find({
            bussCategoryId: category._id,
            deletedAt: { $in: [null] },
          })
            .select(selectSubCategories)
            .populate(populateSubCategories)
            .exec();

        if (query.locale === Locale.HEBREW) {
          categoryWithSubCategory.sub_categories.map(subCategory => {
            // eslint-disable-next-line no-param-reassign
            subCategory.name = subCategory?.hebrewName || subCategory.name;
            return { ...subCategory };
          });
        }

        categoriesWithSubCategories = [
          ...categoriesWithSubCategories,
          categoryWithSubCategory,
        ];
      }),
    );

    return categoriesWithSubCategories;
  }

  async findProductsIds(ids: string[]): Promise<Product[]> {
    try {
      const findQuery = { _id: { $in: ids } };
      let select: {};
      let page: number;
      let limit: number;

      const products = await queryhandler<Product>(this.ProductModel, {
        findQuery,
        select,
        page,
        limit,
      });

      if (!products?.data?.length) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }

      return products;
    } catch (error) {
      exceptionHandling(error);
    }
  }

  async findVouchersByValidIds(ids: string[]): Promise<Voucher[]> {
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

  async processVouchers(
    loggedInUserId: string | null,
    voucherIds,
    totalAmountOfProduct,
  ) {
    let voucherInfo = [];
    const processVouchers = async (
      vouchers,
      index = 0,
      initialRedeemedAmount = 0,
    ) => {
      if (
        index >= vouchers.length
        || (index > 0 && initialRedeemedAmount === 0)
      ) {
        return;
      }

      const voucher = vouchers[index];
      const { amountToBeRedeemed: updateRedeemedAmount, redeemedAmount }
        = await this.updateVoucherAmount(
          loggedInUserId,
          voucher.id,
          index === 0 ? totalAmountOfProduct : initialRedeemedAmount,
        );

      voucherInfo = [
        ...voucherInfo,
        {
          id: voucher.id,
          redeemedAmount,
        },
      ];

      await processVouchers(vouchers, index + 1, updateRedeemedAmount);
    };

    await processVouchers(voucherIds);
    voucherInfo.filter(Boolean);

    return voucherInfo;
  }

  async createOrder(command: CreateOrderCommand): Promise<any> {
    try {
      const {
        loggedInUserId,
        body,
        redeemedVouchers,
        totalAmount,
        actualAmountOfProduct,
        identifierId,
      } = command;

      const externalApiId = (
        await this.findByFieldName('identifierId', identifierId)
      )._id;

      if (totalAmount <= 0) {
        const newOrder = new this.OrderModel({
          ...body,
          voucher: redeemedVouchers,
          userId: loggedInUserId,
          createdBy: loggedInUserId,
          paymentStatus: PaymentStatus.SUCCESS,
          externalApiId,
          status: OrderStatus.PROCESSING,
          creditCardPayment: totalAmount,
          paymentMode: [PaymentMode.VOUCHER],
          totalAmount: actualAmountOfProduct,
        });

        const order = await newOrder.save();
        await Promise.all(
          order.products.map(async product => {
            await this.createOrderProduct({
              productId: product.id,
              quantity: product.quantity,
              loggedInUserId,
              orderId: order.id,
            });
          }),
        );

        const [getProductInformation, businessDetails] = await Promise.all([
          this.getProductInformationForOrders(body.products),
          this.findBusinessEmailByIds(order.businessId),
        ]);

        await this.mailchimpService.sendTransactionalEmail({
          to: order.email,
          templatedId:
            body?.languagePreference === Locale.HEBREW
              ? HebrewTemplate.OrderConfirmationForClient
              : EnglishTemplate.OrderConfirmationForClient,
          mergeVars: {
            BUYERNAME: order.firstName,
            BUSINESSNAME: businessDetails[0].name || '',
            PRODUCTNAME: getProductInformation[0].name,
            QUANTITY: body.products[0].quantity,
            COST: getProductInformation[0].price.sellingPrice,
            TOTALAMOUNT: order.totalAmount,
            BUSINESSPHONE:
              `${businessDetails[0]?.countryCode}-${businessDetails[0]?.phoneNumber}`
              || '',
            BUSINESSEMAIL: businessDetails[0].busiEmail || '',
            BUSINESSADDRESS: businessDetails[0]?.address?.location || '',
          },
        });

        // SEND TO BUSINESS OWNER
        await Promise.all(
          businessDetails.map(async business => {
            if (!business?.busiEmail) return;
            await this.mailchimpService.sendTransactionalEmail({
              to: business.busiEmail,
              templatedId:
                body?.languagePreference === Locale.HEBREW
                  ? HebrewTemplate.OrderReceivedForBusiness
                  : EnglishTemplate.OrderReceivedForBusiness,
              mergeVars: {
                BUSINESSNAME: business?.name || '',
                PRODUCTNAME: getProductInformation[0].name,
                QUANTITY: body.products[0].quantity,
                COST: getProductInformation[0].price.sellingPrice,
                TOTALAMOUNT: order.totalAmount,
                BUYERNAME: `${body.firstName} ${body.lastName}`,
                BUYERPHONE: `${body?.countryCode}-${body.phone}`,
                BUYEREMAIL: body.email,
                BUYERADDRESS: body.address,
              },
            });
          }),
        );

        return;
      }

      const newOrder = new this.OrderModel({
        ...body,
        voucher: redeemedVouchers,
        userId: loggedInUserId,
        createdBy: loggedInUserId,
        paymentStatus: PaymentStatus.PENDING,
        externalApiId,
        creditCardPayment: totalAmount,
        paymentMode:
          totalAmount === actualAmountOfProduct
            ? [PaymentMode.CARD]
            : [PaymentMode.CARD, PaymentMode.VOUCHER],
        totalAmount: actualAmountOfProduct,
      });

      const order = await newOrder.save();

      const link = await this.paymentService.generateLink({
        amount: totalAmount,
        currency: Currency.ILS,
        purpose: PaymentPurpose.ORDER,
        id: order.id,
        customerEmail: body.email,
        customerName: body.firstName,
        languagePreference: body?.languagePreference || Locale.ENGLISH,
      });

      return [link];
    } catch (error) {
      exceptionHandling(error);
    }
  }

  async getAllProducts(query: GetAllProductsQuery) {
    const {
      page, limit, campCode, categoriesId, subCategoriesId,
    } = query;

    const campDetails = await this.findCampaignAndReturn('code', campCode);

    const select = disSelect;

    let findQuery: any = {
      status: ProductStatus.ACTIVE,
      dmoId: { $in: campDetails.dmoIds },
      isDeleted: false,
    };

    const populate = {
      path: 'categories subCategories',
      select: `${disSelect}`,
      populate: {
        path: 'icon',
        select: `${disSelect}`,
      },
    };

    if (categoriesId) {
      const categoriesIds = Array.isArray(categoriesId)
        ? categoriesId
        : [categoriesId];

      findQuery = {
        ...findQuery,
        categoriesId: { $in: categoriesIds },
      };
    }

    if (subCategoriesId) {
      const subCategoriesIds = Array.isArray(subCategoriesId)
        ? subCategoriesId
        : [subCategoriesId];

      findQuery = {
        ...findQuery,
        subCategoriesId: { $in: subCategoriesIds },
      };
    }

    const productsList = await queryhandler<Product>(this.ProductModel, {
      findQuery,
      select,
      page: Number(page),
      limit: Number(limit),
      populate,
    });

    if (!productsList?.data || !productsList.data?.length) {
      return {
        totalData: 0,
        products: [],
      };
    }

    return productsList;
  }

  async getAllBusiness(query: GetAllProductsQuery) {
    const {
      page, limit, campCode, categoriesId, subCategoriesId,
    } = query;

    const campDetails = await this.findCampaignAndReturn('code', campCode);

    const select = disSelect;
    let findQuery: any = {
      status: BusinessStatus.APPROVED,
      dmoId: { $in: campDetails.dmoIds },
      isDeleted: false,
    };

    const populate = {
      path: 'bussCategoriesId bussSubCategoriesId',
      select: `${disSelect}`,
      populate: {
        path: 'icon',
        select: `${disSelect}`,
      },
    };

    if (categoriesId) {
      const categoriesIds = Array.isArray(categoriesId)
        ? categoriesId
        : [categoriesId];

      findQuery = {
        ...findQuery,
        bussCategoriesId: { $in: categoriesIds },
      };
    }

    if (subCategoriesId) {
      const subCategoriesIds = Array.isArray(subCategoriesId)
        ? subCategoriesId
        : [subCategoriesId];

      findQuery = {
        ...findQuery,
        bussSubCategoriesId: { $in: subCategoriesIds },
      };
    }

    const businesses = await queryhandler<Business>(this.BusinessModel, {
      findQuery,
      select,
      page: Number(page),
      limit: Number(limit),
      populate,
    });

    if (!businesses?.data || !businesses.data?.length) {
      return {
        totalData: 0,
        businesses: [],
      };
    }

    return businesses;
  }

  async getVouchersCreatedByMe(userId: string, queries: GetMyVouchersQuery) {
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
      identifierId,
      ...query
    } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    const select = disSelect;

    let findQuery: any = {
      ...query,
      createdBy: userId,
      paymentStatus: VoucherPaymentStatus.PAID,
    };

    const populate = {
      path: 'campId',
      select: `${disSelect}`,
    };

    let campIdsFromProductId;
    if (productId) {
      const dmoOfProduct = (await this.findOneProduct(productId))?.dmoId?._id;

      if (dmoOfProduct) {
        // find campIds of this dmo
        campIdsFromProductId = await this.getCampaignAssociatedToIds(
          dmoOfProduct,
          'dmoIds',
        );
      }
    }

    if (campId) {
      let campIds = Array.isArray(campId)
        ? campId.map(item => item)
        : [campId];

      if (campIdsFromProductId) {
        const campIdsFromProductIds = Array.isArray(campIdsFromProductId)
          ? campIdsFromProductId.map(item => item.toString())
          : [campIdsFromProductId];

        campIds = [...campIds, ...campIdsFromProductIds];
      }

      const campsId = getUniqueSet(campIds);

      findQuery = {
        ...findQuery,
        campId: { $in: campsId },
      };
    }

    if (!campId && productId) {
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
    });
    return voucher;
  }

  async assignVoucher(command: AssignVoucherCommand) {
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
      this.userService.findByEmailOrNull(body.email),
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

  async purchaseVoucher(
    dto: CreateVoucherDto,
    query: ExternalApiPostQuery,
    user: LoggedInUserInterface | null,
  ) {
    const campId = (await this.findCampaignAndReturn('code', dto.campCode))._id;
    const createdByUserId
      = user?.email === dto?.email
        ? user?.id
        : (await this.userService.findByEmailOrNull(dto.email))?._id;

    let i: number = 0;
    const voucherId: any = [];
    const totalAmount = dto.noOfVoucher * dto.amount;

    const externalApiId = (
      await this.findByFieldName('identifierId', query.identifierId)
    )._id;

    // eslint-disable-next-line no-plusplus
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
        externalApiId,
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
      languagePreference: dto.languagePreference || Locale.ENGLISH,
    });

    return paymentLink;
  }

  async createVoucherBySuperadmin(
    user: LoggedInUserInterface,
    dto: CreateVoucherDto,
    identifierId?: string,
  ) {
    try {
      const campaignId = (
        await this.findCampaignAndReturn('code', dto.campCode)
      )._id;
      const createdByUserId
        = user?.email === dto.email
          ? user?.id
          : (await this.userService.findByEmailOrNull(dto.email))?._id;

      let i: number = 0;
      const vouchers: any = [];
      const voucherCodes: any = [];

      const externalApiId = (
        await this.findByFieldName('identifierId', identifierId)
      )._id;

      // eslint-disable-next-line no-plusplus
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
          externalApiId,
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
          FNAME: dto.name,
          VOUCHERCODE,
          VOUCHERAMOUNT: dto.amount,
        },
      });

      return vouchers;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async createCampaigns(
    dto: CreateCampaignDto,
    files: Array<Express.Multer.File>,
    userId: string,
    identifierId: string,
  ): Promise<Campaign> {
    await Promise.all([
      this.findCampaignByFieldName('name', dto.name),
      this.findCampaignByFieldName('code', dto.code),
    ]);

    if (!files?.length) {
      throw new BadRequestException('Please upload logo and campaign image');
    }

    let imageCount: number = 0;

    await Promise.all(
      // eslint-disable-next-line array-callback-return
      files.map(file => {
        if (file.fieldname === 'logoPath' || file.fieldname === 'campImage') {
          imageCount += 1;
        }
      }),
    );

    if (imageCount !== 2) {
      throw new BadRequestException('Please upload logo and campaign image');
    }

    let campImage: string;
    let logoPath: string;
    await Promise.all(
      files.map(async file => {
        if (file.fieldname === 'logoPath') {
          logoPath = await this.gcpBucketServices.upload(file);
        }

        if (file.fieldname === 'campImage') {
          campImage = await this.gcpBucketServices.upload(file);
        }
      }),
    );

    const { rewardAmount, rewardVoucherLimit, ...body } = dto;

    const externalApiId = (
      await this.findByFieldName('identifierId', identifierId)
    )._id;

    let campaign: any = {
      ...body,
      imagePath: campImage,
      logoPath,
      createdBy: userId,
      externalApiId,
    };

    if (rewardAmount) {
      // create reward;
      const reward = await this.createReward({
        createdBy: userId,
        amount: rewardAmount,
        voucherLimit: rewardVoucherLimit,
      });

      campaign = {
        ...campaign,
        rewardId: reward._id,
      };
    }

    const newCampaign = new this.CampaignModel(campaign);
    await newCampaign.save();
    return newCampaign;
  }

  async getVoucherByCode(query: GetOneVoucherInterface) {
    try {
      const { code, productId } = query;
      const select = disSelect;
      const populate = {
        path: 'campId',
        select: `${disSelect}`,
      };

      const findQuery: any = {
        code: code.trim(),
      };

      const voucher: any = await this.VoucherModel.findOne(findQuery)
        .select(select)
        .populate(populate)
        .exec();

      if (!voucher) {
        throw new BadRequestException(ServerErrors.VOUCHER.NOT_FOUND);
      }

      const dmoOfProduct = (await this.findOneProduct(productId))?.dmoId?._id;

      // check if campaign Id has the dmo
      if (!voucher?.campId?.dmoIds.includes(dmoOfProduct)) {
        throw new ForbiddenException(
          'This voucher is not eligible for this product',
        );
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
        id: voucher._id,
        remainingAmount: voucher.remainingAmount,
        expireDate: voucher.expireDate,
        paymentStatus: voucher.paymentStatus,
        status: voucher.status,
      };
    } catch (err) {
      exceptionHandling(err);
    }
  }

  private async getProductInformationForOrders(productInfo) {
    try {
      const ids = productInfo.map(item => item.id.toString());
      const products = await this.ProductModel.find({ _id: { $in: ids } });

      if (!products?.length) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }

      return products;
    } catch (error) {
      exceptionHandling(error);
    }
  }

  private async findBusinessEmailByIds(ids: ObjectId[]) {
    try {
      const businessDetails = await this.BusinessModel.find({
        _id: { $in: ids },
      });

      return businessDetails;
    } catch (error) {
      exceptionHandling(error);
    }
  }

  private async findCampaignAndReturn(
    fieldName: keyof Campaign,
    items: string,
  ): Promise<Campaign> {
    const fieldNames = {
      [fieldName]: items,
      status: CampaignStatus.ACTIVE,
    };
    const campaign = await findOneByFieldNames<Campaign>(
      this.CampaignModel,
      fieldNames,
    );
    if (!campaign) {
      throw new NotFoundException(
        `${ServerErrors.CAMPAIGN.NOT_FOUND} ${fieldName}.`,
      );
    }
    return campaign;
  }

  private async getCampaignAssociatedToIds(
    id: string | ObjectId,
    key: keyof Campaign,
  ) {
    try {
      const campaigns = await this.CampaignModel.find({
        [key]: { $in: [id] },
      });

      const campaignIds = campaigns.map(obj => obj._id);

      return campaignIds;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async getOneVoucherById(id: string): Promise<Voucher> {
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

  private async updateVoucherAmount(
    loggedInUserId: string | null,
    voucherId: string,
    totalAmount: number,
  ) {
    const voucher = await this.getOneVoucherById(voucherId);

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

  private async createOrderProduct(
    command: CreateOrderProductCommand,
  ): Promise<any> {
    try {
      const product = await this.ProductModel.findById(command.productId);

      const productDetails = new this.OrderProductsModel({
        productId: command.productId,
        quantity: command.quantity,
        amount: product.price.sellingPrice,
        userId: command.loggedInUserId,
        orderId: command.orderId,
        createdBy: command.loggedInUserId,
      });

      const productDetail = await productDetails.save();

      return productDetail;
    } catch (error) {
      exceptionHandling(error);
    }
  }

  private async findCampaignByFieldName(
    fieldName: keyof Campaign,
    items: string,
  ): Promise<boolean> {
    const campaign = await findOneByFieldName<Campaign>(
      this.CampaignModel,
      fieldName,
      items,
    );
    if (campaign) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }

  private async createReward(command: CreateRewardCommand): Promise<Rewards> {
    const newReward = new this.RewardModel({
      ...command,
    });

    const reward = await newReward.save();

    return reward;
  }

  private async findRewardByCampId(campId: string) {
    const findQuery = {
      endDate: { $gte: new Date() },
      status: CampaignStatus.ACTIVE,
      _id: campId,
    };

    const populate = {
      path: 'rewardId',
      select: `${disSelect}`,
    };

    const campaignRewardDetail = await findOneByIDPopulate<Campaign>(
      this.CampaignModel,
      findQuery,
      populate,
    );

    return campaignRewardDetail;
  }

  private async deductRewardUsage(id: string, noOfVoucherBought: number) {
    const updatedDto = { $inc: { totalVoucherCreated: noOfVoucherBought } };
    const updatedReward = await updateById<Rewards>(
      this.RewardModel,
      id,
      updatedDto,
    );

    return updatedReward;
  }

  private async findOneProduct(
    productId: string | mongoose.Types.ObjectId,
  ): Promise<Product> {
    const populate = {
      path: 'dmoId authorityId',
      select: `${disSelect}`,
    };
    const select = `${disSelect}`;
    try {
      const product = await this.ProductModel.findById(productId)
        .select(select)
        .populate(populate);

      if (!product || product.status !== ProductStatus.ACTIVE) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }
      return product;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
