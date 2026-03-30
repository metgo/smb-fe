"use client";

import { useEffect, useState } from "react";

import { useFeedFilter } from "@/hooks";

import NoFeedItemLayout from "./NoFeedItemLayout";
import BusinessPinMap from "../maps/BusinessPinMap";
import OnlyFeedCardsLayout from "./OnlyFeedCardsLayout";
import MapFeedIntegratedLayout from "./MapFeedIntegratedLayout";
import StickyYellowRibbonImage from "../StickyYellowRibbonImage";

import { SearchButton } from "../filter-icon/SearchButton";
import { FeedFilterDrawer } from "../drawer";
interface FeedLayoutProps {
  selectedFiltersIds: any;
}

const FeedLayout = ({ selectedFiltersIds }: FeedLayoutProps) => {
  const {
    appliedFilterCount,
    isSelected,
    toggleParam,
    handleResetFilters: resetLocalFilters,

    activeFilterTab,
    hideFirstTwoSection,
    setIsFilterDrawerOpen,
    isFilterDrawerOpen,
    setShowFavoriteFeedItems,
    selectedSiteCategories,
    feedFilterState,
    resetFeedFilters,

    filters,
    totalBusiness,
    visibleFeedItems,
    infiniteData,
    handleFilterTooltipShown,
  } = useFeedFilter(selectedFiltersIds);

  const totalLength = Object.values(feedFilterState).reduce(
    (sum, arr) => sum + arr.length,
    0,
  );

  const totalActiveFilters =
    totalLength + (selectedSiteCategories?.length || 0);

  const handleResetFilters = () => {
    resetLocalFilters();
    resetFeedFilters();
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  /* ---------------------- Reset favorites on filter change ---------------------- */
  useEffect(() => {
    setShowFavoriteFeedItems(false);
  }, [selectedFiltersIds, setShowFavoriteFeedItems]);

  /* ---------------------- Handlers ---------------------- */
  const handleFilterIconClick = () => {
    const newState = !isFilterDrawerOpen;
    setIsFilterDrawerOpen(newState);
    setIsFilterOpen(newState);
    handleFilterTooltipShown(true);
  };

  /* ---------------------- Render Helpers ---------------------- */
  const renderLayout = () => {
    switch (activeFilterTab) {
      case "gallery":
        return (
          <OnlyFeedCardsLayout
            data={visibleFeedItems}
            isFilterOpen={isFilterDrawerOpen}
            setIsFilterOpen={setIsFilterDrawerOpen}
            filters={filters}
            appliedFilterCount={appliedFilterCount}
            isSelected={isSelected}
            toggleParam={toggleParam}
            handleResetFilters={handleResetFilters}
            itemCount={infiniteData?.totalData ?? 0}
          />
        );
      case "integrated":
        return <MapFeedIntegratedLayout data={visibleFeedItems} />;
      case "map":
        return <BusinessPinMap mapHeight="120vh" />;
      default:
        return <NoFeedItemLayout isFilterDrawerOpen={isFilterDrawerOpen} />;
    }
  };

  /* ---------------------- JSX ---------------------- */
  return (
    <>
      <div className="md:block max-sm:hidden relative">
        {totalBusiness === 0 ? (
          <NoFeedItemLayout isFilterDrawerOpen />
        ) : (
          <div className="bg-primary">{renderLayout()}</div>
        )}

        {/* Filter Button */}
        {hideFirstTwoSection && (
          <div className="fixed bottom-1 right-4 custom-cursor max-sm:hidden md:block">
            <SearchButton
              onClick={handleFilterIconClick}
              activeFiltersCount={totalActiveFilters}
              isFilterDrawerOpen={isFilterDrawerOpen}
              variant="continuous"
              size={96}
            />
          </div>
        )}
        <FeedFilterDrawer
          isOpen={isFilterOpen}
          visibleFeedItems={visibleFeedItems}
          filters={filters}
        />
        <StickyYellowRibbonImage activeFilterTab={activeFilterTab} />
      </div>
    </>
  );
};

export default FeedLayout;
