"use client";

import { useEffect, useRef, useState } from "react";
import { useLoadMore } from "@/hooks/useLoadMore";
import useGeneralStore from "@/stores/generalStore";
import { getAllTrails } from "@/actions/trailActions";

import NoBusinessLayout from "@/components/layouts/NoFeedItemLayout";
import OnlyFeedCardsLayout from "@/components/layouts/OnlyFeedCardsLayout";
import MapFeedIntegratedLayout from "@/components/layouts/MapFeedIntegratedLayout";

const FilterTrailsLayout = () => {
  const hasFetchedRef = useRef(false);
  const { activeFilterTab } = useGeneralStore();
  const [trails, setTrails] = useState<TrailsFeedProps>();

  useEffect(() => {
    async function fetchTrails() {
      const res = await getAllTrails(1, "/trails");
      setTrails(res);
    }

    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchTrails();
  }, []);

  const { sentryRef, loading, initialLoadDone, canLoadMore } = useLoadMore(
    trails?.meta?.hasNextPage,
  );
  const totalBusiness = trails?.totalData;

  if (!totalBusiness) return <NoBusinessLayout />;

  const renderLayout = () => {
    switch (activeFilterTab) {
      case "gallery":
        return <OnlyFeedCardsLayout data={trails?.data} />;
      case "integrated":
        return <MapFeedIntegratedLayout data={trails?.data} />;
      default:
        return <NoBusinessLayout />;
    }
  };

  return (
    <div>
      <div className="bg-primary">
        {renderLayout()}
        {initialLoadDone && canLoadMore && trails?.meta?.hasNextPage && (
          <div ref={sentryRef} className="h-4">
            {loading && <span>Loading...</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterTrailsLayout;
