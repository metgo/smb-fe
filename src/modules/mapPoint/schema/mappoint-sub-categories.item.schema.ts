import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema()
export class MapPointSubCategoriesItem {
  @Prop()
    name: string;

  @Prop()
    icon: string;

  @Prop()
    iconAlt: string;

  @Prop(
    {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MapPoint' }],
      ref: 'MapPoint',
      required: true,
    },
  )
    mapPointId: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MapPointCategories' }],
    ref: 'MapPointCategories',
    required: true,
  })
    mapPointCategoriesId: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MapPointSubCategories' }],
    ref: 'MapPointSubCategories',
    required: true,
  })
    mapPointSubCategoriesId: mongoose.Types.ObjectId[];
}

export type MapPointSubCategoriesItemDocument = HydratedDocument<MapPointSubCategoriesItem>
export const MapPointSubCategoriesItemSchema = SchemaFactory.createForClass(MapPointSubCategoriesItem);
