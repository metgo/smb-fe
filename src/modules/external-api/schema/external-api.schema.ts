import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Theme } from 'src/modules/themes/schema/theme.schema';

@Schema()
export class ExternalApi extends AuditableSchema {
  @Prop({
    unique: true,
    required: true,
    type: {
      name: String,
      email: String,
      phone: String,
      address: String,
    },
  })
    companyDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };

  @Prop({ default: null })
    name: string;

  @Prop({ unique: true, type: String, required: true })
    identifierId: string;

  @Prop({ default: null })
    ipAddress: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'dmos',
    required: false,
  })
    dmoId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'authorities',
    required: false,
  })
    authorityId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Theme.name,
    required: false,
  })
    themeId: mongoose.Types.ObjectId;
}

export type ExternalApiDocument = HydratedDocument<ExternalApi>;

export const ExternalApiSchema = SchemaFactory.createForClass(ExternalApi);
