import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Business } from 'src/modules/business/shared/schema/business.schema';
import { Product } from 'src/modules/products/schema/products.schema';

@Schema()
export class StatisticsMockData extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Business.name,
    required: false,
  })
    businessId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Product.name,
    required: false,
  })
    productId: mongoose.Types.ObjectId;

  @Prop()
    impression: number;

  @Prop()
    engagement: number;
}

export type StatisticsMockDataDocument = HydratedDocument<StatisticsMockData>;

export const StatisticsMockDataSchema
  = SchemaFactory.createForClass(StatisticsMockData);
