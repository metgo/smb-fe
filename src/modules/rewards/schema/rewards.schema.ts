import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema({})
export class Rewards extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
    amount: number;

  @Prop()
    percentage: number;

  @Prop()
    voucherLimit: number;

  @Prop()
    totalVoucherCreated: number;

  @Prop()
    action: string;
}

export type RewardsDocument = HydratedDocument<Rewards>;
export const RewardsSchema = SchemaFactory.createForClass(Rewards);
