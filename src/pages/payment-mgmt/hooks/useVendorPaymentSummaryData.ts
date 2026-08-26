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
  }, [
    searchTerm,
    filters.month,
    filters.startDate,
    filters.endDate,
    dmoId,
    authorityId,
  ]);

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
  }, [
    page,
    filters.month,
    filters.startDate,
    filters.endDate,
    searchTerm,
    dmoId,
    authorityId,
  ]);

  const { data, isLoading, isFetching, refetch, fulfilledTimeStamp } =
    useGetVendorPaymentSummaryQuery(queryParams, {
      refetchOnMountOrArgChange: true,
      skip: !adminView,
    });

  // RTK Query keeps serving `data` from the previous arg set for a render or
  // two after queryParams changes (e.g. while switching filters), and acting
  // on that stale data - merging it in, or reading its hasNextPage - skipped
  // or duplicated pages. Only trust `data` once it's confirmed to belong to
  // the page we most recently asked for.
  const isDataCurrent = !isFetching && data?.meta?.page === page;

  useEffect(() => {
    if (!isDataCurrent) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDataCurrent, fulfilledTimeStamp, page]);

  const fetchNextPage = useCallback(() => {
    if (!isDataCurrent || !data?.meta?.hasNextPage || isFetching) return;
    setPage((prev) => prev + 1);
  }, [isDataCurrent, data?.meta?.hasNextPage, isFetching]);

  return {
    vendors: combinedVendors,
    summaryOverview: data?.overview,
    isLoading,
    isFetching,
    refetch,
    hasMore: isDataCurrent && !!data?.meta?.hasNextPage,
    totalData: data?.totalData,
    fetchNextPage,
  };
}
