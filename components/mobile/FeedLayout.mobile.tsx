"use client";

import { useEffect, useMemo, useState } from "react";

import MobileNavbar from "./Navbar.mobile";
import MobileBusinessPinMap from "../maps/BusinessPinMap.mobile";
import MobileFeedsThumbnailCarousel from "./FeedsThumbnailCarousel.mobile";

import { categoryColors } from "@/lib/utils";
import { useCommonHook, useFeedFilter, useMobileFeedLayout } from "@/hooks";
import OnlyFeedCardsLayoutMobile from "../layouts/OnlyFeedCardsLayout.mobile";
import useGeneralStore from "@/stores/generalStore";
import { usePathname } from "next/navigation";
import { pathNames } from "@/lib/endpoints";
import { AiIcon } from "../ui/svgIcons";
import MobileFeedFilterDrawer from "../drawer/FeedFilterDrawer.mobile";
import useFavoriteFeedItemStore from "@/stores/favoriteFeedItemStore";

interface MobileFeedLayoutProps {
  businesses: BusinessesProps;
  filters: FiltersResponse;
  initialSelectedFiltersIds: PresetFilterItems;
}

const MobileFeedLayout = ({
  businesses,
  filters,
  initialSelectedFiltersIds,
}: MobileFeedLayoutProps) => {
  const pathname = usePathname();
  const { isMobile } = useCommonHook();

  const {
    activeFilterTabMobile,
    activeFeedItem,
    feedItems,
    activeIndex,
    setActiveIndex,
    isFackLoading,
  } = useMobileFeedLayout(businesses);
  const {
    appliedFilterCount,
    filteredSubCategories,
    isSelected,
    toggleParam,
    handleResetFilters,
    shouldAnimate,
  } = useFeedFilter(filters, initialSelectedFiltersIds);
  const { favoriteFeedItemIds } = useFavoriteFeedItemStore();

  const {
    hideFirstTwoSection,
    setHideFirstTwoSection,
    isFilterDrawerOpen,
    setIsFilterDrawerOpen,
    showFavoriteFeedItems,
    setShowFavoriteFeedItems,
  } = useGeneralStore();

  const [visibleFeedItems, setVisibleFeedItems] = useState<FeedItemList>([]);

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

  // Prepare feed items for carousel
  const carouselItems = useMemo(
    () =>
      feedItems?.map((item) => ({
        id: item._id,
        name: item?.name,
        image: item?.images?.[0]?.image,
        categoryId: item?.primaryCategoryId,
      })),
    [feedItems],
  );

  useEffect(() => {
    if (pathname !== pathNames.home) {
      setHideFirstTwoSection(true);
    }
  }, [pathname]);

  if (!isMobile) return null;
  if (!feedItems?.length) return null;

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
        <div className="fixed bottom-2 right-[42%] custom-cursor">
          <div
            onClick={() => setIsFilterDrawerOpen(true)}
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
              <div className="bg-green-500 absolute right-1 top-1 rounded-full h-[18px] w-[18px] text-[10px] flex items-center justify-center text-white border border-white">
                {appliedFilterCount}
              </div>
            )}
          </div>
        </div>
      )}

      {isFilterDrawerOpen && (
        <MobileFeedFilterDrawer
          itemCount={businesses?.data?.length}
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
