"use client";

import { useEffect, useMemo } from "react";

import MobileNavbar from "./Navbar.mobile";
import MobileBusinessPinMap from "../maps/BusinessPinMap.mobile";
import MobileFeedsThumbnailCarousel from "./FeedsThumbnailCarousel.mobile";

import { categoryColors } from "@/lib/utils";
import { usePathname } from "next/navigation";
import MobileFeedFilterDrawer from "../drawer/FeedFilterDrawer.mobile";
import { useCommonHook, useFeedFilter, useMobileFeedLayout } from "@/hooks";
import OnlyFeedCardsLayoutMobile from "../layouts/OnlyFeedCardsLayout.mobile";
import { SearchButton } from "../filter-icon/SearchButton";
import { pathNames } from "@/lib/endpoints";

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

  /* ---------------------- Memoized Data ---------------------- */

  const {
    appliedFilterCount,
    isSelected,
    toggleParam,
    handleResetFilters,
    initFiltersFromURL,
    filterState,

    filters,
    infiniteData,
    visibleFeedItems,
    hideFirstTwoSection,
    isFilterDrawerOpen,
    totalBusiness,
    setIsFilterDrawerOpen,
    selectedSiteCategories,
    handleFilterTooltipShown,
    setHideFirstTwoSection,
  } = useFeedFilter(selectedFiltersIds);

  const totalActiveFilters =
    appliedFilterCount + (selectedSiteCategories?.length || 0);

  const businesses = infiniteData?.data || [];

  // Prepare feed items for carousel
  const carouselItems = useMemo(
    () =>
      businesses?.map((item: any) => ({
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
          <div className="fixed bottom-2 right-[42%]  custom-cursor">
            <SearchButton
              onClick={handleFilterIconClick}
              activeFiltersCount={totalActiveFilters}
              variant="continuous"
              size={96}
            />
          </div>
        </>
      )}

      <div className="bg-black/40">
        {isFilterDrawerOpen && (
          <MobileFeedFilterDrawer
            itemCount={totalBusiness ?? 0}
            isOpen={isFilterDrawerOpen}
            setIsOpen={setIsFilterDrawerOpen}
            filters={filters}
            appliedFilterCount={appliedFilterCount}
            isSelected={isSelected}
            toggleParam={toggleParam}
            handleResetFilters={handleResetFilters}
            initFiltersFromURL={initFiltersFromURL}
            filterState={filterState}
            visibleFeedItems={visibleFeedItems}
          />
        )}
      </div>
    </div>
  );
};

export default MobileFeedLayout;
