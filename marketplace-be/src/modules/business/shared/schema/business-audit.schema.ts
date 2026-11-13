import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Mixed } from 'mongoose';

@Schema()
export class BusinessAudit {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
  })
    businessId: mongoose.Types.ObjectId;

  @Prop({ type: Map, of: Map })
    changedFields: Map<string, Mixed>;

  @Prop({ required: true })
    updatedBy: string;

  @Prop({ required: true })
    updatedAt: Date;
}

export const BusinessAuditSchema = SchemaFactory.createForClass(BusinessAudit);
