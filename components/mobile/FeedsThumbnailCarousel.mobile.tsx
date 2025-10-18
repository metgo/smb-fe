import clsx from "clsx";
import { useRef, useEffect, useCallback } from "react";

import { NextImage } from "@/components/ui";
import { CardSkeleton } from "@/components/skeletons";
import { categoryColors } from "@/lib/utils";
import useGeneralStore from "@/stores/generalStore";

interface FeedsThumbnailCarouselProps {
  items: {
    id: string;
    name: string;
    image: string;
    categoryId?: string;
  }[];
  primaryBoderColor?: string;
  secondaryBoderColor?: string;
  activeIndex: number;
  setActiveIndex: (v: number) => void;
  posBottom?: string;
  loading: boolean;
  isStation?: boolean;
  shouldSetItemId?: boolean;
}

const ACTIVE_THUMBNAIL_SIZE = 100;
const DEFAULT_SCREEN_WIDTH = 430;

const MobileFeedsThumbnailCarousel = ({
  items,
  loading,
  activeIndex,
  setActiveIndex,
  isStation = false,
  posBottom = "bottom-3",
  primaryBoderColor = "#fff",
  secondaryBoderColor = "#fff",
  shouldSetItemId = false,
}: FeedsThumbnailCarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { setClickedBusinessId } = useGeneralStore();

  const screenWidth =
    typeof window !== "undefined" ? window.innerWidth : DEFAULT_SCREEN_WIDTH;
  const sidePadding = (screenWidth - ACTIVE_THUMBNAIL_SIZE) / 2;

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

  const setRefs = (el: HTMLDivElement | null) => {
    // horizontalScrollRef.current = el;
    containerRef.current = el;
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  function handleActiveItem(idx: number, itemId: string) {
    if (shouldSetItemId) setClickedBusinessId(itemId);
    setActiveIndex(idx);
  }

  return (
    <div className="w-full relative mb-6">
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

        {items?.map((item, idx) => {
          const isActive = activeIndex === idx;
          return (
            <div
              key={item.id}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              onClick={() => handleActiveItem(idx, item.id)}
              className={clsx(
                "flex-shrink-0 cursor-pointer transition-all duration-300 rounded-lg overflow-hidden",
                isActive && "mx-3",
              )}
              style={{
                width: 60,
                height: 60,
                border: `1px solid ${
                  isActive
                    ? isStation
                      ? categoryColors[item.categoryId || ""]
                      : primaryBoderColor
                    : secondaryBoderColor
                }`,
              }}
            >
              <NextImage
                alt={item?.name}
                imgSrc={item?.image}
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

      {/* Floating preview centered at bottom */}
      {activeIndex >= 0 && items[activeIndex] && (
        <div
          className={clsx(
            "fixed left-1/2 transform -translate-x-1/2 z-20",
            posBottom,
          )}
          style={{
            width: 80,
            height: 80,
            border: `3px solid ${primaryBoderColor}`,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            borderRadius: "0.5rem",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <CardSkeleton
              className="w-full h-full rounded-none"
              primaryCategoryId={
                items[activeIndex].categoryId || "6566e31ca77d2a477266d2d6"
              }
            />
          ) : (
            <NextImage
              alt={items[activeIndex].name || "Active item"}
              imgSrc={items[activeIndex].image}
              width={100}
              height={100}
              className="object-cover w-full h-full rounded"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MobileFeedsThumbnailCarousel;
