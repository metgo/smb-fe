import { useMemo } from "react";

export interface ReconciliationStatusOverview {
  pending: number;
  approved: number;
  disputed: number;
  cancelled: number;
  rejected: number;
  closed: number;
}

export interface OrderProductOverview {
  pending: number;
  processing: number;
  shipped: number;
  completed: number;
  canceled: number;
}

export interface ReconciliationStatsResponse {
  totalRevenue: number;
  totalFee: number;
  netPayoutRaw: number;
  totalRevenuePotential: number;
  totalFeePotential: number;
  netPayoutRawPotential: number;
  totalOrderProductCount: number;
  totalOrders: number;
  statusOverview: Partial<ReconciliationStatusOverview>;
  orderProductOverview: Partial<OrderProductOverview>;
  netPayout: number;
  netPayoutPotential: number;
}

export interface OrderStats {
  // Reconciliation status breakdown
  pending: number;
  approved: number;
  disputed: number;
  cancelled: number;
  rejected: number;
  closed: number;
  statusOverview: ReconciliationStatusOverview;

  // Order-product (fulfilment) breakdown
  orderProductPending: number;
  orderProductProcessing: number;
  orderProductShipped: number;
  orderProductCompleted: number;
  orderProductCanceled: number;
  orderProductOverview: OrderProductOverview;

  // Counts
  totalOrders: number;
  totalOrderProductCount: number;

  // Money — realized
  totalRevenue: number;
  totalFee: number;
  netPayout: number;
  netPayoutRaw: number;

  // Money — potential (if every order gets approved)
  totalRevenuePotential: number;
  totalFeePotential: number;
  netPayoutPotential: number;
  netPayoutRawPotential: number;

  heldForDisputes: number;
}

const EMPTY_STATUS_OVERVIEW: ReconciliationStatusOverview = {
  pending: 0,
  approved: 0,
  disputed: 0,
  cancelled: 0,
  rejected: 0,
  closed: 0,
};

const EMPTY_PRODUCT_OVERVIEW: OrderProductOverview = {
  pending: 0,
  processing: 0,
  shipped: 0,
  completed: 0,
  canceled: 0,
};

const EMPTY_STATS: OrderStats = {
  pending: 0,
  approved: 0,
  disputed: 0,
  cancelled: 0,
  rejected: 0,
  closed: 0,
  statusOverview: EMPTY_STATUS_OVERVIEW,

  orderProductPending: 0,
  orderProductProcessing: 0,
  orderProductShipped: 0,
  orderProductCompleted: 0,
  orderProductCanceled: 0,
  orderProductOverview: EMPTY_PRODUCT_OVERVIEW,

  totalOrders: 0,
  totalOrderProductCount: 0,

  totalRevenue: 0,
  totalFee: 0,
  netPayout: 0,
  netPayoutRaw: 0,

  totalRevenuePotential: 0,
  totalFeePotential: 0,
  netPayoutPotential: 0,
  netPayoutRawPotential: 0,

  heldForDisputes: 0,
};

export function useOrderStats(
  reconciliationStats?: Partial<ReconciliationStatsResponse> | null,
): OrderStats {
  return useMemo(() => {
    if (!reconciliationStats) {
      return EMPTY_STATS;
    }

    const statusOverview: ReconciliationStatusOverview = {
      ...EMPTY_STATUS_OVERVIEW,
      ...reconciliationStats.statusOverview,
    };

    const orderProductOverview: OrderProductOverview = {
      ...EMPTY_PRODUCT_OVERVIEW,
      ...reconciliationStats.orderProductOverview,
    };

    return {
      pending: statusOverview.pending,
      approved: statusOverview.approved,
      disputed: statusOverview.disputed,
      cancelled: statusOverview.cancelled,
      rejected: statusOverview.rejected,
      closed: statusOverview.closed,
      statusOverview,

      orderProductPending: orderProductOverview.pending,
      orderProductProcessing: orderProductOverview.processing,
      orderProductShipped: orderProductOverview.shipped,
      orderProductCompleted: orderProductOverview.completed,
      orderProductCanceled: orderProductOverview.canceled,
      orderProductOverview,

      totalOrders: reconciliationStats.totalOrders || 0,
      totalOrderProductCount: reconciliationStats.totalOrderProductCount || 0,

      totalRevenue: reconciliationStats?.totalRevenue || 0,
      totalFee: reconciliationStats.totalFee || 0,
      netPayout:
        reconciliationStats.netPayout ?? reconciliationStats?.netPayoutRaw ?? 0,
      netPayoutRaw: reconciliationStats.netPayoutRaw || 0,

      totalRevenuePotential: reconciliationStats?.totalRevenuePotential || 0,
      totalFeePotential: reconciliationStats.totalFeePotential || 0,
      netPayoutPotential:
        reconciliationStats?.netPayoutPotential ??
        reconciliationStats?.netPayoutRawPotential ??
        0,
      netPayoutRawPotential: reconciliationStats?.netPayoutRawPotential || 0,

      heldForDisputes: 0,
    };
  }, [reconciliationStats]);
}
