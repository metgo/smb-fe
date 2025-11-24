"use client";

import clsx from "clsx";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useInView, useAnimation } from "framer-motion";
import { useEffect, useState, useMemo, useCallback } from "react";

import { pathNames } from "@/lib/endpoints";
import { navigationPathsByServiceType } from "@/lib/utils";
import { startLoading } from "../wrappers/ProgressBar";
import { useImagePresent } from "@/hooks/image/useImagePresent";
import { IconImage } from "@/components/ui";
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

const FeedCardMobile = ({ height, width, feedItem }: FeedCardProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasMounted, setHasMounted] = useState(false);

  const { isCurrentPage } = useCommonHook();

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
    0,
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
      currentImage: updatedImageList?.[0],
      shouldShowSkeleton: !hasMounted || !inView || isLoading,
      locationText: getCityOrCenter(feedItem?.address),
    }),
    [
      urlParams.activeCategoryKey,
      feedItem.primaryCategoryId,
      feedItem?.address,
      updatedImageList,
      hasMounted,
      inView,
      isLoading,
      feedItem,
    ],
  );

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
        <FeedCardContent feedItem={feedItem} />
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
const FeedCardContent = ({ feedItem }: { feedItem: any }) => (
  <div className="relative w-full h-full overflow-hidden">
    {/* Gradient Overlay */}
    <div className="absolute bottom-0 right-0 h-full w-full bg-gradient-to-tl from-black/80 via-black/40 to-black/20 rounded-b-xl" />

    {/* Text Content */}
    <div className="absolute bottom-0 right-0 px-2 py-4 text-white font-bold w-full">
      <div
        className="line-clamp-1"
        dangerouslySetInnerHTML={{
          __html: removeInlineStylesFromHTML(
            feedItem?.shortDescription || feedItem?.description,
          ),
        }}
      />
      <h3 className="line-clamp-1 font-normal text-[12px]">{feedItem?.name}</h3>
    </div>

    <div className="absolute top-2 left-0">
      {feedItem?.serviceType === "point_of_interest" && (
        <div className="bg-black/50 rounded-full p-1 flex items-center justify-center absolute left-[8px] top-[1px] w-7 h-7">
          <IconImage width={20} height={20} icon="location-solid" />
        </div>
      )}
      {feedItem?.serviceType === "event" && (
        <div className="bg-black/50 rounded-full p-1 flex items-center justify-center absolute left-[8px] top-[1px] w-7 h-7">
          <IconImage width={16} height={16} icon="event" />
        </div>
      )}
      {feedItem?.serviceType === "trip" && (
        <div className="bg-black/50 rounded-full p-1 flex items-center justify-center absolute left-[8px] top-[1px] w-7 h-7">
          <IconImage width={16} height={16} icon="trip" />
        </div>
      )}
      {feedItem?.serviceType === "funday" && (
        <div className="bg-black/50 rounded-full p-1 flex items-center justify-center absolute left-[8px] top-[1px] w-7 h-7">
          <IconImage width={16} height={16} icon="kite-white" />
        </div>
      )}
    </div>
  </div>
);

export default FeedCardMobile;
