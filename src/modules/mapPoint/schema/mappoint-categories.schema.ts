import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema()
export class MapPointCategories {
  @Prop()
    name: string;

  @Prop()
    icon: string;

  @Prop()
    iconAlt: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MapPoint' }],
    ref: 'MapPoint',
    required: true,
  })
    mapPointId: mongoose.Types.ObjectId[];
}

export type MapPointCategoriesDocument = HydratedDocument<MapPointCategories>
export const MapPointCategoriesSchema = SchemaFactory.createForClass(MapPointCategories);
