import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

// eslint-disable-next-line no-use-before-define
export type MapPointCategoiresDocument = HydratedDocument<MapPointCategories>

@Schema()
export class MapPointCategories {
    @Prop()
      name: string;

    @Prop()
      mapPointId: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MapPoint',
            required: true,
          }
        ];
}
export const MapPointCategoriesSchema = SchemaFactory.createForClass(MapPointCategories);
