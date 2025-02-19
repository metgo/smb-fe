import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { PaymentStatus } from 'src/common/enum';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
import { OrderStatus, PaymentMode } from 'src/modules/orders/orders.type';
import { Product } from 'src/modules/products/schema/products.schema';
import { User } from 'src/modules/users/schema/users.schema';

@Schema()
export class Order extends AuditableSchema {
  @Prop({
    required: true,
    type: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: Product.name },
      },
    ],
    default: null,
  })
    products: {
    id: mongoose.Types.ObjectId;
  }[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: false,
  })
    userId: mongoose.Types.ObjectId;

  @Prop({
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
    status: OrderStatus;

  @Prop({
    enum: PaymentStatus,
  })
    paymentStatus: PaymentStatus;

  @Prop({ default: null })
    email: string;

  @Prop({ default: null })
    countryCode: string;

  @Prop({ default: null })
    phone: string;

  @Prop({ default: null })
    firstName: string;

  @Prop({ default: null })
    lastName: string;

  @Prop()
    paymentMode: PaymentMode[];

  @Prop()
    voucher: [
    {
      id: string;
      redeemedAmount: number;
    }
  ];

  @Prop({ type: Number, default: 0 })
    totalAmount: number;

  @Prop({ type: Number, default: 0 })
    creditCardPayment: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ExternalApi.name,
    required: false,
  })
    externalApiId: mongoose.Types.ObjectId;

  @Prop({ type: Number, default: 0 })
    deliveryFee: number;

  @Prop({ default: null })
    campId: string;

  @Prop({
    type: String,
    default: null,
  })
    qrCodeUrl: string;

  @Prop({ default: null })
    paymentDate: Date;

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

export type OrderDocument = HydratedDocument<Order>;

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ name: 'text', description: 'text' });
