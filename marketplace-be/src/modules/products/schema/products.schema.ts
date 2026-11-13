import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { CommonStatus } from 'src/common/enum';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { ProductType } from 'src/modules/products/products.type';
import { DeliveryArea } from 'src/modules/business/shared/schema/business.schema';

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
    nameHe: string;

  @Prop()
    nameAr: string;

  @Prop()
    slug: string;

  @Prop()
    description: string;

  @Prop()
    descriptionHe: string;

  @Prop()
    descriptionAr: string;

  @Prop()
    shortDescription: string;

  @Prop()
    shortDescriptionHe: string;

  @Prop()
    shortDescriptionAr: string;

  @Prop({ enum: ProductType, default: ProductType.PHYSICAL })
    productType: ProductType;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
  })
    businessId: mongoose.Types.ObjectId;

  @Prop()
    images: Image[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    required: false,
  })
    collaboratorId: mongoose.Types.ObjectId[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  })
    primaryUserId: mongoose.Types.ObjectId | null;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Authority',
    required: false,
  })
    authorityId: mongoose.Types.ObjectId;

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

  @Prop({ enum: CommonStatus, default: CommonStatus.DRAFT })
    status: CommonStatus;

  @Prop({ default: 200, required: false })
    impact: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BussCategory',
    required: false,
    default: null,
  })
    primaryCategoryId: mongoose.Types.ObjectId;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BussCategory',
      },
    ],
    required: false,
  })
    categories: mongoose.Schema.Types.ObjectId[];

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BussSubCategory',
      },
    ],
    required: false,
  })
    subCategories: mongoose.Schema.Types.ObjectId[];

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GroupType',
      },
    ],
    required: false,
  })
    groupTypesId: mongoose.Schema.Types.ObjectId[];

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Accessibility',
      },
    ],
    required: false,
  })
    accessibilitiesId: mongoose.Schema.Types.ObjectId[];

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tags',
      },
    ],
    required: false,
  })
    tagsId: mongoose.Schema.Types.ObjectId[];

  @Prop({
    type: {
      country: String,
      city: String,
      location: String,
      additional_information: String,
    },
    default: null,
    _id: false,
  })
    address: {
    country: { type: string; default: null };
    city: { type: string; default: null };
    location: { type: string; default: null };
    additional_information: { type: string; default: null };
  };

  @Prop()
    serviceDuration: string;

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

  @Prop({ type: Boolean, default: false })
    globalDelivery: boolean;

  @Prop({ required: false })
    globalDeliveryArea: DeliveryArea[];

  @Prop({ type: Boolean, default: false })
    vendorDelivers: boolean;

  @Prop({ required: false })
    vendorDeliveryArea: DeliveryArea[];

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
ProductSchema.index({ slug: 1 });
ProductSchema.index({ isDeleted: 1, status: 1 });
ProductSchema.index({ businessId: 1, isDeleted: 1, status: 1 });
ProductSchema.index({ isDeleted: 1, status: 1, createdAt: -1 });
