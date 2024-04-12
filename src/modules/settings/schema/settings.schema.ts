import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema()
export class Setting extends AuditableSchema {
  @Prop()
    title: string;

  @Prop()
    description: string;

  @Prop()
    slug: string;
}

export type Settings = HydratedDocument<Setting>;

export const SettingSchema = SchemaFactory.createForClass(Setting);
