import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Accessibility } from 'src/modules/accessibility/schema/accessibility.schema';
import { Authority } from 'src/modules/authority/schema/authority.schema';
import { BankAccount } from 'src/modules/bank-account/bank-account.schema';
import { BussSubCategory } from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';
import { GroupType } from 'src/modules/group-type/schema/group-type.schema';
import { User } from 'src/modules/users/schema/users.schema';
import { EventPaymentMethod, EventStatus } from '../events.type';
import { Ticket } from 'src/modules/tickets/schema/tickets.schema';
import { Business } from 'src/modules/business/shared/schema/business.schema';
import { DMO } from 'src/modules/dmo/schema/dmo.schema';

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

  @Prop({ enum: EventStatus, default: EventStatus.PENDING })
    status: EventStatus;

  @Prop()
    rejected_reason: string;

  @Prop({
    type: {
      isFree: { type: Boolean, default: false },
      method: {
        type: String,
        enum: EventPaymentMethod,
        default: EventPaymentMethod.TICKET,
      },
      externalLink: { type: String, required: false, default: null },
      ticketIds: [{ type: mongoose.Schema.Types.ObjectId, ref: Ticket.name }],
    },
  })
    payment: {
    isFree: boolean;
    method: EventPaymentMethod;
    externalLink?: string;
    ticketIds: mongoose.Types.ObjectId[];
  };

  @Prop({
    type: {
      isRegistration: { type: Boolean, default: false },
      noOfPeople: { type: Number, required: false, default: null },
      isUnlimited: { type: Boolean, default: false },
    },
  })
    registration: {
    isRegistration: boolean;
    noOfPeople?: number;
    isUnlimited: boolean;
  };

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: false,
  })
    userId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Business.name,
    required: false,
    default: null,
  })
    businessId: mongoose.Types.ObjectId;

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
    }
  ];

  @Prop({
    type: {
      image: String,
      caption: String,
      alt: String,
    },
    default: null,
  })
    cover: {
    image: { type: string; default: null };
    caption: { type: string; default: null };
    alt: { type: string; default: null };
  };

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

  @Prop({ required: false, default: null })
    startDate: Date;

  @Prop({ required: false, default: null })
    endDate: Date;

  @Prop({
    type: [
      {
        ticketIds: [{ type: mongoose.Schema.Types.ObjectId, ref: Ticket.name }],
        date: { type: Date, required: true },
        description: { type: String, required: false, default: null },
        startTime: { type: String, required: false, default: null },
        endTime: { type: String, required: false, default: null },
      },
    ],
    default: [],
  })
    dayDescription: {
    ticketIds: mongoose.Types.ObjectId[];
    date: Date;
    description?: string;
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
}

export const EventSchema = SchemaFactory.createForClass(Event);
EventSchema.index({ name: 'text', description: 'text' });

export type EventDocument = HydratedDocument<Event>;
