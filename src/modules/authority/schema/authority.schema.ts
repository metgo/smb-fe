import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { DMO } from 'src/modules/dmo/schema/dmo.schema';
import { Theme } from 'src/modules/themes/schema/theme.schema';
import { User } from 'src/modules/users/schema/users.schema';

@Schema()
export class Authority extends AuditableSchema {
  @Prop({ type: String, required: true })
    name: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: DMO.name,
    required: true,
  })
    dmoId: mongoose.Types.ObjectId;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }],
    ref: User.name,
  })
    adminIds: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }],
    ref: User.name,
  })
    collaboratorsUser: mongoose.Types.ObjectId[];

  @Prop()
    logoPath: string;

  @Prop()
    imagePath: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Theme.name,
    required: false,
  })
    themeId: mongoose.Types.ObjectId;
}

export const AuthoritySchema = SchemaFactory.createForClass(Authority);
export type AuthorityDocument = HydratedDocument<Authority>;
