import { useState, useEffect, useCallback } from "react";
import { useGetQrScanTrackingQuery } from "@/store/api/eventQueryApi";

const LIMIT = 20;

export function useQrScanListData(
  eventId: string,
  searchTerm: string,
  scanType: "TICKET" | "SESSION",
) {
  const [page, setPage] = useState(1);
  const [combinedLogs, setCombinedLogs] = useState<IQRScanLog[]>([]);

  // Reset pagination whenever query inputs change
  useEffect(() => {
    setPage(1);
    setCombinedLogs([]);
  }, [searchTerm, eventId, scanType]);

  const {
    data: qrScanData,
    isLoading,
    isFetching,
    refetch,
  } = useGetQrScanTrackingQuery(
    {
      eventId,
      scanType,
      page: page.toString(),
      limit: LIMIT.toString(),
      search: searchTerm,
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  // Accumulate pages for infinite scroll
  useEffect(() => {
    if (!qrScanData?.data?.length) {
      setCombinedLogs([]);
      return;
    }
    setCombinedLogs((prev) => {
      if (page === 1) return qrScanData.data;
      const existingIds = new Set(prev.map((log) => log._id));
      const newItems = qrScanData.data.filter(
        (log) => !existingIds.has(log._id),
      );
      return newItems.length ? [...prev, ...newItems] : prev;
    });
  }, [qrScanData, page]);

  const fetchNextPage = useCallback(() => {
    if (!qrScanData?.meta?.hasNextPage || isFetching) return;
    setPage((prev) => prev + 1);
  }, [qrScanData?.meta?.hasNextPage, isFetching]);

  return {
    combinedLogs,
    isLoading,
    isFetching,
    refetch,
    hasMore: !!qrScanData?.meta?.hasNextPage,
    totalData: qrScanData?.totalData as number | undefined,
    fetchNextPage,
  };
}
