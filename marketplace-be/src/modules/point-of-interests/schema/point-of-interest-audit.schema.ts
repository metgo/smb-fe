import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { PointOfInterest } from './point-of-interest.schema';

@Schema({ timestamps: true })
export class PointOfInterestsAudit extends PointOfInterest {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: PointOfInterest.name,
    required: true,
    index: true,
  })
    pointOfInterestId: mongoose.Types.ObjectId;

  @Prop({ required: true, default: 1 })
    version: number;

  @Prop({ default: true, index: true })
    isActive: boolean;
}

export const PointOfInterestsAuditSchema = SchemaFactory.createForClass(
  PointOfInterestsAudit,
);

// Compound index: fast lookup of the active snapshot for a point of interest
PointOfInterestsAuditSchema.index({ pointOfInterestId: 1, isActive: 1 });
PointOfInterestsAuditSchema.index({ pointOfInterestId: 1, version: -1 });
PointOfInterestsAuditSchema.index({ name: 'text', description: 'text' });

export type PointOfInterestsAuditDocument =
  HydratedDocument<PointOfInterestsAudit>;
