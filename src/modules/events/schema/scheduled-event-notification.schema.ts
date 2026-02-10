import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import {
  NotificationChannel,
  ScheduledNotificationStatus,
} from '../events.type';
import { Locale } from 'src/common/enum';

@Schema({ _id: false })
export class NotificationTemplate {
  @Prop({ required: true })
    subject: string;

  @Prop({ required: true })
    body: string;
}

export const NotificationTemplateSchema
  = SchemaFactory.createForClass(NotificationTemplate);

@Schema()
export class ScheduledEventNotification extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Event.name,
    required: true,
    index: true,
  })
    eventId: mongoose.Types.ObjectId;

  @Prop({ required: true })
    sendHoursBefore: number; // e.g., 24

  @Prop({
    type: [String],
    enum: Object.values(NotificationChannel),
    required: true,
  })
    channels: NotificationChannel[];

  @Prop({
    enum: Locale,
    default: Locale.ENGLISH,
  })
    language: Locale;

  @Prop({
    required: true,
  })
    template: string;

  @Prop({
    type: NotificationTemplateSchema,
    required: false,
  })
    customTemplate: NotificationTemplate;

  @Prop({
    enum: ScheduledNotificationStatus,
    default: ScheduledNotificationStatus.ACTIVE,
  })
    status: ScheduledNotificationStatus;
}

export const ScheduledEventNotificationSchema = SchemaFactory.createForClass(
  ScheduledEventNotification,
);

export type ScheduledEventNotificationDocument =
  HydratedDocument<ScheduledEventNotification>;
