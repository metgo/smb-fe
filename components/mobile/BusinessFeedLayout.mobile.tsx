"use client";

import clsx from "clsx";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

import MobileNavbar from "./Navbar.mobile";
import MobileCategoryPanel from "./CategoryPanel.mobile";
import MobileBusinessPinMap from "../maps/BusinessPinMap.mobile";
import MobileFeedsThumbnailCarousel from "./FeedsThumbnailCarousel.mobile";
import MobileBusinessFeedGalleryView from "./BusinessFeedGalleryView.mobile";
import MobileFeedScreenActionIcons from "./FeedScreenActionIcons.mobile";

import { IconImage } from "../ui";
import { staticImages } from "@/constant/staticImages";
import { categoryColors } from "@/lib/utils";
import { getCityOrCenter, removeInlineStylesFromHTML } from "@/lib/helpers";
import { useDeviceHeight, useMobileFeedLayout, useSwipeHooks } from "@/hooks";

interface MobileFeedLayoutProps {
  businesses: BusinessesProps;
}

const PreviewSlide = ({ direction, progress, scale, business }: any) => {
  if (!business) return null;

  const positionClass = direction === "left" ? "right-0" : "left-0";
  const gradientDirection =
    "bg-gradient-to-t from-black/70 via-black/40 to-black/30";

  return (
    <motion.div
      className={clsx(
        "absolute top-0 h-full overflow-hidden bg-background",
        positionClass,
      )}
      style={{ width: `${progress * 0.9}%` }}
      transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
    >
      <Image
        fill
        priority
        unoptimized
        src={business?.images?.[0]?.image || staticImages.placeholder}
        alt={business?.name || "Preview"}
        className="object-cover ultra-sharp"
      />
      {/* Gradient Overlay */}
      <div className={clsx("absolute inset-0 z-10", gradientDirection)} />

      {/* Content */}
      <div className="absolute top-50 left-10 right-10 z-20 text-white">
        <h1
          style={{ fontSize: 60 * scale }}
          className="font-bold line-clamp-2 leading-14"
        >
          {business.name}
        </h1>

        <div
          dangerouslySetInnerHTML={{
            __html: removeInlineStylesFromHTML(business.description || ""),
          }}
          style={{ fontSize: 24 * scale }}
          className="line-clamp-3 font-bold mt-1"
        />

        {business?.serviceType !== "point_of_interest" &&
          business?.address?.city && (
            <div className="flex items-center gap-2 mt-4">
              <IconImage icon="location" width={30} height={30} />
              <span style={{ fontSize: 20 * scale }} className="font-bold">
                {getCityOrCenter(business?.address)}
              </span>
            </div>
          )}
      </div>
    </motion.div>
  );
};

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

  const { scale } = useDeviceHeight();

  const {
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart,
    handleNavigation,
    swipeProgress,
    swipeDirection,
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

  const x = useMotionValue(0);

  // Smooth swipe spring animation
  useEffect(() => {
    if (swipeProgress === 0) {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
    } else {
      const dirMultiplier = swipeDirection === "left" ? 1 : -1;
      const newVal =
        (swipeProgress * 0.9 * dirMultiplier * window.innerWidth) / 100;
      x.set(newVal);
    }
  }, [swipeProgress, swipeDirection]);

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

  const prev = businesses.data[activeIndex - 1];
  const next = businesses.data[activeIndex + 1];

  return (
    <div className="flex flex-col max-sm:block md:hidden relative h-screen">
      {shouldShowNavbar && <MobileNavbar />}

      {activeFilterTabMobile === "gallery" && (
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative flex-1 overflow-hidden h-screen"
        >
          <MobileFeedScreenActionIcons
            trailInfo={`?businessId=${activeFeedItem?._id}&slug=${activeFeedItem?.slug}`}
            geoLocation={geoLocation}
            posTop={scale * 140}
          />
          {/* Main Image */}
          <div
            className="w-full h-full"
            style={{
              transform: `translateX(${
                swipeDirection === "left"
                  ? -swipeProgress * 0.9
                  : swipeDirection === "right"
                    ? swipeProgress * 0.9
                    : 0
              }%)`,
            }}
          >
            <MobileBusinessFeedGalleryView
              scale={scale}
              currentImage={computedValues.currentImage}
              activeFeedItem={activeFeedItem}
              geoLocation={geoLocation}
              onNavigate={handleNavigation}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
            />
          </div>

          {/* Swipe Previews */}
          {swipeProgress > 0 && (
            <>
              {swipeDirection === "left" && (
                <PreviewSlide
                  direction="left"
                  progress={swipeProgress}
                  scale={scale}
                  geoLocation={geoLocation}
                  business={prev}
                />
              )}
              {swipeDirection === "right" && (
                <PreviewSlide
                  direction="right"
                  progress={swipeProgress}
                  scale={scale}
                  geoLocation={geoLocation}
                  business={next}
                />
              )}
            </>
          )}
        </div>
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
          <div
            className={clsx(
              "transition-transform duration-300 ease-in-out space-y-4",
              isPanelVisible ? "translate-y-0" : "translate-y-20",
            )}
          >
            {renderCarousel(
              isPanelVisible || !activeCategoryKey ? "bottom-24" : "bottom-30",
            )}

            {!isPanelVisible && activeCategoryKey && (
              <div className="flex justify-center my-4">
                <div className="flex w-[125px] h-[10px] justify-between items-center rounded-lg p-1 bg-white">
                  {categories.map((item) => {
                    const isActive = item.id === activeCategoryKey;
                    return (
                      <div
                        key={item.id}
                        style={{
                          backgroundColor: isActive
                            ? categoryColors[item.id]
                            : "#FBFBFB",
                        }}
                        className={clsx(
                          "w-[25px] h-[8px] transition-colors duration-200",
                          isActive && "rounded-md",
                        )}
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
