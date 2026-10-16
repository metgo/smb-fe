/* eslint-disable no-shadow */
import { PromotionOrderStatus } from 'src/common/enum';

export interface PromotionStatusResponse {
  businessId: string;
  status: PromotionOrderStatus | 'NOT_PARTICIPATING';
  value: number;
  minThreshold: number;
  voucherId?: string;
  voucherCode?: string;
  campaignId?: string;
}

export interface PromotionApplyResult {
  businessId: string;
  _id: string;
  status: PromotionOrderStatus;
  sessionId: string;
  vouchers: {
    _id: string;
    code: string;
    remainingAmount: number;
    expireDate: Date;
    paymentStatus: string;
  } | null;
}
