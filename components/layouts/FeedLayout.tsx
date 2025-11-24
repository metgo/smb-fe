"use client";

import { useEffect, useRef } from "react";

import { useFeedFilter, useIsHydrated } from "@/hooks";
import { useLoadMore } from "@/hooks/useLoadMore";
import useGeneralStore from "@/stores/generalStore";

import { AiIcon } from "../ui/svgIcons";
import NoFeedItemLayout from "./NoFeedItemLayout";
import BusinessPinMap from "../maps/BusinessPinMap";
import OnlyFeedCardsLayout from "./OnlyFeedCardsLayout";
import MapFeedIntegratedLayout from "./MapFeedIntegratedLayout";
import StickyYellowRibbonImage from "../StickyYellowRibbonImage";
import FeedFilterDrawer from "../drawer/FeedFilterDrawer";

const FeedLayout = ({
  businesses,
  filters,
}: {
  businesses: BusinessesProps;
  filters: FiltersResponse;
}) => {
  const isHydrated = useIsHydrated();

  const {
    activeFilterTab,
    hideFirstTwoSection,
    setAppliedFilterItemCount,
    setIsFilterDrawerOpen,
    isFilterDrawerOpen,
    setHideFirstTwoSection,
  } = useGeneralStore();

  const { sentryRef, loading, initialLoadDone, canLoadMore } = useLoadMore(
    businesses?.meta?.hasNextPage,
  );
  const {
    appliedFilterCount,
    filteredSubCategories,
    isSelected,
    toggleParam,
    handleResetFilters,
  } = useFeedFilter(filters);

  const triggerRef = useRef(null);
  const totalBusiness = businesses?.totalData;

  useEffect(() => {
    if (businesses?.data?.length > 0) {
      setAppliedFilterItemCount(businesses?.data?.length);
    }
  }, [businesses, setAppliedFilterItemCount]);

  useEffect(() => {
    const navEntries = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];
    const isReload =
      (navEntries && navEntries[0]?.type === "reload") ||
      performance.navigation.type === 1;

    if (isReload) {
      setHideFirstTwoSection(true);
    }
  }, []);

  if (!isHydrated || !hideFirstTwoSection) return null;

  const renderLayout = () => {
    switch (activeFilterTab) {
      case "gallery":
        return <OnlyFeedCardsLayout data={businesses.data} />;
      case "integrated":
        return <MapFeedIntegratedLayout data={businesses.data} />;
      case "map":
        return <BusinessPinMap mapHeight="120vh" />;
      default:
        return <NoFeedItemLayout isFilterDrawerOpen={isFilterDrawerOpen} />;
    }
  };

  return (
    <>
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
            {initialLoadDone &&
              canLoadMore &&
              businesses?.meta?.hasNextPage && (
                <div ref={sentryRef} className="h-4">
                  {loading && <span>Loading...</span>}
                </div>
              )}
          </div>
        ) : (
          <NoFeedItemLayout isFilterDrawerOpen={isFilterDrawerOpen} />
        )}

        {hideFirstTwoSection && (
          <div
            onClick={() => setIsFilterDrawerOpen(true)}
            className="fixed top-2/3 right-1 custom-cursor max-sm:hidden md:block"
          >
            {appliedFilterCount > 0 && (
              <div className="bg-green-500 absolute left-1 top-1 rounded-full h-[18px] w-[18px] text-[10px] flex items-center justify-center text-white aspect-square border border-white">
                {appliedFilterCount}
              </div>
            )}
            <AiIcon size={68} />
          </div>
        )}

        <StickyYellowRibbonImage activeFilterTab={activeFilterTab} />
      </div>

      {isFilterDrawerOpen && (
        <FeedFilterDrawer
          itemCount={businesses?.data?.length}
          isOpen={isFilterDrawerOpen}
          setIsOpen={setIsFilterDrawerOpen}
          filters={filters}
          appliedFilterCount={appliedFilterCount}
          isSelected={isSelected}
          toggleParam={toggleParam}
          handleResetFilters={handleResetFilters}
          filteredSubCategories={filteredSubCategories}
        />
      )}
    </>
  );
};

export default FeedLayout;
