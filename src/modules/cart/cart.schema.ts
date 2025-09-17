import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { CartProductPayload, CartStatus } from 'src/modules/cart/cart.types';
import { DeliveryMethod, OrderItemType } from '../orders/orders.type';

@Schema({})
export class Cart extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    type: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        email: String,
        countryCode: String,
        phone: String,
        firstName: String,
        lastName: String,
        deliveryFee: Number,
        deliveryMethod: { type: String, enum: Object.values(DeliveryMethod) },
        deliveryArea: String,
        deliveryPickupLocation: String,
        houseNo: String,
        apartment: String,
        city: String,
        street: String,
        isGift: Boolean,
        additionalInfo: String,
        itemType: { type: String, enum: Object.values(OrderItemType) },
      },
    ],
    _id: false,
  })
    product: CartProductPayload[];

  @Prop()
    totalAmount: number;

  @Prop({ default: CartStatus.PENDING })
    status: CartStatus;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
  })
    campId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false,
  })
    orderId: mongoose.Types.ObjectId;
}
export type CartDocument = HydratedDocument<Cart>;
export const CartSchema = SchemaFactory.createForClass(Cart);
