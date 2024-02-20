import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { VoucherPaymentStatus, VoucherStatus } from 'src/common/enum';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Campaign } from 'src/modules/campaign/schema/campaign.schema';

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

  @Prop({
    default: null,
    required: false,
  })
    createdByEmail: string;

  @Prop({
    type: Number,
    min: [1, 'Amount must be at least 1.'],
    max: [5000, 'Amount must be at most 5000.'],
  })
    amount: number;

  @Prop()
    code: string;

  @Prop()
    remainingAmount: number;

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

  @Prop({ default: null })
    identifierId: string;

  @Prop(
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: Campaign.name,
    },
  )
    campId: mongoose.Types.ObjectId;

  @Prop({ default: null, type: Date })
    expireDate: Date;
}

export type VoucherDocument = HydratedDocument<Voucher>
export const VoucherSchema = SchemaFactory.createForClass(Voucher);
