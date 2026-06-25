import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useGetAllPOIQuery,
  useGetPoiStatsQuery,
} from "@/store/api/poiQueryApi";
import type { PoiFilters } from "./usePoiFilters";

const LIMIT = 20;

export function usePoiListData(filters: PoiFilters, searchTerm: string) {
  const { dmoId, authorityId, websiteId } = useAppSelector(
    (state) => state.auth,
  );
  const { language } = useThemeClasses();

  const [page, setPage] = useState(1);
  const [combinedPois, setCombinedPois] = useState<any[]>([]);

  useEffect(() => {
    setPage(1);
    setCombinedPois([]);
  }, [searchTerm, filters, language, dmoId, authorityId, websiteId]);

  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page,
      dmoId,
      authorityId,
      limit: LIMIT,
      locale: language,
      externalApiId: websiteId,
    };
    if (searchTerm) params.search = searchTerm;
    if (filters.status !== "all") params.status = filters.status;
    return params;
  }, [page, searchTerm, filters, language, dmoId, authorityId, websiteId]);

  const { data: poiStatsData, isLoading: isStatsLoading } = useGetPoiStatsQuery(
    {},
  );

  const {
    data: poiData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllPOIQuery(queryParams);

  useEffect(() => {
    if (!poiData?.data?.length) {
      setCombinedPois([]);
      return;
    }
    setCombinedPois((prev) => {
      if (page === 1) return poiData.data;
      const existingIds = new Set(prev.map((p: any) => p._id));
      const newItems = poiData.data.filter((p: any) => !existingIds.has(p._id));
      return newItems.length ? [...prev, ...newItems] : prev;
    });
  }, [poiData, page]);

  const fetchNextPage = useCallback(() => {
    if (!poiData?.meta?.hasNextPage || isFetching) return;
    setPage((prev) => prev + 1);
  }, [poiData?.meta?.hasNextPage, isFetching]);

  const refetchFromPage1 = useCallback(() => {
    if (page === 1) {
      refetch();
    } else {
      setPage(1);
    }
  }, [page, refetch]);

  return {
    combinedPois,
    poiStatsData,
    isLoading,
    isFetching,
    isStatsLoading,
    refetch,
    refetchFromPage1,
    hasMore: !!poiData?.meta?.hasNextPage,
    totalData: poiData?.totalData as number | undefined,
    fetchNextPage,
  };
}
