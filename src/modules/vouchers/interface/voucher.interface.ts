import mongoose from 'mongoose';
import { VoucherStatus } from 'src/common/enum';

export interface UpdateFieldInterface {
  assignedTo: mongoose.Types.ObjectId | null,
  waitingUserEmail: string | null,
  status: VoucherStatus,
  updatedBy: string,
  updatedAt: Date
}
