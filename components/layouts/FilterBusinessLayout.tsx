"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useLoadMore } from "@/hooks/useLoadMore";
import NoFeedItemLayout from "./NoFeedItemLayout";
import useGeneralStore from "@/stores/generalStore";

import { useIsHydrated } from "@/hooks";
import { pathNames } from "@/lib/endpoints";
import OnlyFeedCardsLayout from "./OnlyFeedCardsLayout";
import MapFeedIntegratedLayout from "./MapFeedIntegratedLayout";
import StickyYellowRibbonImage from "../StickyYellowRibbonImage";
import BusinessPinMap from "../maps/BusinessPinMap";

interface Props {
  businesses: BusinessesProps;
}

const FilterBusinessLayout = ({ businesses }: Props) => {
  const pathname = usePathname();

  const isHydrated = useIsHydrated();
  const { activeFilterTab, setAppliedFilterItemCount } = useGeneralStore();

  const { sentryRef, loading, initialLoadDone, canLoadMore } = useLoadMore(
    businesses?.meta?.hasNextPage,
  );
  const totalBusiness = businesses?.totalData;

  useEffect(() => {
    if (businesses?.data?.length > 0)
      setAppliedFilterItemCount(businesses?.data?.length);
  }, [businesses?.data]);

  if (!isHydrated) return null;
  if (!totalBusiness) return <NoFeedItemLayout />;

  const renderLayout = () => {
    if (pathname === pathNames.events || pathname === pathNames.blogArticles)
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
      <div>
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
