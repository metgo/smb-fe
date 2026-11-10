import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { CommonStatus } from 'src/common/enum';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { User } from 'src/modules/users/schema/users.schema';
import { Business, DeliveryArea } from 'src/modules/business/shared/schema/business.schema';
import { CatalogueType } from '../punch-passes.type';

export class Image {
  image: string;
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
export class PunchPassCatalogue {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({ required: false, default: null })
    name: string;

  @Prop({ required: false, default: null })
    nameHe: string;

  @Prop({ required: false, default: null })
    nameAr: string;

  @Prop({ required: false })
    quantity: number;

  @Prop({ required: false, type: Date })
    dateTime: Date;

  @Prop({ type: String, enum: CatalogueType, default: CatalogueType.PRODUCT })
    type: CatalogueType;

  @Prop({ type: Number, default: 0 })
    order: number;
}
export const PunchPassCatalogueSchema
  = SchemaFactory.createForClass(PunchPassCatalogue);

@Schema()
export class PunchPass extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Business.name,
    required: true,
    index: true,
  })
    businessId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
    userId: mongoose.Types.ObjectId;

  @Prop({ required: false, default: null })
    name: string;

  @Prop({ required: false, default: null })
    nameHe: string;

  @Prop({ required: false, default: null })
    nameAr: string;

  @Prop({ required: false, default: null })
    description: string;

  @Prop({ required: false, default: null })
    descriptionHe: string;

  @Prop({ required: false, default: null })
    descriptionAr: string;

  @Prop()
    images: Image[];

  @Prop({ type: [PunchPassCatalogueSchema], required: true, default: [] })
    catalogues: PunchPassCatalogue[];

  @Prop({
    type: {
      markedPrice: Number,
      discountAmount: Number,
      discountPercent: Number,
      sellingPrice: Number,
    },
    _id: false,
    required: true,
  })
    price: {
    markedPrice: number;
    discountAmount: number;
    discountPercent: number;
    sellingPrice: number;
  };

  @Prop({ type: Number, default: 60 })
    expiryDate: number;

  @Prop({
    type: {
      initial: Number,
      sold: { type: Number, default: 0 },
      remaining: Number,
      isUnlimited: Boolean,
    },
    _id: false,
  })
    quantity: {
    initial: number;
    sold: number;
    remaining: number;
    isUnlimited: boolean;
  };

  @Prop({ type: String, enum: CommonStatus, default: CommonStatus.DRAFT })
    status: CommonStatus;

  @Prop({ required: false })
    deliveryArea: DeliveryArea[];
}

export type PunchPasses = HydratedDocument<PunchPass>;

export const PunchPassSchema = SchemaFactory.createForClass(PunchPass);

PunchPassSchema.index({ businessId: 1, status: 1 });
PunchPassSchema.index({ userId: 1 });
