"use client";

import { usePathname } from "next/navigation";

import { useLoadMore } from "@/hooks/useLoadMore";
import NoFeedItemLayout from "./NoFeedItemLayout";
import useGeneralStore from "@/stores/generalStore";

import OnlyFeedCardsLayout from "./OnlyFeedCardsLayout";
import MapFeedIntegratedLayout from "./MapFeedIntegratedLayout";
import StickyYellowRibbonImage from "../StickyYellowRibbonImage";
import BusinessPinMap from "../maps/BusinessPinMap";
import { useIsHydrated } from "@/hooks";

interface Props {
  businesses: BusinessesProps;
}

const FilterBusinessLayout = ({ businesses }: Props) => {
  const pathname = usePathname();

  const isHydrated = useIsHydrated();
  const { activeFilterTab } = useGeneralStore();

  const { sentryRef, loading, initialLoadDone, canLoadMore } = useLoadMore(
    businesses?.meta?.hasNextPage,
  );
  const totalBusiness = businesses?.totalData;

  if (!isHydrated) return null;
  if (!totalBusiness) return <NoFeedItemLayout />;

  const renderLayout = () => {
    if (pathname === "/events")
      return <OnlyFeedCardsLayout data={businesses.data} />;

    switch (activeFilterTab) {
      case "gallery":
        return <OnlyFeedCardsLayout data={businesses.data} />;
      case "integrated":
        return <MapFeedIntegratedLayout data={businesses.data} />;
      case "map":
        return <BusinessPinMap />;
      default:
        return <NoFeedItemLayout />;
    }
  };

  return (
    <div>
      <div className="bg-primary">
        {renderLayout()}
        {initialLoadDone && canLoadMore && businesses?.meta?.hasNextPage && (
          <div ref={sentryRef} className="h-4">
            {loading && <span>Loading...</span>}
          </div>
        )}
      </div>

      <StickyYellowRibbonImage activeFilterTab={activeFilterTab} />
    </div>
  );
};

export default FilterBusinessLayout;
