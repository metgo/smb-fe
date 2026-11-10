import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { PromotionOrderStatus } from 'src/common/enum';
import { AuditableSchema } from 'src/core/helper/auditable.schema';

// Generic promotion redemption record (Lion Coin is first consumer). Shared across promotion types
// via redeemCode. Lion Coin v2: one doc per promotion voucher - (businessId, redeemCode, voucherNumber) is unique,
// so each promotion voucher is reserved, redeemed and released independently and atomically.
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

  // 1..vouchersPerBusiness. Null only on v1.1 records that were never migrated.
  @Prop({ type: Number, default: null })
    voucherNumber: number;

  // Stored per promotion voucher so redeemed/reserved promotion vouchers keep their value if the setting changes.
  @Prop({ type: Number, required: true, default: 500 })
    value: number;

  // voucher_step_amount when the promotion voucher was last reserved
  // (one promotion voucher per full step of the business subtotal).
  @Prop({ type: Number, required: true, default: 2000 })
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

  // reservedAt + reservation_minutes; restarted whenever the promotion voucher count is adjusted or payment starts.
  @Prop({ type: Date, default: null })
    reservedUntil: Date;

  // Set while the buyer is on the processor's page. The expiry job skips these promotion vouchers - only the
  // processor's failure/timeout callback releases them (with a long backstop for lost callbacks).
  @Prop({ type: Boolean, default: false })
    paymentInProgress: boolean;

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

  // Snapshot of the business subtotal (before discount, incl. VAT) the promotion voucher was redeemed against.
  // Promotion vouchers sharing redeemedOrderId + businessId together form the order x business record.
  @Prop({ type: Number, default: null })
    businessSubtotal: number;

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

// One doc per promotion voucher. Legacy v1.1 docs without voucherNumber index as null - at most one per business,
// which the old (businessId, redeemCode) unique index already guaranteed.
PromotionOrderSchema.index({ businessId: 1, redeemCode: 1, voucherNumber: 1 }, { unique: true });
PromotionOrderSchema.index({ businessId: 1, status: 1 });
PromotionOrderSchema.index({ status: 1, reservedUntil: 1 });
PromotionOrderSchema.index({ reservedCartId: 1 }, { sparse: true });
PromotionOrderSchema.index({ reservedBy: 1 }, { sparse: true });
PromotionOrderSchema.index({ redeemedOrderId: 1 }, { sparse: true });
// A voucher backs at most one promotion voucher - stops two concurrent reservations picking the same voucher.
PromotionOrderSchema.index(
  { voucherId: 1 },
  { unique: true, partialFilterExpression: { voucherId: { $type: 'objectId' } } },
);
PromotionOrderSchema.index({ voucherCode: 1 }, { sparse: true });
