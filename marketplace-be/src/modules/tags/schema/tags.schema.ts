import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { BussSubCategory } from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';

@Schema()
export class Tags {
  @Prop({ default: null })
    name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Icons', default: null })
    icon: mongoose.Types.ObjectId;

  @Prop({ default: null })
    nameHe: string;

  @Prop({ default: null })
    nameAr: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: BussSubCategory.name,
    default: null,
  })
    subcategoryId: mongoose.Types.ObjectId;

  @Prop()
    createdAt: Date;
}

export const TagsSchema = SchemaFactory.createForClass(Tags);
export type TagsDocument = HydratedDocument<Tags>;
