import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { PaymentStatus, VoucherStatus } from 'src/common/enum';
import { AuditableSchema } from 'src/core/helper/auditable.schema';

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

  @Prop(
    {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' }],
      default: null,
    },
  )
    voucherId: [];

  @Prop(
    {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
      default: null,
    },
  )
    orderId: [];

  @Prop({ enum: PaymentStatus, default: PaymentStatus.FAILURE })
    status: VoucherStatus;

  @Prop({
    default: null,
  })
    methods: string;
}

export type PaymentDocument = HydratedDocument<Payment>
export const PaymentSchema = SchemaFactory.createForClass(Payment);
