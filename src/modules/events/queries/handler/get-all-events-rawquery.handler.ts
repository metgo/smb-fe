import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CommonStatus } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import {
  buildHebrewSearchRegex,
  normalizeHebrewSearch,
} from 'src/core/helper/atlas-search.util';
import { GetAllEventsRawQuery } from '../get-all-events-rawquery.query';

@QueryHandler(GetAllEventsRawQuery)
export class GetAllEventsRawQueryHandler
implements IQueryHandler<GetAllEventsRawQuery> {
  constructor(private campaignService: CampaignService) {}

  async execute(queries: GetAllEventsRawQuery): Promise<any> {
    try {
      const {
        campCode,
        subCategoriesId,
        groupTypesId,
        accessibilitiesId,
        search,
      } = queries;

      const campDetails = await this.campaignService.findCampaignAndReturn(
        'code',
        campCode,
      );

      if (!campDetails?.dmoIds?.length && !campDetails?.authorityIds?.length) {
        return { data: [] };
      }

      const categoryIds = campDetails.category.map(cat => cat.id);

      if (!categoryIds.some(id => id.equals('6566e208a77d2a477266d2b3'))) {
        return { data: [] };
      }

      let findQuery: any = {
        status: CommonStatus.APPROVED,
        isDeleted: { $ne: true },
        isActive: true,
      };

      const orConditions = [];

      if (campDetails?.dmoIds?.length) {
        orConditions.push({ dmoId: { $in: campDetails.dmoIds } });
      }

      if (campDetails?.authorityIds?.length) {
        orConditions.push({ authorityId: { $in: campDetails.authorityIds } });
      }

      if (orConditions.length) {
        findQuery = {
          ...findQuery,
          $or: orConditions,
        };
      }

      if (subCategoriesId) {
        const subCategoriesIds = Array.isArray(subCategoriesId)
          ? subCategoriesId
          : [subCategoriesId];

        findQuery = {
          ...findQuery,
          subCategoriesId: { $in: subCategoriesIds },
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
        const normalizedSearch = normalizeHebrewSearch(search);
        const searchTerms = [search, normalizedSearch].filter(
          (t, i, arr) => t && arr.indexOf(t) === i,
        );
        const combinedPattern = searchTerms
          .map(t => buildHebrewSearchRegex(t).source)
          .join('|');
        const regex = { $regex: combinedPattern, $options: 'i' };

        if (!findQuery.$and) {
          findQuery.$and = [];
        }

        findQuery.$and.push({
          $or: [{ name: regex }, { description: regex }],
        });
      }

      return findQuery;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
