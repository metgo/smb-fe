"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useFeedFilter } from "@/hooks";
import { misc, searchText, filterLabels } from "@/constant/hebrew";
import useGeneralStore from "@/stores/generalStore";
import useFavoriteFeedItemStore from "@/stores/favoriteFeedItemStore";

import NoFeedItemLayout from "./NoFeedItemLayout";
import BusinessPinMap from "../maps/BusinessPinMap";
import OnlyFeedCardsLayout from "./OnlyFeedCardsLayout";
import MapFeedIntegratedLayout from "./MapFeedIntegratedLayout";
import StickyYellowRibbonImage from "../StickyYellowRibbonImage";
import FeedFilterDrawer from "../drawer/FeedFilterDrawer";

import { getFeedItems, getAllFilters } from "@/actions/feedActions";
import { getPresetFilters } from "@/actions/commonActions";
import { filterBusinesses } from "@/lib/helpers";
import { SearchButton } from "../filter-icon/SearchButton";
import { useSearchFlow } from "@/hooks/useSearchFlow";
import { useGetAllCategorySites } from "@/hooks/useGetAllCategorySites";
interface FeedLayoutProps {
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
    filterState,
  } = useFeedFilter(filters, initialSelectedFiltersIds);
  /* ---------------------- Memoized Data ---------------------- */

  const businesses = infiniteData?.data || [];
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const {
    hasResults,
    isLoading: isSearchLoading,
    hasMounted,
    handleClearInputText,
    handleKeywordSelect,
    recommendedBusinesses,
    searchItems,
    searchKeyword,
    setSearchKeyword,
  } = useSearchFlow();
  const [advancedFilter, setAdvancedFilter] = useState(false);
  const [displayMode, setDisplayMode] = useState("");
  const { aminitiesInfo } = useGeneralStore();
  const {
    data: categoriesSites,
    isLoading,
    isError,
  } = useGetAllCategorySites();
  const filteredBusinesses = filterBusinesses(
    businesses,
    filterState,
    categoriesSites,
  );
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
            filteredSubCategories={filteredSubCategories}
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
      <div className="md:block max-sm:hidden">
        {totalBusiness === 0 ? (
          <NoFeedItemLayout isFilterDrawerOpen />
        ) : (
          <div className="bg-primary">{renderLayout()}</div>
        )}

        {/* Filter Button */}
        {hideFirstTwoSection && (
          <div className="fixed bottom-1 right-4 custom-cursor max-sm:hidden md:block">
            {/* <SunsetButton
              variant={"black"}
              onClick={handleFilterIconClick}
              appliedFilterCount={appliedFilterCount}
            /> */}
            <SearchButton
              onClick={handleFilterIconClick}
              activeFiltersCount={appliedFilterCount}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              variant="continuous"
              size={96}
            />
            {!alreadyShownFilterTooltip && (
              <div className="bg-[#28C368] px-4 py-2 rounded-md text-white absolute right-24 bottom-8 w-max font-bold">
                {misc.filterIconTooltip}
              </div>
            )}
          </div>
        )}
        <StickyYellowRibbonImage activeFilterTab={activeFilterTab} />
      </div>

      {/* Filter Drawer */}
      {/* {isFilterDrawerOpen && (
        <FeedFilterDrawer
          itemCount={infiniteData?.totalData ?? 0}
          isOpen={isFilterDrawerOpen}
          setIsOpen={setIsFilterDrawerOpen}
          filters={filters}
          appliedFilterCount={appliedFilterCount}
          isSelected={isSelected}
          toggleParam={toggleParam}
          handleResetFilters={handleResetFilters}
          filteredSubCategories={filteredSubCategories}
        />
      )} */}
    </>
  );
};

export default FeedLayout;
