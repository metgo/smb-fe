import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { GetTicketByIdsQuery } from '../get-ticket-by-ids.query';
import { Ticket } from '../../schema/tickets.schema';

@QueryHandler(GetTicketByIdsQuery)
export class GetTicketByIdsHandler
implements IQueryHandler<GetTicketByIdsQuery> {
  constructor(
    @InjectModel(Ticket.name)
    private readonly TicketModel: Model<Ticket>,
  ) {}

  async execute(queries: GetTicketByIdsQuery) {
    try {
      const { ids } = queries;
      const tickets = await this.TicketModel.find({ _id: { $in: ids } });

      if (!tickets?.length) {
        throw new NotFoundException(`Tickets ${ServerErrors.NOT_FOUND}`);
      }

      return tickets;
    } catch (error) {
      if (error?.name === 'CastError' && error?.kind === 'ObjectId') {
        throw new BadRequestException(
          `${error?.model?.modelName} ${ServerErrors.INVALID_ID}`,
        );
      }
      exceptionHandling(error);
    }
  }
}
