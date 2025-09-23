"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { IconImage, NextImage } from "../ui";
import { searchText } from "@/constant/hebrew";
import useGeneralStore from "@/stores/generalStore";
import { startLoading } from "../wrappers/ProgressBar";
import { pathNames } from "@/lib/endpoints";

const PopularBusinessCard = ({
  name,
  description,
  images,
  logo,
  slug,
  navPath,
}: GeneralProductCardProps) => {
  const router = useRouter();
  const { setIsSerachModalOpen } = useGeneralStore();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const imageCount = images?.length;

  function handleNavigation() {
    startLoading();
    router.push(`${navPath}/${slug}`);
    setIsSerachModalOpen(false);
  }

  return (
    <div style={{ width: 240, height: 240 }} className="relative group">
      <NextImage
        isFill
        width={240}
        height={240}
        alt={images?.[imageCount]?.alt}
        imgSrc={images?.[activeImageIndex]?.image}
        className="rounded-xl object-cover"
      />

      {navPath !== pathNames.eventDetails && (
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
            className="rounded-lg object-cover"
          />
        </div>
      )}

      <div
        onClick={handleNavigation}
        className="text-white text-sm font-bold px-4 py-2.25 bg-dark/50 rounded-lg absolute left-4 top-4 custom-cursor hidden group-hover:block z-50"
      >
        {searchText.moreDetails}
      </div>

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
