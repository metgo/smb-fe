import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { PromotionPlacementType, PromotionRotationType } from 'src/common/enum';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
import { Promotion } from './promotion.schema';

@Schema({ _id: false })
class PlacementGroupItem {
  @Prop({ enum: PromotionPlacementType, required: true })
    placement: PromotionPlacementType;

  @Prop({ enum: PromotionRotationType, required: true })
    rotationType: PromotionRotationType;

  @Prop({ default: 0 })
    timeInterval: number;

  @Prop({
    type: [
      {
        promoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' },
        order: Number,
      },
    ],
    default: [],
  })
    promotions: { promoId: mongoose.Types.ObjectId | Promotion; order: number }[];
}

@Schema()
export class PromotionGroup extends AuditableSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, index: true, auto: true })
    _id: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ExternalApi.name,
    required: false,
  })
    externalApiId: mongoose.Types.ObjectId;

  @Prop({
    type: [SchemaFactory.createForClass(PlacementGroupItem)],
    default: [],
  })
    placementGroup: PlacementGroupItem[];
}

export type PromotionGroupDocument = HydratedDocument<PromotionGroup>;
export const PromotionGroupSchema
  = SchemaFactory.createForClass(PromotionGroup);

PromotionGroupSchema.index({ externalApiId: 1 });
