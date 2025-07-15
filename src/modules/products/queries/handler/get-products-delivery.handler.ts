import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { Product } from '../../schema/products.schema';
import { GetProductsDeliveryQuery } from '../get-products-delivery-info.query';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { ProductStatus } from '../../products.type';
import { ProductsService } from '../../products.services';
import { Business } from 'src/modules/business/shared/schema/business.schema';

@QueryHandler(GetProductsDeliveryQuery)
export class GetProductsDeliveryHandler
implements IQueryHandler<GetProductsDeliveryQuery> {
  constructor(
    @InjectModel(Product.name)
    private ProductModel: Model<Product>,
    private campaignService: CampaignService,
    private productService: ProductsService,
  ) {}

  async execute(queries: GetProductsDeliveryQuery): Promise<any> {
    try {
      const { campCode, id } = queries.query;

      const campDetails = await this.campaignService.findCampaignAndReturn(
        'code',
        campCode,
      );

      if (
        !campDetails?.productIds?.length
        && !campDetails?.dmoIds?.length
        && !campDetails?.authorityIds?.length
        && !campDetails?.businessIds?.length
        && !campDetails?.categoryIds?.length
      ) {
        return { data: [] };
      }

      const productIds = Array.isArray(id) ? id : [id];

      const validProductIdsSet = new Set<string>();
      if (campDetails.productIds?.length) {
        campDetails.productIds.forEach(pid => validProductIdsSet.add(pid.toString()));
      }

      if (campDetails.businessIds?.length) {
        const businessProducts = await this.productService.findProductsByField(
          'businessId',
          campDetails.businessIds,
        );
        businessProducts.forEach(prod => validProductIdsSet.add(prod._id.toString()));
      }

      if (campDetails.dmoIds?.length) {
        const dmoProducts = await this.productService.findProductsByField(
          'dmoId',
          campDetails.dmoIds,
        );
        dmoProducts.forEach(prod => validProductIdsSet.add(prod._id.toString()));
      }

      if (campDetails.authorityIds?.length) {
        const authorityProducts = await this.productService.findProductsByField(
          'authorityId',
          campDetails.authorityIds,
        );
        authorityProducts.forEach(prod => validProductIdsSet.add(prod._id.toString()));
      }

      const filteredProductIds = productIds.filter(prodId => validProductIdsSet.has(prodId.toString()));

      const findQuery = {
        status: ProductStatus.ACTIVE,
        isDeleted: false,
        _id: { $in: filteredProductIds },
        categories: { $in: campDetails?.categoryIds },
        $and: [
          {
            $or: [
              { 'quantity.remaining': { $gt: 0 } },
              { 'quantity.isUnlimited': true },
            ],
          },
        ],
      };

      const select
        = '_id name images price quantity businessId deliveryInfoSameAsBusiness deliveryArea deliveryAdditionalInfo isPickUpAvailable';

      const populate = [
        {
          path: 'businessId',
          select:
            '_id name deliveryArea deliveryAdditionalInfo isPickUpAvailable',
        },
      ];

      const productsList = await queryhandler<Product>(this.ProductModel, {
        findQuery,
        select,
        populate,
      });

      if (!productsList?.data || !productsList.data?.length) {
        return {
          totalData: 0,
          products: [],
        };
      }

      const productsDeliveryInfo = await Promise.all(
        productsList.data.map(product => {
          const useBusinessInfo: Business = product?.deliveryInfoSameAsBusiness
            ? product?.businessId
            : {
              ...product?.businessId,
              deliveryArea: [],
              deliveryAdditionalInfo: '',
              isPickUpAvailable: false,
            };

          return {
            _id: product?._id,
            name: product?.name,
            images: product?.images[0],
            price: product?.price?.sellingPrice,
            businessId: product?.businessId,
            quantity: {
              remaining: product?.quantity?.remaining,
              isUnlimited: product?.quantity?.isUnlimited,
            },
            deliveryArea: product?.deliveryArea?.length
              ? product.deliveryArea
              : useBusinessInfo?.deliveryArea,

            deliveryAdditionalInfo:
              product?.deliveryAdditionalInfo
              ?? useBusinessInfo?.deliveryAdditionalInfo,
            isPickUpAvailable:
              product?.isPickUpAvailable ?? useBusinessInfo?.isPickUpAvailable,
          };
        }),
      );

      return productsDeliveryInfo;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
