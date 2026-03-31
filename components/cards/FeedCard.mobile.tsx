"use client";

import clsx from "clsx";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useInView, useAnimation } from "framer-motion";
import { useEffect, useState, useMemo, useCallback } from "react";

import { navigationPathsByServiceType } from "@/lib/utils";
import { startLoading } from "../wrappers/ProgressBar";
import {
  getCityOrCenter,
  getPrimaryCategoryId,
  removeInlineStylesFromHTML,
} from "@/lib/helpers";
import { sendGAEvent, triggerName } from "@/lib/googleEventsConfig";
import { CardSkeleton } from "../skeletons";
import { staticImages } from "@/constant/staticImages";
import {
  ANIMATION_CONFIG,
  cardVariants,
  INTERSECTION_CONFIG,
  MOTION_CONFIG,
} from "@/lib/animationConfig";
import { IconImage } from "../ui";
import { FaHeart } from "react-icons/fa6";
import useFavoriteFeedItemStore from "@/stores/favoriteFeedItemStore";
import { useSingleImagePresent } from "@/hooks/image/useSingleImagePresent";

interface FeedCardProps {
  height: number;
  width: number;
  feedItem: any;
}

const FeedCardMobile = ({ height, width, feedItem }: FeedCardProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasMounted, setHasMounted] = useState(false);
  const { favoriteFeedItemIds, addFavoriteFeedItemId } =
    useFavoriteFeedItemStore();

  // Memoized search params
  const urlParams = useMemo(() => {
    const params = Object.fromEntries(searchParams.entries());
    return {
      categoryId: params.categoryId || "",
      subCategoryId: params.subCategoryId || "",
      activeCategoryKey: searchParams.get("categoryId"),
    };
  }, [searchParams]);

  // Optimized image and dependency arrays
  const { images } = useMemo(
    () => ({
      images: feedItem?.images ?? [],
      deps: [urlParams.categoryId, urlParams.subCategoryId],
    }),
    [feedItem, urlParams.categoryId, urlParams.subCategoryId],
  );

  // Image loading hook
  const { isLoading, updatedImage, inView, containerRef } =
    useSingleImagePresent(width / height, images[0], INTERSECTION_CONFIG);

  // Animation controls
  const animationControls = useAnimation();
  const isCardInView = useInView(containerRef, MOTION_CONFIG as any);

  // Mount effect
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Animation effect
  useEffect(() => {
    if (isCardInView) {
      animationControls.start("visible");
    }
  }, [isCardInView, animationControls]);

  // Memoized computed values
  const computedValues = useMemo(
    () => ({
      primaryCategoryId: getPrimaryCategoryId(
        window.location.pathname,
        urlParams.activeCategoryKey || "",
        feedItem.primaryCategoryId!,
      ),
      currentImage: updatedImage,
      shouldShowSkeleton: !hasMounted || !inView || isLoading,
      locationText: getCityOrCenter(feedItem?.address),
    }),
    [
      urlParams.activeCategoryKey,
      feedItem.primaryCategoryId,
      feedItem?.address,
      updatedImage,
      hasMounted,
      inView,
      isLoading,
      feedItem,
    ],
  );

  const handleNavigation = useCallback(
    (serviceType: keyof typeof navigationPathsByServiceType) => {
      startLoading();
      sendGAEvent(triggerName.navigateToBusiness, {
        bussiness_id: feedItem._id,
        bussiness_name: feedItem.name,
      });
      router.push(
        `${navigationPathsByServiceType[serviceType]}/${feedItem.slug}`,
      );
    },
    [feedItem._id, feedItem.name, feedItem.slug, router],
  );

  // const handleMapIconClick = (e: React.MouseEvent, id: string) => {
  //   e.stopPropagation();
  //   e.preventDefault();
  //   setClickedBusinessId(id);
  //   setActiveFilterTab("map");
  // };

  // Render skeleton
  if (computedValues.shouldShowSkeleton) {
    return (
      <motion.div
        ref={containerRef}
        style={{ width: `${width}px`, height: `${height}px` }}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        transition={ANIMATION_CONFIG}
      >
        <CardSkeleton
          width={width}
          height={height}
          primaryCategoryId={computedValues.primaryCategoryId}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      style={{ width: `${width}px`, height: `${height}px` }}
      initial="hidden"
      animate={animationControls}
      variants={cardVariants}
      transition={ANIMATION_CONFIG}
    >
      <div
        className={clsx(
          "w-full h-full relative group rounded-xl overflow-hidden",
        )}
      >
        {/* Main Image */}
        <Image
          src={
            computedValues.currentImage?.imageUrl || staticImages.placeholder
          }
          alt={computedValues.currentImage?.alt || ""}
          fill
          unoptimized
          quality={100}
          sizes={`${width}px`}
          className={clsx(
            "object-cover transition-transform duration-500 ease-in-out ultra-sharp",
          )}
          priority={false}
        />

        {/* Content Overlay */}
        <FeedCardContent
          feedItem={feedItem}
          // onMapIconClick={handleMapIconClick}
          addFavoriteFeedItemId={addFavoriteFeedItemId}
          favoriteFeedItemIds={favoriteFeedItemIds}
        />
        <button
          type="button"
          onClick={() => handleNavigation(feedItem.serviceType)}
          className={clsx(
            "custom-cursor absolute left-0 top-12 w-full",
            images.length > 1 ? "bottom-14" : "bottom-0 h-full",
          )}
        />
      </div>
    </motion.div>
  );
};

// Extracted sub-components for better organization
const FeedCardContent = ({
  feedItem,
  // onMapIconClick,
  addFavoriteFeedItemId,
  favoriteFeedItemIds,
}: {
  feedItem: any;
  favoriteFeedItemIds: string[];
  addFavoriteFeedItemId: (feedId: string) => void;
  // onMapIconClick: (e: React.MouseEvent, id: string) => void;
}) => (
  <div className="relative w-full h-full overflow-hidden">
    {/* Gradient Overlay */}
    <div className="absolute bottom-0 right-0 h-full w-full bg-linear-to-tl from-black/80 via-black/40 to-black/20 rounded-b-xl" />

    {/* Text Content */}
    <div className="absolute bottom-0 right-0 px-2 py-4 text-white font-bold w-full">
      <div
        className="line-clamp-1"
        dangerouslySetInnerHTML={{
          __html: removeInlineStylesFromHTML(feedItem?.shortDescription) || "",
        }}
      />
      <h3 className="line-clamp-1 font-normal text-[12px]">{feedItem?.name}</h3>
    </div>

    <div className="absolute top-1.5 left-0  w-full">
      <div className="flex gap-1 ps-1.5">
        <button
          type="button"
          className="custom-cursor border border-transparent hover:border-white rounded-full"
          aria-label="Circular heart"
          onClick={() => addFavoriteFeedItemId(feedItem._id)}
        >
          {favoriteFeedItemIds.includes(feedItem._id) ? (
            <div className=" h-7.5 w-7.5 p-1 bg-black/20 rounded-full flex items-center justify-center">
              <FaHeart size={16} className="text-white" />
            </div>
          ) : (
            <IconImage width={30} height={30} icon="circular-heart" />
          )}
        </button>
        {/* 
        <button
          type="button"
          onClick={(e) => onMapIconClick(e, feedItem._id)}
          className="custom-cursor border border-transparent hover:border-white rounded-full"
          aria-label="Show on map"
        >
          <IconImage width={30} height={30} icon="circular-map-fold" />
        </button> */}
      </div>

      {feedItem.serviceType === "point_of_interest" && (
        <div className="bg-[#29C368] flex items-center justify-center absolute left-[8px] top-[1px] text-white text-[12px] font-bold px-3 py-1.5 rounded-md">
          <span>{"נקודת עניין"}</span>
        </div>
      )}
      {feedItem.serviceType === "event" && (
        <div className="bg-[#B471B5] flex items-center justify-center absolute left-[8px] top-[1px] text-white text-[12px] font-bold px-3 py-1.5 rounded-md">
          <span>{"אירוע"}</span>
        </div>
      )}
      {feedItem.serviceType === "trip" && (
        <div className="bg-[#FEBF3A] flex items-center justify-center absolute left-[8px] top-[1px] text-white text-[12px] font-bold px-3 py-1.5 rounded-md">
          <span>{"מסלול"}</span>
        </div>
      )}
      {feedItem.serviceType === "funday" && (
        <div className="bg-[#4C95D8] flex items-center justify-center absolute left-[8px] top-[1px] text-white text-[12px] font-bold px-3 py-1.5 rounded-md">
          <span>{"יום גיבוש"}</span>
        </div>
      )}
    </div>
  </div>
);

export default FeedCardMobile;
