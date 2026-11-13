// The voucher pool backing Lion Coins (one voucher of voucherValue per promotion voucher).
// Kept out of the service so the voucher module can use it without a circular import.
export const LION_COIN_POOL_ASSIGNEE = { name: 'Lion Coin', email: 'support@metgo.app' };

export const isLionCoinVoucher = (voucher: any): boolean => voucher?.assigneeInfo?.name === LION_COIN_POOL_ASSIGNEE.name
  && voucher?.assigneeInfo?.email === LION_COIN_POOL_ASSIGNEE.email;

/**
 * Lion Coin fields on a business object in listings: the coins-left counter (AVAILABLE only -
 * reserved ones are not counted) and the all-redeemed flag.
 */
export const applyLionCoinStatus = (
  business: any,
  status?: { status: string; vouchersAvailable: number; vouchersTotal: number },
) => {
  if (!business) return business;
  /* eslint-disable no-param-reassign */
  business.isAlreadyRedeemed = status?.status === 'REDEEMED';
  business.lionCoinVouchersLeft = status?.vouchersAvailable ?? null;
  business.lionCoinVouchersTotal = status?.vouchersTotal ?? null;
  /* eslint-enable no-param-reassign */
  return business;
};
