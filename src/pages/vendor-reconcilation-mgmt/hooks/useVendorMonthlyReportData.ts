import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppSelector } from "@/hooks/hooks";
import {
  useGetOrderProductsQuery,
  useGetReconciliationStatsQuery,
} from "@/store/api/reconciliationQueryApi";

const LIMIT = 20;

export interface VendorMonthlyReportFilters {
  status: string;
  reconciliationStatus: string;
  startDate: string;
  endDate: string;
  month: string;
  businessId: string;
}

export function useVendorMonthlyReportData(
  filters: VendorMonthlyReportFilters,
  searchTerm: string,
) {
  const { dmoId, authorityId } = useAppSelector((state) => state.auth);

  const [page, setPage] = useState(1);
  const [combinedOrders, setCombinedOrders] = useState<any[]>([]);

  // Reset pagination whenever query inputs change
  useEffect(() => {
    setPage(1);
    setCombinedOrders([]);
  }, [searchTerm, filters, dmoId, authorityId]);

  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page,
      limit: LIMIT,
      dmoId,
      authorityId,
    };

    if (filters.businessId) params.vendorId = filters.businessId;
    if (filters.status !== "all") params.status = filters.status;
    if (filters.reconciliationStatus !== "all") {
      params.reconciliationStatus = filters.reconciliationStatus;
    }
    if (searchTerm) params.search = searchTerm;

    if (filters.month !== "all" && filters.month !== "custom") {
      const [month, year] = filters.month.split("-");

      // format from the Date's own local year/month/day, not
      // toISOString() - that converts to UTC first, which silently shifts
      // the date back a day for any timezone ahead of UTC (midnight local
      // time is still "yesterday evening" in UTC)
      const formatLocalDate = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      };

      const firstDay = new Date(Number(year), Number(month) - 1, 1);
      const lastDay = new Date(Number(year), Number(month), 0);

      params.startDate = formatLocalDate(firstDay);
      params.endDate = formatLocalDate(lastDay);
    }

    // Custom date range
    if (filters.month === "custom") {
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
    }
    return params;
  }, [page, filters, searchTerm, dmoId, authorityId]);

  const statsQueryParams = useMemo(() => {
    const { page: _p, limit: _l, ...rest } = queryParams;
    return rest;
  }, [queryParams]);

  const {
    data: orderProductsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetOrderProductsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const {
    data: reconciliationStats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useGetReconciliationStatsQuery(statsQueryParams, {
    refetchOnMountOrArgChange: true,
  });

  // Accumulate pages for infinite scroll
  useEffect(() => {
    if (!orderProductsData?.data?.length) {
      setCombinedOrders([]);
      return;
    }
    setCombinedOrders((prev) => {
      if (page === 1) return orderProductsData.data;
      const existingIds = new Set(prev.map((o: any) => o._id));
      const newItems = orderProductsData.data.filter(
        (o: any) => !existingIds.has(o._id),
      );
      return newItems.length ? [...prev, ...newItems] : prev;
    });
  }, [orderProductsData, page]);

  const fetchNextPage = useCallback(() => {
    if (!orderProductsData?.meta?.hasNextPage || isFetching) return;
    setPage((prev) => prev + 1);
  }, [orderProductsData?.meta?.hasNextPage, isFetching]);

  return {
    combinedOrders,
    reconciliationStats,
    isLoading,
    isFetching,
    isStatsLoading,
    refetch,
    refetchStats,
    hasMore: !!orderProductsData?.meta?.hasNextPage,
    totalData: orderProductsData?.totalData as number | undefined,
    fetchNextPage,
  };
}
