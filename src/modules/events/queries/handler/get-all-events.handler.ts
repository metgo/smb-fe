import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SortOrder } from 'src/common/enum';
import { queryhandler } from 'src/core/helper/query-helper';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { GetAllEventsQuery } from '../get-all-events.query';
import { EventStatus } from '../../events.type';

@QueryHandler(GetAllEventsQuery)
export class GetAllEventsHandler implements IQueryHandler<GetAllEventsQuery> {
  constructor(
    @InjectModel(Event.name)
    private EventModel: Model<Event>,
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

    let findQuery: any = {
      status: EventStatus.APPROVED,
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

    const select = '_id name description geoLocation images logo address slug';

    if (search) {
      findQuery = {
        ...findQuery,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const allEvents = await queryhandler<Event>(this.EventModel, {
      findQuery,
      select,
      sort: sortBy || 'createdAt',
      sortOrder: sortOrder || SortOrder.DESC,
      page: Number(page),
      limit: Number(limit),
    });

    return allEvents;
  }
}
