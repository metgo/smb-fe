import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';

import { CommonStatus, SortOrder } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import {
  BUSINESSES_SEARCH_INDEX,
  buildHebrewSearchRegex,
  normalizeHebrewSearch,
} from 'src/core/helper/atlas-search.util';
import { expandSearchTerms } from 'src/core/helper/search-expansion.util';
import { ConfigService } from 'src/services/config/config.service';
import { BusinessesAudit } from 'src/modules/business/shared/schema/businesses-audit.schema';
import { Tags } from 'src/modules/tags/schema/tags.schema';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { GetAllApprovedBusinessesQuery } from '../get-all-approved-businesses.query';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { BusinessService } from 'src/modules/business/shared/services/business.service';

@QueryHandler(GetAllApprovedBusinessesQuery)
export class GetAllApprovedBusinessesHandler
implements IQueryHandler<GetAllApprovedBusinessesQuery> {
  constructor(
    @InjectModel(BusinessesAudit.name)
    private BusinessesAuditModel: Model<BusinessesAudit>,
    @InjectModel(Tags.name)
    private TagModel: Model<Tags>,
    @InjectModel(BussCategory.name)
    private CategoryModel: Model<BussCategory>,
    private campaignService: CampaignService,
    private readonly businessService: BusinessService,
    private readonly configService: ConfigService,
  ) {}

  async execute(queries: GetAllApprovedBusinessesQuery): Promise<any> {
    try {
      const {
        search,
        page,
        limit,
        groupTypesId,
        accessibilitiesId,
        bussCategoriesId,
        bussSubCategoriesId,
        sortBy,
        sortOrder,
        campCode,
        locale,
      } = queries.query;

      const campDetails = await this.campaignService.findCampaignAndReturn(
        'code',
        campCode,
      );

      if (
        !campDetails?.dmoIds?.length
        && !campDetails?.authorityIds?.length
        && !campDetails?.businessIds?.length
      ) {
        return { totalData: 0, data: [] };
      }

      let findQuery: any = {
        status: CommonStatus.APPROVED,
        isActive: true,
        isDeleted: { $ne: true },
      };

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
      if (orConditions.length) {
        findQuery = { ...findQuery, $or: orConditions };
      }

      if (bussCategoriesId) {
        findQuery = {
          ...findQuery,
          bussCategoriesId: {
            $in: Array.isArray(bussCategoriesId)
              ? bussCategoriesId
              : [bussCategoriesId],
          },
        };
      }
      if (bussSubCategoriesId) {
        findQuery = {
          ...findQuery,
          bussSubCategoriesId: {
            $in: Array.isArray(bussSubCategoriesId)
              ? bussSubCategoriesId
              : [bussSubCategoriesId],
          },
        };
      }
      if (groupTypesId) {
        findQuery = {
          ...findQuery,
          groupTypesId: {
            $in: Array.isArray(groupTypesId) ? groupTypesId : [groupTypesId],
          },
        };
      }
      if (accessibilitiesId) {
        findQuery = {
          ...findQuery,
          accessibilitiesId: {
            $in: Array.isArray(accessibilitiesId)
              ? accessibilitiesId
              : [accessibilitiesId],
          },
        };
      }

      // Atlas Search with regex fallback
      if (search) {
        let expandedTerms: string[] = [];
        try {
          const normalizedSearch = normalizeHebrewSearch(search);
          expandedTerms = await expandSearchTerms(
            normalizedSearch,
            this.configService.get('GEMINI_API_KEY'),
          );
        } catch (expansionError) {
          console.warn(
            '[Search Expansion] Failed in Business Search:',
            expansionError?.message,
          );
        }

        const searchTerms = [search, ...expandedTerms].filter(
          (t, i, arr) => t && arr.indexOf(t) === i,
        );
        const searchPaths = [
          'name',
          'nameHe',
          'nameAr',
          'description',
          'descriptionHe',
          'descriptionAr',
        ];

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
            '[Contextual Search] Failed to fetch matching categories:',
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
            '[Contextual Search] Failed to fetch matching tags:',
            tagError?.message,
          );
        }

        try {
          const pageNum = Number(page) || 1;
          const limitNum = Number(limit) || 20;
          const skip = (pageNum - 1) * limitNum;

          const shouldClauses: any[] = searchTerms.map((term, index) => {
            const isOriginalInput = index === 0;
            const isNormalizedOriginal = index === 1;
            const isHighPriority = isOriginalInput || isNormalizedOriginal;

            if (term.includes(' ')) {
              return {
                phrase: {
                  query: term,
                  path: searchPaths,
                  slop: 1,
                  ...(isHighPriority && { score: { boost: { value: 10 } } }),
                },
              };
            }

            return {
              text: {
                query: term,
                path: searchPaths,
                fuzzy: { maxEdits: 2, prefixLength: 1 },
                ...(isHighPriority && { score: { boost: { value: 10 } } }),
              },
            };
          });

          // Add category matches to Atlas should clauses
          matchingCategoryIds.forEach(cat => {
            shouldClauses.push({
              text: {
                query: cat._id.toString(),
                path: ['bussCategoriesId', 'primaryCategoryId'],
              },
            });
          });

          // Add tag matches to Atlas should clauses
          matchingTagIds.forEach(tag => {
            shouldClauses.push({
              text: {
                query: tag._id.toString(),
                path: ['tagsId'],
              },
            });
          });

          const searchStage = {
            $search: {
              index: BUSINESSES_SEARCH_INDEX,
              compound: {
                should: shouldClauses,
                minimumShouldMatch: 1,
              },
            },
          };

          const pipeline: PipelineStage[] = [
            searchStage as any,
            { $match: findQuery },
            {
              $sort: {
                [sortBy || 'createdAt']: sortOrder === SortOrder.ASC ? 1 : -1,
              },
            },
            { $skip: skip },
            { $limit: limitNum },
          ];

          const countPipeline: PipelineStage[] = [
            searchStage as any,
            { $match: findQuery },
            { $count: 'total' },
          ];

          const [results, countResult] = await Promise.all([
            this.BusinessesAuditModel.aggregate(pipeline),
            this.BusinessesAuditModel.aggregate(countPipeline),
          ]);

          const totalData = countResult[0]?.total || 0;

          if (!results.length) {
            return { totalData: 0, data: [] };
          }

          const mappedBusiness = results.map((business: any) => {
            const { businessId, ...rest } = business;
            return { ...rest, _id: businessId };
          });

          const localizedBusiness = await Promise.all(
            mappedBusiness.map(p => this.businessService.localizeBusiness(p, locale)),
          );

          return {
            totalData,
            data: localizedBusiness,
            meta: {
              page: pageNum,
              limit: limitNum,
              data: localizedBusiness.length,
              pageCount: Math.ceil(totalData / limitNum),
              hasPreviousPage: pageNum > 1,
              hasNextPage: pageNum < Math.ceil(totalData / limitNum),
            },
          };
        } catch (atlasError) {
          // Atlas Search failed — fall back to regex silently
          console.warn(
            '[Atlas Search] Business search falling back to regex:',
            atlasError?.message,
          );
          const combinedPattern = searchTerms
            .map(t => buildHebrewSearchRegex(t).source)
            .join('|');
          const regex = { $regex: combinedPattern, $options: 'i' };
          findQuery = {
            ...findQuery,
            $or: [
              { name: regex },
              { nameHe: regex },
              { nameAr: regex },
              { description: regex },
              { descriptionHe: regex },
              { descriptionAr: regex },
              {
                bussCategoriesId: {
                  $in: matchingCategoryIds.map(c => c._id),
                },
              },
              { tagsId: { $in: matchingTagIds.map(t => t._id) } },
              {
                primaryCategoryId: {
                  $in: matchingCategoryIds.map(c => c._id),
                },
              },
            ],
          };
        }
      }

      const select
        = '_id name nameHe nameAr description descriptionHe descriptionAr geoLocation images logo primaryCategoryId address slug businessId';

      const allBusiness = await queryhandler<BusinessesAudit>(
        this.BusinessesAuditModel,
        {
          findQuery,
          select,
          page,
          limit,
          sort: sortBy || 'createdAt',
          sortOrder: sortOrder || SortOrder.DESC,
          isLean: true,
        },
      );

      const mappedBusiness = await Promise.all(
        allBusiness.data.map(async (business: any) => {
          const { businessId, ...rest } = (await business.toObject)
            ? business.toObject()
            : business;
          return { ...rest, _id: businessId };
        }),
      );

      allBusiness.data = await Promise.all(
        mappedBusiness.map(p => this.businessService.localizeBusiness(p, locale)),
      );

      return allBusiness;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
