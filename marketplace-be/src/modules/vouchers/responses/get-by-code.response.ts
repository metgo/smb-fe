import { VoucherPaymentStatus } from 'src/common/enum';
import { ObjectId } from 'typeorm';

export interface GetByCodeResponse {
  _id: ObjectId;
  code: string;
  remainingAmount: number;
  expireDate: Date;
  paymentStatus: VoucherPaymentStatus;
  purchaser?: string;
  assignee?: string;
  createdAt: Date;
}
