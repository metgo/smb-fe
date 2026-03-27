import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { SMSTemplateStatus } from 'src/services/sms/sms.type';

@Schema()
export class SMSTemplate extends AuditableSchema {
  @Prop()
    name: string;

  @Prop()
    description: string;

  @Prop({ unique: true, required: true })
    slug: string;

  @Prop()
    heMessage: string;

  @Prop()
    enMessage: string;

  @Prop({ enum: SMSTemplateStatus, default: SMSTemplateStatus.ACTIVE })
    status: SMSTemplateStatus;
}

export type SMSTemplateDocument = HydratedDocument<SMSTemplate>;
export const SMSTemplateSchema = SchemaFactory.createForClass(SMSTemplate);
