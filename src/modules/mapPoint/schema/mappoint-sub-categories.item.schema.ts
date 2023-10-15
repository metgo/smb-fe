import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

// eslint-disable-next-line no-use-before-define
export type MapPointSubCategoiresItemDocument = HydratedDocument<MapPoinMapPointSubCategoiresItem>

@Schema()
export class MapPoinMapPointSubCategoiresItem {
    @Prop()
      name: string;

    @Prop()
      mapPontId: [
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MapPoint',
        required: true,
      ];

    @Prop()
      mapPontCategoriesId: [
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MapPointCategories',
        required: true,
      ];

  @Prop()
    mapPontSubCategoriesId: [
      type: mongoose.Schema.Types.ObjectId,
      ref: '  MapPointSubCategoires',
      required: true,
    ];
}
export const MapPoinMapPointSubCategoiresItemSchema = SchemaFactory.createForClass(MapPoinMapPointSubCategoiresItem);
