import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { CampaignStatus } from 'src/common/enum';
import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema({})
export class Campaign extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({})
    name: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DMO',
    default: null,
  })
    dmoId: mongoose.Types.ObjectId;

  @Prop({})
    code: string;

  @Prop({})
    description: string;

  @Prop({})
    imagePath: string;

  @Prop({})
    crowed: string[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Business' }],
    ref: 'Business',
    required: true,
  })
    segment: mongoose.Types.ObjectId[];

  @Prop({ default: CampaignStatus.INACTIVE })
    status: CampaignStatus;

  @Prop({ required: true })
    startDate: Date;

  @Prop({ required: true })
    endDate: Date;
}
export type CampaignDocument = HydratedDocument<Campaign>
export const CampaignSchema = SchemaFactory.createForClass(Campaign);
