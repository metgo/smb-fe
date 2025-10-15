"use client";

import clsx from "clsx";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { NextImage } from "@/components/ui";
import { categoryColors } from "@/lib/utils";
import { CardSkeleton } from "@/components/skeletons";
import { removeInlineStylesFromHTML } from "@/lib/helpers";
import { useImageCrop, useSwipeHooks } from "@/hooks";
import MobileFeedScreenActionIcons from "@/components/mobile/FeedScreenActionIcons.mobile";

const MobileTrailFeedDetails = ({ stations }: TrailDetailsProps) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [feedItems, setFeedItems] = useState<TrailStationProps[]>([]);
  const [isFackLoading, setIsFackLoading] = useState(true);

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { handleTouchEnd, handleTouchMove, handleTouchStart } = useSwipeHooks(
    feedItems.length,
    activeIndex,
    setActiveIndex,
  );

  const activeFeedItem = feedItems[activeIndex];

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsFackLoading(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (stations.length > 0) {
      setFeedItems(stations);
    }
  }, [stations]);

  const handleActiveItem = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <>
      <div className="flex flex-col max-sm:block md:hidden relative">
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative flex-1 h-screen"
        >
          <GalleryView
            currentImage={activeFeedItem?.images[0]}
            activeFeedItem={activeFeedItem}
            isFackLoading={isFackLoading}
          />
        </div>

        <div className="fixed bottom-0 right-0 w-full z-20 space-y-4">
          <ThumbnailCarousel
            feedItems={feedItems}
            activeIndex={activeIndex}
            loading={isFackLoading}
            itemRefs={itemRefs}
            onItemClick={handleActiveItem}
            activeFeedItem={activeFeedItem}
          />
        </div>

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
  activeFeedItem: TrailStationProps;
  isFackLoading: boolean;
}

const GalleryView = ({
  currentImage,
  activeFeedItem,
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
            categoryColors[activeFeedItem?.primaryCategoryId?._id] ||
            "6566e31ca77d2a477266d2d6"
          }
        />
      ) : (
        <div
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
            geoLocation={activeFeedItem.geoLocation}
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
            {/* {activeFeedItem?.address && (
              <div className="flex items-center gap-2 mt-4">
                <IconImage icon="location" width={30} height={30} />
                <span className="text-xl font-bold">
                  {getCityOrCenter(activeFeedItem?.address)}
                </span>
              </div>
            )} */}
          </div>
        </div>
      )}
    </>
  );
};

interface ThumbnailCarouselProps {
  feedItems: TrailStationProps[];
  activeIndex: number;
  loading: boolean;
  activeFeedItem: TrailStationProps;
  itemRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  onItemClick: (index: number, id: string) => void;
  activeCategoryId?: string | null;
}

const ThumbnailCarousel = ({
  feedItems,
  activeIndex,
  loading,
  itemRefs,
  onItemClick,
  activeFeedItem,
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
        }}
        className="relative flex flex-row items-center gap-3 overflow-x-auto scrollbar-hide"
        style={{
          scrollBehavior: "smooth",
        }}
        onScroll={handleScroll}
      >
        {feedItems?.map((item, idx) => {
          return (
            <div
              key={item._id + idx}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              onClick={() => handleItemClick(idx, item._id)}
              className={clsx(
                "flex-shrink-0 cursor-pointer transition-all duration-300 rounded-md overflow-hidden",
              )}
              style={{
                width: 60,
                height: 60,
                border: `2px solid #fff`,
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
      </div>
      <div
        className={clsx(
          "fixed right-0 left-0 mx-auto w-[80px] h-80px] rounded-md overflow-hidden bg-white bottom-4",
        )}
        style={{
          width: 80,
          height: 80,
          border: `3px solid #fff`,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        {loading ? (
          <CardSkeleton
            className={"rounded-none w-full h-full"}
            primaryCategoryId={
              categoryColors[activeFeedItem?.primaryCategoryId?._id] ||
              "6566e31ca77d2a477266d2d6"
            }
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

export default MobileTrailFeedDetails;
