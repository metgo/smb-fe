import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { PaymentStatus } from 'src/common/enum';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { OrderStatus, PaymentMode } from 'src/modules/orders/orders.type';
import { User } from 'src/modules/users/schema/users.schema';

@Schema()
export class Order extends AuditableSchema {
  @Prop({
    required: true,
  })
    products: [{
      id: string,
      quantity: number,
    }];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
    userId: mongoose.Types.ObjectId;

  @Prop({
    enum: OrderStatus, default: OrderStatus.PENDING,
  })
    status: OrderStatus;

  @Prop({
    enum: PaymentStatus,
  })
    paymentStatus: PaymentStatus;

  @Prop()
    paymentMode: PaymentMode[];

  @Prop()
    voucher: [{
      id: string,
      redeemedAmount: number,
    }];

  @Prop({ type: Number, default: 0 })
    totalAmount: number;

  @Prop({ type: Number, default: 0 })
    creditCardPayment: number;
}

export type OrderDocument = HydratedDocument<Order>;

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ name: 'text', description: 'text' });
