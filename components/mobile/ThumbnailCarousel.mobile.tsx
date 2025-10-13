import { categoryColors } from "@/lib/utils";
import { NextImage } from "../ui";
import { useCallback, useEffect, useRef } from "react";
import clsx from "clsx";

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

const ThumbnailCarouselMobile = ({
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

        {loading && (
          <div className="flex-shrink-0 w-[60px] h-[60px] flex items-center justify-center text-white border-2 border-white rounded-md">
            <div className="text-xs">Loading...</div>
          </div>
        )}

        {/* Right spacer for centering */}
        <div className="flex-shrink-0" style={{ width: "50%" }} />
      </div>
      <div
        className={clsx(
          isMap || isPanelVisible || activeCategoryId === null
            ? "bottom-24"
            : "bottom-30",
          "fixed right-0 left-0 mx-auto w-[80px] h-80px] rounded-lg overflow-hidden",
        )}
        style={{
          width: 80,
          height: 80,
          border: `3px solid ${categoryColors[activeFeedItem?.primaryCategoryId]}`,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <NextImage
          alt={activeFeedItem?.name || "Active feed item"}
          imgSrc={activeFeedItem?.images?.[0]?.image}
          width={100}
          height={100}
          className="object-cover w-[80px] h-[80px] overflow-hidden"
        />
      </div>
    </section>
  );
};

export default ThumbnailCarouselMobile;
