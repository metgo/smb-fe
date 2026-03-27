/* eslint-disable no-undef */
/* eslint-disable no-nested-ternary */
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FlattenMaps, Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ObjectId } from 'typeorm';
import { Logger } from 'winston';

import { ServerErrors } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { disSelect } from 'src/common/utils/select.handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { ProductStatus } from 'src/modules/products/products.type';
import { GetProductsQuery } from 'src/modules/products/queries';
import { Business } from '../business/shared/schema/business.schema';
import { ProductsAudit } from './schema/products-audit.schema';
import { Locale } from 'src/common/enum';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(ProductsAudit.name)
    private ProductsAuditModel: Model<ProductsAudit>,
    private campaignService: CampaignService,
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
        status: ProductStatus.APPROVED,
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

      const response = { ...rest, _id: productId };

      const mappedResponse = await this.localizeProduct(response, locale);

      return mappedResponse;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async getOne(slug: string, query: GetProductsQuery) {
    try {
      const campDetails = await this.campaignService.findCampaignAndReturn(
        'code',
        query.campCode,
      );

      if (
        !campDetails?.productIds?.length
        && !campDetails?.dmoIds?.length
        && !campDetails?.authorityIds?.length
        && !campDetails?.businessIds?.length
        && !campDetails?.category?.length
      ) {
        return {};
      }

      const select
        = '_id productId name nameHe nameAr dmoId authorityId description descriptionHe descriptionAr images price quantity businessId deliveryArea deliverySpecificSellerInfo isPickUpAvailable categories subCategories deliveryInfoSameAsBusiness';

      const populate = {
        path: 'categories subCategories',
        select: '_id name hebrewName',
      };

      let product = await this.ProductsAuditModel.findOne({
        slug,
        isActive: true,
        status: ProductStatus.APPROVED,
        isDeleted: { $ne: true },
        $or: [
          { 'quantity.remaining': { $gt: 0 } },
          { 'quantity.isUnlimited': true },
        ],
      })
        .populate<{ businessId: Business }>(
          'businessId',
          '_id logo name nameHe nameAr address geoLocation location openingHrs isAlwaysOpen deliveryArea deliveryAdditionalInfo isPickUpAvailable slug',
        )
        .populate(populate)
        .select(select)
        .lean();

      if (!product) {
        product = await this.ProductsAuditModel.findOne({
          productId: slug,
          isActive: true,
          status: ProductStatus.APPROVED,
          isDeleted: { $ne: true },
          $or: [
            { 'quantity.remaining': { $gt: 0 } },
            { 'quantity.isUnlimited': true },
          ],
        })
          .populate<{ businessId: Business }>(
            'businessId',
            '_id logo name nameHe nameAr address geoLocation location openingHrs isAlwaysOpen deliveryArea deliveryAdditionalInfo isPickUpAvailable slug',
          )
          .populate(populate)
          .select(select)
          .lean();
      }

      if (!product) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }

      if (
        !campDetails.dmoIds.includes(
          new mongoose.Types.ObjectId(product.dmoId),
        )
        && !campDetails.productIds.includes(
          new mongoose.Types.ObjectId(product._id),
        )
        && !campDetails.authorityIds.includes(
          new mongoose.Types.ObjectId(product.authorityId),
        )
        && !campDetails.businessIds.includes(
          new mongoose.Types.ObjectId(product?.businessId?._id),
        )
      ) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }

      const useBusinessInfo: FlattenMaps<Business>
        = product?.deliveryInfoSameAsBusiness
          ? product?.businessId
          : {
            ...product?.businessId,
            deliveryArea: [],
            deliveryAdditionalInfo: '',
            isPickUpAvailable: false,
          };

      const response = await this.localizeProduct(product, query.locale);

      return {
        _id: response?.productId,
        name: response?.name,
        dmoId: response?.dmoId,
        description: response?.description,
        images: response?.images,
        price: response?.price,
        quantity: response?.quantity,
        businessId: response?.businessId,
        deliveryArea: response?.deliveryArea?.length
          ? product.deliveryArea
          : useBusinessInfo?.deliveryArea,

        deliveryAdditionalInfo:
          response?.deliveryAdditionalInfo
          ?? useBusinessInfo?.deliveryAdditionalInfo,
        isPickUpAvailable:
          response?.isPickUpAvailable ?? useBusinessInfo?.isPickUpAvailable,
        deliverySpecificSellerInfo: response?.deliverySpecificSellerInfo,
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
        status: ProductStatus.APPROVED,
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
        status: ProductStatus.APPROVED,
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
    const bulkOps = products.map(pro => ({
      updateOne: {
        filter: { productId: pro.id, isActive: true },
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

    await this.ProductsAuditModel.bulkWrite(bulkOps);
  }

  async findProductsByField(field: keyof ProductsAudit, id: ObjectId[]) {
    const products = await this.ProductsAuditModel.find({
      [field]: { $in: id },
      isActive: true,
      status: ProductStatus.APPROVED,
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
