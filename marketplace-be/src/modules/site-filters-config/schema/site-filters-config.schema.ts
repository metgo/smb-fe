import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Business } from 'src/modules/business/shared/schema/business.schema';
import { Trip } from 'src/modules/trips/schema/trips.schema';
import { SiteFiltersConfigStatus } from '../site-filters-config.type';
import { Product } from 'src/modules/products/schema/products.schema';
import { PointOfInterest } from 'src/modules/point-of-interests/schema/point-of-interest.schema';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';

@Schema({ _id: false })
export class SiteCategoriesItem {
  @Prop({ default: null })
    title: string;

  @Prop({ default: null })
    titleHe: string;

  @Prop({ default: null })
    titleAr: string;

  @Prop({ default: null })
    description: string;

  @Prop({ default: null })
    descriptionHe: string;

  @Prop({ default: null })
    descriptionAr: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Business.name }],
    required: false,
  })
    businessIds: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Event.name }],
    required: false,
  })
    eventIds: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: PointOfInterest.name }],
    required: false,
  })
    poiIds: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Trip.name }],
    required: false,
  })
    tripIds: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Product.name }],
    required: false,
  })
    productIds: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Trip.name }],
    required: false,
  })
    fundayIds: mongoose.Types.ObjectId[];

  @Prop({ type: Boolean, default: false })
    isPrimary: boolean;

  @Prop({ type: Boolean, default: false })
    isArchived: boolean;

  @Prop({ default: null })
    icon: string;

  @Prop({ type: [String], default: ['#800080'] })
    colors: string[];
}

export const SiteCategoriesItemSchema
  = SchemaFactory.createForClass(SiteCategoriesItem);

@Schema({ _id: false })
export class SiteTopicItem {
  @Prop({ default: null })
    title: string;

  @Prop({ default: null })
    titleHe: string;

  @Prop({ default: null })
    titleAr: string;

  @Prop({ default: null })
    description: string;

  @Prop({ default: null })
    descriptionHe: string;

  @Prop({ default: null })
    descriptionAr: string;

  @Prop({ type: [SiteCategoriesItemSchema], required: false })
    siteCategories: SiteCategoriesItem[];

  @Prop({ required: false })
    order: number;

  @Prop({ type: Boolean, default: false })
    isPrimary: boolean;

  @Prop({ type: Boolean, default: false })
    isArchived: boolean;

  @Prop({ default: null })
    icon: string;

  @Prop({ type: [String], default: ['#800080'] })
    colors: string[];
}

export const SiteTopicItemSchema = SchemaFactory.createForClass(SiteTopicItem);

@Schema()
export class SiteFiltersConfig extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({ default: null })
    header: string;

  @Prop({ default: null })
    headerDescription: string;

  @Prop({ default: null })
    headerHe: string;

  @Prop({ default: null })
    headerDescriptionHe: string;

  @Prop({ default: null })
    headerAr: string;

  @Prop({ default: null })
    headerDescriptionAr: string;

  @Prop({ default: null })
    icon: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ExternalApi.name,
    required: false,
  })
    externalApiId: mongoose.Types.ObjectId;

  @Prop({ enum: SiteFiltersConfigStatus, required: true })
    status: SiteFiltersConfigStatus;

  @Prop({ type: [SiteTopicItemSchema], required: false })
    siteTopics: SiteTopicItem[];
}

export type SiteFiltersConfigDocument = HydratedDocument<SiteFiltersConfig>;

export const SiteFiltersConfigSchema
  = SchemaFactory.createForClass(SiteFiltersConfig);

SiteFiltersConfigSchema.index({ externalApiId: 1 });
