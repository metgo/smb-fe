import { Voucher } from 'src/modules/vouchers/schema/voucher.schema';

export const sortByPriorityAndHighest = (priorityNumber: number, voucher: Voucher[]) => voucher.sort((a, b) => {
  if (
    (priorityNumber === a.remainingAmount && priorityNumber !== b.remainingAmount)
        || (priorityNumber !== a.remainingAmount && priorityNumber === b.remainingAmount)
  ) {
    return priorityNumber === a.remainingAmount ? -1 : 1;
  }
  return b.remainingAmount - a.remainingAmount;
});
