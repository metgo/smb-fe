import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { Business } from '../../../shared/schema/business.schema';
import { GetAllApprovedBusinessesQuery } from '../get-all-approved-businesses.query';
import { BusinessStatus } from '../../../business.type';
import { SortOrder } from 'src/common/enum';
import { CampaignService } from 'src/modules/campaign/campaign.service';

@QueryHandler(GetAllApprovedBusinessesQuery)
export class GetAllApprovedBusinessesHandler
implements IQueryHandler<GetAllApprovedBusinessesQuery> {
  constructor(
    @InjectModel(Business.name)
    private BusinessModel: Model<Business>,
    private campaignService: CampaignService,
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
        serviceType,
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
        return {
          totalData: 0,
          data: [],
        };
      }

      let findQuery: any = {
        status: BusinessStatus.APPROVED,
        ...(serviceType && { serviceType }),
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

      if (bussCategoriesId) {
        const categoriesIds = Array.isArray(bussCategoriesId)
          ? bussCategoriesId
          : [bussCategoriesId];

        findQuery = {
          ...findQuery,
          bussCategoriesId: { $in: categoriesIds },
        };
      }

      if (bussSubCategoriesId) {
        const subCategoriesIds = Array.isArray(bussSubCategoriesId)
          ? bussSubCategoriesId
          : [bussSubCategoriesId];

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
        = '_id name description geoLocation images logo primaryCategoryId address slug';

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
