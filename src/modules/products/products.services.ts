/* eslint-disable no-undef */
/* eslint-disable no-nested-ternary */
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ObjectId } from 'typeorm';
import { Logger } from 'winston';

import { ServerErrors } from 'src/common/constant';
import { SortOrder } from 'src/common/enum';
import { getRandomNumberBetween } from 'src/common/utils/random-number-range';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { disSelect } from 'src/common/utils/select.handling';
import {
  queryhandler,
  updateManyByIds,
  updateOneByManyFields,
} from 'src/core/helper/query-helper';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { Product } from 'src/modules/products/schema/products.schema';
import { UploadMediaCommand } from 'src/modules/products/interface';
import { ProductStatus } from 'src/modules/products/products.type';
import { GetAllProductsQuery } from 'src/modules/products/queries/get-all-products.query';
import { UserType } from 'src/modules/users/users.type';
import { CartService } from 'src/modules/cart/cart.service';
import { GetProductsQuery } from 'src/modules/products/queries/get-product.query';
import { Business } from '../business/schema/business.schema';
import { Authority } from '../authority/schema/authority.schema';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(Product.name)
    private ProductModel: Model<Product>,
    @InjectModel(Business.name)
    private BusinessModel: Model<Business>,
    @InjectModel(Authority.name)
    private AuthorityModel: Model<Authority>,
    private campaignService: CampaignService,
    private cartService: CartService,
  ) {}

  async seed() {
    const products = await this.ProductModel.find();

    await Promise.all(
      products.map(async b => {
        const impact = getRandomNumberBetween(9, 73);
        await this.ProductModel.updateOne(
          { _id: b.id },
          {
            $set: { impact },
          },
        );
      }),
    );
  }

  async findOne(productId: string | mongoose.Types.ObjectId): Promise<Product> {
    const populate = {
      path: 'categories subCategories',
      select: `${disSelect}`,
      populate: {
        path: 'icon',
        select: `${disSelect}`,
      },
    };
    const populate1 = {
      path: 'dmoId authorityId',
      select: `${disSelect}`,
    };
    const select = `${disSelect}`;
    try {
      const product = await this.ProductModel.findOne({
        _id: productId,
        status: ProductStatus.ACTIVE,
        deletedAt: null,
        deletedBy: null,
        isDeleted: false,
        $or: [
          { 'quantity.remaining': { $gt: 0 } },
          { 'quantity.isUnlimited': true },
        ],
      })
        .select(select)
        .populate(populate)
        .populate(populate1);

      if (!product) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }
      return product;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async getOne(productId: string, query: GetProductsQuery) {
    try {
      const campDetails = await this.campaignService.findCampaignAndReturn(
        'code',
        query.campCode,
      );

      if (
        !campDetails?.productIds?.length
        && !campDetails?.dmoIds?.length
        && !campDetails?.businessIds?.length
      ) {
        return {};
      }

      const populate = {
        path: 'businessId',
        select: '_id logo name address geoLocation location openingHrs',
      };

      const select
        = '_id name dmoId description images price quantity businessId deliveryArea deliverySpecificSellerInfo isPickUpAvailable categories subCategories';

      const populate1 = {
        path: 'categories subCategories',
        select: '_id name hebrewName',
      };

      const product = await this.ProductModel.findOne({
        _id: productId,
        status: ProductStatus.ACTIVE,
        deletedAt: null,
        deletedBy: null,
        isDeleted: false,
        $or: [
          { 'quantity.remaining': { $gt: 0 } },
          { 'quantity.isUnlimited': true },
        ],
      })
        .populate(populate)
        .populate(populate1)
        .select(select);

      if (!product) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }

      if (
        !campDetails.dmoIds.includes(
          new mongoose.Types.ObjectId(product.dmoId),
        )
        && !campDetails.productIds.includes(
          new mongoose.Types.ObjectId(productId),
        )
        && !campDetails.businessIds.includes(
          new mongoose.Types.ObjectId(product.businessId),
        )
      ) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }

      return product;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async getAllProducts(queries: GetAllProductsQuery) {
    const {
      campCode,
      businessId,
      categoriesId,
      subCategoriesId,
      groupTypesId,
      accessibilitiesId,
      priceMin,
      priceMax,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
      vendorDelivers,
    } = queries;

    const campDetails = await this.campaignService.findCampaignAndReturn(
      'code',
      campCode,
    );

    if (
      !campDetails?.productIds?.length
      && !campDetails?.dmoIds?.length
      && !campDetails?.businessIds?.length
    ) {
      return { data: [] };
    }

    let findQuery: any = {
      status: ProductStatus.ACTIVE,
      isDeleted: false,
      $or: [
        { 'quantity.remaining': { $gt: 0 } },
        { 'quantity.isUnlimited': true },
      ],
    };

    if (vendorDelivers) {
      findQuery = {
        ...findQuery,
        deliveryArea: { $exists: true, $ne: [], $not: { $size: 0 } },
      };
    }

    if (businessId) {
      findQuery = {
        ...findQuery,
        businessId,
      };
    }

    if (campDetails?.dmoIds?.length) {
      findQuery = {
        ...findQuery,
        dmoId: { $in: campDetails.dmoIds },
      };
    }

    if (campDetails?.businessIds?.length) {
      findQuery = {
        ...findQuery,
        businessId: { $in: campDetails.businessIds },
      };
    }

    if (campDetails?.productIds?.length) {
      findQuery = {
        ...findQuery,
        _id: { $in: campDetails.productIds },
      };
    }

    if (categoriesId) {
      const categoriesIds = Array.isArray(categoriesId)
        ? categoriesId
        : [categoriesId];

      findQuery = {
        ...findQuery,
        categories: { $in: categoriesIds },
      };
    }

    if (subCategoriesId) {
      const subCategoriesIds = Array.isArray(subCategoriesId)
        ? subCategoriesId
        : [subCategoriesId];

      findQuery = {
        ...findQuery,
        subCategories: { $in: subCategoriesIds },
      };
    }

    if (groupTypesId) {
      const groupTypeIds = Array.isArray(groupTypesId)
        ? groupTypesId
        : [groupTypesId];

      findQuery = {
        ...findQuery,
        groupTypesId: { $in: groupTypeIds },
      };
    }

    if (accessibilitiesId) {
      const accessibilitiesIds = Array.isArray(accessibilitiesId)
        ? accessibilitiesId
        : [accessibilitiesId];

      findQuery = {
        ...findQuery,
        accessibilitiesId: { $in: accessibilitiesIds },
      };
    }

    if (priceMin && priceMax) {
      const minPrice = Number(priceMin);
      const maxPrice = Number(priceMax);

      if (maxPrice < minPrice) {
        throw new BadRequestException('Invalid Price Range');
      }

      findQuery = {
        ...findQuery,
        'price.sellingPrice': {
          $gte: minPrice,
          $lte: maxPrice,
        },
      };
    }

    if (search) {
      const [matchingBusinessIds, matchingAuthorityIds] = await Promise.all([
        this.BusinessModel.find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { 'address.country': { $regex: search, $options: 'i' } },
            { 'address.city': { $regex: search, $options: 'i' } },
            { 'address.location': { $regex: search, $options: 'i' } },
            {
              'address.additional_information': {
                $regex: search,
                $options: 'i',
              },
            },
            { 'contactDetails.address': { $regex: search, $options: 'i' } },
          ],
        }).select('_id'),
        this.AuthorityModel.find({
          name: { $regex: search, $options: 'i' },
        }).select('_id'),
      ]);

      findQuery = {
        ...findQuery,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { authorityId: { $in: matchingAuthorityIds } },
          { businessId: { $in: matchingBusinessIds } },
        ],
      };
    }

    const select
      = '_id name description images price quantity businessId categories subCategories';

    const populate = [
      {
        path: 'businessId',
        select: '_id logo name address geoLocation location openingHrs',
      },
      {
        path: 'categories subCategories',
        select: '_id name hebrewName',
      },
    ];

    const productsList = await queryhandler<Product>(this.ProductModel, {
      findQuery,
      select,
      page: Number(page),
      limit: Number(limit),
      sort: sortBy || 'createdAt',
      sortOrder: sortOrder || SortOrder.DESC,
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

  async findManyById(ids: string[]): Promise<Product[]> {
    try {
      const findQuery = { _id: { $in: ids }, status: ProductStatus.ACTIVE };
      let select: {};

      const products = await queryhandler<Product>(this.ProductModel, {
        findQuery,
        select,
      });

      if (!products?.data?.length) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }

      return products?.data;
    } catch (error) {
      this.logger.error('[PRODUCT]: FAILED TO LIST PRODUCTS', {
        err: error.message,
      });
      exceptionHandling(error);
    }
  }

  async uploadMedia(command: UploadMediaCommand) {
    try {
      const updatedField = {
        updatedBy: command.loggedInUserId,
        updatedAt: new Date(),
      };

      let updatedProduct: mongoose.Document<unknown, {}, Product> &
        Product & {
          _id: mongoose.Types.ObjectId;
        };
      if (command.role === UserType.SUPERADMIN) {
        updatedProduct = await updateOneByManyFields<Product>(
          this.ProductModel,
          {
            _id: command.productId,
            businessId: command.businessId,
          },
          {
            $push: { images: { $each: command.body } },
            $set: updatedField,
          },
        );
      } else {
        updatedProduct = await updateOneByManyFields<Product>(
          this.ProductModel,
          {
            _id: command.productId,
            businessId: command.businessId,
            $or: [
              { primaryUserId: command.loggedInUserId },
              { collaboratorId: command.loggedInUserId },
            ],
          },
          {
            $push: { images: { $each: command.body } },
            $set: updatedField,
          },
        );
      }

      if (!updatedProduct) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }

      this.logger.info(`[PRODUCT]: UPLOADED IMAGES for ${command.productId}`);

      return updatedProduct;
    } catch (err) {
      this.logger.error(
        `[PRODUCT]: FAILED TO UPLOAD IMAGE productId:${command.productId}`,
        {
          err: err.message,
        },
      );
      exceptionHandling(err);
    }
  }

  async deleteImage(
    loggedInUserId: string,
    id: string,
    imageUrl: any,
  ): Promise<Product> {
    const existingProduct = await this.ProductModel.findById(id);

    if (!existingProduct) {
      throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
    }

    const images = existingProduct.images.filter(
      image => image.image !== imageUrl,
    );

    if (!images?.length) {
      throw new BadRequestException(ServerErrors.PRODUCT.IMAGE_EMPTY);
    }

    const updateProduct = await this.ProductModel.findOneAndUpdate(
      { _id: id },
      { images, updatedAt: new Date(), updatedBy: loggedInUserId },
      { new: true },
    );
    if (!updateProduct) {
      throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
    }

    return updateProduct;
  }

  async assignUserToProducts(
    businessIds: string[],
    assignUserId: string,
    loggedInUserId: string,
  ) {
    try {
      const productIds = await this.ProductModel.distinct('_id', {
        businessId: { $in: businessIds },
      });

      const updatedField = {
        primaryUserId: assignUserId,
        updatedBy: loggedInUserId,
      };
      const updateProducts = await updateManyByIds<Product>(
        this.ProductModel,
        '_id',
        productIds,
        updatedField,
      );

      if (!updateProducts) {
        throw new BadRequestException(ServerErrors.BUSINESS_NOT_FOUND);
      }

      return updateProducts;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async getProductInformationForOrders(productInfo) {
    try {
      const ids = productInfo.map(item => item.id?.toString());
      const products = await this.ProductModel.find({ _id: { $in: ids } });

      if (!products?.length) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }

      return products;
    } catch (error) {
      if (error?.name === 'CastError' && error?.kind === 'ObjectId') {
        throw new BadRequestException(
          `${error?.model?.modelName} ${ServerErrors.INVALID_ID}`,
        );
      }
      exceptionHandling(error);
    }
  }

  async getProductInformationForCart(productInfo) {
    try {
      const product = await this.ProductModel.findOne({
        _id: productInfo?.id,
        $or: [
          { 'quantity.remaining': { $gte: productInfo?.quantity } },
          { 'quantity.isUnlimited': true },
        ],
        isDeleted: false,
        status: ProductStatus.ACTIVE,
      });

      if (!product) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }

      return product;
    } catch (error) {
      if (error?.name === 'CastError' && error?.kind === 'ObjectId') {
        throw new BadRequestException(
          `${error?.model?.modelName} ${ServerErrors.INVALID_ID}`,
        );
      }
      exceptionHandling(error);
    }
  }

  // async checkTofreezeQuantity(products: AddProductToCart[]) {
  //   try {
  //     const availableProducts = await Promise.all(
  //       products.map(async productInfo => {
  //         const product = await this.findOne(productInfo.id);

  //         if (product.quantity.remaining < productInfo.quantity) {
  //           throw new BadRequestException(
  //             `Insufficient quantity for product: ${productInfo.id}`,
  //           );
  //         }
  //       }),
  //     );

  //     return availableProducts;
  //   } catch (err) {
  //     this.logger.error('[VOUCHER]: FAILED TO UPDATE', {
  //       err: err.message,
  //     });
  //     exceptionHandling(err);
  //   }
  // }

  // async freezeQuantity(
  //   products: AddProductToCart[],
  //   cartId: ObjectId,
  //   loggedInUser?: LoggedInUserInterface,
  // ) {
  //   try {
  //     const updatedProducts = await Promise.all(
  //       products.map(async productInfo => {
  //         const product = await this.findOne(productInfo.id);

  //         const updateField = {
  //           'quantity.remaining':
  //             product.quantity.remaining - productInfo.quantity,
  //           $push: {
  //             freeze: {
  //               cartId,
  //               quantity: productInfo.quantity,
  //             },
  //           },
  //           updatedAt: new Date(),
  //           updatedBy: loggedInUser?.id,
  //         };

  //         const updatedProduct = await this.ProductModel.findByIdAndUpdate(
  //           productInfo.id,
  //           updateField,
  //           { new: true },
  //         );

  //         if (!updatedProduct) {
  //           throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
  //         }

  //         return updatedProduct;
  //       }),
  //     );

  //     this.logger.info('[Order-Product]: Quantity freezed', {
  //       message: updatedProducts,
  //     });

  //     return updatedProducts;
  //   } catch (err) {
  //     this.logger.error('[VOUCHER]: FAILED TO UPDATE', {
  //       err: err.message,
  //     });
  //     exceptionHandling(err);
  //   }
  // }

  async deleteFreezeProductPostSuccess(
    products: {
      id: ObjectId;
      quantity: number;
      price: number;
      address: string;
    }[],
    orderId: string,
    loggedInUser: LoggedInUserInterface,
  ) {
    try {
      await Promise.all(
        products.map(async product => {
          const cart = await this.cartService.findOneByOrderId(orderId);
          await this.ProductModel.findOneAndUpdate(
            { _id: product.id },
            {
              $set: { updatedAt: new Date(), updatedBy: loggedInUser?.id },
              $pull: { freeze: { cartId: cart._id } },
            },
            { new: true },
          );
        }),
      );
      this.logger.info('[EXTERNAL-API-PRODUCT]: REMOVE FREEZED ITEM DETAILS', {
        message: products,
      });
    } catch (err) {
      this.logger.error(
        '[EXTERNAL-API-PRODUCT]: FAILED TO REMOVE FREEZE DATA',
        {
          err: err.message,
        },
      );
      exceptionHandling(err);
    }
  }

  async reimburseFreezeProductsPostFailure(
    products: {
      id: ObjectId;
      quantity: number;
      price: number;
      address: string;
    }[],
    orderId: string,
    loggedInUser: LoggedInUserInterface,
  ) {
    try {
      const cart = await this.cartService.findOneByOrderId(orderId);

      await Promise.all(
        products.map(async product => {
          await this.ProductModel.updateOne(
            { _id: product.id, 'freeze.cartId': cart._id },
            [
              {
                $set: {
                  updatedAt: new Date(),
                  updatedBy: loggedInUser?.id,
                  'quantity.remaining': {
                    $add: [
                      '$quantity.remaining',
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
                                  in: '$$filteredFreeze.quantity',
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
                      cond: { $ne: ['$$f.cartId', cart._id] },
                    },
                  },
                },
              },
            ],
            { new: true },
          );
        }),
      );
      this.logger.info(
        '[EXTERNAL-API-PRODUCT]: REIMBURSED PRODUCT QUANTITY ONCE PAYMENT FAILED',
        {
          message: products,
        },
      );
    } catch (err) {
      this.logger.error(
        '[EXTERNAL-API-PRODUCT]: FAILED TO REIMBURSE QUANITTY AFTER PAYMENT FAILED',
        {
          err: err.message,
        },
      );
      exceptionHandling(err);
    }
  }

  async deductQuantity(products) {
    const bulkOps = products.map(pro => ({
      updateOne: {
        filter: { _id: pro.id },
        update: [
          {
            $set: {
              'quantity.remaining': {
                $subtract: ['$quantity.remaining', pro.quantity],
              },
            },
          },
        ],
      },
    }));

    await this.ProductModel.bulkWrite(bulkOps);
  }
}
