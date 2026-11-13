import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';

// eslint-disable-next-line no-shadow
export enum SessionBookingStatus {
  ACTIVE = 'ACTIVE',
  CONFIRMED = 'CONFIRMED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  ATTENDED = 'ATTENDED',
}

@Schema({ _id: false })
export class PurchaserInfo {
  @Prop({ required: true })
    name: string;

  @Prop({ required: true, index: true })
    email: string;

  @Prop({ required: false })
    phone: string;
}
export const PurchaserInfoSchema = SchemaFactory.createForClass(PurchaserInfo);

@Schema()
export class SessionBooking extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({ required: true, index: true })
    wrapperId: string;

  @Prop({ required: true, index: true })
    identifierId: string;

  @Prop({ required: true, index: true })
    sessionId: string;

  @Prop({ required: true })
    sessionName: string;

  @Prop({ required: true })
    slotTime: string;

  @Prop({ required: true })
    slotDate: string;

  @Prop({ required: false })
    room: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    index: true,
  })
    userId?: mongoose.Types.ObjectId;

  @Prop({ type: PurchaserInfoSchema, required: true })
    purchaserInfo: PurchaserInfo;

  @Prop({ required: true })
    holdExpiresAt: Date;

  @Prop({
    enum: SessionBookingStatus,
    default: SessionBookingStatus.ACTIVE,
    index: true,
  })
    status: SessionBookingStatus;

  @Prop({ required: false })
    attendedAt: Date;

  @Prop({ required: false })
    confirmedAt: Date;

  @Prop({ required: false })
    qrToken: string;

  @Prop({ required: false })
    bookingReference: string;

  @Prop({ required: false, index: true })
    inviteCode?: string;

  // the OrderProduct (ticket) this booking was made for - lets check-in and
  // any later status check confirm the ticket wasn't cancelled after booking
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    index: true,
  })
    orderProductId?: mongoose.Types.ObjectId;

  @Prop({ required: false })
    consumedAt?: Date; // Single-use lock: set when token is consumed

  @Prop({ required: false })
    comments?: string; // Optional comments from customer (injuries, accessibility needs, etc.)

  // Cancellation tracking fields
  @Prop({ required: false })
    cancelledAt?: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  })
    cancelledBy?: mongoose.Types.ObjectId;

  @Prop({ required: false })
    cancelReason?: string;
}

export type SessionBookingDocument = HydratedDocument<SessionBooking>;
export const SessionBookingSchema
  = SchemaFactory.createForClass(SessionBooking);

// Indexes for queries
SessionBookingSchema.index({ userId: 1, status: 1 });
SessionBookingSchema.index({
  wrapperId: 1,
  sessionId: 1,
  slotDate: 1,
  slotTime: 1,
});
SessionBookingSchema.index({
  wrapperId: 1,
  inviteCode: 1,
  'purchaserInfo.email': 1,
  status: 1,
});
SessionBookingSchema.index({ holdExpiresAt: 1, status: 1 });
SessionBookingSchema.index({ status: 1, isDeleted: 1 });
