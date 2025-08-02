"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { misc } from "@/constant/hebrew";
import { getLocationDetailsById } from "@/actions/commonActions";
import { IconImage, ImageCarouselControls, NextImage } from "./ui";

interface CustomInfoWindowProps {
  stationId: string;
  isTrailMap?: boolean;
}

const CustomInfoWindow = ({
  stationId,
  isTrailMap = false,
}: CustomInfoWindowProps) => {
  const [stationDetails, setStationDetails] =
    useState<LocationStationDetailsProps>();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const imageCount = stationDetails?.images?.length || 0;
  useEffect(() => {
    if (stationId) {
      async function fetchStationDetails() {
        const res = await getLocationDetailsById(stationId);
        setStationDetails(res);
      }
      fetchStationDetails();
    }
  }, [stationId]);

  return (
    <div className="w-[240px] h-[240px] rounded-md bg-white border-2 border-white relative">
      <NextImage
        width={240}
        height={240}
        imgSrc={stationDetails?.images?.[activeImageIndex]?.image}
        alt={stationDetails?.images?.[activeImageIndex]?.alt || "station image"}
        className="object-cover w-full h-full rounded-md"
      />
      <div className="absolute top-0 right-0 w-full">
        <div className="flex items-center justify-between w-full p-2">
          <Link href={`/business-details/${stationDetails?.slug}`}>
            <NextImage
              width={40}
              height={40}
              imgSrc={stationDetails?.logo?.image}
              alt={stationDetails?.logo?.alt || "Station logo"}
              className="w-[40px] h-[40px] rounded-md shadow-md border border-white overflow-hidden"
            />
          </Link>
          {isTrailMap ? (
            <button
              type="button"
              onClick={() => {}}
              className="cursor-pointer font-bold text-white bg-black/60 rounded-lg px-4 py-2.25"
            >
              <span>{misc.addToRoute}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <IconImage icon="pin" />
              <IconImage icon="circular-heart" />
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 right-0 z-50 w-full">
        <div className="px-2 pb-2 space-y-2">
          <div className="font-bold text-white">
            <h3 className="text-lg">{stationDetails?.name}</h3>
            <div
              dangerouslySetInnerHTML={{
                __html: stationDetails?.description || "",
              }}
              className="text-sm line-clamp-1"
            />
          </div>
          <ImageCarouselControls
            totalImages={imageCount}
            activeIndex={activeImageIndex}
            setActiveImageIndex={setActiveImageIndex}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomInfoWindow;
