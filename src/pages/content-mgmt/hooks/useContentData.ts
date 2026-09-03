import { useState, useEffect, useMemo } from "react";
import { skipToken } from "@reduxjs/toolkit/query";

import { useGetAllbusinessesQuery } from "@/store/api/businessQueryApi";
import { useGetContentManagementProductsQuery } from "@/store/api/productQueryApi";
import type { TabState } from "./useContentTabs";

const PAGE_LIMIT = 20;

interface UseContentDataParams {
  selected: string;
  tabState: Record<string, TabState>;
  externalApiId: string | null;
  dmoId: string;
  authorityId: string;
  language: string;
  isMarketplace?: boolean; // Added for TRAVELLER vs MARKETPLACE handling
  viewId?: string | null;
}

export function useContentData({
  selected,
  tabState,
  externalApiId,
  dmoId,
  authorityId,
  language,
  isMarketplace = false,
  viewId = null,
}: UseContentDataParams) {
  const [page, setPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [isApiIdChanging, setIsApiIdChanging] = useState(false);

  const [combinedBusinesses, setCombinedBusinesses] = useState<any[]>([]);
  const [combinedProducts, setCombinedProducts] = useState<any[]>([]);

  const businessTab = tabState["Businesses"];
  const productTab = tabState["Products"];

  // ── Query params ────────────────────────────────────────────────────────────

  const businessParams = useMemo(() => {
    const { searchQuery, filters } = tabState["Businesses"];
    const params: any = {
      dmoId,
      authorityId,
      locale: language,
      status: "APPROVED",
      page,
      externalApiId,
      limit: PAGE_LIMIT,
    };
    if (searchQuery) params.search = searchQuery;
    if (filters.hasProductFilter !== "all")
      params.hasProductFilter = filters.hasProductFilter === "yes";
    if (filters.primaryCategory !== "all")
      params.primaryCategoryId = filters.primaryCategory;
    const hasAssignmentFilter =
      (filters.assignmentStatus && filters.assignmentStatus !== "all") ||
      (filters.viewCategory && filters.viewCategory !== "all");
    if (filters.assignmentStatus && filters.assignmentStatus !== "all")
      params.assignmentStatus = filters.assignmentStatus;
    if (filters.viewCategory && filters.viewCategory !== "all")
      params.viewCategory = filters.viewCategory;
    if (hasAssignmentFilter && viewId) params.viewId = viewId;
    return params;
  }, [businessTab, dmoId, authorityId, language, page, externalApiId, viewId]);

  const productParams = useMemo(() => {
    const { searchQuery, filters } = tabState["Products"];
    const params: any = {
      status: "APPROVED",
      dmoId,
      authorityId,
      externalApiId,
      limit: PAGE_LIMIT,
      page: productPage,
    };
    if (filters.businessId) params.businessId = filters.businessId;
    if (searchQuery) params.search = searchQuery;
    const hasAssignmentFilter =
      (filters.assignmentStatus && filters.assignmentStatus !== "all") ||
      (filters.viewCategory && filters.viewCategory !== "all");
    if (filters.assignmentStatus && filters.assignmentStatus !== "all")
      params.assignmentStatus = filters.assignmentStatus;
    if (filters.viewCategory && filters.viewCategory !== "all")
      params.viewCategory = filters.viewCategory;
    if (hasAssignmentFilter && viewId) params.viewId = viewId;
    return params;
  }, [productTab, dmoId, authorityId, externalApiId, productPage, viewId]);

  // ── Queries ─────────────────────────────────────────────────────────────────

  const {
    data: businessData,
    isLoading,
    isFetching,
  } = useGetAllbusinessesQuery(externalApiId ? businessParams : skipToken);

  const {
    data: productData,
    isLoading: isLoadingProduct,
    isFetching: isFetchingProduct,
  } = useGetContentManagementProductsQuery(
    // Products only available for MARKETPLACE purpose
    selected === "Products" && externalApiId && isMarketplace
      ? productParams
      : skipToken,
  );

  // ── Reset all on website change ─────────────────────────────────────────────

  useEffect(() => {
    if (!externalApiId) return;
    setIsApiIdChanging(true);
    setPage(1);
    setProductPage(1);
    setCombinedBusinesses([]);
    setCombinedProducts([]);
  }, [externalApiId]);

  // ── Businesses pagination ───────────────────────────────────────────────────

  useEffect(() => {
    setPage(1);
    setCombinedBusinesses([]);
  }, [
    businessTab.searchQuery,
    businessTab.filters,
    dmoId,
    authorityId,
    externalApiId,
    viewId,
  ]);

  useEffect(() => {
    if (!businessData?.data) return;
    if (page === 1) {
      setIsApiIdChanging(false);
      setCombinedBusinesses(businessData.data);
    } else {
      setCombinedBusinesses((prev) => {
        const existingIds = new Set(prev.map((b) => b._id));
        return [
          ...prev,
          ...businessData.data.filter((b: any) => !existingIds.has(b._id)),
        ];
      });
    }
  }, [businessData?.data, page]);

  // ── Products pagination ─────────────────────────────────────────────────────

  useEffect(() => {
    setProductPage(1);
    setCombinedProducts([]);
  }, [productTab.searchQuery, productTab.filters, dmoId, authorityId, viewId]);

  useEffect(() => {
    if (!productData?.data) return;
    if (productPage === 1) {
      setCombinedProducts(productData.data);
    } else {
      setCombinedProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p._id));
        return [
          ...prev,
          ...productData.data.filter((p: any) => !existingIds.has(p._id)),
        ];
      });
    }
  }, [productData?.data, productPage]);

  // ── Load-more callbacks ─────────────────────────────────────────────────────

  const fetchNextPage = () => {
    if (!businessData?.meta?.hasNextPage || isFetching) return;
    setPage((prev) => prev + 1);
  };

  const fetchNextProductPage = () => {
    if (!productData?.meta?.hasNextPage || isFetchingProduct) return;
    setProductPage((prev) => prev + 1);
  };

  // ── Data map (aggregates everything per tab) ────────────────────────────────

  const dataMap: Record<
    string,
    {
      rawData: any;
      isLoading: boolean;
      loadMore?: () => void;
      hasMore?: boolean;
    }
  > = {
    Businesses: {
      rawData: combinedBusinesses,
      isLoading,
      loadMore: fetchNextPage,
      hasMore: businessData?.meta?.hasNextPage,
    },
    Products: {
      rawData: combinedProducts,
      isLoading: isLoadingProduct,
      loadMore: fetchNextProductPage,
      hasMore: productData?.meta?.hasNextPage,
    },
  };

  const active = dataMap[selected ?? "Businesses"];

  const getItems = (rawData: any, tab: string | null) => {
    if (!rawData) return [];
    if (tab === "Businesses" || tab === "Products") return rawData;
    return rawData?.data ?? [];
  };

  const combinedItems: any[] = getItems(active?.rawData, selected);

  const tabCounts = {
    Businesses: businessData?.totalData ?? 0,
    Products: productData?.totalData ?? 0,
  };

  const tabLoadings = {
    Businesses: isLoading || isApiIdChanging,
    Products: isLoadingProduct || isApiIdChanging,
  };

  const totalData =
    selected === "Products"
      ? productData?.totalData
      : active?.rawData?.totalData;

  return {
    // Exposed for template init effects in useContentTemplate
    combinedBusinesses,
    combinedProducts,

    // Tab-aggregated data for Contents component
    combinedItems,
    tabCounts,
    tabLoadings,
    totalData,

    activeIsLoading: active?.isLoading,
    activeLoadMore: active?.loadMore,
    activeHasMore: active?.hasMore,

    // Loading indicator
    isApiIdChanging,
  };
}
