export interface CreateRewardCommand {
  createdBy: string;
  amount: number;
  voucherLimit?: number;
}
