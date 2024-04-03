import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema()
export class MockData extends AuditableSchema {
  @Prop()
    userCount: number;

  @Prop()
    isExternalApi: boolean;

  @Prop()
    identifierId: string;
}

export type MockDataDocument = HydratedDocument<MockData>;

export const MockDataSchema = SchemaFactory.createForClass(MockData);
