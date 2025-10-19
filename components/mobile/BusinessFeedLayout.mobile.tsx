"use client";

import clsx from "clsx";
import Image from "next/image";

import MobileNavbar from "./Navbar.mobile";
import { CardSkeleton } from "../skeletons";
import { categoryColors } from "@/lib/utils";
import { IconImage } from "../ui";
import MobileCategoryPanel from "./CategoryPanel.mobile";
import { getCityOrCenter, removeInlineStylesFromHTML } from "@/lib/helpers";
import { useImageCrop, useMobileFeedLayout, useSwipeHooks } from "@/hooks";
import MobileBusinessPinMap from "../maps/BusinessPinMap.mobile";
import MobileFeedsThumbnailCarousel from "./FeedsThumbnailCarousel.mobile";
import { useState } from "react";
import MobileFeedScreenActionIcons from "./FeedScreenActionIcons.mobile";

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

  return (
    <>
      <div className="flex flex-col max-sm:block md:hidden relative">
        {shouldShowNavbar && <MobileNavbar />}

        {activeFilterTabMobile === "gallery" && (
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative flex-1 h-screen"
          >
            <GalleryView
              currentImage={computedValues.currentImage}
              activeFeedItem={activeFeedItem}
              geoLocation={geoLocation}
              onNavigate={handleNavigation}
              isFackLoading={isFackLoading}
            />
          </div>
        )}

        {activeFilterTabMobile === "map" && <MobileBusinessPinMap />}

        {shouldShowNavbar && activeFilterTabMobile === "map" && (
          <div className="fixed bottom-0 right-0 w-full z-20 space-y-4">
            <MobileFeedsThumbnailCarousel
              shouldSetItemId
              posBottom="bottom-24"
              items={feedItems?.map((item) => {
                return {
                  id: item?._id,
                  name: item?.name,
                  image: item?.images?.[0]?.image,
                  categoryId: item?.primaryCategoryId,
                };
              })}
              setActiveIndex={setActiveIndex}
              activeIndex={activeIndex}
              loading={isFackLoading}
              primaryBoderColor={
                categoryColors[activeFeedItem?.primaryCategoryId]
              }
            />
            <MobileCategoryPanel />
          </div>
        )}
        {shouldShowNavbar && activeFilterTabMobile === "gallery" && (
          <div className="fixed bottom-0 right-0 w-full z-20">
            <div
              className={`transition-transform duration-300 ease-in-out space-y-4 ${
                isPanelVisible ? "translate-y-0" : "translate-y-20"
              }`}
            >
              <MobileFeedsThumbnailCarousel
                items={feedItems?.map((item) => {
                  return {
                    id: item._id,
                    name: item?.name,
                    image: item?.images?.[0]?.image,
                    categoryId: item?.primaryCategoryId,
                  };
                })}
                posBottom={
                  isPanelVisible || !activeCategoryKey
                    ? "bottom-24"
                    : "bottom-30"
                }
                setActiveIndex={setActiveIndex}
                activeIndex={activeIndex}
                loading={isFackLoading}
                primaryBoderColor={
                  categoryColors[activeFeedItem?.primaryCategoryId]
                }
              />

              {!isPanelVisible && activeCategoryKey && (
                <div className="flex justify-center my-4">
                  <div className="flex w-[125px] h-[10px] justify-between items-center rounded-lg p-1 bg-white ">
                    {categories.map((item, index) => {
                      const isActive = item.id === activeCategoryKey;
                      const activeColor = isActive
                        ? categoryColors[item.id]
                        : "#FBFBFB";

                      return (
                        <div
                          key={index}
                          style={{ backgroundColor: activeColor }}
                          className={`w-[25px] h-[8px] transition-colors duration-200 ${isActive ? " rounded-md" : ""} `}
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
    </>
  );
};

// Sub-components
interface GalleryViewProps {
  currentImage: any;
  activeFeedItem: BusinessProps | null;
  geoLocation: { lat: number; long: number };
  isFackLoading: boolean;
  onNavigate: (e: React.MouseEvent) => void;
}

const GalleryView = ({
  currentImage,
  activeFeedItem,
  geoLocation,
  onNavigate,
  isFackLoading,
}: GalleryViewProps) => {
  const {
    finalImageSrc,
    handleImageLoad,
    handleImageError,
    isImageTransitionComplete,
    shouldShowSkeleton,
  } = useImageCrop(currentImage, 390 / 840);

  return (
    <>
      {shouldShowSkeleton || isFackLoading ? (
        <CardSkeleton
          className="w-full h-screen absolute inset-0"
          primaryCategoryId={
            activeFeedItem?.primaryCategoryId || "6566e31ca77d2a477266d2d6"
          }
        />
      ) : (
        <div
          onClick={onNavigate}
          className={clsx(
            "custom-cursor block relative w-full h-full transition-opacity duration-300",
            isImageTransitionComplete ? "opacity-100" : "opacity-80",
          )}
        >
          <Image
            unoptimized
            fill
            src={finalImageSrc}
            alt={currentImage?.alt || "Feed active image"}
            className="object-cover ultra-sharp"
            onLoad={handleImageLoad}
            onError={handleImageError}
            priority
          />

          <MobileFeedScreenActionIcons
            trailInfo={`?businessId=${activeFeedItem?._id}&slug=${activeFeedItem?.slug}`}
            geoLocation={geoLocation}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/30 to-black/10 z-10" />

          {/* Content */}
          <div className="absolute top-60 right-10 left-10 z-20 text-white">
            <h1 className="text-6xl font-bold line-clamp-2">
              {activeFeedItem?.name}
            </h1>
            <div
              dangerouslySetInnerHTML={{
                __html: removeInlineStylesFromHTML(
                  activeFeedItem?.description || "",
                ),
              }}
              className="line-clamp-3 font-bold text-2xl mt-1"
            />
            {activeFeedItem?.serviceType !== "point_of_interest" &&
              activeFeedItem?.address?.city && (
                <div className="flex items-center gap-2 mt-4">
                  <IconImage icon="location" width={30} height={30} />
                  <span className="text-xl font-bold">
                    {getCityOrCenter(activeFeedItem?.address)}
                  </span>
                </div>
              )}
          </div>
        </div>
      )}
    </>
  );
};

export default MobileBusinessFeedLayout;
