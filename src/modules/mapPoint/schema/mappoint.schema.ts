import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema()
export class MapPoint extends AuditableSchema {
    @Prop({ unique: true, required: true })
      name: string;

  @Prop()
    icon: string;

  @Prop()
    iconAlt: string;

  @Prop({ type: Boolean, default: false })
    hasMultiple: boolean;
}

export type MapPointDocument = HydratedDocument<MapPoint>

export const MapPointSchema = SchemaFactory.createForClass(MapPoint);
