import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useGetPunchPassesQuery,
  useGetPunchPassStatsQuery,
} from "@/store/api/punchPassApi";
import type { PunchPassFilters } from "./usePunchPassFilters";

const LIMIT = 20;

export function usePunchPassListData(
  filters: PunchPassFilters,
  searchTerm: string,
  urlBusinessId: string | null,
) {
  const { dmoId, authorityId, websiteId, startDate, endDate } = useAppSelector(
    (state) => state.auth,
  );
  const { language } = useThemeClasses();

  const [page, setPage] = useState(1);
  const [combinedPunchPasses, setCombinedPunchPasses] = useState<IPunchPass[]>(
    [],
  );

  useEffect(() => {
    setPage(1);
    setCombinedPunchPasses([]);
  }, [
    searchTerm,
    filters,
    language,
    urlBusinessId,
    dmoId,
    websiteId,
    authorityId,
    startDate,
    endDate,
  ]);

  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page,
      limit: LIMIT,
      locale: language,
      dmoId,
      authorityId,
      websiteId,
      startDate,
      endDate,
    };
    if (searchTerm) params.search = searchTerm;
    if (filters.status !== "all") params.status = filters.status;
    const effectiveBusinessId = urlBusinessId || filters.businessId || "";
    if (effectiveBusinessId) params.businessId = effectiveBusinessId;
    return params;
  }, [
    page,
    searchTerm,
    filters,
    language,
    urlBusinessId,
    dmoId,
    authorityId,
    websiteId,
    startDate,
    endDate,
  ]);

  const {
    data: punchPassData,
    refetch,
    isFetching,
    isLoading,
  } = useGetPunchPassesQuery(queryParams, { refetchOnMountOrArgChange: true });

  const { data: punchPassStatsData } = useGetPunchPassStatsQuery();

  useEffect(() => {
    if (!punchPassData?.data?.length) {
      setCombinedPunchPasses([]);
      return;
    }
    setCombinedPunchPasses((prev) => {
      if (page === 1) return punchPassData.data;
      const existingIds = new Set(prev.map((p) => p._id));
      const newItems = punchPassData.data.filter(
        (p) => !existingIds.has(p._id),
      );
      return newItems.length ? [...prev, ...newItems] : prev;
    });
  }, [punchPassData, page]);

  const fetchNextPage = useCallback(() => {
    if (!punchPassData?.meta?.hasNextPage || isFetching) return;
    setPage((prev) => prev + 1);
  }, [punchPassData?.meta?.hasNextPage, isFetching]);

  const refetchFromPage1 = useCallback(() => {
    if (page === 1) {
      refetch();
    } else {
      setPage(1);
    }
  }, [page, refetch]);

  return {
    combinedPunchPasses,
    isLoading,
    isFetching,
    refetch,
    refetchFromPage1,
    hasMore: !!punchPassData?.meta?.hasNextPage,
    totalData: punchPassData?.totalData as number | undefined,
    fetchNextPage,
    punchPassStatsData,
  };
}
