import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { GetSearchRecommendationQuery } from '../get-search-recommendation.query';
import { queryhandler } from 'src/core/helper/query-helper';
import { SortOrder } from 'src/common/enum';
import { EventStatus } from '../../events.type';
import { EventsAudit } from '../../schema/events-audit.schema';

@QueryHandler(GetSearchRecommendationQuery)
export class GetSearchRecommendationTourismHandler
implements IQueryHandler<GetSearchRecommendationQuery> {
  constructor(
    @InjectModel(EventsAudit.name)
    private EventsAuditModel: Model<EventsAudit>,
    private campaignService: CampaignService,
  ) {}

  async execute(queries: GetSearchRecommendationQuery) {
    try {
      const { campCode } = queries.query;

      const select
        = '_id name nameHe nameAr description descriptionHe descriptionAr images cover dmoId slug eventId';

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

      const today = new Date();

      today.setUTCHours(0, 0, 0, 0);

      let findQuery: any = {
        status: EventStatus.APPROVED,
        isActive: true,

        dayDescription: {
          $elemMatch: {
            date: {
              $gte: today,
            },
          },
        },

        isDeleted: { $ne: true },
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

      const allEvents = await queryhandler<EventsAudit>(this.EventsAuditModel, {
        findQuery,
        select,
        sort: 'startDate',
        sortOrder: SortOrder.ASC,
        page: 1,
        limit: 3,
        isLean: true,
      });

      const mappedEvents = await Promise.all(
        allEvents.data.map(async (event: any) => {
          const { _id, eventId, ...rest } = (await event.toObject)
            ? event.toObject()
            : event;

          return {
            ...rest,
            _id: eventId,
          };
        }),
      );

      allEvents.data = mappedEvents;

      return allEvents;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
