import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SortOrder } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { GetAllEventsByBusinessIdQuery } from '../get-all-events-by-businessId.query';
import { EventsAudit } from '../../schema/events-audit.schema';

@QueryHandler(GetAllEventsByBusinessIdQuery)
export class GetAllEventsByBusinessIdHandler
implements IQueryHandler<GetAllEventsByBusinessIdQuery> {
  constructor(
    @InjectModel(EventsAudit.name)
    private EventsAuditModel: Model<EventsAudit>,
  ) {}

  async execute(queries: GetAllEventsByBusinessIdQuery): Promise<any> {
    try {
      const { businessId } = queries.query ?? {};

      const select
        = '_id name nameHe nameAr description descriptionHe descriptionAr images businessId eventId slug dayDescription';

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const findQuery = {
        businessId,
        isActive: true,
        isDeleted: { $ne: true },
        dayDescription: {
          $elemMatch: { date: { $gte: today } },
        },
      };

      const eventsList = await queryhandler<EventsAudit>(
        this.EventsAuditModel,
        {
          findQuery,
          select,
          sort: 'createdAt',
          sortOrder: SortOrder.DESC,
          isLean: true,
        },
      );

      if (!eventsList?.data || !eventsList.data?.length) {
        return { totalData: 0, data: [] };
      }

      eventsList.data = eventsList.data.map((event: any) => {
        const { _id, eventId, ...rest } = event.toObject
          ? event.toObject()
          : event;

        return { ...rest, _id: eventId };
      });

      return eventsList;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
