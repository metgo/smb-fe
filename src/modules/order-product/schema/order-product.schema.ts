import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Authority } from 'src/modules/authority/schema/authority.schema';
import { Business } from 'src/modules/business/schema/business.schema';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { BussSubCategory } from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';
import { DMO } from 'src/modules/dmo/schema/dmo.schema';
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
    ref: Business.name,
    required: true,
  })
    businessId: mongoose.Types.ObjectId;

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

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: DMO.name,
    required: false,
  })
    dmoId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Authority.name,
    required: false,
  })
    authorityId: mongoose.Types.ObjectId;

  @Prop({ default: null })
    email: string;

    @Prop({
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: BussCategory.name,
        },
      ],
      required: false,
    })
      categories: mongoose.Schema.Types.ObjectId[];

    @Prop({
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: BussSubCategory.name,
        },
      ],
      required: false,
    })
      subCategories: mongoose.Schema.Types.ObjectId[];

    @Prop({
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
        },
      ],
    })
      features: mongoose.Schema.Types.ObjectId[];
}

export type OrderProducts = HydratedDocument<OrderProduct>;

export const OrderProductSchema = SchemaFactory.createForClass(OrderProduct);
