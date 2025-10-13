"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";

import MobileNavbar from "./Navbar.mobile";
import MobileBusinessPinMap from "../maps/BusinessPinMap.mobile";
import MobileCategoryPanel from "./CategoryPanel.mobile";

import { useMobileFeedLayout } from "@/hooks";
import GalleryViewMobile from "./GalleryView.mobile";
import ThumbnailCarouselMobile from "./ThumbnailCarousel.mobile";
import { categoryColors } from "@/lib/utils";

interface MobileFeedLayoutProps {
  businesses: BusinessesProps;
}

const MobileFeedLayout = ({ businesses }: MobileFeedLayoutProps) => {
  const {
    calculateDistanceTo,
    userLiveLocation,
    loading,
    computedValues,
    geoLocation,
    sidePadding,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleActiveItem,
    handleNavigation,
    setRefs,
    shouldShowNavbar,
    activeFilterTabMobile,
    activeFeedItem,
    feedItems,
    itemRefs,
    activeIndex,
    isPanelVisible,
    categories,
    activeCategoryKey,
  } = useMobileFeedLayout(businesses);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!shouldShowNavbar) return;
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [shouldShowNavbar]);

  const isMapView = activeFilterTabMobile === "map";
  const isGalleryView = activeFilterTabMobile === "gallery";

  return (
    <>
      <div className="flex flex-col md:hidden relative">
        {shouldShowNavbar && <MobileNavbar showFilterTab />}

        {isGalleryView && (
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative flex-1 h-screen"
          >
            <GalleryViewMobile
              currentImage={computedValues.currentImage}
              activeFeedItem={activeFeedItem}
              geoLocation={geoLocation}
              userLiveLocation={userLiveLocation}
              calculateDistanceTo={calculateDistanceTo}
              onNavigate={handleNavigation}
              isFackLoading={isLoading}
            />
          </div>
        )}

        {isMapView && <MobileBusinessPinMap />}

        {/* Thumbnail Carousel + Category Panel */}
        {shouldShowNavbar && (
          <div className="fixed bottom-0 right-0 w-full z-20 space-y-4">
            <div
              className={clsx(
                isGalleryView &&
                  "transition-transform duration-300 ease-in-out",
                isGalleryView && !isPanelVisible && "translate-y-20",
              )}
            >
              <ThumbnailCarouselMobile
                feedItems={isGalleryView ? businesses.data : feedItems}
                activeIndex={activeIndex}
                loading={loading}
                sidePadding={sidePadding}
                itemRefs={itemRefs}
                setRefs={setRefs}
                onItemClick={handleActiveItem}
                isPanelVisible={isPanelVisible}
                activeFeedItem={activeFeedItem}
                isMap={isMapView}
                activeCategoryId={activeCategoryKey}
              />

              {!isPanelVisible && activeCategoryKey && (
                <div className="flex justify-center my-4">
                  <div className="flex w-[125px] h-[10px] justify-between items-center rounded-lg p-1 bg-white">
                    {categories.map((item) => {
                      const isActive = item.id === activeCategoryKey;
                      const activeColor = isActive
                        ? categoryColors[item.id]
                        : "#FBFBFB";

                      return (
                        <div
                          key={item.id}
                          style={{ backgroundColor: activeColor }}
                          className={clsx("w-[25px] h-[8px]", {
                            "rounded-md": isActive,
                          })}
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

        <div className="pb-safe-bottom bg-white rounded-b-2xl" />
      </div>

      <style jsx>{`
        .pb-safe-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </>
  );
};

export default MobileFeedLayout;
