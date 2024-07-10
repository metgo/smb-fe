import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AuditableSchema } from 'src/core/helper/auditable.schema';

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

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: false })
    userId: mongoose.Types.ObjectId;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    ref: 'Users',
  })
    collaboratorsUser: mongoose.Types.ObjectId[];

  @Prop()
    logoPath: string;

  @Prop()
    imagePath: string;
}

export type DMODocument = HydratedDocument<DMO>;
export const DMOSchema = SchemaFactory.createForClass(DMO);
