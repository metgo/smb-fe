import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { User } from 'src/modules/users/schema/users.schema';
import { TicketStatus } from '../tickets.type';

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

  @Prop()
    images: Image[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
    userId: mongoose.Types.ObjectId;

  @Prop({
    type: {
      markedPrice: Number,
      discountAmount: Number,
      discountPercent: Number,
      sellingPrice: Number,
    },
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
      sold: { type: Number, default: 0 },
      remaining: Number,
      isUnlimited: Boolean,
    },
  })
    quantity: {
    initial: number;
    sold: number;
    remaining: number;
    isUnlimited: boolean;
  };

  @Prop({ enum: TicketStatus, default: TicketStatus.ACTIVE })
    status: TicketStatus;
}

export type Tickets = HydratedDocument<Ticket>;

export const TicketSchema = SchemaFactory.createForClass(Ticket);
