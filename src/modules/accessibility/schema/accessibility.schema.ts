import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Icons } from 'src/modules/icons/schema/icon.schema';

@Schema()
export class Accessibility extends AuditableSchema {
  @Prop({ unique: true, required: true })
    name: string;

  @Prop({ default: null })
    description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Icons.name })
    icon: mongoose.Types.ObjectId;

  @Prop()
    hebrewName: string;
}

export type AccessibilityDocument = HydratedDocument<Accessibility>

export const AccessibilitySchema = SchemaFactory.createForClass(Accessibility);
