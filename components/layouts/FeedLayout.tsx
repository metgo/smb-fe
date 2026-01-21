"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

import { useFeedFilter } from "@/hooks";
import useGeneralStore from "@/stores/generalStore";
import useFavoriteFeedItemStore from "@/stores/favoriteFeedItemStore";

import { IconImage } from "../ui";
import NoFeedItemLayout from "./NoFeedItemLayout";
import BusinessPinMap from "../maps/BusinessPinMap";
import OnlyFeedCardsLayout from "./OnlyFeedCardsLayout";
import FeedFilterDrawer from "../drawer/FeedFilterDrawer";
import MapFeedIntegratedLayout from "./MapFeedIntegratedLayout";
import StickyYellowRibbonImage from "../StickyYellowRibbonImage";

import {
  getAllFilters,
  getFeedItemIds,
  getFeedDetailsItems,
} from "@/actions/feedActions";
import { getPresetFilters } from "@/actions/commonActions";
import { misc } from "@/constant/hebrew";
import { filterBusinesses } from "@/lib/helpers";

interface FeedLayoutProps {
  selectedFiltersIds: any;
}

const PAGE_SIZE = 20;

const FeedLayout = ({ selectedFiltersIds }: FeedLayoutProps) => {
  const observerTarget = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  /* ---------------------- Pagination State ---------------------- */
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [filteredFeedIds, setFilteredFeedIds] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  /* ---------------------- Global Stores ---------------------- */
  const {
    activeFilterTab,
    hideFirstTwoSection,
    setIsFilterDrawerOpen,
    isFilterDrawerOpen,
    showFavoriteFeedItems,
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
    staleTime: Infinity,
  });

  const { data: filters } = useQuery({
    queryKey: ["filters", selectedFiltersIds],
    queryFn: () => getAllFilters(selectedFiltersIds),
    staleTime: Infinity,
  });

  const { data: feedIds } = useQuery({
    queryKey: ["feedIds"],
    queryFn: getFeedItemIds,
    staleTime: Infinity,
  });

  /* ---------------------- Filters Hook ---------------------- */
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

  /* ---------------------- Memoize all feed IDs ---------------------- */
  const allFeedIds = useMemo(() => {
    return feedIds?.data || [];
  }, [feedIds?.data]);

  /* ---------------------- Store IDs in localStorage (once) ---------------------- */
  useEffect(() => {
    if (allFeedIds.length) {
      localStorage.setItem("feedIds", JSON.stringify(allFeedIds));
    }
  }, [allFeedIds]);

  /* ---------------------- Apply Filters & RESET State ---------------------- */
  useEffect(() => {
    if (!allFeedIds.length) return;

    const filtered = filterBusinesses(allFeedIds, filterState);

    // Clear previous state completely when filter changes
    setFilteredFeedIds(filtered);
    setFeedItems([]);
    setPage(0);
    setHasMore(true);
    setIsLoadingMore(false);
  }, [filterState, allFeedIds]);

  /* ---------------------- Load next page (20 items) ---------------------- */
  const loadNextFeedItems = useCallback(async () => {
    if (isLoadingMore || !hasMore || filteredFeedIds.length === 0) return;

    const start = page * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const chunk = filteredFeedIds.slice(start, end);

    if (chunk.length === 0) {
      setHasMore(false);
      return;
    }

    setIsLoadingMore(true);

    try {
      const body = {
        details: chunk.map((item: any) => ({
          id: item._id,
          serviceType: item.serviceType,
        })),
      };

      const res = await getFeedDetailsItems(body);

      if (res?.data) {
        setFeedItems((prev) => [...prev, ...res.data]);
        setPage((prev) => prev + 1);

        if (end >= filteredFeedIds.length) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Error loading feed items:", error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, hasMore, isLoadingMore, filteredFeedIds]);

  /* ---------------------- Load first page after filter change ---------------------- */
  useEffect(() => {
    // Skip initial mount to avoid double loading
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (
      filteredFeedIds.length > 0 &&
      feedItems.length === 0 &&
      !isLoadingMore
    ) {
      loadNextFeedItems();
    }
  }, [filteredFeedIds]);

  /* ---------------------- Infinite Scroll Observer ---------------------- */
  useEffect(() => {
    const target = observerTarget.current;
    if (!target || isLoadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadNextFeedItems();
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadNextFeedItems, hasMore, isLoadingMore]);

  /* ---------------------- Favorites Filter (Memoized) ---------------------- */
  const visibleFeedItems = useMemo(() => {
    if (!feedItems.length) return [];

    if (showFavoriteFeedItems && favoriteFeedItemIds.length > 0) {
      return feedItems.filter((item) => favoriteFeedItemIds.includes(item._id));
    }

    return feedItems;
  }, [feedItems, showFavoriteFeedItems, favoriteFeedItemIds]);

  const totalBusiness = visibleFeedItems.length;

  /* ---------------------- Handlers ---------------------- */
  const handleFilterIconClick = useCallback(() => {
    setIsFilterDrawerOpen(true);
    handleFilterTooltipShown(true);
  }, [setIsFilterDrawerOpen, handleFilterTooltipShown]);

  /* ---------------------- Render Helpers ---------------------- */
  const renderLayout = useCallback(() => {
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
  }, [activeFilterTab, visibleFeedItems, isFilterDrawerOpen]);

  /* ---------------------- JSX ---------------------- */
  return (
    <>
      <div className="md:block max-sm:hidden">
        {totalBusiness === 0 && !isLoadingMore ? (
          <NoFeedItemLayout isFilterDrawerOpen />
        ) : (
          <div className="bg-primary">
            {renderLayout()}

            {activeFilterTab === "gallery" && hasMore && (
              <div ref={observerTarget} className="py-8 text-center">
                {isLoadingMore && (
                  <span className="text-charcoal">{misc.feedItemsLoading}</span>
                )}
              </div>
            )}

            {!hasMore && totalBusiness > PAGE_SIZE && (
              <div className="py-8 text-center text-charcoal">
                {misc.noMoreItems}
              </div>
            )}
          </div>
        )}

        {hideFirstTwoSection && (
          <div className="fixed bottom-1 right-4 custom-cursor">
            <div onClick={handleFilterIconClick}>
              <div
                className={`border-2 border-white rounded-full shadow-2xl shadow-green-400 ${
                  shouldAnimate ? "animate-zoom-3x" : ""
                }`}
              >
                {appliedFilterCount > 0 && (
                  <div className="bg-green-500 absolute right-0 -top-1 rounded-full h-[25px] w-[25px] text-[10px] flex items-center justify-center text-white border-2 border-white">
                    {appliedFilterCount}
                  </div>
                )}
                <IconImage icon="ai" width={84} height={84} />
              </div>
            </div>

            {!alreadyShownFilterTooltip && (
              <div className="bg-[#28C368] px-4 py-2 rounded-md text-white absolute right-24 bottom-8 font-bold">
                {misc.filterIconTooltip}
              </div>
            )}
          </div>
        )}
        <StickyYellowRibbonImage activeFilterTab={activeFilterTab} />
      </div>

      {isFilterDrawerOpen && (
        <FeedFilterDrawer
          filters={filters}
          itemCount={visibleFeedItems?.length || 0}
          isOpen={isFilterDrawerOpen}
          setIsOpen={setIsFilterDrawerOpen}
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
