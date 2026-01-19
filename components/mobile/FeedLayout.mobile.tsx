"use client";

import { useEffect, useMemo } from "react";

import MobileNavbar from "./Navbar.mobile";
import MobileBusinessPinMap from "../maps/BusinessPinMap.mobile";
import MobileFeedsThumbnailCarousel from "./FeedsThumbnailCarousel.mobile";

import { AiIcon } from "../ui/svgIcons";
import { misc } from "@/constant/hebrew";
import { pathNames } from "@/lib/endpoints";
import { categoryColors } from "@/lib/utils";
import { usePathname } from "next/navigation";
import useGeneralStore from "@/stores/generalStore";
import MobileFeedFilterDrawer from "../drawer/FeedFilterDrawer.mobile";
import useFavoriteFeedItemStore from "@/stores/favoriteFeedItemStore";
import { useCommonHook, useFeedFilter, useMobileFeedLayout } from "@/hooks";
import OnlyFeedCardsLayoutMobile from "../layouts/OnlyFeedCardsLayout.mobile";
import { useQuery } from "@tanstack/react-query";
import { getAllFilters, getFeedItems } from "@/actions/feedActions";
import { getPresetFilters } from "@/actions/commonActions";
import { filterBusinesses } from "@/lib/helpers";

interface MobileFeedLayoutProps {
  selectedFiltersIds: any;
  isAllClear: boolean;
}

const MobileFeedLayout = ({ selectedFiltersIds }: MobileFeedLayoutProps) => {
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

  const { data: infiniteData } = useQuery({
    queryKey: ["feeds"],
    queryFn: () => getFeedItems(),
  });

  /* ---------------------- Memoized Data ---------------------- */

  const {
    appliedFilterCount,
    filteredSubCategories,
    isSelected,
    toggleParam,
    handleResetFilters,
    shouldAnimate,
    filterState,
  } = useFeedFilter(filters, initialSelectedFiltersIds);

  const businesses = infiniteData?.data || [];

  const filteredBusinesses = filterBusinesses(businesses, filterState);

  const visibleFeedItems = useMemo(() => {
    if (filteredBusinesses?.length === 0) return [];

    if (showFavoriteFeedItems && favoriteFeedItemIds?.length > 0) {
      return filteredBusinesses?.filter((item) =>
        favoriteFeedItemIds?.includes(item._id),
      );
    }

    return filteredBusinesses;
  }, [filteredBusinesses, showFavoriteFeedItems, favoriteFeedItemIds]);

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

      {/* Bottom Panels */}
      {hideFirstTwoSection && (
        <>
          <div className="fixed bottom-2 right-[42%] custom-cursor">
            <div
              onClick={handleFilterIconClick}
              className="relative inline-flex items-center justify-center"
            >
              {/* Circle with shadow behind icon */}
              <div
                className={`absolute top-3 w-12 h-12 rounded-full shadow-xl shadow-green-300
              ${shouldAnimate ? "animate-zoom-3x" : ""}`}
              />

              {/* Icon stays centered */}
              <AiIcon size={68} />
              {appliedFilterCount > 0 && (
                <div className="bg-green-500 absolute right-1 top-1 rounded-full h-4.5 w-4.5 text-[10px] flex items-center justify-center text-white border border-white">
                  {appliedFilterCount}
                </div>
              )}
            </div>
          </div>
          {!alreadyShownFilterTooltip && (
            <div className="bg-[#28C368] px-4 py-2 rounded-md text-white fixed bottom-16 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-max font-bold">
              {misc.filterIconTooltip}
            </div>
          )}
        </>
      )}
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
  );
};

export default MobileFeedLayout;
