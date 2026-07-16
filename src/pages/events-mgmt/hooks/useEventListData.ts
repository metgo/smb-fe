import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppSelector } from "@/hooks/hooks";
import { useGetAllEventsQuery } from "@/store/api/eventQueryApi";

const LIMIT = 20;

interface EventFilters {
  eventTypeFilter: "all" | "free" | "paid";
  registrationFilter: "all" | "true" | "false";
  statusFilter: any | "all";
  dateRangeFilter: { start: string; end: string };
}

export function useEventListData(filters: EventFilters, searchQuery: string) {
  const { dmoId, authorityId, websiteId } = useAppSelector(
    (state) => state.auth,
  );

  const { eventTypeFilter, registrationFilter, statusFilter, dateRangeFilter } =
    filters;

  const [page, setPage] = useState(1);
  const [combinedEvents, setCombinedEvents] = useState<IEventListRes[]>([]);

  useEffect(() => {
    setPage(1);
    setCombinedEvents([]);
  }, [
    searchQuery,
    eventTypeFilter,
    registrationFilter,
    statusFilter,
    dateRangeFilter.start,
    dateRangeFilter.end,
    dmoId,
    authorityId,
    websiteId,
  ]);

  const eventQueryParams = useMemo(() => {
    const params: any = {
      dmoId,
      authorityId,
      externalApiId: websiteId,
      page,
      limit: LIMIT,
    };

    const finalSearchTerm =
      localStorage.getItem("eventsSearchTerm") ?? searchQuery;
    if (finalSearchTerm) params.search = finalSearchTerm;

    if (eventTypeFilter === "free") params.isFree = true;
    if (eventTypeFilter === "paid") params.isFree = false;

    if (registrationFilter !== "all") {
      params.isRegistration = Boolean(registrationFilter);
    }

    if (statusFilter !== "all") params.status = statusFilter;

    if (dateRangeFilter.start) params.startDate = dateRangeFilter.start;
    if (dateRangeFilter.end) params.endDate = dateRangeFilter.end;

    return params;
  }, [
    dmoId,
    authorityId,
    websiteId,
    page,
    searchQuery,
    eventTypeFilter,
    registrationFilter,
    statusFilter,
    dateRangeFilter.start,
    dateRangeFilter.end,
  ]);

  const {
    data: eventData,
    refetch,
    isFetching,
    isLoading,
  } = useGetAllEventsQuery(eventQueryParams);

  useEffect(() => {
    if (!eventData?.data?.length) {
      if (page === 1) setCombinedEvents([]);
      return;
    }
    setCombinedEvents((prev) => {
      if (page === 1) return eventData.data;
      const existingIds = new Set(prev.map((e) => e._id));
      const newItems = eventData.data.filter(
        (e: IEventListRes) => !existingIds.has(e._id),
      );
      return newItems.length ? [...prev, ...newItems] : prev;
    });
  }, [eventData, page]);

  const fetchNextPage = useCallback(() => {
    if (!eventData?.meta?.hasNextPage || isFetching) return;
    setPage((prev) => prev + 1);
  }, [eventData?.meta?.hasNextPage, isFetching]);

  const refetchFromPage1 = useCallback(() => {
    if (page === 1) {
      refetch();
    } else {
      setPage(1);
    }
  }, [page, refetch]);

  return {
    combinedEvents,
    isLoading,
    isFetching,
    refetch,
    refetchFromPage1,
    hasMore: !!eventData?.meta?.hasNextPage,
    totalData: eventData?.totalData as number | undefined,
    eventQueryParams,
    fetchNextPage,
  };
}
