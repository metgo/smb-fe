import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { GetSearchRecommendationQuery } from '../get-search-recommendation.query';
import { queryhandler } from 'src/core/helper/query-helper';
import { SortOrder } from 'src/common/enum';
import { EventStatus } from '../../events.type';
import { Event } from '../../schema/events.schema';

@QueryHandler(GetSearchRecommendationQuery)
export class GetSearchRecommendationTourismHandler
implements IQueryHandler<GetSearchRecommendationQuery> {
  constructor(
    @InjectModel(Event.name)
    private EventModel: Model<Event>,
    private campaignService: CampaignService,
  ) {}

  async execute(queries: GetSearchRecommendationQuery) {
    try {
      const { campCode } = queries.query;

      const select = '_id name description images logo dmoId slug';

      const campDetails = await this.campaignService.findCampaignAndReturn(
        'code',
        campCode,
      );

      if (!campDetails?.dmoIds?.length && !campDetails?.authorityIds?.length) {
        return {
          totalData: 0,
          data: [],
        };
      }

      const today = new Date().toISOString();

      let findQuery: any = {
        status: EventStatus.APPROVED,
        endDate: { $gte: today },
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

      const allEvents = await queryhandler<Event>(this.EventModel, {
        findQuery,
        select,
        sort: 'startDate',
        sortOrder: SortOrder.ASC,
        page: 1,
        limit: 3,
      });

      return allEvents;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
