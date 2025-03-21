import { VoucherPaymentStatus } from 'src/common/enum';
import { ObjectId } from 'typeorm';

export interface GetByCodeInterface {
  _id: ObjectId;
  code: string;
  remainingAmount: number;
  expireDate: Date;
  paymentStatus: VoucherPaymentStatus;
}
