"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useFeedFilter } from "@/hooks";
import useGeneralStore from "@/stores/generalStore";
import useFavoriteFeedItemStore from "@/stores/favoriteFeedItemStore";

import NoFeedItemLayout from "./NoFeedItemLayout";
import BusinessPinMap from "../maps/BusinessPinMap";
import OnlyFeedCardsLayout from "./OnlyFeedCardsLayout";
import MapFeedIntegratedLayout from "./MapFeedIntegratedLayout";
import StickyYellowRibbonImage from "../StickyYellowRibbonImage";

import { getFeedItems, getAllFilters } from "@/actions/feedActions";
import { getPresetFilters } from "@/actions/commonActions";
import { SearchButton } from "../filter-icon/SearchButton";
import { FeedFilterDrawer } from "../drawer";
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
    selectedSiteCategories,
    feedFilterState,
    feedSearchKeyword,
    resetFeedFilters,
  } = useGeneralStore();

  const { favoriteFeedItemIds, handleFilterTooltipShown } =
    useFavoriteFeedItemStore();

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
    isSelected,
    toggleParam,
    handleResetFilters: resetLocalFilters,
  } = useFeedFilter(filters, initialSelectedFiltersIds);

  const totalLength = Object.values(feedFilterState)
  .reduce((sum, arr) => sum + arr.length, 0);


  const totalActiveFilters =
    totalLength + (selectedSiteCategories?.length || 0);

  const handleResetFilters = () => {
    resetLocalFilters();
    resetFeedFilters();
  };

  /* ---------------------- Memoized Data ---------------------- */

  const businesses = infiniteData?.data || [];
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const totalBusiness = businesses?.length;

  const visibleFeedItems = useMemo(() => {
    if (businesses?.length === 0) return [];

    let items = businesses;

    if (selectedSiteCategories.length > 0) {
      const allowedIds = new Set(
        selectedSiteCategories.flatMap((cat) => cat.businessIds),
      );
      items = items.filter((item) => allowedIds.has(item.businessId));
    }

    if (feedFilterState.serviceTypes.length > 0) {
      items = items.filter((item) =>
        feedFilterState.serviceTypes.includes(item.serviceType),
      );
    }

    if (feedFilterState.accessibilityIds.length > 0) {
      items = items.filter((item) =>
        feedFilterState.accessibilityIds.some((id) =>
          (item as any).accessibilitiesId?.some(
            (a: any) => (a._id ?? a) === id,
          ),
        ),
      );
    }

    if (feedFilterState.groupTypeIds.length > 0) {
      items = items.filter((item) =>
        feedFilterState.groupTypeIds.some((id) =>
          (item as any).groupTypesId?.some((g: any) => (g._id ?? g) === id),
        ),
      );
    }

    if (feedSearchKeyword.trim()) {
      const keyword = feedSearchKeyword.trim().toLowerCase();
      items = items.filter(
        (item) =>
          item.name?.toLowerCase().includes(keyword) ||
          item.description?.toLowerCase().includes(keyword) ||
          item.address?.city?.toLowerCase().includes(keyword) ||
          item.address?.address?.toLowerCase().includes(keyword),
      );
    }

    if (showFavoriteFeedItems && favoriteFeedItemIds?.length > 0) {
      return items.filter((item) => favoriteFeedItemIds.includes(item._id));
    }

    return items;
  }, [
    businesses,
    showFavoriteFeedItems,
    favoriteFeedItemIds,
    selectedSiteCategories,
    feedFilterState,
    feedSearchKeyword,
  ]);
  console.log("🚀 ~ FeedLayout ~ visibleFeedItems:", visibleFeedItems)

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
          setIsOpen={setIsFilterOpen}
          itemCount={totalBusiness}
          visibleFeedItems={visibleFeedItems}
          filters={filters}

        />
        <StickyYellowRibbonImage activeFilterTab={activeFilterTab} />
      </div>
    </>
  );
};

export default FeedLayout;
