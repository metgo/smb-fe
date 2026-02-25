import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Business } from './business.schema';

@Schema({ timestamps: true })
export class BusinessesAudit extends Business {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true,
  })
    businessId: mongoose.Types.ObjectId;

  @Prop({ required: true, default: 1 })
    version: number;

  @Prop({ default: true, index: true })
    isActive: boolean;
}

export const BusinessesAuditSchema
  = SchemaFactory.createForClass(BusinessesAudit);

// Compound index: fast lookup of the active snapshot for a business
BusinessesAuditSchema.index({ businessId: 1, isActive: 1 });
BusinessesAuditSchema.index({ businessId: 1, version: -1 });
BusinessesAuditSchema.index({ name: 'text', description: 'text' });

export type BusinessesAuditDocument = HydratedDocument<BusinessesAudit>;
