"use client";

import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";
import { BiNavigation } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useRef, useEffect, useCallback } from "react";

import MobileNavbar from "./Navbar.mobile";
import { CardSkeleton } from "../skeletons";
import { categoryColors } from "@/lib/utils";
import { IconImage, NextImage } from "../ui";
import MobileCategoryPanel from "./CategoryPanel.mobile";
import { removeInlineStylesFromHTML } from "@/lib/helpers";
import { useImageCrop, useMobileFeedLayout } from "@/hooks";
import MobileBusinessPinMap from "../maps/BusinessPinMap.mobile";

interface MobileFeedLayoutProps {
  businesses: BusinessesProps;
}

const MobileFeedLayout = ({ businesses }: MobileFeedLayoutProps) => {
  const {
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

  return (
    <>
      <div className="flex flex-col max-sm:block md:hidden relative">
        {shouldShowNavbar && <MobileNavbar showFilterTab />}

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
              isFackLoading={loading}
            />
          </div>
        )}

        {activeFilterTabMobile === "map" && <MobileBusinessPinMap />}

        {shouldShowNavbar && activeFilterTabMobile === "map" && (
          <div className="fixed bottom-0 right-0 w-full z-20 space-y-4">
            <ThumbnailCarousel
              feedItems={feedItems}
              activeIndex={activeIndex}
              loading={loading}
              sidePadding={sidePadding}
              itemRefs={itemRefs}
              setRefs={setRefs}
              onItemClick={handleActiveItem}
              isPanelVisible={isPanelVisible}
              activeFeedItem={activeFeedItem}
              isMap
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
              <ThumbnailCarousel
                feedItems={businesses?.data}
                activeIndex={activeIndex}
                loading={loading}
                sidePadding={sidePadding}
                itemRefs={itemRefs}
                setRefs={setRefs}
                onItemClick={handleActiveItem}
                isPanelVisible={isPanelVisible}
                activeFeedItem={activeFeedItem}
                isMap={false}
                activeCategoryId={activeCategoryKey}
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

// Sub-components
interface GalleryViewProps {
  currentImage: any;
  activeFeedItem: BusinessProps | null;
  geoLocation: { lat: number; lng: number };
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

          {/* Top Right Controls */}
          <div className="w-[94%] absolute top-30 right-4 flex justify-between text-white z-20">
            <BsThreeDotsVertical size={30} />
            <div className="flex items-center flex-col">
              <Link
                target="_blank"
                data-no-swipe
                rel="noopener noreferrer"
                href={`https://www.google.com/maps/search/?api=1&query=${geoLocation.lat},${geoLocation.lng}`}
                className="flex flex-col items-center gap-1.25 ps-2.5 pe-4 py-1 custom-cursor"
                onClick={(e) => e.stopPropagation()}
              >
                <BiNavigation size={36} />
              </Link>
            </div>
          </div>

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
                    {activeFeedItem?.address?.city}
                  </span>
                </div>
              )}
          </div>
        </div>
      )}
    </>
  );
};

interface ThumbnailCarouselProps {
  isMap?: boolean;
  feedItems: BusinessProps[];
  activeIndex: number;
  loading: boolean;
  sidePadding: number;
  activeFeedItem: BusinessProps;
  itemRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  setRefs: (el: HTMLDivElement | null) => void;
  onItemClick: (index: number, id: string) => void;
  isPanelVisible: boolean;
  activeCategoryId?: string | null;
}

const ThumbnailCarousel = ({
  feedItems,
  activeIndex,
  loading,
  sidePadding,
  itemRefs,
  setRefs,
  onItemClick,
  isPanelVisible,
  isMap = false,
  activeFeedItem,
  activeCategoryId = "",
}: ThumbnailCarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Center the active item
  const centerActiveItem = useCallback(() => {
    if (
      activeIndex === -1 ||
      !containerRef.current ||
      !itemRefs.current[activeIndex!]
    )
      return;

    const scrollContainer = containerRef.current;
    const activeItem = activeIndex !== null && itemRefs.current[activeIndex];

    if (!activeItem) return;

    const containerWidth = scrollContainer.clientWidth;
    const itemWidth = activeItem.clientWidth;
    const itemOffsetLeft = activeItem.offsetLeft;

    // Calculate the scroll position to center the item
    const targetScrollLeft =
      itemOffsetLeft - containerWidth / 2 + itemWidth / 2;

    scrollContainer.scrollTo({
      left: targetScrollLeft,
      behavior: "smooth",
    });
  }, [activeIndex, itemRefs]);

  // Center active item when index changes
  useEffect(() => {
    if (activeIndex !== -1) {
      // Small delay to ensure DOM is updated
      setTimeout(centerActiveItem, 100);
    }
  }, [activeIndex, centerActiveItem]);

  // Handle scroll events - prevent auto-activation
  const handleScroll = () => {
    isScrollingRef.current = true;

    // Clear timeout if user is still scrolling
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set timeout to mark scrolling as finished
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 150);
  };

  // Enhanced click handler that prevents accidental activation during scroll
  const handleItemClick = (idx: number, itemId: string) => {
    // Don't trigger click if we're currently scrolling
    if (isScrollingRef.current) return;
    onItemClick(idx, itemId);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section className="relative mb-6">
      <div
        ref={(el) => {
          containerRef.current = el;
          setRefs?.(el);
        }}
        className="relative flex flex-row items-center gap-3 overflow-x-auto scrollbar-hide"
        style={{
          paddingLeft: sidePadding,
          paddingRight: sidePadding,
          scrollBehavior: "smooth",
        }}
        onScroll={handleScroll}
      >
        {/* Left spacer for centering */}
        <div className="flex-shrink-0" style={{ width: "50%" }} />

        {feedItems?.map((item, idx) => {
          const isActive = activeIndex === idx;
          return (
            <div
              key={item._id}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              onClick={() => handleItemClick(idx, item._id)}
              className={clsx(
                "flex-shrink-0 cursor-pointer transition-all duration-300 rounded-lg overflow-hidden",
                isActive && "mx-3",
              )}
              style={{
                width: 60,
                height: 60,
                border: `3px solid #fff`,
              }}
            >
              <NextImage
                alt={item?.name}
                imgSrc={item?.images?.[0]?.image}
                width={200}
                height={200}
                className="object-cover w-full h-full rounded"
              />
            </div>
          );
        })}
        {/* Right spacer for centering */}
        <div className="flex-shrink-0" style={{ width: "50%" }} />
      </div>
      <div
        className={clsx(
          isMap || isPanelVisible || activeCategoryId === null
            ? "bottom-24"
            : "bottom-30",
          "fixed right-0 left-0 mx-auto w-[80px] h-80px] rounded-lg overflow-hidden bg-white",
        )}
        style={{
          width: 80,
          height: 80,
          border: `3px solid ${categoryColors[activeFeedItem?.primaryCategoryId]}`,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        {loading ? (
          <CardSkeleton
            className={"rounded-none w-full h-full"}
            primaryCategoryId={activeFeedItem?.primaryCategoryId}
          />
        ) : (
          <NextImage
            alt={activeFeedItem?.name || "Active feed item"}
            imgSrc={activeFeedItem?.images?.[0]?.image}
            width={100}
            height={100}
            className="object-cover w-[80px] h-[80px] overflow-hidden"
          />
        )}
      </div>
    </section>
  );
};

export default MobileFeedLayout;
