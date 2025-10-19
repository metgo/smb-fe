"use client";

import { useEffect } from "react";

import { useIsHydrated } from "@/hooks";
import { useLoadMore } from "@/hooks/useLoadMore";
import useGeneralStore from "@/stores/generalStore";
import NoBusinessLayout from "@/components/layouts/NoFeedItemLayout";
import OnlyFeedCardsLayout from "@/components/layouts/OnlyFeedCardsLayout";
import MapFeedIntegratedLayout from "@/components/layouts/MapFeedIntegratedLayout";

const FilterTrailsLayout = ({ meta, totalData, data }: TrailsFeedProps) => {
  const { activeFilterTab, setAppliedFilterItemCount } = useGeneralStore();
  const isHydrate = useIsHydrated();

  const { sentryRef, loading, initialLoadDone, canLoadMore } = useLoadMore(
    meta?.hasNextPage,
  );
  const totalBusiness = totalData;

  useEffect(() => {
    if (data?.length > 0) setAppliedFilterItemCount(data?.length);
  }, [data]);

  if (!isHydrate) return null;
  if (!totalBusiness) return <NoBusinessLayout />;

  const renderLayout = () => {
    switch (activeFilterTab) {
      case "gallery":
        return <OnlyFeedCardsLayout data={data} />;
      case "integrated":
        return <MapFeedIntegratedLayout data={data} />;
      default:
        return <NoBusinessLayout />;
    }
  };

  return (
    <div className="bg-primary max-sm:hidden md:block">
      {renderLayout()}
      {initialLoadDone && canLoadMore && meta?.hasNextPage && (
        <div ref={sentryRef} className="h-4">
          {loading && <span>Loading...</span>}
        </div>
      )}
    </div>
  );
};

export default FilterTrailsLayout;
