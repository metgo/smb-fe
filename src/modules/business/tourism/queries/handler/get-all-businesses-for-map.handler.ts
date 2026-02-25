import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { GetAllBusinessForMapTourismQuery } from '../get-all-businesses-for-map.query';
import { BusinessStatus } from 'src/modules/business/business.type';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { BusinessesAudit } from 'src/modules/business/shared/schema/businesses-audit.schema';
import { BusinessService } from 'src/modules/business/shared/services/business.service';

@QueryHandler(GetAllBusinessForMapTourismQuery)
export class GetAllBusinessForMapTourismHandler
implements IQueryHandler<GetAllBusinessForMapTourismQuery> {
  constructor(
    @InjectModel(BusinessesAudit.name)
    private BusinessesAuditModel: Model<BusinessesAudit>,
    private campaignService: CampaignService,
    private readonly businessService: BusinessService,
  ) {}

  async execute(queries: GetAllBusinessForMapTourismQuery): Promise<any> {
    try {
      const {
        search,
        groupTypesId,
        accessibilitiesId,
        bussCategoriesId,
        bussSubCategoriesId,
        campCode,
        serviceType,
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
        return {
          totalData: 0,
          data: [],
        };
      }

      let findQuery: any = {
        status: BusinessStatus.APPROVED,
        isActive: true,
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
        orConditions.push({ businessId: { $in: campDetails.businessIds } });
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
        = '_id geoLocation primaryCategoryId bussCategoriesId bussSubCategoriesId slug serviceType businessId';

      const allBusiness = await queryhandler<BusinessesAudit>(
        this.BusinessesAuditModel,
        {
          findQuery,
          select,
          isLean: true,
        },
      );

      const mappedBusiness = await Promise.all(
        allBusiness.data.map(async (business: any) => {
          const { businessId, ...rest } = (await business.toObject)
            ? business.toObject()
            : business;

          return {
            ...rest,
            _id: businessId,
          };
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
