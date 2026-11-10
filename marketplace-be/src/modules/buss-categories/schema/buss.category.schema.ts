import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Icons } from 'src/modules/icons/schema/icon.schema';

@Schema({})
export class BussCategory extends AuditableSchema {
  @Prop({ required: true })
    name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Icons.name })
    icon: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Icons.name })
    iconBnW: mongoose.Types.ObjectId;

  @Prop()
    hebrewName: string;

  @Prop({ default: true })
    isVisible: boolean;
}
export type BussCategoryDocument = HydratedDocument<BussCategory>;

export const BussCategorySchema = SchemaFactory.createForClass(BussCategory);
