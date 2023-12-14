import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema({})
export class BussCategory extends AuditableSchema {
  @Prop({ required: true })
    name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Icons' })
    icon: mongoose.Types.ObjectId;

  @Prop()
    hebrewName: string;
}
export type BussCategoryDocument = HydratedDocument<BussCategory>;

export const BussCategorySchema = SchemaFactory.createForClass(BussCategory);
