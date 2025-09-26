"use client";

import clsx from "clsx";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useInView, useAnimation } from "framer-motion";
import { useEffect, useState, useMemo, useCallback } from "react";

import { pathNames } from "@/lib/endpoints";
import { navigationPaths } from "@/lib/utils";
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

// Animation variants for better performance
const cardVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const ANIMATION_CONFIG = {
  duration: 0.5,
  ease: "easeOut" as const,
};

const INTERSECTION_CONFIG = {
  threshold: 0.1,
  rootMargin: "50px",
  enabled: true,
};

const MOTION_CONFIG = {
  once: true,
  margin: "0px 0px -50px 0px",
};

interface FeedCardProps {
  height: number;
  width: number;
  feedItem: any; // Replace with proper type
}

const FeedCard = ({ height, width, feedItem }: FeedCardProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);

  const { isCurrentPage } = useCommonHook();
  const { activeFilterTab, setActiveFilterTab, setClickedBusinessId } =
    useGeneralStore();

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
    width / height, // aspectRatio
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
    ],
  );

  // Event handlers
  const handleMapIconClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      e.preventDefault();
      setClickedBusinessId(id);
      setActiveFilterTab("map");
    },
    [setClickedBusinessId, setActiveFilterTab],
  );

  const handleTrailMouseActions = useCallback(
    (action: "enter" | "leave") => {
      if (activeFilterTab !== "integrated" || !pageTypes.isTrailPage) return;

      const params = new URLSearchParams(searchParams.toString());
      if (action === "enter") {
        params.set("slug", feedItem.slug);
      } else {
        params.delete("slug");
      }
      router.replace(`${window.location.pathname}?${params.toString()}`, {
        scroll: false,
      });
    },
    [
      activeFilterTab,
      pageTypes.isTrailPage,
      searchParams,
      feedItem.slug,
      router,
    ],
  );

  const handleNavigation = useCallback(() => {
    startLoading();
    googleSendGtmEvent(triggerName.navigateToBusiness, {
      bussinessId: feedItem._id,
      bussinessName: feedItem.name,
    });
    router.push(
      `${navigationPaths[window.location.pathname]}/${feedItem.slug}`,
    );
  }, [feedItem._id, feedItem.name, feedItem.slug, router]);

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
        onMouseEnter={() => handleTrailMouseActions("enter")}
        onMouseLeave={() => handleTrailMouseActions("leave")}
        onClick={handleNavigation}
        className={clsx(
          "w-full h-full relative group rounded-xl overflow-hidden custom-cursor",
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
          locationText={computedValues.locationText}
        />

        {/* Action Icons */}
        <FeedCardActions
          feedItem={feedItem}
          pageTypes={pageTypes}
          onMapIconClick={handleMapIconClick}
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
  locationText,
}: {
  feedItem: any;
  pageTypes: {
    isEventPage: boolean;
    isTrailPage: boolean;
  };
  images: any[];
  activeImageIndex: number;
  setActiveImageIndex: React.Dispatch<React.SetStateAction<number>>;

  locationText: string | undefined;
}) => (
  <div className="relative w-full h-full">
    {/* Gradient Overlay */}
    <div className="absolute bottom-0 right-0 h-1/2 w-full bg-gradient-to-t from-black/50 to-transparent rounded-b-xl" />

    {/* Text Content */}
    <div className="absolute bottom-0 right-0 p-4 text-white font-bold w-full">
      <h3 className="lg:text-[1rem] 3xl:text-[1.5rem] line-clamp-1">
        {feedItem?.name}
      </h3>

      {feedItem?.serviceType !== "point_of_interest" && (
        <div className="flex items-center gap-2">
          <IconImage icon="location" width={20} height={20} />
          <span className="md:text-sm">{locationText}</span>
        </div>
      )}

      <div className="hidden group-hover:block">
        <div
          dangerouslySetInnerHTML={{
            __html: removeInlineStylesFromHTML(feedItem?.description),
          }}
          className="line-clamp-2 font-bold text-[12px] text-white mt-1"
        />

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
}) => (
  <div className="hidden absolute top-4 group-hover:flex items-center justify-between  w-full px-4">
    <div className="flex gap-2.5">
      <IconImage width={30} height={30} icon="circular-heart" />
      {!pageTypes.isEventPage && !pageTypes.isTrailPage && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onMapIconClick(e, feedItem._id);
          }}
        >
          <IconImage width={30} height={30} icon="circular-map-fold" />
        </div>
      )}
    </div>
    {feedItem.serviceType === "point_of_interest" && (
      <div className="bg-black/35 rounded-full p-1 flex items-center justify-center">
        <IconImage width={23} height={23} icon="global-white" />
      </div>
    )}
  </div>
);

export default FeedCard;
