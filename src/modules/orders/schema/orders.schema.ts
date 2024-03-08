import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { PaymentStatus } from 'src/common/enum';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Business } from 'src/modules/business/schema/business.schema';
import { OrderStatus, PaymentMode } from 'src/modules/orders/orders.type';
import { Product } from 'src/modules/products/schema/products.schema';
import { User } from 'src/modules/users/schema/users.schema';

@Schema()
export class Order extends AuditableSchema {
  @Prop({
    required: true,
    type: [
      {
        id: mongoose.Schema.Types.ObjectId,
        quantity: Number,
      },
    ],
    ref: Product.name,
    default: null,
  })
    products: [
    {
      id: mongoose.Types.ObjectId;
      quantity: number;
    }
  ];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Business.name }],
    ref: Business.name,
    required: false,
    default: [],
  })
    businessId: mongoose.Types.ObjectId[];

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
    address: string;

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

  @Prop({ default: null })
    identifierId: string;
}

export type OrderDocument = HydratedDocument<Order>;

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ name: 'text', description: 'text' });
