import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CommonStatus } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import {
  buildHebrewSearchRegex,
  normalizeHebrewSearch,
} from 'src/core/helper/atlas-search.util';
import { expandSearchTerms } from 'src/core/helper/search-expansion.util';
import { ConfigService } from 'src/services/config/config.service';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { Tags } from 'src/modules/tags/schema/tags.schema';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { GetCombinedSearchQuery } from '../get-combined-search.query';
import { BusinessesAudit } from 'src/modules/business/shared/schema/businesses-audit.schema';
import { EventsAudit } from 'src/modules/events/schema/events-audit.schema';
import { ProductsAudit } from 'src/modules/products/schema/products-audit.schema';

@QueryHandler(GetCombinedSearchQuery)
export class GetCombinedSearchHandler
implements IQueryHandler<GetCombinedSearchQuery> {
  constructor(
    @InjectModel(BusinessesAudit.name)
    private BusinessesAuditModel: Model<BusinessesAudit>,
    @InjectModel(EventsAudit.name)
    private EventsAuditModel: Model<EventsAudit>,
    @InjectModel(ProductsAudit.name)
    private ProductsAuditModel: Model<ProductsAudit>,
    @InjectModel(Tags.name)
    private TagModel: Model<Tags>,
    @InjectModel(BussCategory.name)
    private CategoryModel: Model<BussCategory>,
    private campaignService: CampaignService,
    private readonly configService: ConfigService,
  ) {}

  async execute(queries: GetCombinedSearchQuery): Promise<any> {
    try {
      const { search, campCode } = queries.query;
      const campDetails = await this.campaignService.findCampaignAndReturn(
        'code',
        campCode,
      );

      if (
        !campDetails?.dmoIds?.length
        && !campDetails?.authorityIds?.length
        && !campDetails?.businessIds?.length
      ) {
        return {
          totalData: 0,
          businesses: [],
          events: [],
          products: [],
        };
      }

      const businessBaseQuery: any = {
        status: CommonStatus.APPROVED,
        isActive: true,
        $and: [],
      };

      const productBaseQuery: any = {
        status: CommonStatus.APPROVED,
        isActive: true,
        $and: [],
      };

      const eventBaseQuery: any = {
        status: CommonStatus.APPROVED,
        isActive: true,
        $and: [],
      };

      const select
        = '_id name nameHe nameAr descriptionHe descriptionAr description images logo slug';

      const normalizedSearch = normalizeHebrewSearch(search);
      const expandedTerms = await expandSearchTerms(
        normalizedSearch,
        this.configService.get('GEMINI_API_KEY'),
      );
      // Combine all expanded terms into one regex pattern (OR of all variants)
      const combinedPattern = expandedTerms
        .map(t => buildHebrewSearchRegex(t).source)
        .join('|');
      const regex = { $regex: combinedPattern, $options: 'i' };
      console.log(
        '[Combined Search] original:',
        search,
        '| expanded terms:',
        expandedTerms,
      );

      const searchTerms = [search, ...expandedTerms].filter(
        (t, i, arr) => t && arr.indexOf(t) === i,
      );

      // Contextual Search: Find categories matching search terms
      let matchingCategoryIds: any[] = [];
      try {
        const categoryOrQueries = searchTerms
          .map(t => {
            const r = buildHebrewSearchRegex(t);
            return [
              { name: { $regex: r.source, $options: 'i' } },
              { hebrewName: { $regex: r.source, $options: 'i' } },
            ];
          })
          .flat();
        matchingCategoryIds = await this.CategoryModel.find({
          $or: categoryOrQueries,
        }).select('_id');
      } catch (catError) {
        console.warn(
          '[Contextual Combined Search] Failed to fetch matching categories:',
          catError?.message,
        );
      }

      // Contextual Search: Find tags matching search terms
      let matchingTagIds: any[] = [];
      try {
        const tagOrQueries = searchTerms
          .map(t => {
            const r = buildHebrewSearchRegex(t);
            return [
              { name: { $regex: r.source, $options: 'i' } },
              { nameHe: { $regex: r.source, $options: 'i' } },
              { nameAr: { $regex: r.source, $options: 'i' } },
            ];
          })
          .flat();
        matchingTagIds = await this.TagModel.find({
          $or: tagOrQueries,
        }).select('_id');
      } catch (tagError) {
        console.warn(
          '[Contextual Combined Search] Failed to fetch matching tags:',
          tagError?.message,
        );
      }

      const businessSearchConditions = [
        { name: regex },
        { nameHe: regex },
        { nameAr: regex },
        { description: regex },
        { descriptionHe: regex },
        { descriptionAr: regex },
        { bussCategoriesId: { $in: matchingCategoryIds.map(c => c._id) } },
        { tagsId: { $in: matchingTagIds.map(t => t._id) } },
        { primaryCategoryId: { $in: matchingCategoryIds.map(c => c._id) } },
      ];

      const eventSearchConditions = [
        { name: regex },
        { nameHe: regex },
        { nameAr: regex },
        { description: regex },
        { descriptionHe: regex },
        { descriptionAr: regex },
      ];

      const productSearchConditions = [
        { name: regex },
        { nameHe: regex },
        { nameAr: regex },
        { description: regex },
        { descriptionHe: regex },
        { descriptionAr: regex },
        { categories: { $in: matchingCategoryIds.map(c => c._id) } },
        { tagsId: { $in: matchingTagIds.map(t => t._id) } },
      ];

      if (businessSearchConditions.length) {
        businessBaseQuery.$and.push({ $or: businessSearchConditions });
        eventBaseQuery.$and.push({ $or: eventSearchConditions });
        productBaseQuery.$and.push({ $or: productSearchConditions });
      }

      const businessCampConditions = [
        ...(campDetails.businessIds?.length
          ? [{ businessId: { $in: campDetails.businessIds } }]
          : []),
        ...(campDetails.dmoIds?.length
          ? [{ dmoId: { $in: campDetails.dmoIds } }]
          : []),
        ...(campDetails.authorityIds?.length
          ? [{ authorityId: { $in: campDetails.authorityIds } }]
          : []),
      ];

      if (businessCampConditions.length) {
        businessBaseQuery.$and.push({ $or: businessCampConditions });
      }

      const productCampConditions = [
        ...(campDetails.businessIds?.length
          ? [{ businessId: { $in: campDetails.businessIds } }]
          : []),
        ...(campDetails.dmoIds?.length
          ? [{ dmoId: { $in: campDetails.dmoIds } }]
          : []),
        ...(campDetails.authorityIds?.length
          ? [{ authorityId: { $in: campDetails.authorityIds } }]
          : []),
        ...(campDetails.productIds?.length
          ? [{ productId: { $in: campDetails.productIds } }]
          : []),
      ];

      if (productCampConditions.length) {
        productBaseQuery.$and.push({ $or: productCampConditions });
      }

      const eventCampConditions = [
        ...(campDetails.dmoIds?.length
          ? [{ dmoId: { $in: campDetails.dmoIds } }]
          : []),
        ...(campDetails.authorityIds?.length
          ? [{ authorityId: { $in: campDetails.authorityIds } }]
          : []),
      ];

      if (eventCampConditions.length) {
        eventBaseQuery.$and.push({ $or: eventCampConditions });
      }

      const productSelect = '_id name nameHe nameAr descriptionHe descriptionAr description images slug price';

      const [businessResults, eventResults, productResults] = await Promise.all([
        this.BusinessesAuditModel.find(businessBaseQuery)
          .select(select)
          .limit(10)
          .lean(),
        this.EventsAuditModel.find(eventBaseQuery)
          .select(select)
          .limit(10)
          .lean(),
        this.ProductsAuditModel.find(productBaseQuery)
          .select(productSelect)
          .limit(10)
          .lean(),
      ]);

      return {
        businesses: businessResults,
        events: eventResults,
        products: productResults,
      };
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
