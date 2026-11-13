import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useGetAllbusinessesQuery,
  useGetBusinessStatsQuery,
} from "@/store/api/businessQueryApi";
import type { BusinessFilters } from "./useBusinessFilters";

const LIMIT = 20;

export function useBusinessListData(
  filters: BusinessFilters,
  searchTerm: string,
) {
  const { dmoId, authorityId, startDate, endDate, websiteId } = useAppSelector(
    (state) => state.auth,
  );
  const { language } = useThemeClasses();

  const [page, setPage] = useState(1);
  const [combinedBusinesses, setCombinedBusinesses] = useState<any[]>([]);

  // Reset pagination whenever query inputs change
  useEffect(() => {
    setPage(1);
    setCombinedBusinesses([]);
  }, [searchTerm, filters, dmoId, authorityId, startDate, endDate]);

  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page,
      dmoId: filters.dmoFilter === "unassigned" ? "null" : dmoId,
      authorityId:
        filters.authorityFilter === "unassigned" ? "null" : authorityId,
      limit: LIMIT,
      locale: language,
      externalApiId: websiteId,
    };
    if (searchTerm) params.search = searchTerm;
    if (filters.status !== "all") params.status = filters.status;
    if (filters.hasProductFilter !== "all") {
      params.hasProductFilter = filters.hasProductFilter === "yes";
    }
    return params;
  }, [page, searchTerm, filters, language, dmoId, authorityId, websiteId]);

  const statsQueryParams = useMemo(() => {
    const { page: _p, limit: _l, locale: _loc, ...rest } = queryParams;
    return rest;
  }, [queryParams]);

  const { data: businessStatsData, isLoading: isStatsLoading } =
    useGetBusinessStatsQuery(statsQueryParams, {
      refetchOnMountOrArgChange: true,
    });

  const {
    data: businessData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllbusinessesQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  // Accumulate pages for infinite scroll
  useEffect(() => {
    if (!businessData?.data?.length) {
      setCombinedBusinesses([]);
      return;
    }
    setCombinedBusinesses((prev) => {
      if (page === 1) return businessData.data;
      const existingIds = new Set(prev.map((b: any) => b._id));
      const newItems = businessData.data.filter(
        (b: any) => !existingIds.has(b._id),
      );
      return newItems.length ? [...prev, ...newItems] : prev;
    });
  }, [businessData, page]);

  const fetchNextPage = useCallback(() => {
    if (!businessData?.meta?.hasNextPage || isFetching) return;
    setPage((prev) => prev + 1);
  }, [businessData?.meta?.hasNextPage, isFetching]);

  return {
    combinedBusinesses,
    businessStatsData,
    isLoading,
    isFetching,
    isStatsLoading,
    refetch,
    hasMore: !!businessData?.meta?.hasNextPage,
    totalData: businessData?.totalData as number | undefined,
    fetchNextPage,
  };
}
