import { useState, useEffect, useMemo } from "react";
import { skipToken } from "@reduxjs/toolkit/query";

import { useGetAllbusinessesQuery } from "@/store/api/businessQueryApi";
import { useGetContentManagementProductsQuery } from "@/store/api/productQueryApi";
import { useGetAllTripsQuery } from "@/store/api/tripsQueryApi";
import { useGetContentManagementEventsQuery } from "@/store/api/eventQueryApi";
import { useGetAllPOIQuery } from "@/store/api/poiQueryApi";
import type { TabState } from "./useContentTabs";

const PAGE_LIMIT = 20;

interface UseContentDataParams {
  selected: string;
  tabState: Record<string, TabState>;
  externalApiId: string | null;
  dmoId: string;
  authorityId: string;
  language: string;
}

export function useContentData({
  selected,
  tabState,
  externalApiId,
  dmoId,
  authorityId,
  language,
}: UseContentDataParams) {
  const [page, setPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [poiPage, setPoiPage] = useState(1);
  const [eventPage, setEventPage] = useState(1);
  const [isApiIdChanging, setIsApiIdChanging] = useState(false);

  const [combinedBusinesses, setCombinedBusinesses] = useState<any[]>([]);
  const [combinedProducts, setCombinedProducts] = useState<any[]>([]);
  const [combinedPOIs, setCombinedPOIs] = useState<any[]>([]);
  const [combinedEvents, setCombinedEvents] = useState<any[]>([]);

  const businessTab = tabState["Businesses"];
  const productTab = tabState["Products"];
  const tripTab = tabState["Trips"];
  const eventTab = tabState["Events"];
  const poiTab = tabState["POI"];

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
    if (filters.assignmentStatus && filters.assignmentStatus !== "all")
      params.assignmentStatus = filters.assignmentStatus;
    if (filters.viewCategory && filters.viewCategory !== "all")
      params.viewCategory = filters.viewCategory;
    return params;
  }, [businessTab, dmoId, authorityId, language, page, externalApiId]);

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
    if (filters.assignmentStatus && filters.assignmentStatus !== "all")
      params.assignmentStatus = filters.assignmentStatus;
    if (filters.viewCategory && filters.viewCategory !== "all")
      params.viewCategory = filters.viewCategory;
    return params;
  }, [productTab, dmoId, authorityId, externalApiId, productPage]);

  const tripParams = useMemo(() => {
    const { searchQuery, filters } = tabState["Trips"];
    const params: any = { dmoId, authorityId, limit: PAGE_LIMIT };
    if (filters.isTrip !== "all") params.isTrip = filters.isTrip;
    if (searchQuery) params.search = searchQuery;
    return params;
  }, [tripTab, authorityId, dmoId]);

  const eventParams = useMemo(() => {
    const { searchQuery, filters } = tabState["Events"];
    const params: any = {
      status: "APPROVED",
      limit: PAGE_LIMIT,
      page: eventPage,
    };
    if (searchQuery) params.search = searchQuery;
    if (filters.registrationFilter !== "all")
      params.isRegistration = filters.registrationFilter;
    if (filters.dateRangeFilter.start)
      params.startDate = filters.dateRangeFilter.start;
    if (filters.dateRangeFilter.end)
      params.endDate = filters.dateRangeFilter.end;
    return params;
  }, [eventTab, eventPage]);

  const poiParams = useMemo(() => {
    const { searchQuery } = tabState["POI"];
    const params: any = {
      dmoId,
      authorityId,
      limit: PAGE_LIMIT,
      status: "APPROVED",
      externalApiId,
      page: poiPage,
    };
    if (searchQuery) params.search = searchQuery;
    return params;
  }, [poiTab, dmoId, authorityId, externalApiId, poiPage]);

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
    selected === "Products" && externalApiId ? productParams : skipToken,
  );

  const { data: tripData, isLoading: isLoadingTrip } = useGetAllTripsQuery(
    selected === "Trips" ? tripParams : skipToken,
  );

  const {
    data: eventData,
    isLoading: isLoadingEvent,
    isFetching: isFetchingEvent,
  } = useGetContentManagementEventsQuery(
    selected === "Events" ? eventParams : skipToken,
  );

  const {
    data: poiData,
    isLoading: isLoadingPOI,
    isFetching: isFetchingPOI,
  } = useGetAllPOIQuery(selected === "POI" ? poiParams : skipToken);

  // ── Reset all on website change ─────────────────────────────────────────────

  useEffect(() => {
    if (!externalApiId) return;
    setIsApiIdChanging(true);
    setPage(1);
    setProductPage(1);
    setEventPage(1);
    setPoiPage(1);
    setCombinedBusinesses([]);
    setCombinedProducts([]);
    setCombinedEvents([]);
    setCombinedPOIs([]);
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
  }, [productTab.searchQuery, productTab.filters, dmoId, authorityId]);

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

  // ── Events pagination ───────────────────────────────────────────────────────

  useEffect(() => {
    setEventPage(1);
    setCombinedEvents([]);
  }, [eventTab.searchQuery, eventTab.filters]);

  useEffect(() => {
    if (!eventData?.data) return;
    if (eventPage === 1) {
      setCombinedEvents(eventData.data);
    } else {
      setCombinedEvents((prev) => {
        const existingIds = new Set(prev.map((e: any) => e._id));
        return [
          ...prev,
          ...eventData.data.filter((e: any) => !existingIds.has(e._id)),
        ];
      });
    }
  }, [eventData?.data, eventPage]);

  // ── POI pagination ──────────────────────────────────────────────────────────

  useEffect(() => {
    setPoiPage(1);
    setCombinedPOIs([]);
  }, [poiTab.searchQuery, poiTab.filters, dmoId, authorityId, externalApiId]);

  useEffect(() => {
    if (!poiData?.data) return;
    if (poiPage === 1) {
      setCombinedPOIs(poiData.data);
    } else {
      setCombinedPOIs((prev) => {
        const existingIds = new Set(prev.map((p: any) => p._id));
        return [
          ...prev,
          ...poiData.data.filter((p: any) => !existingIds.has(p._id)),
        ];
      });
    }
  }, [poiData?.data, poiPage]);

  // ── Load-more callbacks ─────────────────────────────────────────────────────

  const fetchNextPage = () => {
    if (!businessData?.meta?.hasNextPage || isFetching) return;
    setPage((prev) => prev + 1);
  };

  const fetchNextProductPage = () => {
    if (!productData?.meta?.hasNextPage || isFetchingProduct) return;
    setProductPage((prev) => prev + 1);
  };

  const fetchNextEventPage = () => {
    if (!eventData?.meta?.hasNextPage || isFetchingEvent) return;
    setEventPage((prev) => prev + 1);
  };

  const fetchNextPoiPage = () => {
    if (!poiData?.meta?.hasNextPage || isFetchingPOI) return;
    setPoiPage((prev) => prev + 1);
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
    Trips: { rawData: tripData, isLoading: isLoadingTrip },
    Events: {
      rawData: combinedEvents,
      isLoading: isLoadingEvent,
      loadMore: fetchNextEventPage,
      hasMore: eventData?.meta?.hasNextPage,
    },
    POI: {
      rawData: combinedPOIs,
      isLoading: isLoadingPOI,
      loadMore: fetchNextPoiPage,
      hasMore: poiData?.meta?.hasNextPage,
    },
  };

  const active = dataMap[selected ?? "Businesses"];

  const getItems = (rawData: any, tab: string | null) => {
    if (!rawData) return [];
    if (
      tab === "Businesses" ||
      tab === "Products" ||
      tab === "POI" ||
      tab === "Events"
    )
      return rawData;
    return rawData?.data ?? [];
  };

  const combinedItems: any[] = getItems(active?.rawData, selected);

  const tabCounts = {
    Businesses: businessData?.totalData ?? 0,
    Products: productData?.totalData ?? 0,
    Trips: tripData?.totalData ?? 0,
    Events: eventData?.totalData ?? 0,
    POI: poiData?.totalData ?? combinedPOIs.length,
  };

  const tabLoadings = {
    Businesses: isLoading || isApiIdChanging,
    Products: isLoadingProduct || isApiIdChanging,
    Trips: isLoadingTrip,
    Events: isLoadingEvent,
    POI: isLoadingPOI,
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
