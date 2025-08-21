import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import {
  DeliveryMethod,
  OrderItemType,
  OrderStatus,
} from 'src/modules/orders/orders.type';
import { Order } from 'src/modules/orders/schema/orders.schema';
import { User } from 'src/modules/users/schema/users.schema';

@Schema()
export class OrderProduct extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  })
    itemId: mongoose.Types.ObjectId;

  @Prop({ type: Number, default: 1 })
    quantity: number;

  @Prop({ type: Number })
    amount: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: false,
  })
    userId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Order.name,
    required: true,
  })
    orderId: mongoose.Types.ObjectId;

  @Prop({ default: null })
    email: string;

  @Prop({ enum: OrderItemType, default: OrderItemType.PRODUCT })
    itemType: OrderItemType;

  @Prop({ default: null })
    countryCode: string;

  @Prop({ default: null })
    phone: string;

  @Prop({ default: null })
    firstName: string;

  @Prop({ default: null })
    lastName: string;

  @Prop({ enum: DeliveryMethod, default: DeliveryMethod.DELIVER })
    deliveryMethod: DeliveryMethod;

  @Prop({ default: null })
    deliveryArea: string;

  @Prop({ default: null })
    deliveryPickupLocation: string;

  @Prop({ default: null })
    houseNo: string;

  @Prop({ default: null })
    apartment: string;

  @Prop({ default: null })
    city: string;

  @Prop({ default: null })
    street: string;

  @Prop({ default: false, type: Boolean })
    isGift: boolean;

  @Prop({ default: null })
    additionalInfo: string;

  @Prop({
    enum: OrderStatus,
    default: OrderStatus.PROCESSING,
  })
    status: OrderStatus;

  @Prop({ type: Number, default: 0 })
    deliveryFee: number;

  @Prop({
    type: {
      by: { type: mongoose.Schema.Types.ObjectId, ref: User.name },
      date: { type: Date },
      additional_information: { type: String },
      isAutomatic: { type: Boolean, default: false },
    },
  })
    shipped: {
    by: mongoose.Types.ObjectId;
    date: Date;
    additional_information: string;
    isAutomatic: boolean;
  };

  @Prop({
    type: {
      by: { type: mongoose.Schema.Types.ObjectId, ref: User.name },
      date: { type: Date, required: true },
      additional_information: { type: String },
      isAutomatic: { type: Boolean, default: false },
    },
  })
    completed: {
    by: mongoose.Types.ObjectId;
    date: Date;
    additional_information: String;
    isAutomatic: boolean;
  };

  @Prop({
    type: {
      by: { type: mongoose.Schema.Types.ObjectId, ref: User.name },
      date: { type: Date },
      canceled_reason: { type: String },
      isAutomatic: { type: Boolean, default: false },
    },
  })
    cancelled: {
    by: mongoose.Types.ObjectId;
    date: Date;
    canceled_reason: string;
    isAutomatic: boolean;
  };
}

export type OrderProducts = HydratedDocument<OrderProduct>;

export const OrderProductSchema = SchemaFactory.createForClass(OrderProduct);
