import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { GetAllBusinessesRawQuery } from '../get-all-businesses-rawquery.query';
import { BusinessStatus } from 'src/modules/business/business.type';

@QueryHandler(GetAllBusinessesRawQuery)
export class GetAllBusinessesRawQueryHandler
implements IQueryHandler<GetAllBusinessesRawQuery> {
  constructor(private campaignService: CampaignService) {}

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
        status: BusinessStatus.APPROVED,
        isDeleted: false,
      };

      const orConditions = [];

      if (campDetails?.dmoIds?.length) {
        orConditions.push({ dmoId: { $in: campDetails.dmoIds } });
      }

      if (campDetails?.authorityIds?.length) {
        orConditions.push({ authorityId: { $in: campDetails.authorityIds } });
      }

      if (campDetails?.businessIds?.length) {
        orConditions.push({ _id: { $in: campDetails.businessIds } });
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

      const categoryIds = campDetails.category.map(cat => cat.id);

      if (!categoriesId) {
        findQuery = {
          ...findQuery,
          bussCategoriesId: { $in: categoryIds },
        };
      }

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
