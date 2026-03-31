"use client";

import { useEffect } from "react";

import { useFeedFilter, useFeedFilterUrlSync } from "@/hooks";

import NoFeedItemLayout from "./NoFeedItemLayout";
import BusinessPinMap from "../maps/BusinessPinMap";
import OnlyFeedCardsLayout from "./OnlyFeedCardsLayout";
import MapFeedIntegratedLayout from "./MapFeedIntegratedLayout";
import StickyYellowRibbonImage from "../StickyYellowRibbonImage";

interface FeedLayoutProps {
  selectedFiltersIds: any;
}

const FeedLayout = ({ selectedFiltersIds }: FeedLayoutProps) => {
  useFeedFilterUrlSync();

  const {
    activeFilterTab,
    hideFirstTwoSection,
    setIsFilterDrawerOpen,
    isFilterDrawerOpen,
    setShowFavoriteFeedItems,
    selectedSiteCategories,
    feedFilterState,

    filters,
    totalBusiness,
    visibleFeedItems,
    handleFilterTooltipShown,
  } = useFeedFilter(selectedFiltersIds);

  const totalLength = Object.values(feedFilterState).reduce(
    (sum, arr) => sum + arr.length,
    0,
  );

  const totalActiveFilters =
    totalLength + (selectedSiteCategories?.length || 0);

  /* ---------------------- Reset favorites on filter change ---------------------- */
  useEffect(() => {
    setShowFavoriteFeedItems(false);
  }, [selectedFiltersIds, setShowFavoriteFeedItems]);

  /* ---------------------- Handlers ---------------------- */
  const handleFilterIconClick = () => {
    const newState = !isFilterDrawerOpen;
    setIsFilterDrawerOpen(newState);
    handleFilterTooltipShown(true);
  };

  /* ---------------------- Render Helpers ---------------------- */
  const renderLayout = () => {
    switch (activeFilterTab) {
      case "gallery":
        return (
          <OnlyFeedCardsLayout
            filters={filters}
            data={visibleFeedItems}
            isFilterOpen={isFilterDrawerOpen}
            hideFirstTwoSection={hideFirstTwoSection}
            onFilterIconClick={handleFilterIconClick}
            totalActiveFilters={totalActiveFilters}
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

        <StickyYellowRibbonImage activeFilterTab={activeFilterTab} />
      </div>
    </>
  );
};

export default FeedLayout;
