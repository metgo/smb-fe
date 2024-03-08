import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { PaymentStatus } from 'src/common/enum';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Order } from 'src/modules/orders/schema/orders.schema';
import { Voucher } from 'src/modules/vouchers/schema/voucher.schema';

@Schema()
export class Payment extends AuditableSchema {
  @Prop()
    purpose: string;

  @Prop()
    amount: number;

  @Prop()
    currency: string;

  @Prop({
    default: null,
  })
    customerName: string;

  @Prop({
    default: null,
  })
    identificationNumber: string;

  @Prop({
    default: null,
  })
    customerEmail: string;

  @Prop({
    default: null,
  })
    method: string;

  @Prop({
    default: null,
  })
    paymentRequestId: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Voucher.name }],
    default: null,
  })
    voucherId: [];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Order.name,
    default: null,
  })
    orderId: string;

  @Prop({ enum: PaymentStatus, default: PaymentStatus.PENDING })
    status: PaymentStatus;

  @Prop({
    default: null,
  })
    methods: string;
}

export type PaymentDocument = HydratedDocument<Payment>;
export const PaymentSchema = SchemaFactory.createForClass(Payment);
