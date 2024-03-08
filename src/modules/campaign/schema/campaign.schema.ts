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

  @Prop({})
    description: string;

  @Prop({ default: CampaignStatus.INACTIVE })
    status: CampaignStatus;

  @Prop({})
    code: string;

  @Prop({})
    imagePath: string;

  @Prop({ required: true })
    startDate: Date;

  @Prop({ required: true })
    endDate: Date;
}
export type CampaignDocument = HydratedDocument<Campaign>;
export const CampaignSchema = SchemaFactory.createForClass(Campaign);
