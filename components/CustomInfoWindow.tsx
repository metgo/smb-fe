"use client";

import clsx from "clsx";
import Link from "next/link";
import toast from "react-hot-toast";
import { FaHeart } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";

import { misc } from "@/constant/hebrew";
import { CardSkeleton } from "./skeletons";
import useTrailStationStore from "@/stores/trailStationStore";
import { getLocationDetailsById } from "@/actions/commonActions";
import { IconImage, ImageCarouselControls, NextImage } from "./ui";
import useFavoriteFeedItemStore from "@/stores/favoriteFeedItemStore";

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

  const loadedStationIdsRef = useRef<Set<string>>(new Set());

  const imageCount = stationDetails?.images?.length || 0;

  // window width
  useEffect(() => {
    const update = () => setWindowWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const getCardDimensions = () => {
    if (windowWidth <= 300)
      return { width: "150px", height: "150px", isSmall: true };
    if (windowWidth <= 360)
      return { width: "180px", height: "180px", isSmall: false };
    return { width: "240px", height: "240px", isSmall: false };
  };

  const cardDimensions = getCardDimensions();

  // fetch station
  useEffect(() => {
    if (!stationId || loadedStationIdsRef.current.has(stationId)) return;

    (async () => {
      try {
        setLoading(true);
        const res = await getLocationDetailsById(stationId);
        setStationDetails(res);
        loadedStationIdsRef.current.add(stationId);
      } catch (err) {
        console.error("Failed to fetch station:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [stationId]);

  // add button disabled
  useEffect(() => {
    if (isTrailMap && trailId && stationId) {
      setIsAddBtnDisabled(isAreadyExistStation(trailId, stationId));
    }
  }, [isTrailMap, trailId, stationId, isAreadyExistStation]);

  function handleAddStationToRoute(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (geoLocation && primaryCategoryId && trailId && stationDetails) {
      const info = {
        _id: stationDetails._id,
        name: stationDetails.name,
        description: stationDetails.description,
        image: stationDetails?.images?.[0]?.image,
        geoLocation,
        primaryCategoryId,
      };

      addTrailStation(trailId, info);

      toast.success("התחנה נוספה למסלול", {
        style: { color: "#fff", background: "#111", marginTop: "120px" },
      });

      setIsModalClose?.(true);
    }
  }

  function handleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addFavoriteFeedItemId(stationId);
  }

  if (loading) {
    return (
      <div
        className="rounded-md bg-gray-200 animate-pulse border-2 border-white"
        style={{ width: cardDimensions.width, height: cardDimensions.height }}
      >
        <CardSkeleton
          className="rounded w-full h-full"
          primaryCategoryId={primaryCategoryId!}
        />
      </div>
    );
  }

  return (
    <div
      className="relative rounded-md border-2 border-white overflow-hidden bg-white"
      style={{ width: cardDimensions.width, height: cardDimensions.height }}
    >
      {/* CLICKABLE CARD */}
      <Link
        href={`/business-details/${stationDetails?.slug}`}
        className="absolute inset-0 z-10"
      >
        <NextImage
          isFill
          imgSrc={stationDetails?.images?.[activeImageIndex]?.image}
          alt={stationDetails?.images?.[activeImageIndex]?.alt || "station"}
          className="object-cover w-full h-full"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />

        {/* Bottom text */}
        <div
          className={clsx(
            "absolute bottom-0 w-full text-white",
            cardDimensions.isSmall ? "p-1" : "p-2",
          )}
        >
          <h3
            className={clsx(
              "font-bold",
              cardDimensions.isSmall ? "text-sm" : "text-lg",
            )}
          >
            {stationDetails?.name}
          </h3>

          <div
            dangerouslySetInnerHTML={{
              __html: stationDetails?.description || "",
            }}
            className={clsx(
              "line-clamp-1",
              cardDimensions.isSmall ? "text-[10px]" : "text-sm",
            )}
          />

          <ImageCarouselControls
            totalImages={imageCount < 5 ? imageCount : 4}
            activeIndex={activeImageIndex}
            setActiveImageIndex={setActiveImageIndex}
          />
        </div>
      </Link>

      {/* ACTIONS OVERLAY */}
      <div
        className={clsx(
          "absolute top-0 right-0 w-full flex justify-between items-start z-20",
          cardDimensions.isSmall ? "p-1" : "p-2",
        )}
      >
        {/* Logo */}
        <NextImage
          imgSrc={stationDetails?.logo?.image}
          width={cardDimensions.isSmall ? 30 : 40}
          height={cardDimensions.isSmall ? 30 : 40}
          alt="logo"
          className="rounded-md shadow border border-white"
        />

        {/* Actions */}
        {isTrailMap ? (
          <button
            onClick={handleAddStationToRoute}
            disabled={isAddBtnDisabled}
            className={clsx(
              "font-bold text-white rounded-lg",
              cardDimensions.isSmall ? "text-xs px-2 py-1" : "px-4 py-2",
              isAddBtnDisabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black/60",
            )}
          >
            {misc.addToRoute}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {/* <IconImage icon="pin" /> */}

            <button
              aria-label="favorite"
              onClick={handleFavorite}
              className="rounded-full hover:ring-2 hover:ring-white"
            >
              {favoriteFeedItemIds.includes(stationId) ? (
                <div className="h-7.5 w-7.5 p-1 bg-black/40 rounded-full flex items-center justify-center">
                  <FaHeart size={16} className="text-white" />
                </div>
              ) : (
                <IconImage width={30} height={30} icon="circular-heart" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomInfoWindow;
