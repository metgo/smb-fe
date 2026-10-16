import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { PromotionOrderStatus } from 'src/common/enum';
import { AuditableSchema } from 'src/core/helper/auditable.schema';

// Generic promotion redemption record (Lion Coin is first consumer). Shared across promotion types
// via redeemCode. One doc per (businessId, redeemCode) - business can do multiple promotions, not same one twice.
@Schema()
export class PromotionOrder extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
  })
    businessId: mongoose.Types.ObjectId;

  // Discriminates which promotion scheme this record belongs to. 'LION_COIN' is the
  // only value today; a future promotion gets its own code, not its own collection.
  @Prop({ type: String, required: true, default: 'LION_COIN' })
    redeemCode: string;

  @Prop({ type: Number, required: true, default: 2500 })
    value: number;

  @Prop({ type: Number, required: true, default: 9500 })
    minThreshold: number;

  @Prop({
    type: String,
    enum: PromotionOrderStatus,
    default: PromotionOrderStatus.AVAILABLE,
  })
    status: PromotionOrderStatus;

  // Set once a Cart actually exists (checkout submit), for traceability only
  // - NOT what guards a reservation. See reservedBy.
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Cart', default: null })
    reservedCartId: mongoose.Types.ObjectId;

  // Reservation identity key. Buyer's client session id when clicking "Enable Discount"
  // (before Cart/Order exists). Swapped for logged-in user id at checkout. Plain string
  // (not User ref) to hold anonymous session tokens.
  @Prop({ type: String, default: null })
    reservedBy: string;

  @Prop({ type: Date, default: null })
    reservedAt: Date;

  // Links to the actual Voucher document used for this Lion Coin redemption.
  // Required for voucher-based payment approach (Barak's Oct 15 decision).
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Voucher', default: null })
    voucherId: mongoose.Types.ObjectId;

  // Voucher code for audit trail and reconciliation (e.g., GALILABFA90252B08).
  @Prop({ type: String, default: null })
    voucherCode: string;

  // Links to the Campaign (GALIL) that created this pool of vouchers.
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null })
    campaignId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null })
    redeemedOrderId: mongoose.Types.ObjectId;

  @Prop({ type: Date, default: null })
    redeemedAt: Date;

  // Cardcom paymentRequestId for the charge. Lives on PARENT order's Payment (combined charge),
  // not per-vendor split Order. Set here so admin/reporting doesn't hop Order -> parentOrderId -> Payment.
  @Prop({ type: String, default: null })
    paymentId: string;

  // No settings UI yet (flagged in backend plan doc §6 item 4). Defaults off until admin toggle exists.
  @Prop({ type: Boolean, default: false })
    notifyBusinessOnRedemption: boolean;

  // resetBy/resetAt NOT declared here - MetGo-BE's future admin reset feature (not started)
  // will own those on its own Mongoose model over this collection. Nothing here reads/writes them,
  // and this repo never does full-document .save() that could strip them.
}

export type PromotionOrderDocument = HydratedDocument<PromotionOrder>;
export const PromotionOrderSchema = SchemaFactory.createForClass(PromotionOrder);

// Compound index: one record per (businessId, redeemCode). Business can do multiple promotions,
// never same one twice. Prevents duplicate Lion Coin bugs, enforced by MongoDB.
PromotionOrderSchema.index({ businessId: 1, redeemCode: 1 }, { unique: true });
PromotionOrderSchema.index({ status: 1 });
PromotionOrderSchema.index({ reservedCartId: 1 }, { sparse: true });
PromotionOrderSchema.index({ reservedBy: 1 }, { sparse: true });
PromotionOrderSchema.index({ voucherId: 1 }, { sparse: true });
PromotionOrderSchema.index({ voucherCode: 1 }, { sparse: true });
