import "react-multi-carousel/lib/styles.css";

import clsx from "clsx";
import { useRef, useEffect } from "react";
import Carousel from "react-multi-carousel";

import { NextImage } from "@/components/ui";
import { CardSkeleton } from "@/components/skeletons";
import useGeneralStore from "@/stores/generalStore";
import { categoryColors } from "@/lib/utils";

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
  isInfinite?: boolean;
  posBottom?: string;
  loading: boolean;
  isStation?: boolean;
  shouldSetItemId?: boolean;
}

const responsive = {
  desktop: { breakpoint: { max: 3000, min: 1024 }, items: 5 },
  tablet: { breakpoint: { max: 1024, min: 640 }, items: 3 },
  mobile: { breakpoint: { max: 640, min: 0 }, items: 5 },
};

const MobileFeedsThumbnailCarousel = ({
  items,
  loading,
  activeIndex,
  setActiveIndex,
  shouldSetItemId,
  isStation = false,
  isInfinite = true,
  posBottom = "bottom-3",
  primaryBoderColor = "#fff",
  secondaryBoderColor = "#fff",
}: FeedsThumbnailCarouselProps) => {
  const carouselRef = useRef<Carousel>(null);
  const isDraggingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const { setClickedBusinessId } = useGeneralStore();

  // Center the first item on mount
  useEffect(() => {
    if (!hasInitializedRef.current && carouselRef.current && items.length > 0) {
      hasInitializedRef.current = true;
      // Small delay to ensure carousel is fully rendered
      setTimeout(() => {
        if (activeIndex === 0) {
          carouselRef.current?.goToSlide(0, false);
        }
      }, 6000);
    }
  }, [items.length, activeIndex]);

  const handleCardClick = (idx: number, itemId: string): void => {
    if (isDraggingRef.current) return;

    setActiveIndex(idx);
    if (shouldSetItemId) setClickedBusinessId(itemId);

    // Center the clicked item
    carouselRef.current?.goToSlide(idx, true);
  };

  return (
    <div className="w-full relative mb-6">
      <Carousel
        ref={carouselRef}
        responsive={responsive}
        infinite={isInfinite}
        centerMode
        arrows={false}
        swipeable
        draggable
        showDots={false}
        keyBoardControl
        customTransition="transform 300ms ease-in-out"
        transitionDuration={300}
        containerClass="carousel-container"
        sliderClass="carousel-slider"
        itemClass="carousel-item"
        beforeChange={() => {
          isDraggingRef.current = true;
        }}
        afterChange={(previousSlide, { currentSlide }) => {
          // Update active index based on carousel's current slide
          if (!isDraggingRef.current) {
            setActiveIndex(currentSlide);
          }

          setTimeout(() => {
            isDraggingRef.current = false;
          }, 300);
        }}
      >
        {items.map((item, idx) => {
          const isActive = idx === activeIndex;

          return (
            <div
              key={item.id}
              className={clsx(
                "relative rounded-md overflow-hidden flex items-center justify-center transition-all duration-300 select-none cursor-pointer",
              )}
              style={{
                height: "60px",
                width: "60px",
                border: `2px solid ${
                  isActive
                    ? isStation
                      ? categoryColors[item.categoryId || ""]
                      : primaryBoderColor
                    : secondaryBoderColor
                }`,
                transform: isActive ? "scale(1.05)" : "scale(0.95)",
                opacity: isActive ? 1 : 0.6,
                zIndex: isActive ? 10 : 1,
              }}
              onClick={() => handleCardClick(idx, item.id)}
            >
              <div className="absolute left-0 right-0 mx-auto text-2xl text-white z-50">
                {idx}
              </div>
              <NextImage
                alt={item.name}
                imgSrc={item.image}
                width={200}
                height={200}
                className="object-cover w-full h-full rounded"
              />
            </div>
          );
        })}
      </Carousel>

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

      <style jsx>{`
        :global(.carousel-container) {
          width: 100%;
          padding: 0 !important;
          overflow: hidden;
        }

        :global(.carousel-slider) {
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }

        :global(.carousel-item) {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 4px;
        }

        /* Add padding to center the first item */
        :global(.carousel-slider > *:first-child) {
          margin-left: calc(50vw - 54px);
        }

        /* Add padding to allow last item to be centered */
        :global(.carousel-slider > *:last-child) {
          margin-right: calc(50vw - 35px);
        }
      `}</style>
    </div>
  );
};

export default MobileFeedsThumbnailCarousel;
