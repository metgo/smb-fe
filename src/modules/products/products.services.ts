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

@Injectable()
export class ProductsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(Product.name)
    private ProductModel: Model<Product>,
    @InjectModel(ProductsAudit.name)
    private ProductsAuditModel: Model<ProductsAudit>,
  ) { }

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

      const response = { ...rest, _id: productId, images: sanitizeImages(rest.images) };

      const mappedResponse = await this.localizeProduct(response, locale);

      return mappedResponse;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async getOne(slug: string, query: GetProductsQuery) {
    try {
      const select
        = '_id productId name nameHe nameAr dmoId authorityId description descriptionHe descriptionAr images price quantity businessId';

      const populate = {
        path: 'categories subCategories',
        select: '_id name hebrewName',
      };

      const businessPopulate = {
        path: 'businessId',
        select:
          '_id slug logo name nameHe nameAr shortDescription shortDescriptionHe shortDescriptionAr address geoLocation location tagsId',
      };

      const baseProductFilter: any = {
        slug,
        status: CommonStatus.APPROVED,
        isDeleted: { $ne: true },
        $or: [
          { 'quantity.remaining': { $gt: 0 } },
          { 'quantity.isUnlimited': true },
        ],
      };

      // First try to find the latest audit doc with isActive: true
      let product = await this.ProductsAuditModel.findOne({
        ...baseProductFilter,
        isActive: true,
      })
        .sort({ createdAt: -1 })
        .populate<{ businessId: Business }>(businessPopulate)
        .populate(populate)
        .select(select)
        .lean();

      // If no isActive doc found, fall back to the latest audit doc regardless of isActive
      if (!product) {
        product = await this.ProductsAuditModel.findOne(baseProductFilter)
          .sort({ createdAt: -1 })
          .populate<{ businessId: Business }>(businessPopulate)
          .populate(populate)
          .select(select)
          .lean();
      }

      if (!product && mongoose.Types.ObjectId.isValid(slug)) {
        const baseByIdFilter: any = {
          productId: slug,
          status: CommonStatus.APPROVED,
          isDeleted: { $ne: true },
          $or: [
            { 'quantity.remaining': { $gt: 0 } },
            { 'quantity.isUnlimited': true },
          ],
        };

        // First try isActive: true by productId
        product = await this.ProductsAuditModel.findOne({
          ...baseByIdFilter,
          isActive: true,
        })
          .sort({ createdAt: -1 })
          .populate<{ businessId: Business }>(businessPopulate)
          .populate(populate)
          .select(select)
          .lean();

        // Fall back to latest audit doc by productId
        if (!product) {
          product = await this.ProductsAuditModel.findOne(baseByIdFilter)
            .sort({ createdAt: -1 })
            .populate<{ businessId: Business }>(businessPopulate)
            .populate(populate)
            .select(select)
            .lean();
        }
      }

      if (!product) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }
      const response = await this.localizeProduct(product, query.locale);

      const localizedBusiness = response?.businessId
        ? this.localizeBusinessFields(response.businessId, query.locale)
        : undefined;

      return {
        _id: response?.productId,
        name: response?.name,
        dmoId: response?.dmoId,
        description: response?.description,
        images: sanitizeImages(response?.images),
        price: response?.price,
        quantity: response?.quantity,
        businessId: localizedBusiness,
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

      this.logger.info('[DEDUCT QUANTITY]: Successfully deducted quantity from both collections', {
        productCount: products.length,
      });
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
