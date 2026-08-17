import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { Ticket } from './schema/tickets.schema';

@Injectable()
export class TicketsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(Ticket.name)
    private TicketModel: Model<Ticket>,
  ) { }

  async deductQuantity(tickets) {
    try {
      const ticketBulkOps = tickets.map(ticket => ({
        updateOne: {
          filter: { _id: ticket.id },
          update: [
            {
              $set: {
                'quantity.remaining': {
                  $subtract: ['$quantity.remaining', ticket.quantity],
                },
                'quantity.sold': {
                  $add: ['$quantity.sold', ticket.quantity],
                },
              },
            },
          ],
        },
      }));

      await this.TicketModel.bulkWrite(ticketBulkOps);

      this.logger.info('[DEDUCT TICKET QUANTITY]: Successfully deducted quantity', {
        ticketCount: tickets.length,
      });
    } catch (error) {
      this.logger.error('[DEDUCT TICKET QUANTITY]: Failed to deduct quantity', {
        err: error.message,
        ticketCount: tickets.length,
      });
      throw error;
    }
  }
}
