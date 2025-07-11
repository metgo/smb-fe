import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SortOrder } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { Business } from '../../../shared/schema/business.schema';
import { BusinessStatus } from '../../../business.type';
import { GetSearchRecommendationQuery } from '../get-search-recommendation.query';
import { CampaignService } from 'src/modules/campaign/campaign.service';

@QueryHandler(GetSearchRecommendationQuery)
export class GetSearchRecommendationTourismHandler
implements IQueryHandler<GetSearchRecommendationQuery> {
  constructor(
    @InjectModel(Business.name)
    private BusinessModel: Model<Business>,
    private campaignService: CampaignService,
  ) {}

  async execute(queries: GetSearchRecommendationQuery): Promise<any> {
    try {
      const { campCode } = queries.query;

      const select = '_id name description images logo dmoId slug';

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
      const allBusiness = await queryhandler<Business>(this.BusinessModel, {
        findQuery,
        select,
        sort: 'impact',
        sortOrder: SortOrder.DESC,
        page: 1,
        limit: 3,
      });

      return allBusiness;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
