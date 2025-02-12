import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Campaign } from 'src/modules/campaign/schema/campaign.schema';
import { CartStatus } from 'src/modules/cart/cart.types';

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
        address: String,
      },
    ],
  })
    product: [
    {
      id: mongoose.Types.ObjectId;
      quantity: number;
      address: string;
    }
  ];

  @Prop()
    totalAmount: number;

  @Prop({ default: CartStatus.PENDING })
    status: CartStatus;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Campaign.name,
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
