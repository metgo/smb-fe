import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SortOrder } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { BusinessStatus } from '../../../business.type';
import { GetSearchRecommendationQuery } from '../get-search-recommendation.query';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { BusinessesAudit } from 'src/modules/business/shared/schema/businesses-audit.schema';
import { BusinessService } from 'src/modules/business/shared/services/business.service';

@QueryHandler(GetSearchRecommendationQuery)
export class GetSearchRecommendationTourismHandler
implements IQueryHandler<GetSearchRecommendationQuery> {
  constructor(
    @InjectModel(BusinessesAudit.name)
    private BusinessesAuditModel: Model<BusinessesAudit>,
    private campaignService: CampaignService,
    private readonly businessService: BusinessService,
  ) {}

  async execute(queries: GetSearchRecommendationQuery): Promise<any> {
    try {
      const { campCode, locale } = queries.query;

      const select
        = '_id name description nameHe descriptionHe nameAr descriptionAr images logo dmoId slug businessId';

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
      const allBusiness = await queryhandler<BusinessesAudit>(
        this.BusinessesAuditModel,
        {
          findQuery,
          select,
          sort: 'impact',
          sortOrder: SortOrder.DESC,
          page: 1,
          limit: 3,
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
