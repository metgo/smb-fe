import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppSelector } from "@/hooks/hooks";
import { buildDateScopeParams } from "@/helpers";
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
  amount?: string;
}

export function useVendorMonthlyReportData(
  filters: VendorMonthlyReportFilters,
  searchTerm: string,
  adminView: boolean,
) {
  const { dmoId, authorityId } = useAppSelector((state) => state.auth);

  const [page, setPage] = useState(1);
  const [showVenderWiseOrderTable, setShowVendorWiseOrderTable] =
    useState(false);
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
    if (filters.amount) params.amount = filters.amount;

    Object.assign(
      params,
      buildDateScopeParams(filters.month, filters.startDate, filters.endDate),
    );

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
    skip: !filters.businessId && adminView,
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
    scopeParams: {
      dmoId: queryParams.dmoId,
      authorityId: queryParams.authorityId,
      vendorId: queryParams.vendorId,
      startDate: queryParams.startDate,
      endDate: queryParams.endDate,
    },
    showVenderWiseOrderTable,
    setShowVendorWiseOrderTable,
  };
}
