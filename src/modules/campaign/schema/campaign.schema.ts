import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CampaignStatus } from 'src/common/enum';
import { twoYearExpireDate } from 'src/common/expireDate';
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

    @Prop({ default: CampaignStatus.PRIVATE })
      status: CampaignStatus;

    @Prop({ default: twoYearExpireDate(new Date()) })
      expiredDate: Date;
}
export type CampaignDocument = HydratedDocument<Campaign>
export const CampaignSchema = SchemaFactory.createForClass(Campaign);
