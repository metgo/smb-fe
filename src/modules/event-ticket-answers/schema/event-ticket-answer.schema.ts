import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema({ _id: false })
export class EventInfo {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true,
  })
    eventId: mongoose.Types.ObjectId;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Ticket',
    required: true,
    default: [],
  })
    ticketIds: mongoose.Types.ObjectId[];
}
export const EventInfoSchema = SchemaFactory.createForClass(EventInfo);

@Schema({ _id: false })
export class PurchaserInfo {
  @Prop({ required: true, index: true })
    email: string;

  @Prop({ required: false })
    phone: string;
}
export const PurchaserInfoSchema = SchemaFactory.createForClass(PurchaserInfo);

@Schema()
export class QuestionAnswer {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  })
    questionId: mongoose.Types.ObjectId;

  @Prop({ required: true })
    answer: string;
}
export const QuestionAnswerSchema = SchemaFactory.createForClass(QuestionAnswer);

@Schema()
export class EventTicketAnswer extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({ type: EventInfoSchema, required: true })
    eventInfo: EventInfo;

  @Prop({ type: PurchaserInfoSchema, required: true })
    purchaserInfo: PurchaserInfo;

  @Prop({ type: [QuestionAnswerSchema], default: [] })
    questionAnswer: QuestionAnswer[];
}

export type EventTicketAnswerDocument = HydratedDocument<EventTicketAnswer>;
export const EventTicketAnswerSchema = SchemaFactory.createForClass(EventTicketAnswer);

EventTicketAnswerSchema.index({ 'eventInfo.eventId': 1 });
EventTicketAnswerSchema.index({ 'purchaserInfo.email': 1 });
