import mongoose from 'mongoose';

import { PromotionOrderStatus } from 'src/common/enum';
import { PromotionOrdersService } from './promotion-orders.service';

const businessA = new mongoose.Types.ObjectId().toString();
const businessB = new mongoose.Types.ObjectId().toString();
const holderId = 'session-1';

const promoVoucher = (
  businessId: string,
  voucherNumber: number,
  status: PromotionOrderStatus,
  reservedBy: string | null = null,
) => ({
  _id: new mongoose.Types.ObjectId(),
  businessId: new mongoose.Types.ObjectId(businessId),
  voucherNumber,
  status,
  value: 500,
  reservedBy,
  reservedUntil: reservedBy ? new Date(Date.now() + 15 * 60 * 1000) : null,
});

const build = (docs: any[] = [], freePoolVouchers = 100) => {
  const PromotionOrderModel = {
    find: jest.fn(() => ({ select: () => ({ lean: async () => docs }) })),
    distinct: jest.fn(async () => []),
  };
  const VoucherModel = {
    countDocuments: jest.fn(async () => freePoolVouchers),
  };
  const service = new PromotionOrdersService(
    { info: jest.fn(), warn: jest.fn(), error: jest.fn() } as any,
    PromotionOrderModel as any,
    VoucherModel as any,
    {} as any,
    {} as any,
    { emitStatusChange: jest.fn() } as any,
    {} as any,
  );
  return { service, PromotionOrderModel };
};

describe('PromotionOrdersService - Lion Coin v2 eligibility', () => {
  // Spec v2 §2 worked examples (5 vouchers left before)
  it.each([
    [1999, 0],
    [2000, 1],
    [4200, 2],
    [9999, 4],
    [10000, 5],
    [14000, 5],
    [0, 0],
    [-50, 0],
  ])('subtotal %p unlocks %p vouchers', (subtotal, expected) => {
    const { service } = build();
    expect(service.getEligibleVoucherCount(subtotal)).toBe(expected);
  });

  it('amounts from different businesses are never combined (₪1,900 + ₪1,900)', async () => {
    const { service } = build();
    const states = await service.getVoucherStates([
      { businessId: businessA, businessSubtotal: 1900 },
      { businessId: businessB, businessSubtotal: 1900 },
    ]);

    expect(states.map(state => state.eligibleByAmount)).toEqual([0, 0]);
    expect(states.map(state => state.nextVoucherGap)).toEqual([100, 100]);
  });

  it('a business without voucher docs yet has all 5 available', async () => {
    const { service } = build();
    const [state] = await service.getVoucherStates([{ businessId: businessA, businessSubtotal: 4500 }]);

    expect(state).toMatchObject({
      vouchersTotal: 5,
      available: 5,
      applied: 0,
      eligibleByAmount: 2,
      limitedByStock: false,
      nextVoucherGap: 1500,
    });
  });

  it('limited by stock: qualifies for 4, only 2 left (another buyer used 3)', async () => {
    const { service } = build([
      promoVoucher(businessA, 1, PromotionOrderStatus.REDEEMED),
      promoVoucher(businessA, 2, PromotionOrderStatus.REDEEMED),
      promoVoucher(businessA, 3, PromotionOrderStatus.REDEEMED),
      promoVoucher(businessA, 4, PromotionOrderStatus.AVAILABLE),
      promoVoucher(businessA, 5, PromotionOrderStatus.AVAILABLE),
    ]);
    const [state] = await service.getVoucherStates([{ businessId: businessA, businessSubtotal: 8000 }], holderId);

    expect(state).toMatchObject({
      eligibleByAmount: 4,
      available: 2,
      applied: 0,
      limitedByStock: true,
      nextVoucherGap: null,
    });
  });

  it('counts the buyer’s own holds as applied, others’ holds as unavailable', async () => {
    const { service } = build([
      promoVoucher(businessA, 1, PromotionOrderStatus.RESERVED, holderId),
      promoVoucher(businessA, 2, PromotionOrderStatus.RESERVED, holderId),
      promoVoucher(businessA, 3, PromotionOrderStatus.RESERVED, 'someone-else'),
      promoVoucher(businessA, 4, PromotionOrderStatus.AVAILABLE),
      promoVoucher(businessA, 5, PromotionOrderStatus.AVAILABLE),
    ]);
    const [state] = await service.getVoucherStates([{ businessId: businessA, businessSubtotal: 4500 }], holderId);

    expect(state).toMatchObject({
      applied: 2,
      appliedAmount: 1000,
      available: 2,
      vouchersReserved: 3,
      eligibleByAmount: 2,
      // ₪1,500 more reaches a 3rd voucher, and one is still free
      nextVoucherGap: 1500,
    });
    expect(state.reservedUntil).toBeInstanceOf(Date);
  });

  it('status is REDEEMED only once every voucher is redeemed', async () => {
    const allRedeemed = [1, 2, 3, 4, 5].map(n => promoVoucher(businessA, n, PromotionOrderStatus.REDEEMED));
    const someLeft = [
      ...[1, 2, 3].map(n => promoVoucher(businessB, n, PromotionOrderStatus.REDEEMED)),
      promoVoucher(businessB, 4, PromotionOrderStatus.RESERVED, 'x'),
      promoVoucher(businessB, 5, PromotionOrderStatus.RESERVED, 'y'),
    ];
    const { service } = build([...allRedeemed, ...someLeft]);
    const [a, b] = await service.getStatusForBusinesses([businessA, businessB]);

    expect(a).toMatchObject({ status: PromotionOrderStatus.REDEEMED, vouchersAvailable: 0, vouchersRedeemed: 5 });
    expect(b).toMatchObject({ status: PromotionOrderStatus.RESERVED, vouchersAvailable: 0, vouchersReserved: 2 });
  });

  it('an empty ₪500 voucher pool shows nothing to take instead of a dead apply button', async () => {
    const { service } = build([], 0);
    const [state] = await service.getVoucherStates([{ businessId: businessA, businessSubtotal: 2100 }], holderId);
    const [status] = await service.getStatusForBusinesses([businessA]);

    expect(state).toMatchObject({
      eligibleByAmount: 1, available: 0, applied: 0, limitedByStock: true,
    });
    expect(status).toMatchObject({ status: PromotionOrderStatus.RESERVED, vouchersAvailable: 0 });
  });

  it('the pool caps availability across businesses', async () => {
    const { service } = build([], 2);
    const [state] = await service.getVoucherStates([{ businessId: businessA, businessSubtotal: 10000 }], holderId);

    expect(state).toMatchObject({ eligibleByAmount: 5, available: 2, limitedByStock: true });
  });
});
