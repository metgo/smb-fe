import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CommonStatus } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import {
  buildHebrewSearchRegex,
  normalizeHebrewSearch,
} from 'src/core/helper/atlas-search.util';
import { expandSearchTerms } from 'src/core/helper/search-expansion.util';
import { ConfigService } from 'src/services/config/config.service';
import { Tags } from 'src/modules/tags/schema/tags.schema';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { GetAllBusinessesRawQuery } from '../get-all-businesses-rawquery.query';

@QueryHandler(GetAllBusinessesRawQuery)
export class GetAllBusinessesRawQueryHandler
implements IQueryHandler<GetAllBusinessesRawQuery> {
  constructor(
    private campaignService: CampaignService,
    private readonly configService: ConfigService,
    @InjectModel(Tags.name)
    private TagModel: Model<Tags>,
    @InjectModel(BussCategory.name)
    private CategoryModel: Model<BussCategory>,
  ) {}

  async execute(queries: GetAllBusinessesRawQuery): Promise<any> {
    try {
      const {
        campCode,
        categoriesId,
        subCategoriesId,
        groupTypesId,
        accessibilitiesId,
        search,
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
        findQuery = {
          ...findQuery,
          $or: orConditions,
        };
      }

      if (categoriesId) {
        const categoriesIds = Array.isArray(categoriesId)
          ? categoriesId
          : [categoriesId];

        findQuery = {
          ...findQuery,
          bussCategoriesId: { $in: categoriesIds },
        };
      }

      // const categoryIds = campDetails.category.map(cat => cat.id);

      // if (!categoriesId) {
      //   findQuery = {
      //     ...findQuery,
      //     bussCategoriesId: { $in: categoryIds },
      //   };
      // }

      if (subCategoriesId) {
        const subCategoriesIds = Array.isArray(subCategoriesId)
          ? subCategoriesId
          : [subCategoriesId];

        findQuery = {
          ...findQuery,
          bussSubCategoriesId: { $in: subCategoriesIds },
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
            '[Search Expansion] Failed in Business Raw Query:',
            expansionError?.message,
          );
        }

        const searchTerms = [search, ...expandedTerms].filter(
          (t, i, arr) => t && arr.indexOf(t) === i,
        );
        const combinedPattern = searchTerms
          .map(t => buildHebrewSearchRegex(t).source)
          .join('|');
        const regex = { $regex: combinedPattern, $options: 'i' };

        const categoryOrQueries = searchTerms
          .map(t => {
            const r = buildHebrewSearchRegex(t);
            return [
              { name: { $regex: r.source, $options: 'i' } },
              { hebrewName: { $regex: r.source, $options: 'i' } },
            ];
          })
          .flat();
        const matchingCategoryIds = await this.CategoryModel.find({
          $or: categoryOrQueries,
        }).select('_id');

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
        const matchingTagIds = await this.TagModel.find({
          $or: tagOrQueries,
        }).select('_id');

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
              bussCategoriesId: { $in: matchingCategoryIds.map(c => c._id) },
            },
            { tagsId: { $in: matchingTagIds.map(t => t._id) } },
            {
              primaryCategoryId: { $in: matchingCategoryIds.map(c => c._id) },
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
