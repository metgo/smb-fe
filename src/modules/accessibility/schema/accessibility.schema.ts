import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema()
export class Accessibility extends AuditableSchema {
  @Prop({ unique: true, required: true })
    name: string;

  @Prop({ default: null })
    description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Icons' })
    icon: mongoose.Types.ObjectId;
}

export type AccessibilityDocument = HydratedDocument<Accessibility>

export const AccessibilitySchema = SchemaFactory.createForClass(Accessibility);
