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
import { CommonStatus, Locale } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { disSelect } from 'src/common/utils/select.handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { GetProductsQuery } from 'src/modules/products/queries';
import { Business } from '../business/shared/schema/business.schema';
import { Product } from './schema/products.schema';
import { ProductsAudit } from './schema/products-audit.schema';
import { sanitizeImages } from 'src/core/helper/image.util';
import { PromotionOrdersService } from '../promotion-orders/promotion-orders.service';
import { applyLionCoinStatus } from '../promotion-orders/promotion-orders.utils';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(Product.name)
    private ProductModel: Model<Product>,
    @InjectModel(ProductsAudit.name)
    private ProductsAuditModel: Model<ProductsAudit>,
    private readonly promotionOrdersService: PromotionOrdersService,
  ) {}

  async findOne(
    id: string | mongoose.Types.ObjectId,
    locale: Locale,
  ): Promise<any> {
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
      const product = await this.ProductsAuditModel.findOne({
        productId: id,
        isActive: true,
        status: CommonStatus.APPROVED,
        isDeleted: { $ne: true },
        $or: [
          { 'quantity.remaining': { $gt: 0 } },
          { 'quantity.isUnlimited': true },
        ],
      })
        .select(select)
        .populate(populate)
        .populate(populate1)
        .lean();

      if (!product) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }

      const { productId, ...rest } = product;

      const response = {
        ...rest,
        _id: productId,
        images: sanitizeImages(rest.images),
      };

      const mappedResponse = await this.localizeProduct(response, locale);

      return mappedResponse;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async getOne(slug: string, query: GetProductsQuery) {
    try {
      const select
        = '_id productId name nameHe nameAr dmoId authorityId description descriptionHe descriptionAr images price quantity businessId deliveryInfoSameAsBusiness deliveryArea deliveryAdditionalInfo deliverySpecificSellerInfo isPickUpAvailable globalDelivery globalDeliveryArea vendorDelivers vendorDeliveryArea';
      // status/isDeleted aren't in the response shape but are needed by
      // isVisible() below — select() is a projection, so they must be
      // explicitly requested or they come back undefined on the lean doc.
      const selectWithVisibilityFields = `${select} status isDeleted`;

      const populate = {
        path: 'categories subCategories',
        select: '_id name hebrewName',
      };

      const businessPopulate = {
        path: 'businessId',
        select:
          '_id slug logo name nameHe nameAr shortDescription shortDescriptionHe shortDescriptionAr address geoLocation location tagsId deliveryArea deliveryAdditionalInfo isPickUpAvailable vendorDelivers vendorDeliveryArea globalDelivery globalDeliveryArea',
      };

      // A doc is only servable if it's still APPROVED, not deleted, and in
      // stock/unlimited — checked AFTER picking the latest doc (below), not
      // baked into the query before sorting by recency. Filtering by status
      // first would let an older still-APPROVED audit version win once the
      // real latest version stopped matching (e.g. after the product was
      // closed/rejected/archived), resurfacing a product that should 404.
      const isVisible = (doc: any): boolean => !!doc
        && doc.status === CommonStatus.APPROVED
        && doc.isDeleted !== true
        && (doc.quantity?.remaining > 0 || doc.quantity?.isUnlimited === true);

      // Find the truly-latest audit doc for this slug, regardless of status/isActive.
      let product = await this.ProductsAuditModel.findOne({ slug })
        .sort({ createdAt: -1 })
        .populate<{ businessId: Business }>(businessPopulate)
        .populate(populate)
        .select(selectWithVisibilityFields)
        .lean();

      if (!isVisible(product) && mongoose.Types.ObjectId.isValid(slug)) {
        product = await this.ProductsAuditModel.findOne({ productId: slug })
          .sort({ createdAt: -1 })
          .populate<{ businessId: Business }>(businessPopulate)
          .populate(populate)
          .select(selectWithVisibilityFields)
          .lean();
      }

      if (!isVisible(product)) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }
      // Business delivery fields are only fetched as a fallback for the
      // product's own delivery info — keep them out of the businessId payload.
      const {
        deliveryArea: businessDeliveryArea,
        deliveryAdditionalInfo: businessDeliveryAdditionalInfo,
        isPickUpAvailable: businessIsPickUpAvailable,
        vendorDelivers: businessVendorDelivers,
        vendorDeliveryArea: businessVendorDeliveryArea,
        globalDelivery: businessGlobalDelivery,
        globalDeliveryArea: businessGlobalDeliveryArea,
        ...business
      } = (product.businessId ?? {}) as any;

      const useBusinessInfo = product.deliveryInfoSameAsBusiness
        ? {
          deliveryArea: businessDeliveryArea,
          deliveryAdditionalInfo: businessDeliveryAdditionalInfo,
          isPickUpAvailable: businessIsPickUpAvailable,
          vendorDelivers: businessVendorDelivers,
          vendorDeliveryArea: businessVendorDeliveryArea,
          globalDelivery: businessGlobalDelivery,
          globalDeliveryArea: businessGlobalDeliveryArea,
        }
        : {
          deliveryArea: [],
          deliveryAdditionalInfo: '',
          isPickUpAvailable: false,
          vendorDelivers: false,
          vendorDeliveryArea: [],
          globalDelivery: false,
          globalDeliveryArea: [],
        };

      const response = await this.localizeProduct(product, query.locale);

      const localizedBusiness = product.businessId
        ? this.localizeBusinessFields(business, query.locale)
        : undefined;

      // Lion Coin status for this business (all-redeemed flag + coins-left counter)
      const [promotionStatus] = product.businessId?._id
        ? await this.promotionOrdersService.getStatusForBusinesses(
          [product.businessId._id.toString()],
        )
        : [];

      const businessIdWithLionCoin = localizedBusiness
        ? applyLionCoinStatus({ ...localizedBusiness }, promotionStatus)
        : undefined;

      return {
        _id: response?.productId,
        name: response?.name,
        dmoId: response?.dmoId,
        description: response?.description,
        images: sanitizeImages(response?.images),
        price: response?.price,
        quantity: response?.quantity,
        businessId: businessIdWithLionCoin,
        deliveryArea: response?.deliveryArea?.length
          ? response.deliveryArea
          : useBusinessInfo.deliveryArea,
        deliveryAdditionalInfo:
          response?.deliveryAdditionalInfo
          ?? useBusinessInfo.deliveryAdditionalInfo,
        isPickUpAvailable:
          response?.isPickUpAvailable ?? useBusinessInfo.isPickUpAvailable,
        deliverySpecificSellerInfo: response?.deliverySpecificSellerInfo,
        vendorDelivers: useBusinessInfo.vendorDelivers ?? false,
        vendorDeliveryArea: useBusinessInfo.vendorDeliveryArea ?? [],
        globalDelivery: useBusinessInfo.globalDelivery ?? false,
        globalDeliveryArea: useBusinessInfo.globalDeliveryArea ?? [],
        categories: response?.categories,
        subCategories: response?.subCategories,
      };
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async findManyById(ids: string[]): Promise<ProductsAudit[]> {
    try {
      const findQuery = {
        productId: { $in: ids },
        status: CommonStatus.APPROVED,
        isActive: true,
        isDeleted: { $ne: true },
      };
      const select = `${disSelect}`;

      const products = await queryhandler<ProductsAudit>(
        this.ProductsAuditModel,
        {
          findQuery,
          select,
          isLean: true,
        },
      );

      if (!products?.data?.length) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }

      const mappedProducts = products.data.map((product: any) => {
        const { _id, productId, ...rest } = product.toObject
          ? product.toObject()
          : product;

        return {
          ...rest,
          _id: productId,
        };
      });

      const response = await Promise.all(
        mappedProducts.map(p => this.localizeProduct(p, Locale.HEBREW)),
      );

      return response;
    } catch (error) {
      this.logger.error('[PRODUCT]: FAILED TO LIST PRODUCTS', {
        err: error.message,
      });
      exceptionHandling(error);
    }
  }

  async getProductInformationForOrders(productInfo) {
    try {
      const ids = productInfo.map(item => item.id?.toString());
      const products = await this.ProductsAuditModel.find({
        productId: { $in: ids },
        isActive: true,
        isDeleted: { $ne: true },
      }).lean();

      if (!products?.length) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }

      const mappedProducts = await Promise.all(
        products.map((product: any) => {
          const { _id, productId, ...rest } = product.toObject
            ? product.toObject()
            : product;

          return {
            ...rest,
            _id: productId,
          };
        }),
      );

      const response = await Promise.all(
        mappedProducts.map(p => this.localizeProduct(p, Locale.HEBREW)),
      );
      return response;
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
      const product = await this.ProductsAuditModel.findOne({
        productId: productInfo?.id,
        $or: [
          { 'quantity.remaining': { $gte: productInfo?.quantity } },
          { 'quantity.isUnlimited': true },
        ],
        isDeleted: { $ne: true },
        status: CommonStatus.APPROVED,
        isActive: true,
      }).lean();

      if (!product) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }

      const { productId, ...rest } = product;

      const response = { ...rest, _id: productId };

      const mappedResponse = await this.localizeProduct(
        response,
        Locale.HEBREW,
      );

      return mappedResponse;
    } catch (error) {
      if (error?.name === 'CastError' && error?.kind === 'ObjectId') {
        throw new BadRequestException(
          `${error?.model?.modelName} ${ServerErrors.INVALID_ID}`,
        );
      }
      exceptionHandling(error);
    }
  }

  async deductQuantity(products) {
    try {
      const productBulkOps = products.map(pro => ({
        updateOne: {
          filter: { _id: pro.id },
          update: [
            {
              $set: {
                'quantity.remaining': {
                  $subtract: ['$quantity.remaining', pro.quantity],
                },
                'quantity.sold': {
                  $add: ['$quantity.sold', pro.quantity],
                },
              },
            },
          ],
        },
      }));

      const auditBulkOps = products.map(pro => ({
        updateOne: {
          filter: { productId: pro.id, isActive: true },
          update: [
            {
              $set: {
                'quantity.remaining': {
                  $subtract: ['$quantity.remaining', pro.quantity],
                },
                'quantity.sold': {
                  $add: ['$quantity.sold', pro.quantity],
                },
              },
            },
          ],
        },
      }));

      await Promise.all([
        this.ProductModel.bulkWrite(productBulkOps),
        this.ProductsAuditModel.bulkWrite(auditBulkOps),
      ]);

      this.logger.info(
        '[DEDUCT QUANTITY]: Successfully deducted quantity from both collections',
        {
          productCount: products.length,
        },
      );
    } catch (error) {
      this.logger.error('[DEDUCT QUANTITY]: Failed to deduct quantity', {
        err: error.message,
        productCount: products.length,
      });
      throw error;
    }
  }

  async findProductsByField(field: keyof ProductsAudit, id: ObjectId[]) {
    const products = await this.ProductsAuditModel.find({
      [field]: { $in: id },
      isActive: true,
      status: CommonStatus.APPROVED,
      isDeleted: { $ne: true },
      $or: [
        { 'quantity.remaining': { $gt: 0 } },
        { 'quantity.isUnlimited': true },
      ],
    })
      .select('_id')
      .lean();

    if (!products) {
      throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
    }
    return products;
  }

  localizeBusinessFields(business: any, locale: Locale) {
    const {
      name,
      nameHe,
      nameAr,
      shortDescription,
      shortDescriptionHe,
      shortDescriptionAr,
      tagsId,
      ...rest
    } = business;

    const localizedName
      = locale === Locale.HEBREW
        ? nameHe || name || nameAr
        : locale === Locale.ARABIC
          ? nameAr || name || nameHe
          : name || nameHe || nameAr;

    const localizedShortDescription
      = locale === Locale.HEBREW
        ? shortDescriptionHe || shortDescription || shortDescriptionAr
        : locale === Locale.ARABIC
          ? shortDescriptionAr || shortDescription || shortDescriptionHe
          : shortDescription || shortDescriptionHe || shortDescriptionAr;

    const localizedTags = (tagsId || []).map((tag: any) => ({
      _id: tag._id,
      name:
        locale === Locale.HEBREW
          ? tag.nameHe || tag.name || tag.nameAr
          : locale === Locale.ARABIC
            ? tag.nameAr || tag.name || tag.nameHe
            : tag.name || tag.nameHe || tag.nameAr,
    }));

    return {
      ...rest,
      name: localizedName,
      shortDescription: localizedShortDescription,
      tagsId: localizedTags,
    };
  }

  async localizeProduct(product: any, locale: Locale) {
    const {
      nameAr,
      descriptionAr,
      shortDescriptionAr,
      name,
      description,
      shortDescription,
      nameHe,
      descriptionHe,
      shortDescriptionHe,
      ...rest
    } = product;

    switch (locale) {
      case Locale.ARABIC:
        return {
          ...rest,
          name: nameAr || name || nameHe,
          description: descriptionAr || description || descriptionHe,
          shortDescription:
            shortDescriptionAr || shortDescription || shortDescriptionHe,
        };
      case Locale.HEBREW:
        return {
          ...rest,
          name: nameHe || name || nameAr,
          description: descriptionHe || description || descriptionAr,
          shortDescription:
            shortDescriptionHe || shortDescription || shortDescriptionAr,
        };

      case Locale.ENGLISH:
        return {
          ...rest,
          name: name || nameHe || nameAr,
          description: description || descriptionHe || descriptionAr,
          shortDescription:
            shortDescription || shortDescriptionHe || shortDescriptionAr,
        };
      default:
        return product;
    }
  }
}
