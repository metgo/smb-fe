import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Business } from 'src/modules/business/schema/business.schema';
import { ProductStatus } from 'src/modules/products/products.type';

@Schema()
export class Product extends AuditableSchema {
  @Prop()
    name: string;

  @Prop()
    description: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Business.name,
    required: true,
  })
    businessId: mongoose.Types.ObjectId;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    ref: 'Users',
    required: false,
  })
    collaboratorId: mongoose.Types.ObjectId[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  })
    primaryUserId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DMO',
    required: false,
  })
    dmoId: mongoose.Types.ObjectId;

  @Prop({
    type: {
      markedPrice: Number,
      discountAmount: Number,
      discountPercent: Number,
      sellingPrice: Number,
    },
  })
    price: {
      markedPrice: number,
      discountAmount: number,
      discountPercent: number,
      sellingPrice: number, // price after discount
    };

  @Prop({
    type: {
      initial: Number,
      sold: Number,
      remaining: Number,
    },
  })
    quantity: {
      initial: number,
      sold: {type: number, default: 0}
      remaining: number,
    };

  @Prop({
    type: {
      comment: String,
      userId: { type: mongoose.Schema.Types.ObjectId },
      rating: {
        type: Number,
        get: (v: number) => v.toFixed(1),
        set: (v: string) => parseFloat(v),
      },
    },
  })
    reviews: [{
      comment: string,
      userId: { type: mongoose.Schema.Types.ObjectId },
      rating: number,
    }];

  @Prop({ enum: ProductStatus, default: ProductStatus.ACTIVE })
    status: ProductStatus;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  })
    categories: [mongoose.Schema.Types.ObjectId];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  })
    subCategories: [mongoose.Schema.Types.ObjectId];

  // need to implement in future
  @Prop()
    features: [mongoose.Schema.Types.ObjectId];
}

export type Products = HydratedDocument<Product>

export const ProductSchema = SchemaFactory.createForClass(Product);
