import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';

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

  @Prop({ unique: true, type: String, required: true })
    identifierId: string;

  @Prop({ default: null })
    ipAddress: string;
}

export type ExternalApiDocument = HydratedDocument<ExternalApi>;

export const ExternalApiSchema = SchemaFactory.createForClass(ExternalApi);
