import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { GetAllEventsRawQuery } from '../get-all-events-rawquery.query';
import { EventStatus } from '../../events.type';

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
        status: EventStatus.APPROVED,
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
        findQuery = {
          ...findQuery,
          $and: [
            ...findQuery.$and,
            {
              $or: [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
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
