import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Authority } from 'src/modules/authority/schema/authority.schema';
import { DMO } from 'src/modules/dmo/schema/dmo.schema';

@Schema()
export class City extends AuditableSchema {
  @Prop({ required: true })
    name: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: DMO.name,
    required: true,
  })
    dmoId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Authority.name,
    required: true,
  })
    authorityId: mongoose.Types.ObjectId;

  @Prop({
    type: {
      lat: [{ type: String, default: null }],
      long: [{ type: String, default: null }],
    },
    default: null,
  })
    geoLocation: {
      lat: [{ type: string, default: null}],
      long: [{ type: string, default: null}],
    };
}

export const CitySchema = SchemaFactory.createForClass(City);
export type CityDocument = HydratedDocument<City>;
