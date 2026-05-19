import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CommonStatus, SortOrder } from 'src/common/enum';
import { queryhandler } from 'src/core/helper/query-helper';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { GetAllEventsQuery } from '../get-all-events.query';
import { EventsAudit } from '../../schema/events-audit.schema';

@QueryHandler(GetAllEventsQuery)
export class GetAllEventsHandler implements IQueryHandler<GetAllEventsQuery> {
  constructor(
    @InjectModel(EventsAudit.name)
    private EventsAuditModel: Model<EventsAudit>,
    private campaignService: CampaignService,
  ) {}

  async execute(queries: GetAllEventsQuery): Promise<any> {
    const { query } = queries;
    const {
      subCategoriesIds,
      sortOrder,
      sortBy,
      search,
      page,
      limit,
      campCode,
    } = query;

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
      status: CommonStatus.APPROVED,

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

    if (subCategoriesIds) {
      const subCategoriesId = Array.isArray(subCategoriesIds)
        ? subCategoriesIds
        : [subCategoriesIds];

      findQuery = {
        ...findQuery,
        subCategoriesId: { $in: subCategoriesId },
      };
    }

    const select
      = '_id name nameHe nameAr description descriptionHe descriptionAr geoLocation images cover address slug eventId';

    if (search) {
      findQuery = {
        ...findQuery,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const allEvents = await queryhandler<EventsAudit>(this.EventsAuditModel, {
      findQuery,
      select,
      sort: sortBy || 'createdAt',
      sortOrder: sortOrder || SortOrder.DESC,
      page: Number(page),
      limit: Number(limit),
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
  }
}
