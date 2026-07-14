import { useState, useEffect, useCallback, useMemo } from "react";

import { useAppSelector } from "@/hooks/hooks";
import { useGetAllTripsQuery } from "@/store/api/tripsQueryApi";
import type { TripListFilters } from "./useTripListFilters";

const LIMIT = 20;

export function useTripListData(
  filters: TripListFilters,
  searchTerm: string,
) {
  const { dmoId, authorityId } = useAppSelector((state) => state.auth);

  const [page, setPage] = useState(1);
  const [combinedTrips, setCombinedTrips] = useState<ITrip[]>([]);

  useEffect(() => {
    setPage(1);
    setCombinedTrips([]);
  }, [searchTerm, filters, dmoId, authorityId]);

  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page,
      limit: LIMIT,
      dmoId,
      authorityId,
    };
    if (searchTerm) params.search = searchTerm;
    if (filters.status !== "all") params.status = filters.status;
    return params;
  }, [page, searchTerm, filters, dmoId, authorityId]);

  const {
    data: tripData,
    refetch,
    isFetching,
    isLoading,
  } = useGetAllTripsQuery(queryParams, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (!tripData?.data?.length) {
      if (page === 1) setCombinedTrips([]);
      return;
    }
    setCombinedTrips((prev) => {
      if (page === 1) return tripData.data;
      const existingIds = new Set(prev.map((trip) => trip._id));
      const newItems = tripData.data.filter(
        (trip) => !existingIds.has(trip._id),
      );
      return newItems.length ? [...prev, ...newItems] : prev;
    });
  }, [tripData, page]);

  const fetchNextPage = useCallback(() => {
    if (!tripData?.hasNextPage || isFetching) return;
    setPage((prev) => prev + 1);
  }, [tripData?.hasNextPage, isFetching]);

  const refetchFromPage1 = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  return {
    combinedTrips,
    isLoading,
    isFetching,
    hasMore: !!tripData?.hasNextPage,
    fetchNextPage,
    refetchFromPage1,
  };
}
