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
import {
  EnglishTemplate,
  HebrewTemplate,
} from 'src/common/mailchimp/templateId';
import { paginateData } from 'src/common/pagination';
import { paginationConfig } from 'src/common/pagination.config';
import { CommonFilterQuery } from 'src/common/query-handler/common-filter-query';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { generateRandomCode } from 'src/common/utils/randomCode.generator';
import { remainingAmountCalculation } from 'src/common/utils/remaining-amount-calculation';
import { disSelect } from 'src/common/utils/select.handling';
import {
  findOneByFieldName,
  findOneByFieldNames,
  queryhandler,
  updateById,
} from 'src/core/helper/query-helper';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { Business } from 'src/modules/business/schema/business.schema';
import { BusinessStatus } from 'src/modules/business/business.type';
import { BussSubCategory } from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { Campaign } from 'src/modules/campaign/schema/campaign.schema';
import { CampaignSegment } from 'src/modules/campaign-segments/schema/campaignSegment.schema';
import {
  CreateExternalApiDTO,
  CreateVoucherDto,
  ExternalApiRegisterRequest,
} from 'src/modules/external-api/dto';
import { CreateOrderCommand } from 'src/modules/external-api/interface/create-order.interface';
import { CreateOrderProductCommand } from 'src/modules/external-api/interface/create-order-product.interface';
import { AssignVoucherCommand } from 'src/modules/external-api/interface/assign-voucher.interface';
import { GetOneVoucherInterface } from 'src/modules/external-api/interface/get-one-voucher.interface';
import {
  ExternalApiPostQuery,
  ExternalApiWithCampCodeFilterQuery,
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
import { UsersService } from 'src/modules/users/users.services';
import { Voucher } from 'src/modules/vouchers/schema/voucher.schema';
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
    @InjectModel('CampaignSegment')
    private CampaignSegmentModel: Model<CampaignSegment>,
    @InjectModel(ExternalApi.name)
    private readonly ExternalApiModel: Model<ExternalApi>,
    @InjectModel(Order.name)
    private OrderModel: Model<Order>,
    @InjectModel(OrderProduct.name)
    private OrderProductsModel: Model<OrderProduct>,
    @InjectModel(Product.name)
    private ProductModel: Model<Product>,
    @InjectModel('Voucher')
    private readonly VoucherModel: Model<Voucher>,
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
      throw new BadRequestException(ServerErrors.EXTERNAL_API.NOT_FOUND);
    }
    return externalApi;
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

      if (totalAmount <= 0) {
        const newOrder = new this.OrderModel({
          ...body,
          voucher: redeemedVouchers,
          userId: loggedInUserId,
          createdBy: loggedInUserId,
          paymentStatus: PaymentStatus.SUCCESS,
          identifierId,
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
        identifierId,
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
    const { page, limit, campCode } = query;

    const campDetails = await this.findCampaignAndReturn('code', campCode);

    const select = disSelect;
    const populate = {
      path: 'products',
      select: `${disSelect}`,
      populate: {
        path: 'categories',
        select: `${disSelect}`,
        populate: {
          path: 'icon',
          select: `${disSelect}`,
        },
      },
    };
    const populate1 = {
      path: 'products',
      select: `${disSelect}`,
      populate: {
        path: 'subCategories businessId',
        select: `${disSelect}`,
      },
    };

    const campaignSegment = await this.CampaignSegmentModel.findOne({
      campaign_ID: campDetails._id,
    })
      .populate(populate)
      .populate(populate1)
      .select(select)
      .lean()
      .exec();

    if (!campaignSegment?.products || !campaignSegment?.products?.length) {
      return {
        totalData: 0,
        products: [],
      };
    }

    if (!page && !limit) {
      const products = campaignSegment.products
        .filter((product: any) => {
          if (product.status === ProductStatus.INACTIVE) return false;
          if (!query.categoriesId && !query.subCategoriesId) {
            return true;
          }
          if (query.subCategoriesId) {
            return product.subCategories.some(subCategory => query.subCategoriesId.includes(String(subCategory._id)));
          }

          return product.categories.some(category => query.categoriesId.includes(String(category._id)));
        })
        .map((product: any) => ({
          id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          categories: product.categories,
          images: product.images,
          business: product.businessId,
          subCategories: product.subCategories,
        }));

      const totalData = products?.length;

      return {
        totalData,
        products,
      };
    }

    const filteredProducts = campaignSegment.products
      .filter((product: any) => {
        if (product.status === ProductStatus.INACTIVE) return false;

        if (!query.categoriesId && !query.subCategoriesId) {
          return true;
        }
        if (query.subCategoriesId) {
          return product.subCategories.some(subCategory => query.subCategoriesId.includes(String(subCategory._id)));
        }
        return product.categories.some(category => query.categoriesId.includes(String(category._id)));
      })
      .map((product: any) => ({
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        categories: product.categories,
        images: product.images,
        business: product.businessId,
        subCategories: product.subCategories,
      }));

    const paginatedProducts = paginateData(page, limit, filteredProducts);

    return paginatedProducts;
  }

  async getAllBusiness(query: ExternalApiWithCampCodeFilterQuery) {
    const { page, limit, campCode } = query;

    const campDetails = await this.findCampaignAndReturn('code', campCode);

    const select = disSelect;
    const populate = {
      path: 'businesses',
      select: `${disSelect}`,
      populate: {
        path: 'bussCategoriesId',
        select: `${disSelect}`,
        populate: {
          path: 'icon',
          select: `${disSelect}`,
        },
      },
    };

    const campaignSegment = await this.CampaignSegmentModel.findOne({
      campaign_ID: campDetails._id,
    })
      .populate(populate)
      .select(select)
      .lean()
      .exec();

    if (!campaignSegment?.businesses || !campaignSegment?.businesses?.length) {
      return {
        totalData: 0,
        businesses: [],
      };
    }

    if (!page && !limit) {
      const businesses = campaignSegment.businesses
        .filter((business: any) => {
          if (business.status === BusinessStatus.APPROVED) return true;
          return false;
        })
        .map((business: any) => ({
          id: business._id,
          name: business.name,
          description: business.description,
          geoLocation: business.geoLocation,
          address: business.address,
          images: business.images,
          bussCategoriesId: business.bussCategoriesId,
        }));

      const totalData = businesses.length;

      return {
        totalData,
        businesses,
      };
    }

    const filteredBusiness = campaignSegment?.businesses
      .filter((business: any) => {
        if (business.status === BusinessStatus.APPROVED) return true;
        return false;
      })
      .map((business: any) => ({
        id: business._id,
        name: business.name,
        description: business.description,
        geoLocation: business.geoLocation,
        address: business.address,
        images: business.images,
        bussCategoriesId: business.bussCategoriesId,
      }));

    const paginatedBusinesses = paginateData(page, limit, filteredBusiness);

    return paginatedBusinesses;
  }

  async getVoucherCreatedByMe(userId: string, queries: GetMyVouchersQuery) {
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
      campIdsFromProductId = await this.getCampaignAssociatedToIds(
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

  async getVoucherByCode(query: GetOneVoucherInterface) {
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
        const campaignIds = await this.getCampaignAssociatedToIds(
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
    id: string,
    key: keyof CampaignSegment,
  ) {
    try {
      const campaignSegments = await this.CampaignSegmentModel.find({
        [key]: { $in: [id] },
      });

      const campaignIds = campaignSegments.map(obj => obj.campaign_ID);

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
}
