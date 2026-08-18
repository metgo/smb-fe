import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Ticket } from 'src/modules/tickets/schema/tickets.schema';
import { EventTicketAnswer } from './schema/event-ticket-answer.schema';
import { CreateEventTicketAnswerDto } from './dto/create-event-ticket-answer.dto';

@Injectable()
export class EventTicketAnswersService {
  constructor(
    @InjectModel(EventTicketAnswer.name)
    private readonly eventTicketAnswerModel: Model<EventTicketAnswer>,

    @InjectModel('Event')
    private readonly eventModel: Model<any>,

    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<Ticket>,
  ) {}

  /**
   * Given the ticketIds a customer has in their cart, resolves each ticket's
   * event and returns that event's custom questions — grouped per event so the
   * FE can render the question form and later POST answers back in the same shape.
   */
  async getQuestionsByTicketIds(ticketIds: string[]) {
    const tickets = await this.ticketModel
      .find({ _id: { $in: ticketIds } })
      .select('eventId')
      .lean();

    const foundTicketIds = new Set(tickets.map(t => String(t._id)));
    const missingTicketIds = ticketIds.filter(id => !foundTicketIds.has(id));

    if (missingTicketIds.length) {
      throw new NotFoundException(
        `Ticket(s) not found: ${missingTicketIds.join(', ')}`,
      );
    }

    const ticketIdsByEvent = new Map<string, string[]>();
    tickets.forEach((ticket: any) => {
      const eventId = String(ticket.eventId);
      const group = ticketIdsByEvent.get(eventId) || [];
      group.push(String(ticket._id));
      ticketIdsByEvent.set(eventId, group);
    });

    const eventIds = [...ticketIdsByEvent.keys()];
    const events = await this.eventModel
      .find({ _id: { $in: eventIds } })
      .select('customQuestions')
      .lean();

    const eventsById = new Map(events.map((e: any) => [String(e._id), e]));

    return eventIds.map(eventId => ({
      eventId,
      ticketIds: ticketIdsByEvent.get(eventId),
      customQuestions: eventsById.get(eventId)?.customQuestions || [],
    }));
  }

  /**
   * Given a single eventId (FE passes it directly in the URL), returns that
   * event's custom questions as-is.
   */
  async getQuestionsByEventId(eventId: string) {
    const event = await this.eventModel
      .findById(eventId)
      .select('customQuestions')
      .lean();

    if (!event) {
      throw new NotFoundException(`Event ${eventId} not found`);
    }

    return (event as any).customQuestions || [];
  }

  /**
   * One document is created per event in the payload (a single checkout can span
   * multiple events/tickets). Every event's required custom questions must have a
   * non-empty answer before any document is written.
   */
  async createMany(dtos: CreateEventTicketAnswerDto[]) {
    const events: any[] = await Promise.all(
      dtos.map(async dto => {
        const event = await this.eventModel
          .findById(dto.eventInfo.eventId)
          .select('customQuestions')
          .lean();

        if (!event) {
          throw new NotFoundException(
            `Event ${dto.eventInfo.eventId} not found`,
          );
        }

        return event;
      }),
    );

    dtos.forEach((dto, index) => {
      const requiredQuestions = (events[index].customQuestions || []).filter(
        (q: any) => q.isRequired,
      );

      const answeredIds = new Set(
        (dto.questionAnswer || [])
          .filter(qa => qa.answer?.trim())
          .map(qa => qa.questionId),
      );

      const missing = requiredQuestions.filter(
        (q: any) => !answeredIds.has(String(q._id)),
      );

      if (missing.length) {
        throw new BadRequestException(
          `Missing answer for required question(s): ${missing
            .map((q: any) => q.question)
            .join(', ')}`,
        );
      }
    });

    const docs = dtos.map(dto => ({
      eventInfo: {
        eventId: new Types.ObjectId(dto.eventInfo.eventId),
        ticketIds: dto.eventInfo.ticketIds.map(id => new Types.ObjectId(id)),
      },
      purchaserInfo: dto.purchaserInfo,
      questionAnswer: dto.questionAnswer.map(qa => ({
        questionId: new Types.ObjectId(qa.questionId),
        answer: qa.answer,
      })),
      createdAt: new Date(),
    }));

    return this.eventTicketAnswerModel.insertMany(docs);
  }
}
