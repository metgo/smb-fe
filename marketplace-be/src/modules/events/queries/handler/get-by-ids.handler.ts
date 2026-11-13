import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { GetEventByIdsQuery } from '../get-by-ids.query';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { EventsAudit } from '../../schema/events-audit.schema';

@QueryHandler(GetEventByIdsQuery)
export class GetEventsByIdHandler implements IQueryHandler<GetEventByIdsQuery> {
  constructor(
    @InjectModel(EventsAudit.name)
    private EventsAuditModel: Model<EventsAudit>,
  ) {}

  async execute(queries: GetEventByIdsQuery): Promise<any> {
    try {
      const eventDetails = await this.EventsAuditModel.find({
        eventId: { $in: queries.ids },
        isActive: true,
        isDeleted: { $ne: true },
      })
        .populate('userId', 'email firstName lastName')
        .lean();

      const mappedEvents = await Promise.all(
        eventDetails.map(async (event: any) => {
          const { _id, eventId, ...rest } = (await event.toObject)
            ? event.toObject()
            : event;

          return {
            ...rest,
            _id: eventId,
          };
        }),
      );

      return mappedEvents;
    } catch (error) {
      exceptionHandling(error);
    }
  }
}
