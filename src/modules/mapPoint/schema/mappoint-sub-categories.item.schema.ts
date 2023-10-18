import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema({ collection: 'MapPoint' })
export class MapPointSubCategoriesItem {
  @Prop()
    name: string;

  @Prop()
    icon: string;

  @Prop()
    iconAlt: string;

  @Prop(
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MapPoint',
      required: true,
    },
  )
    mapPointId: mongoose.Types.ObjectId[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MapPointCategories',
    required: true,
  })
    mapPointCategoriesId: mongoose.Types.ObjectId[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MapPointSubCategories',
    required: true,
  })
    mapPointSubCategoriesId: mongoose.Types.ObjectId[];
}

export type MapPointSubCategoriesItemDocument = HydratedDocument<MapPointSubCategoriesItem>
export const MapPointSubCategoriesItemSchema = SchemaFactory.createForClass(MapPointSubCategoriesItem);
