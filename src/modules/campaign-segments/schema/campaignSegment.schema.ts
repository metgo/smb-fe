import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Business } from 'src/modules/business/schema/business.schema';
import { Campaign } from 'src/modules/campaign/schema/campaign.schema';
import { DMO } from 'src/modules/dmo/schema/dmo.schema';
import { Product } from 'src/modules/products/schema/products.schema';

@Schema({})
export class CampaignSegment extends AuditableSchema {
    @Prop({
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      required: true,
      auto: true,
    })
      _id: mongoose.Types.ObjectId;

    @Prop({
      type: mongoose.Schema.Types.ObjectId,
      ref: Campaign.name,
      required: true,
      unique: true,
    })
      campaign_ID: mongoose.Types.ObjectId;

    @Prop({
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: DMO.name }],
      ref: DMO.name,
      required: false,
      default: null,
    })
      DMOs: mongoose.Types.ObjectId[];

    @Prop({
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: Business.name }],
      ref: Business.name,
      required: false,
      default: null,
    })
      businesses: mongoose.Types.ObjectId[];

    @Prop({
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: Product.name }],
      ref: Product.name,
      required: false,
      default: null,
    })
      products: mongoose.Types.ObjectId[];

    @Prop({})
      crowed_age: String[];

    @Prop({})
      crowed_origin: String[];
}
export type CampaignSegments = HydratedDocument<CampaignSegment>
export const CampaignSegmentSchema = SchemaFactory.createForClass(CampaignSegment);
