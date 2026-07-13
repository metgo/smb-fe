import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';

@Schema()
export class DocUpload extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ExternalApi.name,
    required: false,
  })
    externalApiId: mongoose.Types.ObjectId;

  @Prop({ default: '' })
    title: string;

  @Prop({ default: '' })
    imageUrl: string;

  @Prop({ default: '' })
    templateKey: string;
}

export type DocUploadDocument = HydratedDocument<DocUpload>;
export const DocUploadSchema = SchemaFactory.createForClass(DocUpload);
