import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema()
export class Media extends AuditableSchema {
  @Prop()
    url: string;

  @Prop()
    originalName: string;

  @Prop()
    mimetype: string;

  @Prop({
    type: {
      refId: mongoose.Schema.Types.ObjectId,
      schema: String,
    },
  })
    reference: {
      refId: string,
      schema: string,
    };
}

export type MediaDocument = HydratedDocument<Media>

export const MediaSchema = SchemaFactory.createForClass(Media);
MediaSchema.index({ name: 'text', iconAlt: 'text' });
