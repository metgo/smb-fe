import "react-multi-carousel/lib/styles.css";

import clsx from "clsx";
import { useRef, useState } from "react";
import Carousel from "react-multi-carousel";

import { NextImage } from "@/components/ui";
import { CardSkeleton } from "@/components/skeletons";
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
  shouldSetItemId?: boolean;
}

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 5,
    slidesToSlide: 1,
  },
  tablet: {
    breakpoint: { max: 1024, min: 640 },
    items: 3,
    slidesToSlide: 1,
  },
  mobile: {
    breakpoint: { max: 640, min: 0 },
    items: 5,
    slidesToSlide: 1,
  },
};

// function getCategoryColor(categoryId: string) {
//   if (categoryId)
//     return categoryColors[categoryId]
//   return "#fff"
// }

const MobileFeedsThumbnailCarousel = ({
  items,
  loading,
  activeIndex,
  setActiveIndex,
  shouldSetItemId,
  posBottom = "bottom-3",
  primaryBoderColor = "#fff",
  secondaryBoderColor = "#fff",
}: FeedsThumbnailCarouselProps) => {
  const carouselRef = useRef<Carousel>(null);
  const isDraggingRef = useRef<boolean>(false);

  const { setClickedBusinessId } = useGeneralStore();

  const [hiddenIndex, setHiddenIndex] = useState<number | null>(0);

  const handleCardClick = (idx: number, itemId: string): void => {
    if (isDraggingRef.current) return; // Prevent activation on drag
    setActiveIndex(idx);
    setHiddenIndex(idx);
    if (shouldSetItemId) setClickedBusinessId(itemId);
  };

  return (
    <>
      <div className="w-full relative mb-6">
        <Carousel
          ref={carouselRef}
          responsive={responsive}
          infinite
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
          afterChange={() => {
            // Reset drag flag after scroll ends
            setTimeout(() => {
              isDraggingRef.current = false;
            }, 100);
          }}
        >
          {items.map((item, idx) => {
            const isCenter = idx === activeIndex;
            const shouldHide = idx === hiddenIndex && isCenter;

            if (shouldHide) return null;

            return (
              <div
                key={item.id}
                className={` rounded-md overflow-hidden flex items-center justify-center transition-all duration-300 select-none custom-cursor`}
                style={{
                  height: "60px",
                  width: "60px",
                  border: `1px solid ${secondaryBoderColor}`,
                }}
                onClick={() => handleCardClick(idx, item.id)}
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
        </Carousel>

        {/* Active card preview (if one is active) */}
        {activeIndex !== null && (
          <div
            className={clsx(
              posBottom,
              "fixed right-0 left-0 mx-auto w-[80px] h-[80px] rounded-lg overflow-hidden bg-white",
            )}
            style={{
              width: 80,
              height: 80,
              border: `3px solid ${primaryBoderColor}`,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            {loading ? (
              <CardSkeleton
                className={"rounded-none w-full h-full"}
                primaryCategoryId={
                  items[activeIndex]?.categoryId || "6566e31ca77d2a477266d2d6"
                }
              />
            ) : (
              <NextImage
                alt={items[activeIndex]?.name || "Active feed item"}
                imgSrc={items[activeIndex]?.image}
                width={100}
                height={100}
                className="object-cover w-[80px] h-[80px] overflow-hidden"
              />
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        :global(.carousel-container) {
          width: 100%;
          padding: 0 !important;
        }
        :global(.carousel-slider) {
          display: flex;
          align-items: center;
        }
        :global(.carousel-item) {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </>
  );
};

export default MobileFeedsThumbnailCarousel;
