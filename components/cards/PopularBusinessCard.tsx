"use client";

import Link from "next/link";
import { useState } from "react";

import { IconImage, NextImage } from "../ui";
import { searchText } from "@/constant/hebrew";

const PopularBusinessCard = ({
  name,
  description,
  images,
  logo,
  slug,
}: GeneralProductCardProps) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const imageCount = images?.length;

  return (
    <div style={{ width: 240, height: 240 }} className="relative group">
      <NextImage
        isFill
        alt={images[imageCount]?.alt}
        imgSrc={images[activeImageIndex]?.image}
        width={240}
        height={240}
        className="rounded-xl object-cover"
      />

      <div
        style={{ width: 40, height: 40 }}
        className="absolute right-4 top-4 rounded-lg overflow-hidden border border-lightGray "
      >
        <NextImage
          isFill
          alt={logo?.alt}
          imgSrc={logo?.image}
          width={40}
          height={40}
        />
      </div>

      <Link
        href={`business-details/${slug}`}
        className="text-white text-sm font-bold px-4 py-2.25 bg-dark/50 rounded-lg absolute left-4 top-4 cursor-pointer hidden group-hover:block z-50"
      >
        {searchText.moreDetails}
      </Link>

      <div className="w-full h-full relative">
        <div className="absolute bottom-0 right-0 h-1/2 w-full bg-gradient-to-t from-black/40 to-transparent rounded-b-xl" />

        <div className="text-white font-bold absolute right-4 bottom-4 w-[87%]">
          <h4 className="line-clamp-1">{name}</h4>
          <div
            className="text-[12px] line-clamp-1"
            dangerouslySetInnerHTML={{ __html: description }}
          />
          <div className="hidden group-hover:flex items-center justify-between mt-2.5">
            <IconImage
              width={30}
              height={30}
              icon="next"
              onClick={() =>
                setActiveImageIndex(
                  (prev) => (prev - 1 + imageCount) % imageCount,
                )
              }
            />
            <div className="flex items-center gap-1.5">
              {images?.map((_, index) => (
                <div
                  key={index}
                  className={`bg-theme rounded-full ${activeImageIndex === index ? "w-2 h-2 bg-white" : "w-1.5 h-1.5"}`}
                />
              ))}
            </div>
            <IconImage
              width={30}
              height={30}
              icon="prev"
              onClick={() =>
                setActiveImageIndex((prev) => (prev + 1) % imageCount)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopularBusinessCard;
