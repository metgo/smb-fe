import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema()
export class SocialMedia extends AuditableSchema {
    @Prop({ unique: true, required: true })
      name: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Icons' })
      icon: mongoose.Types.ObjectId;
}

export type SocialMediaDocument = HydratedDocument<SocialMedia>

export const SocialMediaSchema = SchemaFactory.createForClass(SocialMedia);
