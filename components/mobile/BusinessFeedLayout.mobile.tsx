"use client";

import { useState, useMemo } from "react";

import MobileNavbar from "./Navbar.mobile";
import MobileCategoryPanel from "./CategoryPanel.mobile";
import MobileBusinessPinMap from "../maps/BusinessPinMap.mobile";
import MobileFeedsThumbnailCarousel from "./FeedsThumbnailCarousel.mobile";
import MobileBusinessFeedGalleryView from "./BusinessFeedGalleryView.mobile";

import { categoryColors } from "@/lib/utils";
import { useDeviceHeight, useMobileFeedLayout, useSwipeHooks } from "@/hooks";

interface MobileFeedLayoutProps {
  businesses: BusinessesProps;
}

const MobileBusinessFeedLayout = ({ businesses }: MobileFeedLayoutProps) => {
  const [isPanelVisible, setIsPanelVisible] = useState(true);

  const {
    computedValues,
    geoLocation,
    shouldShowNavbar,
    activeFilterTabMobile,
    activeFeedItem,
    feedItems,
    activeIndex,
    setActiveIndex,
    categories,
    activeCategoryKey,
    isFackLoading,
  } = useMobileFeedLayout(businesses);
  const { height, scale } = useDeviceHeight();

  const {
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart,
    handleNavigation,
  } = useSwipeHooks(
    feedItems.length,
    activeIndex,
    setActiveIndex,
    activeFeedItem?.slug,
    setIsPanelVisible,
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

  if (!feedItems || feedItems.length === 0) return null;

  const renderThumbnailCarousel = (posBottom: string) => (
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

      {/* Gallery View */}
      {activeFilterTabMobile === "gallery" && (
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative flex-1"
          style={{ height }}
        >
          <MobileBusinessFeedGalleryView
            scale={scale}
            currentImage={computedValues.currentImage}
            activeFeedItem={activeFeedItem}
            geoLocation={geoLocation}
            onNavigate={handleNavigation}
          />
        </div>
      )}

      {/* Map View */}
      {activeFilterTabMobile === "map" && <MobileBusinessPinMap />}

      {/* Bottom Panel for Map */}
      {shouldShowNavbar && activeFilterTabMobile === "map" && (
        <div className="fixed bottom-0 right-0 w-full z-20 space-y-4">
          {renderThumbnailCarousel("bottom-24")}
          <MobileCategoryPanel />
        </div>
      )}

      {/* Bottom Panel for Gallery */}
      {shouldShowNavbar && activeFilterTabMobile === "gallery" && (
        <div className="fixed bottom-0 right-0 w-full z-20">
          <div
            className={`transition-transform duration-300 ease-in-out space-y-4 ${
              isPanelVisible ? "translate-y-0" : "translate-y-20"
            }`}
          >
            {renderThumbnailCarousel(
              isPanelVisible || !activeCategoryKey ? "bottom-24" : "bottom-30",
            )}

            {/* Category dots when panel is hidden */}
            {!isPanelVisible && activeCategoryKey && (
              <div className="flex justify-center my-4">
                <div className="flex w-[125px] h-[10px] justify-between items-center rounded-lg p-1 bg-white ">
                  {categories.map((item) => {
                    const isActive = item.id === activeCategoryKey;
                    const activeColor = isActive
                      ? categoryColors[item.id]
                      : "#FBFBFB";

                    return (
                      <div
                        key={item.id}
                        style={{ backgroundColor: activeColor }}
                        className={`w-[25px] h-[8px] transition-colors duration-200 ${
                          isActive ? "rounded-md" : ""
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            <MobileCategoryPanel />
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileBusinessFeedLayout;
