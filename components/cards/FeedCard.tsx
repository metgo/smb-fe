"use client";

import clsx from "clsx";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useInView, useAnimation } from "framer-motion";
import { useEffect, useState, useMemo, useCallback } from "react";

import { pathNames } from "@/lib/endpoints";
import { categoryIds, navigationPathsByServiceType } from "@/lib/utils";
import useGeneralStore from "@/stores/generalStore";
import { startLoading } from "../wrappers/ProgressBar";
import { useImagePresent } from "@/hooks/image/useImagePresent";
import { IconImage, ImageCarouselControls } from "@/components/ui";
import {
  getCityOrCenter,
  getPrimaryCategoryId,
  removeInlineStylesFromHTML,
} from "@/lib/helpers";
import { googleSendGtmEvent, triggerName } from "@/lib/googleEventsConfig";
import { CardSkeleton } from "../skeletons";
import { staticImages } from "@/constant/staticImages";
import { useCommonHook } from "@/hooks";
import {
  ANIMATION_CONFIG,
  cardVariants,
  INTERSECTION_CONFIG,
  MOTION_CONFIG,
} from "@/lib/animationConfig";

interface FeedCardProps {
  height: number;
  width: number;
  feedItem: any;
}

const FeedCard = ({ height, width, feedItem }: FeedCardProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);

  const { isCurrentPage } = useCommonHook();
  const { setActiveFilterTab, setClickedBusinessId } = useGeneralStore();

  // Memoized page type checks
  const pageTypes = useMemo(
    () => ({
      isEventPage: isCurrentPage(pathNames.events),
      isTrailPage: isCurrentPage(pathNames.trails),
    }),
    [isCurrentPage],
  );

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
  const { images, deps } = useMemo(
    () => ({
      images: pageTypes.isEventPage
        ? [feedItem.cover]
        : (feedItem?.images ?? []),
      deps: pageTypes.isEventPage
        ? [feedItem]
        : [urlParams.categoryId, urlParams.subCategoryId],
    }),
    [
      pageTypes.isEventPage,
      feedItem,
      urlParams.categoryId,
      urlParams.subCategoryId,
    ],
  );

  // Image loading hook
  const { isLoading, updatedImageList, inView, containerRef } = useImagePresent(
    width / height,
    images,
    activeImageIndex,
    deps,
    INTERSECTION_CONFIG,
  );

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
      currentImage: updatedImageList?.[activeImageIndex],
      shouldShowSkeleton: !hasMounted || !inView || isLoading,
      locationText: getCityOrCenter(feedItem?.address),
    }),
    [
      urlParams.activeCategoryKey,
      feedItem.primaryCategoryId,
      feedItem?.address,
      updatedImageList,
      activeImageIndex,
      hasMounted,
      inView,
      isLoading,
      feedItem,
    ],
  );

  // Event handlers
  const handleMapIconClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    setClickedBusinessId(id);
    setActiveFilterTab("map");
  };

  const handleNavigation = useCallback(
    (serviceType: keyof typeof navigationPathsByServiceType) => {
      startLoading();
      googleSendGtmEvent(triggerName.navigateToBusiness, {
        bussinessId: feedItem._id,
        bussinessName: feedItem.name,
      });
      router.push(
        `${navigationPathsByServiceType[serviceType]}/${feedItem.slug}`,
      );
    },
    [feedItem._id, feedItem.name, feedItem.slug, router],
  );

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
          primaryCategoryId={
            computedValues.primaryCategoryId || categoryIds.attraction
          }
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
            pageTypes.isEventPage
              ? feedItem?.images?.[0]?.image
              : computedValues.currentImage?.imageUrl ||
                staticImages.placeholder
          }
          alt={computedValues.currentImage?.alt || ""}
          fill
          unoptimized
          quality={100}
          sizes={`${width}px`}
          className={clsx(
            "object-cover transition-transform duration-500 ease-in-out ultra-sharp",
            "group-hover:scale-140",
          )}
          priority={false}
        />

        {/* Content Overlay */}
        <FeedCardContent
          feedItem={feedItem}
          pageTypes={pageTypes}
          images={images}
          activeImageIndex={activeImageIndex}
          setActiveImageIndex={setActiveImageIndex}
        />

        {/* Action Icons */}
        <FeedCardActions
          feedItem={feedItem}
          pageTypes={pageTypes}
          onMapIconClick={handleMapIconClick}
        />
        <button
          type="button"
          onClick={() => handleNavigation(feedItem.serviceType)}
          className={clsx(
            "custom-cursor absolute left-0 top-12 w-full",
            images.length > 1 && !pageTypes.isEventPage
              ? "bottom-14"
              : "bottom-0 h-full",
          )}
        />
      </div>
    </motion.div>
  );
};

// Extracted sub-components for better organization
const FeedCardContent = ({
  feedItem,
  pageTypes,
  images,
  activeImageIndex,
  setActiveImageIndex,
}: {
  feedItem: any;
  pageTypes: {
    isEventPage: boolean;
    isTrailPage: boolean;
  };
  images: any[];
  activeImageIndex: number;
  setActiveImageIndex: React.Dispatch<React.SetStateAction<number>>;
}) => (
  <div className="relative w-full h-full">
    {/* Gradient Overlay */}
    <div className="absolute  bottom-0 right-0 h-full w-full bg-gradient-to-t from-black/40 via-black/30 to-black/5 rounded-b-xl" />

    {/* Text Content */}
    <div className="absolute bottom-0 right-0 p-4 text-white font-bold w-full">
      <div
        className="line-clamp-1"
        dangerouslySetInnerHTML={{
          __html: removeInlineStylesFromHTML(feedItem?.shortDescription),
        }}
      />
      <h3 className="line-clamp-1 font-normal text-[12px]">{feedItem?.name}</h3>

      <div className="hidden group-hover:block">
        {!pageTypes.isEventPage && images.length > 1 && (
          <ImageCarouselControls
            totalImages={feedItem?.images?.length}
            activeIndex={activeImageIndex}
            setActiveImageIndex={setActiveImageIndex}
          />
        )}
      </div>
    </div>
  </div>
);

const FeedCardActions = ({
  feedItem,
  pageTypes,
  onMapIconClick,
}: {
  feedItem: any;
  pageTypes: {
    isEventPage: boolean;
    isTrailPage: boolean;
  };
  onMapIconClick: (e: React.MouseEvent, id: string) => void;
}) => {
  const handleMapClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMapIconClick(e, feedItem._id);
  };

  return (
    <div className="absolute top-4 flex items-center justify-between w-full px-4">
      <div className="group-hover:flex gap-2.5 hidden">
        <button
          type="button"
          className="custom-cursor border border-transparent hover:border-white rounded-full"
          aria-label="Circular heart"
        >
          <IconImage width={30} height={30} icon="circular-heart" />
        </button>

        {!pageTypes.isEventPage && !pageTypes.isTrailPage && (
          <button
            type="button"
            onClick={handleMapClick}
            className="custom-cursor border border-transparent hover:border-white rounded-full"
            aria-label="Show on map"
          >
            <IconImage width={30} height={30} icon="circular-map-fold" />
          </button>
        )}
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
  );
};

export default FeedCard;
