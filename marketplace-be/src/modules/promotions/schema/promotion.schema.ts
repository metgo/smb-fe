import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { PromotionMediaType, PromotionPlacementType } from 'src/common/enum';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';

@Schema()
export class Promotion extends AuditableSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, index: true, auto: true })
    _id: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ExternalApi.name,
    required: false,
  })
    externalApiId: mongoose.Types.ObjectId;

  @Prop({ required: false })
    titleEn: string;

  @Prop({ required: false })
    titleHe: string;

  @Prop({ required: false })
    titleAr: string;

  @Prop({ required: false })
    descriptionEn: string;

  @Prop({ required: false })
    descriptionHe: string;

  @Prop({ required: false })
    descriptionAr: string;

  @Prop({
    enum: PromotionPlacementType,
    default: PromotionPlacementType.HOME_PAGE_HERO,
    required: true,
  })
    placement: PromotionPlacementType;

  @Prop({
    enum: PromotionMediaType,
    default: PromotionMediaType.IMAGE,
    required: true,
  })
    mediaType: PromotionMediaType;

  @Prop({ type: { desktop: String, mobile: String }, required: true })
    mediaUrl: { desktop: string; mobile: string };

  @Prop({ required: true })
    linkUrl: string;

  @Prop({ default: true })
    isActive: boolean;

  @Prop({ default: 0 })
    views: number;

  @Prop({ default: 0 })
    clicks: number;
}

export type PromotionDocument = HydratedDocument<Promotion>;
export const PromotionSchema = SchemaFactory.createForClass(Promotion);

PromotionSchema.index({ externalApiId: 1, placement: 1 });
PromotionSchema.index({ isActive: 1, isDeleted: 1 });
