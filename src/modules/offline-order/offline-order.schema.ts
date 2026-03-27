import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { normalizePhone } from 'src/common/utils/normalise-phone';

import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema()
export class OfflineOrder extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
    companyName: string;

  @Prop({ type: String })
    employerType: string;

  @Prop()
    leadDate: Date;

  @Prop({ type: Number })
    initialRequest: number;

  @Prop({ type: Number })
    closedDealValue: number;

  @Prop()
    dealClosureDate: Date;

  @Prop({ type: String })
    vendor: string;

  @Prop({ type: String })
    product: string;

  @Prop({ type: String })
    paymentMethod: string;

  @Prop({ type: String })
    description: string;

  @Prop()
    name: string;

  @Prop()
    position: string;

  @Prop()
    productPrice: number;

  @Prop()
    desiredQuantity: number;

  @Prop()
    phone: string;

  @Prop()
    email: string;
}

export type OfflineOrderDocument = HydratedDocument<OfflineOrder>;

export const OfflineOrderSchema = SchemaFactory.createForClass(OfflineOrder);

OfflineOrderSchema.pre('save', function (next) {
  if (this?.phone) {
    this.phone = normalizePhone(this.phone);
  }
  next();
});

OfflineOrderSchema.pre('findOneAndUpdate', function (next) {
  const update: any = this.getUpdate();

  if (update?.phone) {
    update.phone = normalizePhone(update.phone);
  }

  next();
});
