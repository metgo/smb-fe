import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { GetEventByIdsQuery } from '../get-by-ids.query';
import { exceptionHandling } from 'src/common/utils/exception-handling';

@QueryHandler(GetEventByIdsQuery)
export class GetEventsByIdHandler implements IQueryHandler<GetEventByIdsQuery> {
  constructor(
    @InjectModel(Event.name)
    private EventModel: Model<Event>,
  ) {}

  async execute(queries: GetEventByIdsQuery): Promise<any> {
    try {
      const businessDetails = await this.EventModel.find({
        _id: { $in: queries.ids },
      });

      return businessDetails;
    } catch (error) {
      exceptionHandling(error);
    }
  }
}
