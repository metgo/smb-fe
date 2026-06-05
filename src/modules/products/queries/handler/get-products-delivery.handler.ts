import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { GetProductsDeliveryQuery } from '../get-products-delivery-info.query';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { ProductsService } from '../../products.services';
import { Business } from 'src/modules/business/shared/schema/business.schema';
import { ProductsAudit } from '../../schema/products-audit.schema';
import { CommonStatus } from 'src/common/enum';

@QueryHandler(GetProductsDeliveryQuery)
export class GetProductsDeliveryHandler
implements IQueryHandler<GetProductsDeliveryQuery> {
  constructor(
    @InjectModel(ProductsAudit.name)
    private ProductsAuditModel: Model<ProductsAudit>,

    private campaignService: CampaignService,
    private productService: ProductsService,
  ) {}

  async execute(queries: GetProductsDeliveryQuery): Promise<any> {
    try {
      const { campCode, id, locale } = queries.query;

      const campDetails = await this.campaignService.findCampaignAndReturn(
        'code',
        campCode,
      );

      if (
        !campDetails?.productIds?.length
        && !campDetails?.dmoIds?.length
        && !campDetails?.authorityIds?.length
        && !campDetails?.businessIds?.length
        && !campDetails?.category?.length
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

      // const categoryIds = campDetails.category.map(cat => cat.id);

      const findQuery = {
        status: CommonStatus.APPROVED,
        isActive: true,
        isDeleted: { $ne: true },
        productId: { $in: filteredProductIds },
        // categories: { $in: categoryIds },
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
        = '_id productId name nameHe nameAr images price quantity businessId deliveryInfoSameAsBusiness deliveryArea deliveryAdditionalInfo isPickUpAvailable globalDelivery globalDeliveryArea vendorDelivers';

      const populate = [
        {
          path: 'businessId',
          select:
            '_id name nameHe nameAr deliveryArea deliveryAdditionalInfo isPickUpAvailable vendorDelivers vendorDeliveryArea globalDelivery globalDeliveryArea status isDeleted',
        },
      ];

      const productsList = await queryhandler<ProductsAudit>(
        this.ProductsAuditModel,
        {
          findQuery,
          select,
          populate,
          isLean: true,
        },
      );

      if (!productsList?.data || !productsList.data?.length) {
        return {
          totalData: 0,
          products: [],
        };
      }

      const filteredProducts = productsList.data.filter((product: any) => {
        const business = product?.businessId as any;
        return business && business.status === CommonStatus.APPROVED && !business.isDeleted;
      });

      const productsDeliveryInfo = await Promise.all(
        filteredProducts.map(async product => {
          const useBusinessInfo: Business = product?.deliveryInfoSameAsBusiness
            ? product?.businessId
            : {
              ...product?.businessId,
              deliveryArea: [],
              deliveryAdditionalInfo: '',
              isPickUpAvailable: false,
            };

          const response = await this.productService.localizeProduct(
            product,
            locale,
          );

          return {
            _id: response?.productId,
            name: response?.name,
            images: response?.images[0],
            price: response?.price?.sellingPrice,
            businessId: response?.businessId,
            quantity: {
              remaining: response?.quantity?.remaining,
              isUnlimited: response?.quantity?.isUnlimited,
            },
            deliveryArea: response?.deliveryArea?.length
              ? product.deliveryArea
              : useBusinessInfo?.deliveryArea,

            deliveryAdditionalInfo:
              response?.deliveryAdditionalInfo
              ?? useBusinessInfo?.deliveryAdditionalInfo,
            isPickUpAvailable:
              response?.isPickUpAvailable ?? useBusinessInfo?.isPickUpAvailable,
            vendorDelivers: useBusinessInfo?.vendorDelivers ?? false,
            globalDelivery: useBusinessInfo?.globalDelivery ?? false,
            globalDeliveryArea: useBusinessInfo?.globalDeliveryArea ?? [],
          };
        }),
      );

      return productsDeliveryInfo;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
