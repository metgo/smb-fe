import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema()
export class BussSubCategory extends AuditableSchema {
  @Prop()
    name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Icons', default: null })
    icon: mongoose.Types.ObjectId;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BussCategory' }],
    ref: 'BussCategory',
    required: true,
  })
    bussCategoryId: mongoose.Types.ObjectId[];

  @Prop()
    hebrewName: string;
}

export type BussSubCategoryDocument = HydratedDocument<BussSubCategory>;
export const BussSubCategorySchema
  = SchemaFactory.createForClass(BussSubCategory);
