import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { Ticket } from '../../schema/tickets.schema';
import { Inject } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { GetAllTicketsQuery } from '../get-all-tickets.query';

@QueryHandler(GetAllTicketsQuery)
export class GetAllTicketsHandler implements IQueryHandler<GetAllTicketsQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(Ticket.name)
    private readonly TicketModel: Model<Ticket>,
  ) {}

  async execute(queries: GetAllTicketsQuery): Promise<Ticket[]> {
    try {
      const {
        eventId, search, status, type,
      } = queries.request;

      const query: any = {
        $and: [
          { $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] },
          { $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] },
          { $or: [{ deletedBy: null }, { deletedBy: { $exists: false } }] },

          ...(eventId ? [{ eventId }] : []),
          ...(status ? [{ status }] : []),
          ...(type ? [{ type }] : []),

          ...(search
            ? [
              {
                $or: [
                  { name: { $regex: search, $options: 'i' } },
                  { description: { $regex: search, $options: 'i' } },
                ],
              },
            ]
            : []),
        ],
      };

      const tickets = await this.TicketModel.find(query).select(
        '_id name description images eventId price quantity status type dayDescription',
      );

      this.logger.info('[TICKET]: TICKETS RETRIEVED');

      return tickets;
    } catch (error) {
      this.logger.error('[TICKET]: FAILED TO GET TICKETS', {
        err: error.message,
      });
      exceptionHandling(error);
    }
  }
}
