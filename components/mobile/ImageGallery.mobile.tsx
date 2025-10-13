"use client";

import clsx from "clsx";
import { useState } from "react";
import { NextImage } from "../ui";

const MobileImageGallery = ({ images }: { images: ImageItem[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAllThumbnails, setShowAllThumbnails] = useState(false);

  const maxVisibleThumbnails = 4;
  const remainingCount = images.length - maxVisibleThumbnails;
  const visibleImages = showAllThumbnails
    ? images
    : images.slice(0, maxVisibleThumbnails);

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
  };

  const handleOverlayClick = () => {
    setShowAllThumbnails(true);
  };

  return (
    <div className="max-sm:block md:hidden">
      {/* Main Image */}
      <NextImage
        width={380}
        height={380}
        imgSrc={images?.[activeIndex]?.image}
        alt={images?.[activeIndex]?.alt}
        className="object-cover w-full h-[380px] rounded-2xl"
      />

      {/* Thumbnails */}
      {images?.length > 1 && (
        <div
          className={clsx(
            "flex flex-wrap items-center my-4 gap-2 overflow-hidden",
            showAllThumbnails ? "flex-wrap" : "flex-nowrap",
          )}
        >
          {visibleImages?.map((item, index) => {
            const isLastVisibleItem =
              !showAllThumbnails && index === maxVisibleThumbnails - 1;
            const showOverlay = isLastVisibleItem && remainingCount > 0;

            return (
              <div
                key={index}
                onClick={() =>
                  showOverlay
                    ? handleOverlayClick()
                    : handleThumbnailClick(index)
                }
                className={clsx(
                  activeIndex === index ? "border-3 border-black" : "",
                  "rounded-lg overflow-hidden relative cursor-pointer",
                )}
              >
                <NextImage
                  width={80}
                  height={80}
                  imgSrc={item?.image}
                  alt={item?.alt}
                  className="object-cover w-[80px] h-[80px] rounded-md"
                />
                {showOverlay && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      +{remainingCount}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MobileImageGallery;
