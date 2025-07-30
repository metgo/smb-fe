"use client";

import { useLoadMore } from "@/hooks/useLoadMore";
import useGeneralStore from "@/stores/generalStore";

import NoBusinessLayout from "@/components/layouts/NoBusinessLayout";
import OnlyFeedCardsLayout from "@/components/layouts/OnlyFeedCardsLayout";
import MapFeedIntegratedLayout from "@/components/layouts/MapFeedIntegratedLayout";

const FilterTrailsLayout = ({ data, meta, totalData }: TrailsFeedProps) => {
  const { activeFilterTab } = useGeneralStore();

  const { sentryRef, loading, initialLoadDone, canLoadMore } = useLoadMore(
    meta?.hasNextPage,
  );
  const totalBusiness = totalData;

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
    <div>
      <div className="bg-primary">
        {renderLayout()}
        {initialLoadDone && canLoadMore && meta?.hasNextPage && (
          <div ref={sentryRef} className="h-4">
            {loading && <span>Loading...</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterTrailsLayout;
