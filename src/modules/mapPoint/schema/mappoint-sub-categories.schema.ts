import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema()
export class MapPointSubCategories {
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
}

export type MapPointCategoriesDocument = HydratedDocument<MapPointSubCategories>
export const MapPointSubCategoriesSchema = SchemaFactory.createForClass(MapPointSubCategories);
