"use client";

import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";
import { BiSolidNavigation } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useRef, useEffect, useCallback } from "react";

import MobileNavbar from "./Navbar.mobile";
import { staticImages } from "@/constant/staticImages";
import { categoryColors } from "@/lib/utils";
import { IconImage, NextImage } from "../ui";
import { useMobileFeedLayout } from "@/hooks";
import { removeInlineStylesFromHTML } from "@/lib/helpers";
import MobileCategoryPanel from "./CategoryPanel.mobile";
import BusinessPinMap from "../maps/BusinessPinMap";

interface MobileFeedLayoutProps {
  businesses: BusinessesProps;
}

// const ACTIVE_THUMBNAIL_SIZE = 100;
// const INACTIVE_THUMBNAIL_SIZE = 60;

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
    activeFilterTab,
    activeFeedItem,
    feedItems,
    itemRefs,
    activeIndex,
  } = useMobileFeedLayout(businesses);

  return (
    <>
      <div
        className="flex flex-col max-sm:block md:hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* ✅ Navbar */}
        {shouldShowNavbar && <MobileNavbar showFilterTab />}

        {/* ✅ Main Content */}
        {activeFilterTab === "gallery" && (
          <div className="relative flex-1 h-screen">
            <GalleryView
              currentImage={computedValues.currentImage}
              activeFeedItem={activeFeedItem}
              geoLocation={geoLocation}
              userLiveLocation={userLiveLocation}
              calculateDistanceTo={calculateDistanceTo}
              onNavigate={handleNavigation}
            />
          </div>
        )}

        {activeFilterTab === "map" && (
          <div className="relative">
            <BusinessPinMap mapHeight="140vh" />
          </div>
        )}

        {/* ✅ Common bottom section */}
        {shouldShowNavbar && (
          <div className="fixed bottom-0 right-0 w-full z-20 space-y-4">
            <ThumbnailCarousel
              feedItems={feedItems}
              activeIndex={activeIndex}
              loading={loading}
              sidePadding={sidePadding}
              itemRefs={itemRefs}
              setRefs={setRefs}
              onItemClick={handleActiveItem}
              isMap
            />
            <MobileCategoryPanel />
          </div>
        )}

        {/* ✅ Safe bottom spacing */}
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
  userLiveLocation: any;
  calculateDistanceTo: (lat: number, lng: number) => number | null;
  onNavigate: (e: React.MouseEvent) => void;
}

const GalleryView = ({
  currentImage,
  activeFeedItem,
  geoLocation,
  userLiveLocation,
  calculateDistanceTo,
  onNavigate,
}: GalleryViewProps) => (
  <div
    className="custom-cursor block relative w-full h-full"
    onClick={onNavigate}
  >
    <Image
      unoptimized
      fill
      src={currentImage?.image || staticImages.placeholder}
      alt={currentImage?.alt || ""}
      className="object-cover ultra-sharp"
    />

    {/* Top Right Controls */}
    <div className="w-[88%] absolute top-30 right-5 flex justify-between text-white z-20">
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
          <BiSolidNavigation size={28} />
          {userLiveLocation && (
            <span className="font-bold">
              ק״מ{" "}
              {calculateDistanceTo(
                Number(geoLocation.lat),
                Number(geoLocation.lng),
              )}
            </span>
          )}
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
          __html: removeInlineStylesFromHTML(activeFeedItem?.description || ""),
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
);

interface ThumbnailCarouselProps {
  isMap?: boolean;
  feedItems: BusinessProps[];
  activeIndex: number | null;
  loading: boolean;
  sidePadding: number;
  itemRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  setRefs: (el: HTMLDivElement | null) => void;
  onItemClick: (index: number, id: string) => void;
}

const ACTIVE_THUMBNAIL_SIZE = 80;
const INACTIVE_THUMBNAIL_SIZE = 60;

const ThumbnailCarousel = ({
  isMap = false,
  feedItems,
  activeIndex,
  loading,
  sidePadding,
  itemRefs,
  setRefs,
  onItemClick,
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
    <section
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      className={clsx(isMap ? "bottom-24" : "bottom-4", "absolute w-full z-20")}
    >
      <div
        ref={(el) => {
          containerRef.current = el;
          setRefs?.(el);
        }}
        className="flex flex-row items-center gap-3 overflow-x-auto scrollbar-hide"
        style={{
          paddingLeft: sidePadding,
          paddingRight: sidePadding,
          scrollBehavior: "smooth",
        }}
        onScroll={handleScroll}
      >
        {/* Left spacer for centering */}
        <div className="flex-shrink-0" style={{ width: "50%" }} />

        {feedItems.map((item, idx) => {
          const isActive = activeIndex === idx;
          const borderColor = isActive
            ? categoryColors[item.primaryCategoryId]
            : "#fff";
          const size = isActive
            ? ACTIVE_THUMBNAIL_SIZE
            : INACTIVE_THUMBNAIL_SIZE;

          return (
            <div
              key={item._id}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              onClick={() => handleItemClick(idx, item._id)}
              className={clsx(
                "flex-shrink-0 cursor-pointer transition-all duration-300 rounded-lg overflow-hidden",
                isActive && "ring-4 ring-opacity-100",
              )}
              style={{
                width: size,
                height: size,
                border: `3px solid ${borderColor}`,
                boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
              }}
            >
              <NextImage
                alt={item.name}
                imgSrc={item?.images?.[0]?.image}
                width={200}
                height={200}
                className="object-cover w-full h-full rounded"
              />
            </div>
          );
        })}

        {loading && (
          <div className="flex-shrink-0 w-[60px] h-[60px] flex items-center justify-center text-white border-2 border-white rounded-md">
            <div className="text-xs">Loading...</div>
          </div>
        )}

        {/* Right spacer for centering */}
        <div className="flex-shrink-0" style={{ width: "50%" }} />
      </div>
    </section>
  );
};

export default MobileFeedLayout;
