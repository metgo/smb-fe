import { useMemo } from "react";

export function useOrderStats(reconciliationStats: any) {
  return useMemo(() => {
    if (!reconciliationStats) {
      return {
        pending: 0,
        approved: 0,
        disputed: 0,
        cancelled: 0,
        totalOrders: 0,
        totalRevenue: 0,
        netPayout: 0,
        heldForDisputes: 0,
        orderProductPending: 0,
        orderProductProcessing: 0,
        orderProductShipped: 0,
      };
    }

    const disputed = reconciliationStats.statusOverview?.disputed || 0;

    return {
      pending: reconciliationStats.statusOverview?.pending || 0,
      approved: reconciliationStats.statusOverview?.approved || 0,
      disputed,
      cancelled: reconciliationStats.statusOverview?.cancelled || 0,
      totalOrders: reconciliationStats.totalOrders || 0,
      totalRevenue: reconciliationStats.totalRevenue || 0,
      netPayout: reconciliationStats.netPayout || 0,
      heldForDisputes: 0,
      orderProductPending:
        reconciliationStats.orderProductOverview?.pending || 0,
      orderProductProcessing:
        reconciliationStats.orderProductOverview?.processing || 0,
      orderProductShipped:
        reconciliationStats.orderProductOverview?.shipped || 0,
    };
  }, [reconciliationStats]);
}
