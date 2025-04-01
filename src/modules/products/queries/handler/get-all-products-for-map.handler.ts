import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';

import { SortOrder } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { GetAllProductsForMapQuery } from '../get-all-products-for-map.query';
import { ProductStatus } from '../../products.type';
import { Business } from 'src/modules/business/schema/business.schema';
import { Authority } from 'src/modules/authority/schema/authority.schema';
import { Product } from '../../schema/products.schema';

@QueryHandler(GetAllProductsForMapQuery)
export class GetAllProductsForMapHandler
implements IQueryHandler<GetAllProductsForMapQuery> {
  constructor(
    @InjectModel(Authority.name)
    private AuthorityModel: Model<Authority>,
    @InjectModel(Business.name)
    private BusinessModel: Model<Business>,
    @InjectModel(Product.name)
    private ProductModel: Model<Product>,
    private campaignService: CampaignService,
  ) {}

  async execute(queries: GetAllProductsForMapQuery): Promise<any> {
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
        page,
        limit,
        sortBy,
        sortOrder,
        vendorDelivers,
      } = queries.query;

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

      const select = '_id name businessId categories subCategories';

      const populate = [
        {
          path: 'businessId',
          select: '_id name address geoLocation',
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
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
