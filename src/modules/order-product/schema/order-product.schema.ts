import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { DeliveryMethod } from 'src/modules/orders/orders.type';
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
}

export type OrderProducts = HydratedDocument<OrderProduct>;

export const OrderProductSchema = SchemaFactory.createForClass(OrderProduct);
