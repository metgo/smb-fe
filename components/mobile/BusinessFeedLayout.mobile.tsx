"use client";

import { useMemo } from "react";

import MobileNavbar from "./Navbar.mobile";
import MobileCategoryPanel from "./CategoryPanel.mobile";
import MobileBusinessPinMap from "../maps/BusinessPinMap.mobile";
import MobileFeedsThumbnailCarousel from "./FeedsThumbnailCarousel.mobile";

import { categoryColors } from "@/lib/utils";
import { useMobileFeedLayout } from "@/hooks";
import OnlyFeedCardsLayoutMobile from "../layouts/OnlyFeedCardsLayout.mobile";

interface MobileFeedLayoutProps {
  businesses: BusinessesProps;
}

const MobileBusinessFeedLayout = ({ businesses }: MobileFeedLayoutProps) => {
  const {
    shouldShowNavbar,
    activeFilterTabMobile,
    activeFeedItem,
    feedItems,
    activeIndex,
    setActiveIndex,
    isFackLoading,
  } = useMobileFeedLayout(businesses);

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

  if (!feedItems?.length) return null;

  const renderCarousel = (posBottom: string) => (
    <MobileFeedsThumbnailCarousel
      shouldSetItemId
      items={carouselItems}
      posBottom={posBottom}
      loading={isFackLoading}
      activeIndex={activeIndex}
      setActiveIndex={setActiveIndex}
      activeFilterTabMobile={activeFilterTabMobile}
      primaryBoderColor={categoryColors[activeFeedItem?.primaryCategoryId]}
    />
  );

  return (
    <div className="flex flex-col max-sm:block md:hidden relative">
      {shouldShowNavbar && <MobileNavbar />}

      {activeFilterTabMobile === "gallery" && (
        <OnlyFeedCardsLayoutMobile data={businesses.data} />
      )}

      {activeFilterTabMobile === "map" && (
        <>
          <MobileBusinessPinMap />
          {shouldShowNavbar && (
            <div className="fixed bottom-0 right-0 w-full z-20 space-y-4">
              {renderCarousel("bottom-24")}
              <MobileCategoryPanel />
            </div>
          )}
        </>
      )}

      {/* Bottom Panels */}
      {shouldShowNavbar && activeFilterTabMobile === "gallery" && (
        <div className="fixed bottom-0 right-0 w-full z-20">
          <MobileCategoryPanel />
        </div>
      )}
    </div>
  );
};

export default MobileBusinessFeedLayout;
