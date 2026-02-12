import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { ProductStatus } from '../../products.type';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { GetAllProductsRawQuery } from '../get-all-products-rawquery.query';

@QueryHandler(GetAllProductsRawQuery)
export class GetAllProductsRawQueryHandler
implements IQueryHandler<GetAllProductsRawQuery> {
  constructor(
    @InjectModel(BussCategory.name)
    private CategoryModel: Model<BussCategory>,
    private campaignService: CampaignService,
  ) {}

  async execute(queries: GetAllProductsRawQuery): Promise<any> {
    try {
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
        vendorDelivers,
      } = queries;

      const campDetails = await this.campaignService.findCampaignAndReturn(
        'code',
        campCode,
      );

      if (
        !campDetails?.productIds?.length
        && !campDetails?.dmoIds?.length
        && !campDetails?.authorityIds?.length
        && !campDetails?.businessIds?.length
      ) {
        return { data: [] };
      }

      let findQuery: any = {
        status: ProductStatus.ACTIVE,
        isDeleted: false,
        $and: [
          {
            $or: [
              { 'quantity.remaining': { $gt: 0 } },
              { 'quantity.isUnlimited': true },
            ],
          },
        ],
      };

      if (vendorDelivers) {
        findQuery = {
          ...findQuery,
          deliveryArea: { $exists: true, $ne: [], $not: { $size: 0 } },
        };
      }

      const orConditions = [];

      if (campDetails?.dmoIds?.length) {
        orConditions.push({ dmoId: { $in: campDetails.dmoIds } });
      }

      if (campDetails?.authorityIds?.length) {
        orConditions.push({ authorityId: { $in: campDetails.authorityIds } });
      }

      if (campDetails?.businessIds?.length) {
        orConditions.push({ businessId: { $in: campDetails.businessIds } });
      }

      if (campDetails?.productIds?.length) {
        orConditions.push({ _id: { $in: campDetails.productIds } });
      }

      if (orConditions.length) {
        findQuery = {
          ...findQuery,
          $and: [
            ...findQuery.$and,
            {
              $or: orConditions,
            },
          ],
        };
      }

      if (businessId) {
        const businessIds = Array.isArray(businessId)
          ? businessId
          : [businessId];

        findQuery = {
          ...findQuery,
          businessId: { $in: businessIds },
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

      // const categoryIds = campDetails.category.map(cat => cat.id);

      // if (!categoriesId && categoryIds.length) {
      //   findQuery = {
      //     ...findQuery,
      //     categories: { $in: categoryIds },
      //   };
      // }

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
        const matchingCategoryIds = await this.CategoryModel.find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { hebrewName: { $regex: search, $options: 'i' } },
          ],
        }).select('_id');

        findQuery = {
          ...findQuery,
          $and: [
            ...findQuery.$and,
            {
              $or: [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { categories: { $in: matchingCategoryIds } },
              ],
            },
          ],
        };
      }

      return findQuery;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
