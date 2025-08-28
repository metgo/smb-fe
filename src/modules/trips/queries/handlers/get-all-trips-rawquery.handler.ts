import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { GetAllTripsRawQuery } from '../get-all-trips-rawquery.query';
import { TripStatus } from '../../trips.types';
import { InjectModel } from '@nestjs/mongoose';
import { Business } from 'src/modules/business/shared/schema/business.schema';
import { Model } from 'mongoose';

@QueryHandler(GetAllTripsRawQuery)
export class GetAllTripsRawQueryHandler
implements IQueryHandler<GetAllTripsRawQuery> {
  constructor(
    private campaignService: CampaignService,
    @InjectModel(Business.name)
    private BusinessModel: Model<Business>,
  ) {}

  async execute(queries: GetAllTripsRawQuery): Promise<any> {
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

      if (!campDetails?.dmoIds?.length && !campDetails?.authorityIds?.length) {
        return { data: [] };
      }

      const categoryIds = campDetails.category.map(cat => cat.id);

      let stationId;
      if (categoryIds || accessibilitiesId || groupTypesId) {
        let findQueryBusiness;

        if (categoryIds) {
          const categories = Array.isArray(categoriesId)
            ? categoriesId
            : [categoriesId];
          findQueryBusiness = {
            ...findQueryBusiness,
            bussCategoriesId: { $in: categories || categoryIds },
          };
        }

        if (subCategoriesId) {
          const subCategoriesIds = Array.isArray(subCategoriesId)
            ? subCategoriesId
            : [subCategoriesId];

          findQueryBusiness = {
            ...findQueryBusiness,
            bussSubCategoriesId: { $in: subCategoriesIds },
          };
        }

        if (groupTypesId) {
          const groupTypeIds = Array.isArray(groupTypesId)
            ? groupTypesId
            : [groupTypesId];

          findQueryBusiness = {
            ...findQueryBusiness,
            groupTypesId: { $in: groupTypeIds },
          };
        }

        if (accessibilitiesId) {
          const accessibilitiesIds = Array.isArray(accessibilitiesId)
            ? accessibilitiesId
            : [accessibilitiesId];

          findQueryBusiness = {
            ...findQueryBusiness,
            accessibilitiesId: { $in: accessibilitiesIds },
          };
        }

        stationId = await this.BusinessModel.find({
          ...findQueryBusiness,
        }).select('_id');
      }

      if (!stationId) return { data: [] };

      let findQuery: any = {
        status: TripStatus.APPROVED,
        isDeleted: false,
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

      if (stationId) {
        const stationIds = Array.isArray(stationId) ? stationId : [stationId];

        findQuery = {
          ...findQuery,
          'stations._id': { $in: stationIds },
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
