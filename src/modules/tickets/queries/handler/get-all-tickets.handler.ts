import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

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
        eventId, search, status, type, includeHidden,
      } = queries.request;

      const query: any = {
        $and: [
          { isDeleted: { $ne: true } },
          {
            $or: [
              { 'quantity.remaining': { $gt: 0 } },
              { 'quantity.isUnlimited': true },
            ],
          },
          // Only filter out hidden tickets if includeHidden is not explicitly set to true
          ...(includeHidden !== true ? [{ isHidden: { $ne: true } }] : []),
          ...(eventId
            ? [{ eventId: new mongoose.Types.ObjectId(eventId) }]
            : []),
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

      const tickets = await this.TicketModel.aggregate([
        { $match: query },
        { $sort: { order: 1, createdAt: 1 } },
        {
          $lookup: {
            from: 'sessionwrappers',
            localField: '_id',
            foreignField: 'ticketIds',
            as: 'sessionWrappers',
          },
        },
        {
          $addFields: {
            wrapperId: { $arrayElemAt: ['$sessionWrappers._id', 0] },
          },
        },
        {
          $project: {
            sessionWrappers: 0,
          },
        },
      ]);

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
