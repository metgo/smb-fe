import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { User } from 'src/modules/users/schema/users.schema';
import { TicketStatus, TicketType } from '../tickets.type';

export class Image {
  image: { type: string; required: true };
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

@Schema()
export class Ticket extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop()
    name: string;

  @Prop()
    description: string;

  @Prop({ maxlength: 500 })
    greeting: string;

  @Prop()
    images: Image[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
    userId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Event.name,
    required: true,
  })
    eventId: mongoose.Types.ObjectId;

  @Prop({ required: false })
    wrapperId?: string;

  @Prop({
    type: {
      markedPrice: Number,
      discountAmount: Number,
      discountPercent: Number,
      sellingPrice: Number,
    },
    _id: false,
  })
    price: {
    markedPrice: number;
    discountAmount: number;
    discountPercent: number;
    sellingPrice: number; // price after discount
  };

  @Prop({
    type: {
      initial: Number,
      sold: Number,
      remaining: Number,
      isUnlimited: Boolean,
      perUserLimit: Number,
    },
    _id: false,
  })
    quantity: {
    initial: number;
    sold: number;
    remaining: number;
    isUnlimited: boolean;
    perUserLimit: number;
  };

  @Prop({ enum: TicketStatus, default: TicketStatus.ACTIVE })
    status: TicketStatus;

  @Prop({ enum: TicketType, default: TicketType.FREE })
    type: TicketType;

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
}

export type Tickets = HydratedDocument<Ticket>;

export const TicketSchema = SchemaFactory.createForClass(Ticket);

TicketSchema.index({ eventId: 1, status: 1 });
TicketSchema.index({ userId: 1 });
