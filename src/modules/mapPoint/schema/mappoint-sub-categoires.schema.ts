import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

// eslint-disable-next-line no-use-before-define
export type MapPointCategoiresDocument = HydratedDocument<MapPointSubCategories>

@Schema()
export class MapPointSubCategories {
    @Prop()
      name: string;

    @Prop()
      mapPontId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MapPoint',
        required: true,
      };

    @Prop()
      mapPontCategoriesId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MapPointCategories',
        required: true,
      };
}
export const MapPointSubCategoriesSchema = SchemaFactory.createForClass(MapPointSubCategories);
