import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Event } from './events.schema';

@Schema({ timestamps: true })
export class EventsAudit extends Event {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Event.name,
    required: true,
    index: true,
  })
    eventId: mongoose.Types.ObjectId;

  @Prop({ required: true, default: 1 })
    version: number;

  @Prop({ default: true, index: true })
    isActive: boolean;
}

export const EventsAuditSchema = SchemaFactory.createForClass(EventsAudit);

// Compound index: fast lookup of the active snapshot for an event
EventsAuditSchema.index({ eventId: 1, isActive: 1 });
EventsAuditSchema.index({ eventId: 1, version: -1 });
EventsAuditSchema.index({ name: 'text', description: 'text' });

export type EventsAuditDocument = HydratedDocument<EventsAudit>;
