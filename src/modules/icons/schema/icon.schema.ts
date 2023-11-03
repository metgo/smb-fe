import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema()
export class Icons extends AuditableSchema {
    @Prop({ unique: true, required: true })
      name: string;

    @Prop({ required: true })
      iconPath: string;

    @Prop({ required: false })
      iconAlt: string;
}

export type IconsDocument = HydratedDocument<Icons>

export const IconsSchema = SchemaFactory.createForClass(Icons);
IconsSchema.index({ name: 'text', iconAlt: 'text' });
