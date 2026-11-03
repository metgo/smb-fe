import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { AuditableSchema } from 'src/core/helper/auditable.schema';
import { User } from 'src/modules/users/schema/users.schema';
import { Business } from 'src/modules/business/shared/schema/business.schema';
import { PunchPass } from 'src/modules/punch-passes/schema/punch-pass.schema';
import { OrderProduct } from 'src/modules/order-product/schema/order-product.schema';
import { PunchCardStatus } from '../punch-cards.type';

@Schema()
export class PunchCard extends AuditableSchema {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    required: true,
    auto: true,
  })
    _id: mongoose.Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
    cardNumber: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: PunchPass.name,
    required: true,
    index: true,
  })
    punchPassId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: OrderProduct.name,
    required: true,
    index: true,
  })
    orderProductId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Business.name,
    required: true,
    index: true,
  })
    businessId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: false,
  })
    userId: mongoose.Types.ObjectId;

  @Prop({ default: null })
    email: string;

  @Prop({ default: null })
    phone: string;

  // Card-level totals - sum of each item's own quantity (not a count of
  // catalogue rows). Feeds the wallet pass header ("6 / 11 נותרו").
  @Prop({ type: Number, required: true })
    totalItems: number;

  @Prop({ type: Number, default: 0 })
    usedItems: number;

  @Prop({ type: Number, required: true })
    remainingItems: number;

  // One entry per PunchPass catalogue row, snapshotted at purchase time
  // (same reasoning as the rest of the card - a vendor editing the catalogue
  // afterward shouldn't retroactively change an already-issued card).
  // quantity/usedCount let a single catalogue row (e.g. "Yoga Class" x6) be
  // redeemed multiple times independently, tracked down to its own count -
  // this is what the wallet's per-item "3 / 6 נותרו" rows come from.
  // name/nameHe/nameAr are kept as separate fields (not pre-resolved to one
  // label) so the redemptions API can flatten by ?locale= at read time, the
  // same way PunchPass itself does - the Google Wallet pass display is
  // always Hebrew regardless, resolved at wallet-sync time instead.
  @Prop({
    type: [{
      name: { type: String, default: null },
      nameHe: { type: String, default: null },
      nameAr: { type: String, default: null },
      type: { type: String, default: null },
      quantity: { type: Number, default: 1 },
      usedCount: { type: Number, default: 0 },
    }],
    default: [],
  })
    items: {
      name: string; nameHe: string; nameAr: string;
      type: string; quantity: number; usedCount: number;
    }[];

  @Prop({ required: true, unique: true, index: true })
    redemptionToken: string;

  @Prop({ required: true })
    validUntil: Date;

  @Prop({ enum: PunchCardStatus, default: PunchCardStatus.ACTIVE })
    status: PunchCardStatus;

  @Prop({ default: null })
    walletAppleSerialNumber: string;

  @Prop({ default: null })
    walletGoogleObjectId: string;

  // "Add to Google Wallet" link for the purchaser - Google can't push a
  // pass into a wallet server-side, the user has to open this once.
  @Prop({ default: null })
    walletGoogleSaveUrl: string;
}

export type PunchCards = HydratedDocument<PunchCard>;

export const PunchCardSchema = SchemaFactory.createForClass(PunchCard);

PunchCardSchema.index({ businessId: 1, status: 1 });
PunchCardSchema.index({ userId: 1 });
PunchCardSchema.index({ orderProductId: 1 });
