import { ICommandHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { Locale } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { Product } from 'src/modules/products/schema/products.schema';
import { GetAllCategoriesQuery } from '../get-all-categories.query';
import { BussCategory } from '../../schema/buss.category.schema';
import { ProductStatus } from 'src/modules/products/products.type';

@QueryHandler(GetAllCategoriesQuery)
export class GetAllCategoriesHandler
implements ICommandHandler<GetAllCategoriesQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(Product.name)
    private readonly ProductModel: Model<Product>,
    @InjectModel('BussCategory')
    private BussCategoryModel: Model<BussCategory>,
    private readonly campaignService: CampaignService,
  ) {}

  async execute(queries: GetAllCategoriesQuery): Promise<any> {
    try {
      const {
        page, limit, search, locale, campCode,
      } = queries.body;

      const campDetails = await this.campaignService.findCampaignAndReturn(
        'code',
        campCode,
      );

      if (!campDetails?.categoryIds?.length) {
        return [];
      }

      const queryPage = page ? Number(page) : null;
      const queryLimit = limit ? Number(limit) : null;

      const findQuery: any = {
        deletedAt: null,
        isDeleted: false,
        deletedBy: null,
        _id: { $in: campDetails.categoryIds },
        ...(search && { name: { $regex: search, $options: 'i' } }),
      };
      const select = '_id name hebrewName';

      const categories = await queryhandler<BussCategory>(
        this.BussCategoryModel,
        {
          findQuery,
          select,
          page: queryPage,
          limit: queryLimit,
          sort: 'createdAt',
          languageQuery: locale || Locale.HEBREW,
        },
      );

      if (
        !campDetails?.productIds?.length
        && !campDetails?.dmoIds?.length
        && !campDetails?.businessIds?.length
      ) {
        return await categories.data.map(cat => ({
          id: cat.id,
          name: cat.name,
          productCount: 0,
        }));
      }

      const productCountQuery: any = {
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
        ...(campDetails?.dmoIds?.length && {
          dmoId: { $in: campDetails.dmoIds },
        }),
        ...(campDetails?.businessIds?.length && {
          businessId: { $in: campDetails.businessIds },
        }),
        ...(campDetails?.productIds?.length && {
          _id: { $in: campDetails.productIds },
        }),
      };

      categories.data = await Promise.all(
        categories?.data?.map(async cat => ({
          id: cat.id,
          name: cat.name,
          productCount: await this.ProductModel.countDocuments({
            ...productCountQuery,
            categories: cat.id,
          }),
        })),
      );

      return categories;
    } catch (err) {
      this.logger.error('[CATEGORIES]: FAILED TO LIST CATEGORIES', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }
}
