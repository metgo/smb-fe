import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema()
export class MPSubCategoriesItems extends AuditableSchema {
  @Prop()
    name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Icons' })
    icon: mongoose.Types.ObjectId;

  @Prop({ type: Boolean, default: false })
    hasMultiple: boolean;

  @Prop(
    {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MapPoint' }],
      ref: 'MapPoint',
      required: true,
    },
  )
    mapPointId: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MPCategories' }],
    ref: 'MPCategories',
    required: true,
  })
    mapPointCategoriesId: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MPSubCategories' }],
    ref: 'MPSubCategories',
    required: true,
  })
    mapPointSubCategoriesId: mongoose.Types.ObjectId[];
}

export type MPSubCategoriesItemsDocument = HydratedDocument<MPSubCategoriesItems>
export const MPSubCategoriesItemsSchema = SchemaFactory.createForClass(MPSubCategoriesItems);
