import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Order } from 'src/modules/orders/schema/orders.schema';
import { Product } from 'src/modules/products/schema/products.schema';
import { User } from 'src/modules/users/schema/users.schema';

@Schema()
export class OrderProduct extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Product.name,
    required: true,
  })
    productId: mongoose.Types.ObjectId;

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
}

export type OrderProducts = HydratedDocument<OrderProduct>;

export const OrderProductSchema = SchemaFactory.createForClass(OrderProduct);
