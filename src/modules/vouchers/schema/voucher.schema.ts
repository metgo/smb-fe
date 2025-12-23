import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { VoucherPaymentStatus, VoucherStatus } from 'src/common/enum';
import { normalizePhone } from 'src/common/utils/normalise-phone';
import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { Campaign } from 'src/modules/campaign/schema/campaign.schema';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
import { User } from 'src/modules/users/schema/users.schema';

class PromotionalEmailDetails {
  promoName: string;
  date: string;
}
@Schema()
export class Voucher extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

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

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ExternalApi.name,
    required: false,
  })
    externalApiId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: Campaign.name,
  })
    campId: mongoose.Types.ObjectId;

  @Prop({ default: null, type: Date })
    expireDate: Date;

  @Prop({
    type: Number,
  })
    reminderCount: number;

  @Prop({ required: false })
    promoDetails: PromotionalEmailDetails[];

  @Prop({
    type: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: User.name },
      name: String,
      countryCode: String,
      phone: String,
      email: String,
      createdAt: Date,
    },
    _id: false,
  })
    creatorInfo: {
    id: mongoose.Types.ObjectId;
    name: string;
    countryCode: string;
    phone: string;
    email: string;
    createdAt: Date;
  };

  @Prop({
    type: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: User.name },
      name: String,
      countryCode: String,
      phone: String,
      email: String,
      assignedAt: Date,
    },
    _id: false,
  })
    assigneeInfo: {
    id: mongoose.Types.ObjectId;
    name: string;
    countryCode: string;
    phone: string;
    email: string;
    assignedAt: Date;
  };

  @Prop({
    type: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: User.name },
      name: String,
      countryCode: String,
      phone: String,
      email: String,
    },
    _id: false,
  })
    purchaserInfo: {
    id: mongoose.Types.ObjectId;
    name: string;
    countryCode: string;
    phone: string;
    email: string;
  };

  @Prop()
    message: string;
}

export type VoucherDocument = HydratedDocument<Voucher>;
export const VoucherSchema = SchemaFactory.createForClass(Voucher);

VoucherSchema.pre('save', function (next) {
  if (this?.creatorInfo?.phone) {
    this.creatorInfo.phone = normalizePhone(this.creatorInfo.phone);
  }

  if (this?.assigneeInfo?.phone) {
    this.assigneeInfo.phone = normalizePhone(this.assigneeInfo.phone);
  }

  if (this?.purchaserInfo?.phone) {
    this.purchaserInfo.phone = normalizePhone(this.purchaserInfo.phone);
  }

  next();
});

VoucherSchema.pre('findOneAndUpdate', function (next) {
  const update: any = this.getUpdate();
  if (!update) return next();

  const $set = update.$set ?? update;

  if ($set.creatorInfo?.phone) {
    $set.creatorInfo.phone = normalizePhone($set.creatorInfo.phone);
  }

  if ($set.assigneeInfo?.phone) {
    $set.assigneeInfo.phone = normalizePhone($set.assigneeInfo.phone);
  }

  if ($set.purchaserInfo?.phone) {
    $set.purchaserInfo.phone = normalizePhone($set.purchaserInfo.phone);
  }

  next();
});
