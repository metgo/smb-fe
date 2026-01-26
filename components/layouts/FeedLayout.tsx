"use client";

import { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { useFeedFilter } from "@/hooks";
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
import { misc } from "@/constant/hebrew";
import { SunsetButton } from "../filter-icon/SunsetButton";

interface FeedLayoutProps {
  isAllClear: boolean;
  selectedFiltersIds: any;
}

const FeedLayout = ({ selectedFiltersIds, isAllClear }: FeedLayoutProps) => {
  const observerTarget = useRef<HTMLDivElement>(null); // Element to observe

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

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["feeds", selectedFiltersIds],
    staleTime: 0,
    queryFn: ({ pageParam = 1 }) =>
      getFeedItems(pageParam, selectedFiltersIds, isAllClear),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });

  /* ---------------------- Memoized Data ---------------------- */
  const businesses = useMemo<FeedItem[]>(() => {
    return infiniteData?.pages.flatMap((page) => page.data) ?? [];
  }, [infiniteData?.pages]);

  const totalBusiness = businesses.length;

  const visibleFeedItems = useMemo(() => {
    if (businesses.length === 0) return [];

    if (showFavoriteFeedItems && favoriteFeedItemIds?.length > 0) {
      return businesses.filter((item) =>
        favoriteFeedItemIds.includes(item._id),
      );
    }

    return businesses;
  }, [businesses, showFavoriteFeedItems, favoriteFeedItemIds]);

  /* ---------------------- Filters Hook ---------------------- */
  const {
    appliedFilterCount,
    filteredSubCategories,
    isSelected,
    toggleParam,
    handleResetFilters,
  } = useFeedFilter(filters, initialSelectedFiltersIds);

  /* ---------------------- Infinite Scroll Observer ---------------------- */
  useEffect(() => {
    if (!observerTarget.current || isFetchingNextPage || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(observerTarget.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

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

  /* ---------------------- JSX ---------------------- */
  return (
    <>
      <div className="md:block max-sm:hidden">
        {totalBusiness === 0 ? (
          <NoFeedItemLayout isFilterDrawerOpen />
        ) : (
          <div className="bg-primary">
            {renderLayout()}

            {/* Infinite Scroll Trigger + Loading Indicator */}
            {activeFilterTab === "gallery" && (
              <>
                {hasNextPage && (
                  <div ref={observerTarget} className="py-8 text-center">
                    {isFetchingNextPage ? (
                      <div className="flex justify-center items-center">
                        {/* <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-orange-500"></div> */}
                        <span className="ml-3 text-charcoal">
                          {misc.feedItemsLoading}
                        </span>
                      </div>
                    ) : (
                      <div className="h-10" />
                    )}
                  </div>
                )}

                {!hasNextPage && totalBusiness > 10 && (
                  <div className="py-8 text-center text-charcoal">
                    {misc.noMoreItems}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Filter Button */}
        {hideFirstTwoSection && (
          <div className="fixed bottom-1 right-4 custom-cursor max-sm:hidden md:block">
            <SunsetButton
              variant={"black"}
              onClick={handleFilterIconClick}
              appliedFilterCount={appliedFilterCount}
            />
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
