import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Authority } from 'src/modules/authority/schema/authority.schema';
import { DeliveryArea } from 'src/modules/business/shared/schema/business.schema';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { BussSubCategory } from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';
import { DMO } from 'src/modules/dmo/schema/dmo.schema';
import { ProductStatus } from 'src/modules/products/products.type';
import { User } from 'src/modules/users/schema/users.schema';

export class Image {
  image: { type: string; required: true };
  caption: string;
  alt: string;
  isPrimary: boolean;
  subCoordinates: {
    xMax: number;
    xMin: number;
    yMax: number;
    yMin: number;
  };
}

@Schema()
export class Product extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop()
    name: string;

  @Prop()
    slug: string;

  @Prop()
    description: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
  })
    businessId: mongoose.Types.ObjectId;

  @Prop()
    images: Image[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }],
    required: false,
  })
    collaboratorId: mongoose.Types.ObjectId[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: false,
  })
    primaryUserId: mongoose.Types.ObjectId | null;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Authority.name,
    required: false,
  })
    authorityId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: DMO.name,
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
    markedPrice: number;
    discountAmount: number;
    discountPercent: number;
    sellingPrice: number; // price after discount
  };

  @Prop({
    type: {
      initial: Number,
      sold: { type: Number, default: 0 },
      remaining: Number,
      isUnlimited: Boolean,
    },
  })
    quantity: {
    initial: number;
    sold: number;
    remaining: number;
    isUnlimited: boolean;
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
    reviews: [
    {
      comment: string;
      userId: { type: mongoose.Schema.Types.ObjectId };
      rating: number;
    }
  ];

  @Prop({ enum: ProductStatus, default: ProductStatus.ACTIVE })
    status: ProductStatus;

  @Prop({ default: 200, required: false })
    impact: number;

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

  @Prop({ type: Boolean, default: false })
    deliveryInfoSameAsBusiness: boolean;

  @Prop({ required: false })
    deliveryArea: DeliveryArea[];

  @Prop({ required: false, type: [String] })
    deliverySpecificSellerInfo: string[];

  @Prop({ required: false, type: [String] })
    deliveryReturnExchange: string[];

  @Prop({ required: false })
    deliveryAdditionalInfo: string;

  @Prop({ type: Boolean, default: false })
    isPickUpAvailable: boolean;

  @Prop({ default: null })
    activeStartDate: Date;

  @Prop({ default: null })
    activeEndDate: Date;

  // need to implement in future
  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
  })
    features: mongoose.Schema.Types.ObjectId[];
}

export type Products = HydratedDocument<Product>;

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ subCategories: 1, status: 1 });
