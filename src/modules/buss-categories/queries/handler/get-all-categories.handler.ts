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
import { GetAllCategoriesQuery } from '../get-all-categories.query';
import { BussCategory } from '../../schema/buss.category.schema';
import { ProductStatus } from 'src/modules/products/products.type';
import { ProductsAudit } from 'src/modules/products/schema/products-audit.schema';

@QueryHandler(GetAllCategoriesQuery)
export class GetAllCategoriesHandler
implements ICommandHandler<GetAllCategoriesQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(ProductsAudit.name)
    private readonly ProductsAuditModel: Model<ProductsAudit>,
    @InjectModel(BussCategory.name)
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

      if (!campDetails?.category?.length) {
        return [];
      }

      const categoryIds = campDetails.category.map(cat => cat.id);

      const queryPage = page ? Number(page) : null;
      const queryLimit = limit ? Number(limit) : null;

      const findQuery: any = {
        isDeleted: { $ne: true },
        _id: { $in: categoryIds },
        ...(search && { name: { $regex: search, $options: 'i' } }),
      };
      const select = '_id name hebrewName icon description';

      const categories = await queryhandler<BussCategory>(
        this.BussCategoryModel,
        {
          findQuery,
          select,
          populate: 'icon',
          page: queryPage,
          limit: queryLimit,
          languageQuery: locale || Locale.HEBREW,
        },
      );

      // Create a map of category id to order
      const orderMap = new Map(
        (campDetails?.category || []).map(cat => [
          cat.id.toString(),
          cat.order,
        ]),
      );
      categories.data = categories.data.sort((a, b) => {
        const orderA = orderMap.get(a.id.toString()) ?? 9999;
        const orderB = orderMap.get(b.id.toString()) ?? 9999;
        return orderA - orderB;
      });

      if (
        !campDetails?.productIds?.length
        && !campDetails?.dmoIds?.length
        && !campDetails?.businessIds?.length
      ) {
        return await categories.data.map(cat => {
          const matchingCategory = campDetails.category.find(
            c => c.id.toString() === cat.id.toString(),
          );
          return {
            id: cat.id,
            name: matchingCategory?.name || cat.name,
            icon: matchingCategory?.icon || cat.icon.iconPath,
            color: matchingCategory?.color,
            productCount: 0,
            description: matchingCategory?.description || '',
          };
        });
      }

      const productCountQuery: any = {
        status: ProductStatus.APPROVED,
        isDeleted: { $ne: true },
        isActive: true,
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
          productId: { $in: campDetails.productIds },
        }),
      };

      categories.data = await Promise.all(
        categories?.data?.map(async cat => {
          const matchingCategory = campDetails.category.find(
            c => c.id.toString() === cat.id.toString(),
          );

          return {
            id: cat.id,
            name: matchingCategory?.name || cat.name,
            icon: matchingCategory?.icon || cat.icon.iconPath,
            color: matchingCategory?.color,
            description: matchingCategory?.description || '',
            productCount: await this.ProductsAuditModel.countDocuments({
              ...productCountQuery,
              categories: cat.id,
            }),
          };
        }),
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
