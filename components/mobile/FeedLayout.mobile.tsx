"use client";

import { useEffect, useMemo, useRef } from "react";

import MobileNavbar from "./Navbar.mobile";
import MobileBusinessPinMap from "../maps/BusinessPinMap.mobile";
import MobileFeedsThumbnailCarousel from "./FeedsThumbnailCarousel.mobile";

import { misc } from "@/constant/hebrew";
import { pathNames } from "@/lib/endpoints";
import { categoryColors } from "@/lib/utils";
import { usePathname } from "next/navigation";
import useGeneralStore from "@/stores/generalStore";
import MobileFeedFilterDrawer from "../drawer/FeedFilterDrawer.mobile";
import useFavoriteFeedItemStore from "@/stores/favoriteFeedItemStore";
import { useCommonHook, useFeedFilter, useMobileFeedLayout } from "@/hooks";
import OnlyFeedCardsLayoutMobile from "../layouts/OnlyFeedCardsLayout.mobile";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getAllFilters, getFeedItems } from "@/actions/feedActions";
import { getPresetFilters } from "@/actions/commonActions";
import { SunsetButton } from "../filter-icon/SunsetButton";

interface MobileFeedLayoutProps {
  selectedFiltersIds: any;
  isAllClear: boolean;
}

const MobileFeedLayout = ({
  selectedFiltersIds,
  isAllClear,
}: MobileFeedLayoutProps) => {
  const observerTarget = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { isMobile } = useCommonHook();

  const {
    activeFilterTabMobile,
    activeFeedItem,
    activeIndex,
    setActiveIndex,
    isFackLoading,
  } = useMobileFeedLayout();

  const {
    favoriteFeedItemIds,
    alreadyShownFilterTooltip,
    handleFilterTooltipShown,
  } = useFavoriteFeedItemStore();

  const {
    hideFirstTwoSection,
    setHideFirstTwoSection,
    isFilterDrawerOpen,
    setIsFilterDrawerOpen,
    showFavoriteFeedItems,
  } = useGeneralStore();

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
    // isLoading,
  } = useInfiniteQuery({
    queryKey: ["feeds", selectedFiltersIds],
    queryFn: ({ pageParam = 1 }) =>
      getFeedItems(pageParam, selectedFiltersIds, isAllClear),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });

  /* ---------------------- Memoized Data ---------------------- */

  const {
    appliedFilterCount,
    filteredSubCategories,
    isSelected,
    toggleParam,
    handleResetFilters,
  } = useFeedFilter(filters, initialSelectedFiltersIds);

  const businesses = useMemo<FeedItem[]>(() => {
    return infiniteData?.pages?.flatMap((page) => page.data) ?? [];
  }, [infiniteData?.pages]);

  const totalBusiness = businesses?.length || 0;

  const visibleFeedItems = useMemo(() => {
    if (businesses?.length === 0) return [];

    if (showFavoriteFeedItems && favoriteFeedItemIds?.length > 0) {
      return businesses?.filter((item) =>
        favoriteFeedItemIds?.includes(item._id),
      );
    }

    return businesses;
  }, [businesses, showFavoriteFeedItems, favoriteFeedItemIds]);

  /* ---------------------- Initial Load Effect ---------------------- */
  useEffect(() => {
    // Fetch more data initially if we have very few items
    if (
      businesses?.length > 0 &&
      businesses?.length < 10 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [businesses?.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  /* ---------------------- Infinite Scroll Observer ---------------------- */
  useEffect(() => {
    const target = observerTarget.current;

    if (!target || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "200px", // Start loading 200px before the element is visible
      },
    );

    // Check if already in view on mount
    const rect = target.getBoundingClientRect();
    const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight;

    if (isInView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }

    observer.observe(target);

    return () => {
      if (target) {
        observer.unobserve(target);
      }
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Prepare feed items for carousel
  const carouselItems = useMemo(
    () =>
      businesses?.map((item) => ({
        id: item._id,
        name: item?.name,
        image: item?.images?.[0]?.image,
        categoryId: item?.primaryCategoryId,
      })),
    [businesses],
  );

  useEffect(() => {
    if (pathname !== pathNames.home) {
      setHideFirstTwoSection(true);
    }
  }, [pathname, setHideFirstTwoSection]);

  const handleFilterIconClick = () => {
    setIsFilterDrawerOpen(true);
    handleFilterTooltipShown(true);
  };

  if (!isMobile) return null;
  if (!businesses?.length) return null;

  return (
    <div className="flex flex-col max-sm:block md:hidden relative">
      {hideFirstTwoSection && <MobileNavbar />}

      {activeFilterTabMobile === "gallery" && (
        <OnlyFeedCardsLayoutMobile data={visibleFeedItems} />
      )}

      {activeFilterTabMobile === "map" && (
        <>
          <MobileBusinessPinMap />
          {hideFirstTwoSection && (
            <div className="fixed bottom-18 right-0 w-full z-20 space-y-4">
              <MobileFeedsThumbnailCarousel
                shouldSetItemId
                items={carouselItems}
                posBottom={"bottom-24"}
                loading={isFackLoading}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
                activeFilterTabMobile={activeFilterTabMobile}
                primaryBoderColor={
                  categoryColors[activeFeedItem?.primaryCategoryId]
                }
              />
            </div>
          )}
        </>
      )}

      {activeFilterTabMobile === "gallery" && (
        <>
          {hasNextPage && (
            <div ref={observerTarget} className="pb-24 pt-10 text-center">
              {isFetchingNextPage ? (
                <div className="flex justify-center items-center">
                  <span className="ml-3 text-black/50">
                    {misc.feedItemsLoading}
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => fetchNextPage()}
                  className="px-8 py-2 border border-black/60 hover:text-white rounded-lg hover:bg-black/80 transition-colors active:bg-green-700 font-medium"
                >
                  {"טען עוד"}
                </button>
              )}
            </div>
          )}

          {!hasNextPage && totalBusiness > 10 && (
            <div className="py-8 text-center text-black/50">
              {misc.noMoreItems}
            </div>
          )}
        </>
      )}

      {/* Bottom Panels */}
      {hideFirstTwoSection && (
        <>
          <div className="fixed bottom-2 right-[42%] custom-cursor">
            <SunsetButton
              size={60}
              variant={"black"}
              onClick={handleFilterIconClick}
              appliedFilterCount={appliedFilterCount}
            />
          </div>
          {!alreadyShownFilterTooltip && (
            <div className="bg-[#28C368] px-4 py-2 rounded-md text-white fixed bottom-16 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-max font-bold">
              {misc.filterIconTooltip}
            </div>
          )}
        </>
      )}
      <div className="bg-black/40">
        {isFilterDrawerOpen && (
          <MobileFeedFilterDrawer
            itemCount={businesses?.length}
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
      </div>
    </div>
  );
};

export default MobileFeedLayout;
