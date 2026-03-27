"use client";

import { useEffect, useMemo } from "react";

import MobileNavbar from "./Navbar.mobile";
import MobileBusinessPinMap from "../maps/BusinessPinMap.mobile";
import MobileFeedsThumbnailCarousel from "./FeedsThumbnailCarousel.mobile";

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
import { SearchButton } from "../filter-icon/SearchButton";

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

  const { favoriteFeedItemIds, handleFilterTooltipShown } =
    useFavoriteFeedItemStore();

  const {
    hideFirstTwoSection,
    setHideFirstTwoSection,
    isFilterDrawerOpen,
    setIsFilterDrawerOpen,
    showFavoriteFeedItems,
    feedFilterState,
    selectedSiteCategories,
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
    isSelected,
    toggleParam,
    handleResetFilters,
    initFiltersFromURL,
    filterState,
  } = useFeedFilter(filters, initialSelectedFiltersIds);

  const totalLength = Object.values(feedFilterState).reduce(
    (sum, arr) => sum + arr.length,
    0,
  );
  const totalActiveFilters =
    appliedFilterCount + (selectedSiteCategories?.length || 0);

  const filteredSubCategories = filters?.subCategories ?? [];

  const businesses = infiniteData?.data || [];

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
  ]);

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
            itemCount={infiniteData?.totalData ?? 0}
            isOpen={isFilterDrawerOpen}
            setIsOpen={setIsFilterDrawerOpen}
            filters={filters}
            appliedFilterCount={appliedFilterCount}
            isSelected={isSelected}
            toggleParam={toggleParam}
            handleResetFilters={handleResetFilters}
            filteredSubCategories={filteredSubCategories}
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
