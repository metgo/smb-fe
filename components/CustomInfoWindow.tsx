"use client";

import clsx from "clsx";
import Link from "next/link";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";

import { misc } from "@/constant/hebrew";
import { CardSkeleton } from "./skeletons";
import useTrailStationStore from "@/stores/trailStationStore";
import { getLocationDetailsById } from "@/actions/commonActions";
import { IconImage, ImageCarouselControls, NextImage } from "./ui";
import useFavoriteFeedItemStore from "@/stores/favoriteFeedItemStore";
import { FaHeart } from "react-icons/fa6";

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
  const { favoriteFeedItemIds, addFavoriteFeedItemId } =
    useFavoriteFeedItemStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAddBtnDisabled, setIsAddBtnDisabled] = useState(false);
  const [stationDetails, setStationDetails] =
    useState<LocationStationDetailsProps>();
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(0);

  const imageCount = stationDetails?.images?.length || 0;

  const loadedStationIdsRef = useRef<Set<string>>(new Set());

  // Get window width for responsive sizing
  useEffect(() => {
    const updateWindowWidth = () => {
      setWindowWidth(window.innerWidth);
    };

    // Set initial width
    updateWindowWidth();

    window.addEventListener("resize", updateWindowWidth);
    return () => window.removeEventListener("resize", updateWindowWidth);
  }, []);

  // Determine card size based on window width
  const getCardDimensions = () => {
    if (windowWidth <= 300) {
      return {
        width: "150px",
        height: "150px",
        isSmall: true,
      };
    } else if (windowWidth <= 360) {
      return {
        width: "180px",
        height: "180px",
        isSmall: false,
      };
    } else {
      return {
        width: "240px",
        height: "240px",
        isSmall: false,
      };
    }
  };

  const cardDimensions = getCardDimensions();

  useEffect(() => {
    if (!stationId || loadedStationIdsRef.current.has(stationId)) return;

    (async () => {
      try {
        setLoading(true);
        const res = await getLocationDetailsById(stationId);
        setStationDetails(res);
        loadedStationIdsRef.current.add(stationId);
      } catch (err) {
        console.error("Failed to fetch station details:", err);
      } finally {
        setLoading(false);
      }
    })();
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
      toast.success("התחנה נוספה למסלול", {
        style: {
          color: "#fff",
          background: "#111",
          marginTop: "120px",
        },
      });
      setIsModalClose?.(true);
    }
  }

  if (loading) {
    return (
      <div
        className="rounded-md bg-gray-200 animate-pulse flex items-center justify-center border-2 border-white"
        style={{
          width: cardDimensions.width,
          height: cardDimensions.height,
        }}
      >
        <CardSkeleton
          className={"rounded w-full h-full"}
          primaryCategoryId={primaryCategoryId!}
        />
      </div>
    );
  }

  // ✅ Main UI after data loaded
  return (
    <div
      className="rounded-md bg-white border-2 border-white relative z-50 overflow-hidden"
      style={{
        width: cardDimensions.width,
        height: cardDimensions.height,
      }}
    >
      {/* Background Image */}
      <NextImage
        isFill
        width={100}
        height={100}
        imgSrc={stationDetails?.images?.[activeImageIndex]?.image}
        alt={stationDetails?.images?.[activeImageIndex]?.alt || "station image"}
        className="object-cover w-full h-full rounded-md overflow-hidden"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-10 rounded-md bg-gradient-to-t from-black/60 via-black/20 to-black/10" />

      {/* Top Section */}
      <div className="absolute top-0 right-0 w-full z-20">
        <div
          className={`flex items-center justify-between w-full ${cardDimensions.isSmall ? "p-1" : "p-2"}`}
        >
          <Link href={`/business-details/${stationDetails?.slug}`}>
            <NextImage
              width={cardDimensions.isSmall ? 30 : 40}
              height={cardDimensions.isSmall ? 30 : 40}
              imgSrc={stationDetails?.logo?.image}
              alt={stationDetails?.logo?.alt || "Station logo"}
              className={`rounded-md shadow-md border border-white overflow-hidden ${cardDimensions.isSmall ? "w-[30px] h-[30px]" : "w-[40px] h-[40px]"}`}
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
                cardDimensions.isSmall && "text-xs px-2 py-1",
              )}
            >
              <span>{misc.addToRoute}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <IconImage icon="pin" />
              <button
                type="button"
                className="custom-cursor border border-transparent hover:border-white rounded-full"
                aria-label="Circular heart"
                onClick={() => addFavoriteFeedItemId(stationId)}
              >
                {favoriteFeedItemIds.includes(stationId) ? (
                  <div className=" h-7.5 w-7.5 p-1 bg-black/20 rounded-full flex items-center justify-center">
                    <FaHeart size={16} className="text-white" />
                  </div>
                ) : (
                  <IconImage width={30} height={30} icon="circular-heart" />
                )}
              </button>
              {/* <IconImage icon="circular-heart" /> */}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div
        className={`absolute bottom-2 right-0 z-20 w-full ${cardDimensions.isSmall && "bottom-1"}`}
      >
        <div
          className={`${cardDimensions.isSmall ? "px-1 pb-1 space-y-0" : "px-2 pb-2 max-sm:space-y-0 md:space-y-2"}`}
        >
          <div className="font-bold text-white">
            <h3
              className={`${cardDimensions.isSmall ? "text-sm -mb-1" : "md:text-lg max-sm:text-xl max-sm:-mb-1"}`}
            >
              {stationDetails?.name}
            </h3>
            <div
              dangerouslySetInnerHTML={{
                __html: stationDetails?.description || "",
              }}
              className={`line-clamp-1 ${cardDimensions.isSmall ? "text-[10px]" : "max-sm:text-[12px] md:text-sm"}`}
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
