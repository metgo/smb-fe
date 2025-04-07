import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Theme } from 'src/modules/themes/schema/theme.schema';
import { User } from 'src/modules/users/schema/users.schema';

@Schema()
export class DMO extends AuditableSchema {
  @Prop({
    type: mongoose.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
    name: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }],
    ref: User.name,
  })
    adminIds: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    ref: 'Users',
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

export type DMODocument = HydratedDocument<DMO>;
export const DMOSchema = SchemaFactory.createForClass(DMO);
