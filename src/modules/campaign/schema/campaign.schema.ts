import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { CampaignStatus, CampaignType } from 'src/common/enum';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Business } from 'src/modules/business/schema/business.schema';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { DMO } from 'src/modules/dmo/schema/dmo.schema';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
import { Product } from 'src/modules/products/schema/products.schema';
import { Rewards } from 'src/modules/rewards/schema/rewards.schema';

@Schema({})
export class Campaign extends AuditableSchema {
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
    description: string;

  @Prop()
    slogan: string;

  @Prop({ default: CampaignStatus.DRAFT })
    status: CampaignStatus;

  @Prop({ default: CampaignType.CASH_BACK })
    type: CampaignType;

  @Prop()
    code: string;

  @Prop()
    logoPath: string;

  @Prop()
    imagePath: string;

  @Prop()
    link: string;

  @Prop({ required: true })
    startDate: Date;

  @Prop({ required: true })
    endDate: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ExternalApi.name,
    required: false,
  })
    externalApiId: mongoose.Types.ObjectId;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: DMO.name }],
    required: false,
  })
    dmoIds: mongoose.Types.ObjectId[];

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Business ? Business.name : 'Business',
      },
    ],
    required: false,
  })
    businessIds: mongoose.Types.ObjectId[];

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Product ? Product.name : 'Product',
      },
    ],
    required: false,
  })
    productIds: mongoose.Types.ObjectId[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Rewards.name,
    required: false,
  })
    rewardId: mongoose.Types.ObjectId;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: BussCategory.name }],
    required: false,
  })
    categoryIds: mongoose.Types.ObjectId[];
}
export type CampaignDocument = HydratedDocument<Campaign>;
export const CampaignSchema = SchemaFactory.createForClass(Campaign);
