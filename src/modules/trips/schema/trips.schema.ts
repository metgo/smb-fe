import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Authority } from 'src/modules/authority/schema/authority.schema';
import { User } from 'src/modules/users/schema/users.schema';
import { DMO } from 'src/modules/dmo/schema/dmo.schema';
import { Business } from 'src/modules/business/shared/schema/business.schema';
import { TripTypes } from '../trips.types';

@Schema({ _id: false })
class Station {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: Business.name,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
    order: number;

  @Prop({ enum: TripTypes, default: TripTypes.BUSINESS, required: true })
    type: TripTypes;
}
const StationSchema = SchemaFactory.createForClass(Station);

@Schema()
export class Trip extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
    name: string;

  @Prop()
    description: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: false,
  })
    userId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Authority.name,
    required: false,
    default: null,
  })
    authorityId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: DMO.name,
    required: false,
    default: null,
  })
    dmoId: mongoose.Types.ObjectId;

  @Prop()
    slug: string;

  @Prop({ type: [StationSchema], default: [] })
    stations: Station[];

  @Prop()
    estimatedDuration?: number;

  @Prop()
    totalDistanceCovered?: number;
}

export type TripDocument = HydratedDocument<Trip>;
export const TripSchema = SchemaFactory.createForClass(Trip);
TripSchema.index({ name: 'text', description: 'text' });
