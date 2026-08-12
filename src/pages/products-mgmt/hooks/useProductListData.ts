import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useGetAllProductsQuery,
  useGetProductStatsQuery,
} from "@/store/api/productQueryApi";
import type { ProductFilters } from "./useProductFilters";

const LIMIT = 20;

export function useProductListData(
  filters: ProductFilters,
  searchTerm: string,
  urlBusinessId: string | null,
) {
  const { dmoId, authorityId, websiteId, startDate, endDate } = useAppSelector(
    (state) => state.auth,
  );
  const { language } = useThemeClasses();

  const [page, setPage] = useState(1);
  const [combinedProducts, setCombinedProducts] = useState<any[]>([]);

  useEffect(() => {
    setPage(1);
    setCombinedProducts([]);
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

  const statsQueryParams = useMemo(() => {
    const {
      page: _p,
      limit: _l,
      status: _s,
      locale: _loc,
      ...rest
    } = queryParams;
    return rest;
  }, [queryParams]);

  const { data: productStats, isLoading: isStatsLoading } =
    useGetProductStatsQuery(statsQueryParams, {
      refetchOnMountOrArgChange: true,
    });

  const {
    data: productData,
    refetch,
    isFetching,
    isLoading,
  } = useGetAllProductsQuery(queryParams, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (!productData?.data?.length) {
      setCombinedProducts([]);
      return;
    }
    setCombinedProducts((prev) => {
      if (page === 1) return productData.data;
      const existingIds = new Set(prev.map((p: any) => p._id));
      const newItems = productData.data.filter(
        (p: any) => !existingIds.has(p._id),
      );
      return newItems.length ? [...prev, ...newItems] : prev;
    });
  }, [productData, page]);

  const fetchNextPage = useCallback(() => {
    if (!productData?.meta?.hasNextPage || isFetching) return;
    setPage((prev) => prev + 1);
  }, [productData?.meta?.hasNextPage, isFetching]);

  const refetchFromPage1 = useCallback(() => {
    if (page === 1) {
      refetch();
    } else {
      setPage(1);
    }
  }, [page, refetch]);

  return {
    combinedProducts,
    productStats,
    isLoading,
    isFetching,
    isStatsLoading,
    refetch,
    refetchFromPage1,
    hasMore: !!productData?.meta?.hasNextPage,
    totalData: productData?.totalData as number | undefined,
    fetchNextPage,
  };
}
