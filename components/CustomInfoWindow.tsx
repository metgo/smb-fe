"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useState } from "react";

import { misc } from "@/constant/hebrew";
import { getLocationDetailsById } from "@/actions/commonActions";
import { IconImage, ImageCarouselControls, NextImage } from "./ui";
import useTrailStationStore from "@/stores/trailStationStore";
import { CardSkeleton } from "./skeletons";

interface CustomInfoWindowProps {
  stationId: string;
  trailId?: string;
  isTrailMap?: boolean;
  geoLocation?: GeoLocation;
  primaryCategoryId?: string;
  setIsModalClose?: (isClose: boolean) => void;
}

const CustomInfoWindow = ({
  stationId,
  trailId,
  geoLocation,
  primaryCategoryId,
  isTrailMap = false,
  setIsModalClose,
}: CustomInfoWindowProps) => {
  const { addTrailStation, isAreadyExistStation } = useTrailStationStore();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAddBtnDisabled, setIsAddBtnDisabled] = useState(false);
  const [stationDetails, setStationDetails] =
    useState<LocationStationDetailsProps>();
  const [loading, setLoading] = useState(true);

  const imageCount = stationDetails?.images?.length || 0;

  useEffect(() => {
    if (stationId) {
      (async () => {
        try {
          setLoading(true);
          const res = await getLocationDetailsById(stationId);
          setStationDetails(res);
        } catch (err) {
          console.error("Failed to fetch station details:", err);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [stationId]);

  useEffect(() => {
    if (isTrailMap && trailId && stationId) {
      setIsAddBtnDisabled(isAreadyExistStation(trailId, stationId));
    }
  }, [isTrailMap, trailId, stationId, isAreadyExistStation]);

  function handleAddStationToRoute() {
    if (geoLocation && primaryCategoryId && trailId) {
      const trailStaionInfo = stationDetails && {
        _id: stationDetails._id,
        name: stationDetails.name,
        description: stationDetails.description,
        image: stationDetails?.images?.[0]?.image,
        geoLocation,
        primaryCategoryId,
      };
      addTrailStation(trailId, trailStaionInfo!);
      setIsModalClose?.(true);
    }
  }

  // ✅ Loading State UI (skeleton or spinner)
  if (loading) {
    return (
      <div className="w-[240px] h-[240px] rounded-md bg-gray-200 animate-pulse flex items-center justify-center border-2 border-white">
        <CardSkeleton
          className={"rounded w-full h-full"}
          primaryCategoryId={
            stationDetails?.primaryCategoryId ?? "6566fcd4a77d2a477266d3b9"
          }
        />
      </div>
    );
  }

  // ✅ Main UI after data loaded
  return (
    <div className="w-[240px] h-[240px] rounded-md bg-white border-2 border-white relative z-50 overflow-hidden">
      {/* Background Image */}
      <NextImage
        width={240}
        height={240}
        imgSrc={stationDetails?.images?.[activeImageIndex]?.image}
        alt={stationDetails?.images?.[activeImageIndex]?.alt || "station image"}
        className="object-cover w-full h-full rounded-md overflow-hidden"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-10 rounded-md bg-gradient-to-t from-black/60 via-black/20 to-black/10" />

      {/* Top Section */}
      <div className="absolute top-0 right-0 w-full z-20">
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
              onClick={handleAddStationToRoute}
              disabled={isAddBtnDisabled}
              className={clsx(
                isAddBtnDisabled
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-black/60 custom-cursor",
                "font-bold text-white rounded-lg px-4 py-2.25",
              )}
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

      {/* Bottom Section */}
      <div className="absolute bottom-0 right-0 z-20 w-full">
        <div className="px-2 pb-2 max-sm:space-y-0 md:space-y-2">
          <div className="font-bold text-white">
            <h3 className="md:text-lg max-sm:text-xl max-sm:-mb-1 ">
              {stationDetails?.name}
            </h3>
            <div
              dangerouslySetInnerHTML={{
                __html: stationDetails?.description || "",
              }}
              className="max-sm:text-[12px] md:text-sm line-clamp-1"
            />
          </div>
          <ImageCarouselControls
            totalImages={imageCount < 5 ? imageCount : 4}
            activeIndex={activeImageIndex}
            setActiveImageIndex={setActiveImageIndex}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomInfoWindow;
