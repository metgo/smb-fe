"use client";

import clsx from "clsx";
import { useState } from "react";
import { NextImage } from "../ui";

const MobileImageGallery = ({ images }: { images: ImageItem[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="px-8">
      <NextImage
        width={380}
        height={380}
        imgSrc={images?.[activeIndex]?.image}
        alt={images?.[activeIndex]?.alt}
        className="object-cover w-full h-[380px] rounded-2xl"
      />
      {images?.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-hidden">
          {images?.map((item, index) => (
            <div
              key={index}
              onClick={() => setActiveIndex(index)}
              className={clsx(
                activeIndex === index ? "border-3 border-black" : "",
                "col-span-4 rounded-lg overflow-hidden",
              )}
            >
              <NextImage
                width={90}
                height={90}
                imgSrc={item?.image}
                alt={item?.alt}
                className="object-cover w-[90px] h-[90px] rounded-lg"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileImageGallery;
