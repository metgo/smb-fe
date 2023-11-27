import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { OrderStatus, PaymentMode } from 'src/modules/orders/orders.type';
import { Product } from 'src/modules/products/schema/products.schema';
import { User } from 'src/modules/users/schema/users.schema';

@Schema()
export class Order extends AuditableSchema {
    @Prop({
      type: mongoose.Schema.Types.ObjectId,
      ref: Product.name,
      required: true,
    })
      productId: mongoose.Types.ObjectId[];

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

    @Prop()
      paymentMode: PaymentMode[];

    @Prop()
      voucher: [{
        id: mongoose.Schema.Types.ObjectId,
        redeemedAmout: number,
      }];

    @Prop({ default: 0 })
      totalAmount: number;
}

export type OrderDocument = HydratedDocument<Order>;

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ name: 'text', description: 'text' });
