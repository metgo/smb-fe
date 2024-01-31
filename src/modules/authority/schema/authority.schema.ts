import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { DMO } from 'src/modules/dmo/schema/dmo.schema';

@Schema()
export class Authority extends AuditableSchema {
  @Prop({ required: true })
    name: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: DMO.name,
    required: true,
  })
    dmoId: mongoose.Types.ObjectId;
}

export const AuthoritySchema = SchemaFactory.createForClass(Authority);
export type AuthorityDocument = HydratedDocument<Authority>;
