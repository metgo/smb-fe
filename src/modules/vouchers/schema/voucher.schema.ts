import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { VoucherPaymentStatus, VoucherStatus } from 'src/common/enum';
import { twoYearExpireDate } from 'src/common/expireDate';
import { AuditableSchema } from 'src/core/helper/auditable.schema';

@Schema()
export class Voucher extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop()
    name: string;

  @Prop()
    amount: number;

  @Prop()
    code: string;

  @Prop()
    remainingAmount: string;

  @Prop({
    default: VoucherPaymentStatus.UNPAID,
  })
    paymentStatus: VoucherPaymentStatus;

  @Prop({ enum: VoucherStatus, default: VoucherStatus.UNASSIGNED })
    status: VoucherStatus;

  @Prop()
    waitingUserEmail: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  })
    assignedTo: mongoose.Types.ObjectId;

  @Prop(
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  )
    campId: mongoose.Types.ObjectId;

  @Prop({ default: twoYearExpireDate(new Date()) })
    expireDate: Date;
}

export type VoucherDocument = HydratedDocument<Voucher>
export const VoucherSchema = SchemaFactory.createForClass(Voucher);
