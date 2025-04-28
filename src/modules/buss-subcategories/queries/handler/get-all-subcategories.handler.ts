import { ICommandHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
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
import { Product } from 'src/modules/products/schema/products.schema';
import { GetAllProductsRawQuery } from 'src/modules/products/queries/get-all-products-rawquery.query';

@QueryHandler(GetAllSubCategoriesQuery)
export class GetAllSubCategoriesHandler
implements ICommandHandler<GetAllSubCategoriesQuery> {
  constructor(
    private queryBus: QueryBus,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel('BussSubCategory')
    private readonly BussSubCategoryModel: Model<BussSubCategory>,
    @InjectModel(Product.name)
    private readonly ProductModel: Model<Product>,
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

      const findQueryProduct = await this.queryBus.execute(
        new GetAllProductsRawQuery(
          campCode,
          null,
          bussCategoryId,
          null,
          groupTypesId,
          accessibilitiesId,
          priceMin,
          priceMax,
          search,
          vendorDelivers,
        ),
      );

      const subCategoryIds = await this.ProductModel.distinct('subCategories', {
        ...findQueryProduct,
        subCategories: { $exists: true, $ne: [] },
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

          const productCount = await this.ProductModel.countDocuments({
            ...findQueryProduct,
            subCategories: subCat._id,
          });
          return {
            id: subCat._id,
            name: subCat.name,
            parent,
            productCount,
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
