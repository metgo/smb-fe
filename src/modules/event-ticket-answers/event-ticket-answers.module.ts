import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EventTicketAnswersController } from './event-ticket-answers.controller';
import { EventTicketAnswersService } from './event-ticket-answers.service';
import { EventTicketAnswer, EventTicketAnswerSchema } from './schema/event-ticket-answer.schema';
import { EventSchema } from '../events/schema/events.schema';
import { Ticket, TicketSchema } from '../tickets/schema/tickets.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventTicketAnswer.name, schema: EventTicketAnswerSchema },
      { name: 'Event', schema: EventSchema },
      { name: Ticket.name, schema: TicketSchema },
    ]),
  ],
  controllers: [EventTicketAnswersController],
  providers: [EventTicketAnswersService],
  exports: [EventTicketAnswersService],
})
export class EventTicketAnswersModule {}
