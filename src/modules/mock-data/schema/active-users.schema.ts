import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema()
export class UsersMockData extends AuditableSchema {
  @Prop()
    userCount: number;

  @Prop()
    isExternalApi: boolean;

  @Prop()
    identifierId: string;
}

export type UsersMockDataDocument = HydratedDocument<UsersMockData>;

export const UsersMockDataSchema = SchemaFactory.createForClass(UsersMockData);
