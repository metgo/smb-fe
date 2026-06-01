import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';

@Schema()
export class Partner extends AuditableSchema {
  @Prop({ type: mongoose.Schema.Types.ObjectId, index: true, auto: true })
    _id: mongoose.Types.ObjectId;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: ExternalApi.name,
    required: true,
  })
    websites: mongoose.Types.ObjectId[];

  @Prop({ required: false })
    nameEn: string;

  @Prop({ required: false })
    nameHe: string;

  @Prop({ required: false })
    nameAr: string;

  @Prop({ required: false })
    descriptionEn: string;

  @Prop({ required: false })
    descriptionHe: string;

  @Prop({ required: false })
    descriptionAr: string;

  @Prop({ required: false })
    logo: string;

  @Prop({ required: false })
    siteUrl: string;

  @Prop({ default: true })
    isActive: boolean;
}

export type PartnerDocument = HydratedDocument<Partner>;
export const PartnerSchema = SchemaFactory.createForClass(Partner);

PartnerSchema.index({ websites: 1 });
PartnerSchema.index({ websites: 1, isActive: 1, isDeleted: 1 });
PartnerSchema.index({ isActive: 1, isDeleted: 1 });
