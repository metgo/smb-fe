import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppSelector } from "@/hooks/hooks";
import { buildDateScopeParams } from "@/helpers";
import {
  useGetVendorPaymentSummaryQuery,
  type VendorPaymentSummaryRow,
} from "@/store/api/reconciliationQueryApi";

const LIMIT = 12;

export interface VendorPaymentSummaryFilters {
  month: string;
  startDate: string;
  endDate: string;
}

export function useVendorPaymentSummaryData(
  filters: VendorPaymentSummaryFilters,
  searchTerm: string,
  adminView: boolean,
) {
  const { dmoId, authorityId } = useAppSelector((state) => state.auth);

  const [page, setPage] = useState(1);
  const [combinedVendors, setCombinedVendors] = useState<
    VendorPaymentSummaryRow[]
  >([]);

  useEffect(() => {
    setPage(1);
    setCombinedVendors([]);
  }, [searchTerm, filters.month, filters.startDate, filters.endDate, dmoId, authorityId]);

  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page,
      limit: LIMIT,
      dmoId,
      authorityId,
    };

    if (searchTerm) params.search = searchTerm;

    Object.assign(
      params,
      buildDateScopeParams(filters.month, filters.startDate, filters.endDate),
    );

    return params;
  }, [page, filters.month, filters.startDate, filters.endDate, searchTerm, dmoId, authorityId]);

  const { data, isLoading, isFetching, refetch } =
    useGetVendorPaymentSummaryQuery(queryParams, {
      refetchOnMountOrArgChange: true,
      skip: !adminView,
    });

  useEffect(() => {
    if (!data?.data?.length) {
      if (page === 1) setCombinedVendors([]);
      return;
    }
    setCombinedVendors((prev) => {
      if (page === 1) return data.data;
      const existingIds = new Set(prev.map((v) => v.vendor_info._id));
      const newItems = data.data.filter(
        (v) => !existingIds.has(v.vendor_info._id),
      );
      return newItems.length ? [...prev, ...newItems] : prev;
    });
  }, [data, page]);

  const fetchNextPage = useCallback(() => {
    if (!data?.meta?.hasNextPage || isFetching) return;
    setPage((prev) => prev + 1);
  }, [data?.meta?.hasNextPage, isFetching]);

  return {
    vendors: combinedVendors,
    summaryOverview: data?.overview,
    isLoading,
    isFetching,
    refetch,
    hasMore: !!data?.meta?.hasNextPage,
    totalData: data?.totalData,
    fetchNextPage,
  };
}
