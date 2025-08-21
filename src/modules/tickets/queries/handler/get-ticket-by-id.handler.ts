import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { GetTicketByIdQuery } from '../get-ticket-by-id.query';
import { Ticket } from '../../schema/tickets.schema';

@QueryHandler(GetTicketByIdQuery)
export class GetTicketByIdHandler implements IQueryHandler<GetTicketByIdQuery> {
  constructor(
    @InjectModel(Ticket.name)
    private readonly TicketModel: Model<Ticket>,
  ) {}

  async execute(query: GetTicketByIdQuery) {
    try {
      const ticket = await this.TicketModel.findById(query.id);

      if (!ticket) {
        throw new NotFoundException(`Tickets ${ServerErrors.NOT_FOUND}`);
      }

      return ticket;
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
