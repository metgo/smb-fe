import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { ServerErrors } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { GetTicketByIdQuery } from '../get-ticket-by-id.query';
import { Ticket } from '../../schema/tickets.schema';
import { TicketStatus } from '../../tickets.type';

@QueryHandler(GetTicketByIdQuery)
export class GetTicketByIdHandler implements IQueryHandler<GetTicketByIdQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(Ticket.name)
    private TicketModel: Model<Ticket>,
  ) {}

  async execute(queries: GetTicketByIdQuery): Promise<Ticket> {
    try {
      const { id, checkout } = queries;
      const tickets = await this.TicketModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
            status: TicketStatus.ACTIVE,
            isDeleted: { $ne: true },
            // Allow fetching hidden tickets via direct link
          },
        },
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

      const ticket = tickets[0];

      if (!ticket) {
        throw new NotFoundException(`Ticket ${ServerErrors.NOT_FOUND}`);
      }

      // If checkout flag is true, return only specific fields
      if (checkout) {
        const primaryImage = ticket.images?.find((img: any) => img.isPrimary) || ticket.images?.[0];
        return {
          _id: ticket._id,
          name: ticket.name,
          image: primaryImage?.image || null,
          alt: primaryImage?.alt || null,
          sellingPrice: ticket.price?.sellingPrice || 0,
        } as any;
      }

      return ticket;
    } catch (err) {
      this.logger.error('[EVENT]: FAILED TO FETCH TICKET', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }
}
