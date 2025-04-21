import { ICommandHandler, QueryHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { Locale } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { GetAllSubCategoriesQuery } from '../get-all-subcategories.query';
import { BussSubCategory } from '../../schema/buss-subCategory.schema';
import { ProductStatus } from 'src/modules/products/products.type';
import { Product } from 'src/modules/products/schema/products.schema';
import { Business } from 'src/modules/business/schema/business.schema';
import { Authority } from 'src/modules/authority/schema/authority.schema';

@QueryHandler(GetAllSubCategoriesQuery)
export class GetAllSubCategoriesHandler
implements ICommandHandler<GetAllSubCategoriesQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel('BussSubCategory')
    private readonly BussSubCategoryModel: Model<BussSubCategory>,
    @InjectModel(Product.name)
    private readonly ProductModel: Model<Product>,
    @InjectModel(Business.name)
    private readonly BusinessModel: Model<Business>,
    @InjectModel(Authority.name)
    private readonly AuthorityModel: Model<Authority>,
    private readonly campaignService: CampaignService,
  ) {}

  async execute(queries: GetAllSubCategoriesQuery): Promise<any> {
    try {
      const {
        page,
        limit,
        search,
        locale,
        campCode,
        bussCategoryId,
        groupTypesId,
        accessibilitiesId,
        vendorDelivers,
        priceMin,
        priceMax,
      } = queries.body;

      const campDetails = await this.campaignService.findCampaignAndReturn(
        'code',
        campCode,
      );

      if (!campDetails?.categoryIds?.length) {
        return [];
      }

      if (
        !campDetails?.productIds?.length
        && !campDetails?.dmoIds?.length
        && !campDetails?.businessIds?.length
      ) {
        return [];
      }

      if (
        !campDetails.categoryIds.includes(
          new mongoose.Types.ObjectId(bussCategoryId),
        )
      ) {
        return [];
      }

      let findQueryProduct: any = {
        subCategories: { $exists: true, $ne: [] },
        status: ProductStatus.ACTIVE,
        isDeleted: false,
        $or: [
          { 'quantity.remaining': { $gt: 0 } },
          { 'quantity.isUnlimited': true },
        ],
      };

      if (vendorDelivers) {
        findQueryProduct = {
          ...findQueryProduct,
          deliveryArea: { $exists: true, $ne: [], $not: { $size: 0 } },
        };
      }

      const orConditions = [];

      if (campDetails?.dmoIds?.length) {
        orConditions.push({ dmoId: { $in: campDetails.dmoIds } });
      }

      if (campDetails?.businessIds?.length) {
        orConditions.push({ businessId: { $in: campDetails.businessIds } });
      }

      if (campDetails?.productIds?.length) {
        orConditions.push({ _id: { $in: campDetails.productIds } });
      }

      if (orConditions.length) {
        findQueryProduct = {
          ...findQueryProduct,
          $or: orConditions,
        };
      }

      if (groupTypesId) {
        const groupTypeIds = Array.isArray(groupTypesId)
          ? groupTypesId
          : [groupTypesId];

        findQueryProduct = {
          ...findQueryProduct,
          groupTypesId: { $in: groupTypeIds },
        };
      }

      if (accessibilitiesId) {
        const accessibilitiesIds = Array.isArray(accessibilitiesId)
          ? accessibilitiesId
          : [accessibilitiesId];

        findQueryProduct = {
          ...findQueryProduct,
          accessibilitiesId: { $in: accessibilitiesIds },
        };
      }

      if (priceMin && priceMax) {
        const minPrice = Number(priceMin);
        const maxPrice = Number(priceMax);

        if (maxPrice < minPrice) {
          throw new BadRequestException('Invalid Price Range');
        }

        findQueryProduct = {
          ...findQueryProduct,
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

        findQueryProduct = {
          ...findQueryProduct,
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { authorityId: { $in: matchingAuthorityIds } },
            { businessId: { $in: matchingBusinessIds } },
          ],
        };
      }

      const rawSubCategoryIds = await this.ProductModel.distinct(
        'subCategories',
        {
          ...findQueryProduct,
        },
      );

      const subCategoryIds = rawSubCategoryIds.map(item => {
        if (item && typeof item === 'object' && '$oid' in item) {
          return new mongoose.Types.ObjectId(item.$oid);
        }
        return new mongoose.Types.ObjectId(item);
      });

      if (!subCategoryIds) {
        return [];
      }

      const findQuery: any = {
        _id: { $in: subCategoryIds },
        bussCategoryId: { $in: bussCategoryId },
      };

      const queryPage = page ? Number(page) : null;
      const queryLimit = limit ? Number(limit) : null;

      const select = '_id name hebrewName';
      const populate = {
        path: 'bussCategoryId',
        select,
      };

      const bussSubCategory = await queryhandler<BussSubCategory>(
        this.BussSubCategoryModel,
        {
          findQuery,
          select,
          page: queryPage,
          limit: queryLimit,
          populate,
          sort: 'name',
          languageQuery: locale || Locale.HEBREW,
        },
      );

      bussSubCategory.data = await Promise.all(
        bussSubCategory?.data?.map(async subCat => {
          const parent = subCat?.bussCategoryId?.length
            ? await Promise.all(
              subCat.bussCategoryId.map(cat => (locale === Locale.ENGLISH ? cat.name : cat.hebrewName)),
            )
            : [];
          return {
            id: subCat.id,
            name: subCat.name,
            parent,
          };
        }),
      );
      return bussSubCategory;
    } catch (err) {
      this.logger.error('[SUBCATEGORIES]: FAILED TO LIST SUBCATEGORIES', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }
}
