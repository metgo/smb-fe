"use client";

import { useEffect, useMemo } from "react";

import MobileNavbar from "./Navbar.mobile";
import MobileCategoryPanel from "./CategoryPanel.mobile";
import MobileBusinessPinMap from "../maps/BusinessPinMap.mobile";
import MobileFeedsThumbnailCarousel from "./FeedsThumbnailCarousel.mobile";

import { categoryColors } from "@/lib/utils";
import { useMobileFeedLayout } from "@/hooks";
import OnlyFeedCardsLayoutMobile from "../layouts/OnlyFeedCardsLayout.mobile";
import useGeneralStore from "@/stores/generalStore";
import { usePathname } from "next/navigation";
import { pathNames } from "@/lib/endpoints";

interface MobileFeedLayoutProps {
  businesses: BusinessesProps;
}

const MobileBusinessFeedLayout = ({ businesses }: MobileFeedLayoutProps) => {
  const pathname = usePathname();
  const {
    activeFilterTabMobile,
    activeFeedItem,
    feedItems,
    activeIndex,
    setActiveIndex,
    isFackLoading,
  } = useMobileFeedLayout(businesses);
  const { hideFirstTwoSection, setHideFirstTwoSection } = useGeneralStore();

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
      {hideFirstTwoSection && pathname === "/" && <MobileCategoryPanel />}
    </div>
  );
};

export default MobileBusinessFeedLayout;
