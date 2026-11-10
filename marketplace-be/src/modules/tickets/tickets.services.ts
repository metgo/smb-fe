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
  ) {}

  async deductQuantity(tickets) {
    try {
      const ticketBulkOps = tickets.map(ticket => ({
        updateOne: {
          filter: { _id: ticket.id },
          // Pipeline update so `remaining` is always DERIVED, never blindly
          // decremented:
          //   sold      += purchased qty  (always reflects reality)
          //   remaining  = max(0, initial - sold)  (never goes negative,
          //               stays consistent with initial even if it was stale)
          // Unlimited tickets don't track remaining.
          update: [
            {
              $set: {
                'quantity.sold': {
                  $add: [
                    { $ifNull: ['$quantity.sold', 0] },
                    ticket.quantity,
                  ],
                },
              },
            },
            {
              $set: {
                'quantity.remaining': {
                  $cond: [
                    { $eq: ['$quantity.isUnlimited', true] },
                    '$quantity.remaining',
                    {
                      $max: [
                        0,
                        {
                          $subtract: [
                            { $ifNull: ['$quantity.initial', 0] },
                            '$quantity.sold',
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
          ],
        },
      }));

      await this.TicketModel.bulkWrite(ticketBulkOps);

      this.logger.info(
        '[DEDUCT TICKET QUANTITY]: Successfully deducted quantity',
        {
          ticketCount: tickets.length,
        },
      );
    } catch (error) {
      this.logger.error('[DEDUCT TICKET QUANTITY]: Failed to deduct quantity', {
        err: error.message,
        ticketCount: tickets.length,
      });
      throw error;
    }
  }
}
