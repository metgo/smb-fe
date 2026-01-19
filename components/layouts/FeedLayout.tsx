"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useFeedFilter } from "@/hooks";
import useGeneralStore from "@/stores/generalStore";
import useFavoriteFeedItemStore from "@/stores/favoriteFeedItemStore";

import { IconImage } from "../ui";
import NoFeedItemLayout from "./NoFeedItemLayout";
import BusinessPinMap from "../maps/BusinessPinMap";
import OnlyFeedCardsLayout from "./OnlyFeedCardsLayout";
import MapFeedIntegratedLayout from "./MapFeedIntegratedLayout";
import StickyYellowRibbonImage from "../StickyYellowRibbonImage";
import FeedFilterDrawer from "../drawer/FeedFilterDrawer";

import { getFeedItems, getAllFilters } from "@/actions/feedActions";
import { getPresetFilters } from "@/actions/commonActions";
import { misc } from "@/constant/hebrew";
import { filterBusinesses } from "@/lib/helpers";

interface FeedLayoutProps {
  isAllClear: boolean;
  selectedFiltersIds: any;
}

const FeedLayout = ({ selectedFiltersIds }: FeedLayoutProps) => {
  /* ---------------------- Global Stores ---------------------- */
  const {
    activeFilterTab,
    hideFirstTwoSection,
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

  /* ---------------------- Queries ---------------------- */
  const { data: initialSelectedFiltersIds } = useQuery({
    queryKey: ["preset-filters"],
    queryFn: getPresetFilters,
  });

  const { data: filters } = useQuery({
    queryKey: ["filters", selectedFiltersIds],
    queryFn: () => getAllFilters(selectedFiltersIds),
  });

  const { data: infiniteData } = useQuery({
    queryKey: ["feeds"],
    queryFn: () => getFeedItems(),
  });

  const {
    appliedFilterCount,
    filteredSubCategories,
    isSelected,
    toggleParam,
    handleResetFilters,
    shouldAnimate,
    filterState,
  } = useFeedFilter(filters, initialSelectedFiltersIds);
  /* ---------------------- Memoized Data ---------------------- */

  const businesses = infiniteData?.data || [];

  const filteredBusinesses = filterBusinesses(businesses, filterState);
  const totalBusiness = filteredBusinesses?.length;

  const visibleFeedItems = useMemo(() => {
    if (filteredBusinesses?.length === 0) return [];

    if (showFavoriteFeedItems && favoriteFeedItemIds?.length > 0) {
      return filteredBusinesses.filter((item) =>
        favoriteFeedItemIds.includes(item._id),
      );
    }

    return filteredBusinesses;
  }, [filteredBusinesses, showFavoriteFeedItems, favoriteFeedItemIds]);

  /* ---------------------- Reset favorites on filter change ---------------------- */
  useEffect(() => {
    setShowFavoriteFeedItems(false);
  }, [selectedFiltersIds, setShowFavoriteFeedItems]);

  /* ---------------------- Handlers ---------------------- */
  const handleFilterIconClick = () => {
    setIsFilterDrawerOpen(true);
    handleFilterTooltipShown(true);
  };

  /* ---------------------- Render Helpers ---------------------- */
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

  /* ---------------------- Guards ---------------------- */
  // if (!isHydrated || !hideFirstTwoSection) return null;

  /* ---------------------- JSX ---------------------- */
  return (
    <>
      <div className="md:block max-sm:hidden">
        {totalBusiness === 0 ? (
          <NoFeedItemLayout isFilterDrawerOpen />
        ) : (
          <div className="bg-primary">{renderLayout()}</div>
        )}

        {/* Filter Button */}
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

      {/* Filter Drawer */}
      {isFilterDrawerOpen && (
        <FeedFilterDrawer
          itemCount={visibleFeedItems.length}
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
