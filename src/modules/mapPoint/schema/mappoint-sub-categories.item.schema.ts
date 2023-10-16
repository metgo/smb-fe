import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema({ collection: 'MapPoint' })
export class MapPointSubCategoiresItem {
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
    ref: 'MapPointCategoires',
    required: true,
  })
    mapPointCategoriesId: mongoose.Types.ObjectId[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MapPointSubCategoires',
    required: true,
  })
    mapPointSubCategoriesId: mongoose.Types.ObjectId[];
}

export type MapPointSubCategoiresItemDocument = HydratedDocument<MapPointSubCategoiresItem>
export const MapPointSubCategoiresItemSchema = SchemaFactory.createForClass(MapPointSubCategoiresItem);
