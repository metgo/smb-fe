"use client";

import { useEffect, useRef, useState } from "react";

import { useFeedFilter, useIsHydrated } from "@/hooks";
import { useLoadMore } from "@/hooks/useLoadMore";
import useGeneralStore from "@/stores/generalStore";

import NoFeedItemLayout from "./NoFeedItemLayout";
import BusinessPinMap from "../maps/BusinessPinMap";
import OnlyFeedCardsLayout from "./OnlyFeedCardsLayout";
import MapFeedIntegratedLayout from "./MapFeedIntegratedLayout";
import StickyYellowRibbonImage from "../StickyYellowRibbonImage";
import FeedFilterDrawer from "../drawer/FeedFilterDrawer";
import { IconImage } from "../ui";
import useFavoriteFeedItemStore from "@/stores/favoriteFeedItemStore";
import { misc } from "@/constant/hebrew";

const FeedLayout = ({
  businesses,
  filters,
  initialSelectedFiltersIds,
}: {
  businesses: BusinessesProps;
  filters: FiltersResponse;
  initialSelectedFiltersIds: PresetFilterItems;
}) => {
  const isHydrated = useIsHydrated();
  const [visibleFeedItems, setVisibleFeedItems] = useState<FeedItemList>([]);

  const {
    activeFilterTab,
    hideFirstTwoSection,
    setAppliedFilterItemCount,
    setIsFilterDrawerOpen,
    isFilterDrawerOpen,
    showFavoriteFeedItems,
    setShowFavoriteFeedItems,
  } = useGeneralStore();

  const {
    favoriteFeedItemIds,
    alreadyShownFilterTooltip,
    handleFilterTooltipShown,
  } = useFavoriteFeedItemStore();

  const { sentryRef, loading, initialLoadDone, canLoadMore } = useLoadMore(
    businesses?.meta?.hasNextPage,
  );

  const {
    appliedFilterCount,
    filteredSubCategories,
    isSelected,
    toggleParam,
    handleResetFilters,
    shouldAnimate,
  } = useFeedFilter(filters, initialSelectedFiltersIds);

  const triggerRef = useRef(null);
  const totalBusiness = businesses?.totalData;

  useEffect(() => {
    if (showFavoriteFeedItems && favoriteFeedItemIds.length > 0) {
      const items = businesses?.data?.filter((item) =>
        favoriteFeedItemIds?.includes(item._id),
      );
      setVisibleFeedItems(items);
    } else {
      setVisibleFeedItems(businesses?.data);
      setShowFavoriteFeedItems(false);
    }
  }, [showFavoriteFeedItems, favoriteFeedItemIds, businesses]);

  useEffect(() => {
    if (businesses?.data?.length > 0) {
      setAppliedFilterItemCount(businesses?.data?.length);
    }
  }, [businesses, setAppliedFilterItemCount]);

  // useEffect(() => {
  //   const navEntries = performance.getEntriesByType(
  //     "navigation",
  //   ) as PerformanceNavigationTiming[];
  //   const isReload =
  //     (navEntries && navEntries[0]?.type === "reload") ||
  //     performance.navigation.type === 1;

  //   if (isReload) {
  //     setHideFirstTwoSection(true);
  //   }
  // }, []);

  const handleFilterIconClick = () => {
    setIsFilterDrawerOpen(true);
    handleFilterTooltipShown(true);
  };

  if (!isHydrated || !hideFirstTwoSection) return null;

  const renderLayout = () => {
    switch (activeFilterTab) {
      case "gallery":
        return <OnlyFeedCardsLayout data={visibleFeedItems} />;
      case "integrated":
        return <MapFeedIntegratedLayout data={visibleFeedItems} />;
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
          <div className="fixed bottom-1 right-4 custom-cursor max-sm:hidden md:block">
            <div
              onClick={handleFilterIconClick}
              className="relative inline-block w-full"
            >
              <div
                className={`relative z-10 border-2 border-white rounded-full shadow-2xl shadow-green-400
                  ${shouldAnimate ? "animate-zoom-3x" : ""}`}
              >
                {appliedFilterCount > 0 && (
                  <div className="bg-green-500 absolute right-0 -top-1 rounded-full h-[25px] w-[25px] text-[10px] flex items-center justify-center text-white aspect-square border-2 border-white z-20">
                    {appliedFilterCount}
                  </div>
                )}
                <IconImage icon="ai" width={84} height={84} />
              </div>
            </div>
            {!alreadyShownFilterTooltip && (
              <div className="bg-[#28C368] px-4 py-2 rounded-md text-white absolute right-24 bottom-8 w-max font-bold ">
                {misc.filterIconTooltip}
              </div>
            )}
          </div>
        )}

        <StickyYellowRibbonImage activeFilterTab={activeFilterTab} />
      </div>

      {isFilterDrawerOpen && (
        <FeedFilterDrawer
          itemCount={visibleFeedItems?.length}
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
