import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CampaignStatus } from 'src/common/enum';
import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema({})
export class Campaign extends AuditableSchema {
  @Prop({})
    name: string;

  @Prop({})
    amount: number;

  @Prop({})
    code: string;

  @Prop({})
    description: string;

  @Prop({})
    imagePath: string;

  @Prop({ default: CampaignStatus.INACTIVE })
    status: CampaignStatus;

  @Prop({ required: true })
    startDate: Date;

  @Prop({ required: true })
    endDate: Date;
}
export type CampaignDocument = HydratedDocument<Campaign>
export const CampaignSchema = SchemaFactory.createForClass(Campaign);
