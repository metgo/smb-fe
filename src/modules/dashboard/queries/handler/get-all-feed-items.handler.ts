import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { SortOrder } from 'src/common/enum';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { GetAllFeedItemsQuery } from '../get-all-feed-items.query';
import { Business } from 'src/modules/business/shared/schema/business.schema';
import {
  BusinessStatus,
  GeoServicesTypes,
} from 'src/modules/business/business.type';
import { ServicesTypes } from '../../dashboard.type';

@QueryHandler(GetAllFeedItemsQuery)
export class GetAllFeedItemsHandler
implements IQueryHandler<GetAllFeedItemsQuery> {
  constructor(
    @InjectModel(Business.name)
    private BusinessModel: Model<Business>,
    private campaignService: CampaignService,
  ) {}

  async execute(queries: GetAllFeedItemsQuery): Promise<any> {
    try {
      const {
        campCode,
        groupTypesId,
        accessibilitiesId,
        categoriesId,
        subCategoriesId,
        sortBy,
        sortOrder,
        serviceType,
        search,
        page,
        limit,
      } = queries;

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
          data: [],
        };
      }

      let findQuery: any = {
        status: BusinessStatus.APPROVED,
        ...(serviceType
          && (serviceType === ServicesTypes.BUSINESS
            || serviceType === ServicesTypes.POINT_OF_INTEREST) && {
          serviceType:
              serviceType === ServicesTypes.BUSINESS
                ? GeoServicesTypes.BUSINESS
                : GeoServicesTypes.POINT_OF_INTEREST,
        }),
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
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        };
      }

      const select
        = '_id name description geoLocation images logo primaryCategoryId address slug serviceType';

      const allBusiness = await queryhandler<Business>(this.BusinessModel, {
        findQuery,
        select,
        page,
        limit,
        sort: sortBy || 'createdAt',
        sortOrder: sortOrder || SortOrder.DESC,
      });

      return allBusiness;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
