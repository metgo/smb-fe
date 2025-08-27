import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
      const { id } = queries;

      const findQuery: any = {
        _id: id,
        status: TicketStatus.ACTIVE,
      };

      const select = 'name description price status images';

      const ticket = await this.TicketModel.findOne(findQuery).select(select);

      if (!ticket) {
        throw new NotFoundException(`Ticket ${ServerErrors.NOT_FOUND}`);
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
