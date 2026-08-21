import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Order } from './orders.schema';

@Schema()
export class QrVerificationToken extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Order.name,
    required: true,
    index: true,
  })
    orderId: mongoose.Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    unique: true,
    index: true,
  })
    token: string;

  @Prop({
    type: Date,
    required: true,
    index: true,
  })
    expiresAt: Date;

  @Prop({
    type: Boolean,
    default: false,
  })
    isUsed: boolean;

  @Prop({
    type: String,
    default: null,
  })
    lastAccessIp: string;

  @Prop({
    type: Date,
    default: null,
  })
    lastAccessedAt: Date;

  @Prop({
    type: Number,
    default: 0,
  })
    accessCount: number;
}

export type QrVerificationTokenDocument = HydratedDocument<QrVerificationToken>;

export const QrVerificationTokenSchema
  = SchemaFactory.createForClass(QrVerificationToken);
