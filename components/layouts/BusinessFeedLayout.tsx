"use client";

import { useEffect, useRef, useState } from "react";

import { useIsHydrated } from "@/hooks";
import { useLoadMore } from "@/hooks/useLoadMore";
import useGeneralStore from "@/stores/generalStore";

import NoFeedItemLayout from "./NoFeedItemLayout";
import BusinessPinMap from "../maps/BusinessPinMap";
import OnlyFeedCardsLayout from "./OnlyFeedCardsLayout";
import MapFeedIntegratedLayout from "./MapFeedIntegratedLayout";
import StickyYellowRibbonImage from "../StickyYellowRibbonImage";
import { AiIcon } from "../ui/svgIcons";
import FeedFilterDrawer from "../drawer/FeedFilterDrawer";

const BusinessFeedLayout = ({
  businesses,
}: {
  businesses: BusinessesProps;
}) => {
  const isHydrated = useIsHydrated();
  const { activeFilterTab, isOnSection2, setAppliedFilterItemCount } =
    useGeneralStore();

  const { sentryRef, loading, initialLoadDone, canLoadMore } = useLoadMore(
    businesses?.meta?.hasNextPage,
  );

  const triggerRef = useRef(null);
  const totalBusiness = businesses?.totalData;

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  useEffect(() => {
    if (businesses?.data?.length > 0) {
      setAppliedFilterItemCount(businesses?.data?.length);
    }
  }, [businesses, setAppliedFilterItemCount]);

  if (!isHydrated) return null;

  const renderLayout = () => {
    switch (activeFilterTab) {
      case "gallery":
        return <OnlyFeedCardsLayout data={businesses.data} />;
      case "integrated":
        return <MapFeedIntegratedLayout data={businesses.data} />;
      case "map":
        return <BusinessPinMap mapHeight="120vh" />;
      default:
        return <NoFeedItemLayout />;
    }
  };

  return (
    <div className="md:block max-sm:hidden">
      {totalBusiness ? (
        <div className="bg-primary">
          {renderLayout()}
          <div style={{ height: "10px", position: "relative" }}>
            <div
              ref={triggerRef}
              style={{ position: "absolute", top: 0, height: 1 }}
            />
          </div>
          {initialLoadDone && canLoadMore && businesses?.meta?.hasNextPage && (
            <div ref={sentryRef} className="h-4">
              {loading && <span>Loading...</span>}
            </div>
          )}
        </div>
      ) : (
        <NoFeedItemLayout />
      )}

      {isOnSection2 && (
        <div
          onClick={() => setIsFilterDrawerOpen(true)}
          className="fixed bottom-40 right-1 custom-cursor max-sm:hidden md:block"
        >
          <AiIcon size={54} />
        </div>
      )}

      <StickyYellowRibbonImage activeFilterTab={activeFilterTab} />

      {isFilterDrawerOpen && (
        <FeedFilterDrawer
          itemCount={businesses?.data?.length}
          isOpen={isFilterDrawerOpen}
          setIsOpen={setIsFilterDrawerOpen}
        />
      )}
    </div>
  );
};

export default BusinessFeedLayout;
