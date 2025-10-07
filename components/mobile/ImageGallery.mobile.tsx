"use client";

import clsx from "clsx";
import { useState } from "react";
import { NextImage } from "../ui";

const MobileImageGallery = ({ images }: { images: ImageItem[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const maxVisibleThumbnails = 4;
  const remainingCount = images.length - maxVisibleThumbnails;
  const visibleImages = images.slice(0, maxVisibleThumbnails);

  return (
    <div className="px-2">
      <NextImage
        width={380}
        height={380}
        imgSrc={images?.[activeIndex]?.image}
        alt={images?.[activeIndex]?.alt}
        className="object-cover w-full h-[380px] rounded-2xl"
      />
      {images?.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-hidden">
          {visibleImages?.map((item, index) => {
            const isLastVisibleItem = index === maxVisibleThumbnails - 1;
            const showOverlay = isLastVisibleItem && remainingCount > 0;

            return (
              <div
                key={index}
                onClick={() => setActiveIndex(index)}
                className={clsx(
                  activeIndex === index ? "border-3 border-black" : "",
                  "col-span-4 rounded-lg overflow-hidden relative cursor-pointer",
                )}
              >
                <NextImage
                  width={90}
                  height={90}
                  imgSrc={item?.image}
                  alt={item?.alt}
                  className="object-cover w-[90px] h-[90px] rounded-md"
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
