"use client";

import { useEffect, useMemo, useState } from "react";

import MobileNavbar from "./Navbar.mobile";
import MobileBusinessPinMap from "../maps/BusinessPinMap.mobile";
import MobileFeedsThumbnailCarousel from "./FeedsThumbnailCarousel.mobile";

import { categoryColors } from "@/lib/utils";
import { useCommonHook, useMobileFeedLayout } from "@/hooks";
import OnlyFeedCardsLayoutMobile from "../layouts/OnlyFeedCardsLayout.mobile";
import useGeneralStore from "@/stores/generalStore";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { pathNames } from "@/lib/endpoints";
import { AiIcon } from "../ui/svgIcons";
import { initialSelectedFiltersIds } from "@/providers/SiteInfoClientProvider";
import { sanitizeInitialFilters } from "@/lib/helpers";
import MobileFeedFilterDrawer from "../drawer/FeedFilterDrawer.mobile";

interface MobileFeedLayoutProps {
  businesses: BusinessesProps;
  filters: FiltersResponse;
}

const MobileFeedLayout = ({ businesses, filters }: MobileFeedLayoutProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const { isMobile } = useCommonHook();
  const searchParams = useSearchParams();

  const {
    activeFilterTabMobile,
    activeFeedItem,
    feedItems,
    activeIndex,
    setActiveIndex,
    isFackLoading,
  } = useMobileFeedLayout(businesses);
  const { hideFirstTwoSection, setHideFirstTwoSection } = useGeneralStore();
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [appliedFilterCount, setAppliedFilterCount] = useState(0);

  const getCurrentParams = () => {
    if (typeof window === "undefined") {
      return new URLSearchParams(searchParams.toString());
    }
    return new URLSearchParams(window.location.search);
  };

  const [paramsState, setParamsState] = useState<URLSearchParams>(() =>
    getCurrentParams(),
  );

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

  // ---- APPLY DEFAULT FILTERS ON FIRST LOAD ----
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      if (!initialSelectedFiltersIds) return;

      const { sanitized, totalCount } = sanitizeInitialFilters(
        initialSelectedFiltersIds,
        filters,
      );
      setAppliedFilterCount(totalCount);
      const params = getCurrentParams();
      let shouldUpdate = false;

      Object.entries(sanitized).forEach(([key, values]) => {
        if (!Array.isArray(values) || values.length === 0) return;

        const existing = params.get(key);
        if (!existing || existing.trim() === "") {
          params.set(key, values.join(","));
          shouldUpdate = true;
        }
      });

      if (shouldUpdate) {
        const nextParams = new URLSearchParams(params);
        setParamsState(nextParams);
        router.replace(`?${nextParams.toString()}`, { scroll: false });
      }
    } catch (error) {
      console.error("Error applying default filters:", error);
    }
  }, [initialSelectedFiltersIds]);

  if (!isMobile) return null;
  if (!feedItems?.length) return null;

  return (
    <div className="flex flex-col max-sm:block md:hidden relative">
      {hideFirstTwoSection && <MobileNavbar />}

      {activeFilterTabMobile === "gallery" && (
        <OnlyFeedCardsLayoutMobile data={businesses?.data} />
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
      {hideFirstTwoSection && pathname === "/" && (
        <div
          onClick={() => setIsFilterDrawerOpen(true)}
          className="fixed bottom-2 right-[42%]  custom-cursor"
        >
          {appliedFilterCount > 0 && (
            <div className="bg-green-500 absolute left-1 top-1 rounded-full h-[18px] w-[18px] text-[10px] flex items-center justify-center text-white aspect-square border border-white">
              {appliedFilterCount}
            </div>
          )}
          <AiIcon size={68} />
        </div>
      )}

      {isFilterDrawerOpen && (
        <MobileFeedFilterDrawer
          itemCount={businesses?.data?.length}
          isOpen={isFilterDrawerOpen}
          setIsOpen={setIsFilterDrawerOpen}
          paramsState={paramsState}
          setParamsState={setParamsState}
          filters={filters}
          appliedFilterCount={appliedFilterCount}
          setAppliedFilterCount={setAppliedFilterCount}
        />
      )}
    </div>
  );
};

export default MobileFeedLayout;
