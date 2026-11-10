/* eslint-disable no-shadow */
import { PromotionOrderStatus } from 'src/common/enum';

// Per-redeemCode settings. A future promotion adds its own entry instead of its own schema.
export interface PromotionConfig {
  voucherValue: number;
  voucherStepAmount: number;
  vouchersPerBusiness: number;
  reservationMinutes: number;
}

export interface PromotionStatusResponse {
  businessId: string;
  // REDEEMED only once every promotion voucher is redeemed, RESERVED when the rest are held by buyers.
  status: PromotionOrderStatus;
  value: number;
  minThreshold: number;
  vouchersTotal: number;
  vouchersAvailable: number;
  vouchersReserved: number;
  vouchersRedeemed: number;
}

// Spec v2 §4.2 - computed in one place for cart, checkout, payment and webhook.
export interface PromotionVoucherState {
  businessId: string;
  businessSubtotal: number;
  voucherValue: number;
  voucherStepAmount: number;
  vouchersTotal: number;
  // floor(subtotal / step), capped at vouchersTotal
  eligibleByAmount: number;
  // Vouchers anyone could still take (AVAILABLE), excluding this buyer's own holds.
  available: number;
  // Vouchers this buyer currently holds for the business.
  applied: number;
  appliedAmount: number;
  vouchersReserved: number;
  vouchersRedeemed: number;
  // ₪ still needed to unlock the next promotion voucher, or null when none is reachable.
  nextVoucherGap: number | null;
  // True when the buyer qualifies for more promotion vouchers than the business has left.
  limitedByStock: boolean;
  reservedUntil: Date | null;
}

export interface VoucherDetails {
  _id: string;
  code: string;
  remainingAmount: number;
  expireDate: Date;
  paymentStatus: string;
}

export interface PromotionApplyResult {
  businessId: string;
  sessionId: string;
  promoVouchers: { _id: string; voucherNumber: number; value: number }[];
  vouchers: VoucherDetails[];
  state: PromotionVoucherState;
  // Number of promotion vouchers held before this call - lets the UI announce "updated to N".
  previousCount: number;
}
