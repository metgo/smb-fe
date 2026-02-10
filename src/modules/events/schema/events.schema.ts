import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Accessibility } from 'src/modules/accessibility/schema/accessibility.schema';
import { Authority } from 'src/modules/authority/schema/authority.schema';
import { BankAccount } from 'src/modules/bank-account/bank-account.schema';
import { BussSubCategory } from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';
import { GroupType } from 'src/modules/group-type/schema/group-type.schema';
import { User } from 'src/modules/users/schema/users.schema';
import {
  CommonQuestionAnswerType,
  EventStatus,
  EventType,
} from '../events.type';
import { DMO } from 'src/modules/dmo/schema/dmo.schema';
import { RecurringEventRule } from './recurring-event.schema';
import { ScheduledEventNotification } from './scheduled-event-notification.schema';

@Schema({ _id: false })
export class CommonQuestionOptions {
  @Prop({ required: false })
    label: string;

  @Prop({ required: false })
    value: string;
}
export const CommonQuestionOptionsSchema = SchemaFactory.createForClass(
  CommonQuestionOptions,
);

@Schema({ _id: false })
export class CustomQuestion {
  @Prop({ required: false })
    question: string;

  @Prop({
    enum: CommonQuestionAnswerType,
    default: CommonQuestionAnswerType.TEXT,
  })
    answerType: CommonQuestionAnswerType;

  @Prop({ default: false })
    required?: boolean;

  @Prop({ type: [CommonQuestionOptionsSchema], default: [] })
    commonQuestionOptions?: CommonQuestionOptions[];
}
export const CustomQuestionSchema
  = SchemaFactory.createForClass(CustomQuestion);

@Schema()
export class Event extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({ required: false, default: null })
    name: string;

  @Prop({
    type: {
      country: String,
      city: String,
      location: String,
      additional_information: String,
    },
    _id: false,
    default: null,
  })
    address: {
    country: { type: string; default: null };
    city: { type: string; default: null };
    location: { type: string; default: null };
    additional_information: { type: string; default: null };
  };

  @Prop()
    shortDescription: string;

  @Prop()
    description: string;

  @Prop()
    internalNotes: string;

  @Prop({ enum: EventStatus, default: EventStatus.DRAFT })
    status: EventStatus;

  @Prop()
    rejected_reason: string;

  @Prop({
    type: {
      isRegistration: { type: Boolean, default: false },
      noOfPeople: { type: Number, required: false, default: null },
      isUnlimited: { type: Boolean, default: false },
    },
    _id: false,
  })
    registration: {
    isRegistration: boolean;
    noOfPeople?: number;
    isUnlimited: boolean;
  };

  @Prop({ type: [CustomQuestionSchema], default: [] })
    customQuestions: CustomQuestion[];

  @Prop({ enum: EventType, default: EventType.PHYSICAL })
    eventType: EventType;

  @Prop()
    onlineLink: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: false,
  })
    userId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Authority.name,
    required: false,
    default: null,
  })
    authorityId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: DMO.name,
    required: false,
    default: null,
  })
    dmoId: mongoose.Types.ObjectId;

  @Prop({
    type: {
      lat: { type: String, default: null },
      long: { type: String, default: null },
    },
    _id: false,
    default: null,
  })
    geoLocation: {
    lat: { type: string; default: null };
    long: { type: string; default: null };
  };

  @Prop()
    images: [
    {
      image: string;
      caption: string;
      alt: string;
      isPrimary: boolean;
      subCoordinates: {
        xMax: number;
        xMin: number;
        yMax: number;
        yMin: number;
      };
    }
  ];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: GroupType.name }],
    required: false,
  })
    groupTypesId: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Accessibility.name }],
    required: false,
  })
    accessibilitiesId: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: BussSubCategory.name }],
    required: false,
  })
    subCategoriesId: mongoose.Types.ObjectId[];

  @Prop()
    slug: string;

  @Prop({
    type: [
      {
        date: { type: Date, required: true },
        startTime: { type: String, required: false, default: null },
        endTime: { type: String, required: false, default: null },
      },
    ],
    _id: false,
    default: [],
  })
    dayDescription: {
    date: Date;
    startTime?: string;
    endTime?: string;
  }[];

  @Prop({ default: 200, required: false })
    impact: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: BankAccount.name,
    required: false,
  })
    bankAccountId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: RecurringEventRule.name,
    required: false,
  })
    recurringEventRuleId: mongoose.Types.ObjectId;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: ScheduledEventNotification.name,
      },
    ],
    required: false,
  })
    scheduledNotificationId: mongoose.Types.ObjectId[];
}

export const EventSchema = SchemaFactory.createForClass(Event);
EventSchema.index({ name: 'text', description: 'text' });

export type EventDocument = HydratedDocument<Event>;
