"use client";

import clsx from "clsx";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { pathNames } from "@/lib/endpoints";
import { navigationPaths } from "@/lib/utils";
import useGeneralStore from "@/stores/generalStore";
import { startLoading } from "../wrappers/ProgressBar";
import { useImagePresent } from "@/hooks/image/useImagePresent";
import { IconImage, ImageCarouselControls } from "@/components/ui";
import {
  getPrimaryCategoryId,
  removeInlineStylesFromHTML,
} from "@/lib/helpers";
import { googleSendGtmEvent, triggerName } from "@/lib/googleEventsConfig";
import { CardSkeleton } from "../skeletons";
import { staticImages } from "@/constant/staticImages";

const FeedCard = ({ height, width, feedItem }: FeedCardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const isEventPage = pathname === pathNames.events;

  const aspectRatio = width / height;

  const { categoryId = "", subCategoryId = "" } = Object.fromEntries(
    searchParams.entries(),
  );

  const {
    activeCategoryKey,
    activeFilterTab,
    setActiveFilterTab,
    setClickedBusinessId,
  } = useGeneralStore();

  const images = useMemo(
    () => (isEventPage ? [feedItem.cover] : (feedItem?.images ?? [])),
    [isEventPage, feedItem.cover, feedItem?.images],
  );

  const deps = useMemo(
    () => (isEventPage ? [feedItem] : [categoryId, subCategoryId]),
    [isEventPage, feedItem, categoryId, subCategoryId],
  );

  const { isLoading, updatedImageList, inView, containerRef } = useImagePresent(
    aspectRatio,
    images,
    activeImageIndex,
    deps,
    {
      threshold: 0.1, // Trigger when 10% visible
      rootMargin: "50px", // Start loading 50px before entering viewport
      enabled: true, // Enable/disable lazy loading
    },
  );

  const [hasMounted, setHasMounted] = useState(false);

  // Framer Motion setup
  const animationControls = useAnimation();
  const isCardInView = useInView(containerRef, {
    once: true,
    margin: "0px 0px -50px 0px",
  });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (isCardInView) {
      animationControls.start({ y: 0, opacity: 1 });
    }
  }, [isCardInView, animationControls]);

  const primaryCategoryId = getPrimaryCategoryId(
    pathname,
    activeCategoryKey,
    feedItem.primaryCategoryId ?? "",
  );

  const currentImage = updatedImageList?.[activeImageIndex];
  const shouldShowSkeleton = !hasMounted || !inView || isLoading;

  function handleMapIconClick(id: string) {
    setClickedBusinessId(id);
    setActiveFilterTab("map");
  }

  const handleMouseEnter = () => {
    if (activeFilterTab === "integrated" && pathname === pathNames.trails) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("slug", feedItem.slug);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const handleMouseLeave = () => {
    if (activeFilterTab === "integrated" && pathname === pathNames.trails) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("slug");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  function handleNavigation() {
    startLoading();
    googleSendGtmEvent(triggerName.navigateToBusiness, {
      bussinessId: feedItem._id,
      bussinessName: feedItem.name,
    });
    router.push(`${navigationPaths[pathname]}/${feedItem.slug}`);
  }

  return (
    <motion.div
      ref={containerRef}
      style={{ width: `${width}px`, height: `${height}px` }}
      initial={{ y: 50, opacity: 1 }}
      animate={animationControls}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {shouldShowSkeleton ? (
        <CardSkeleton
          width={width}
          height={height}
          primaryCategoryId={primaryCategoryId}
        />
      ) : (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleNavigation}
          className="w-full h-full relative group rounded-xl overflow-hidden custom-cursor"
        >
          {/* Main Image */}
          <Image
            src={
              currentImage?.imageUrl
                ? currentImage?.imageUrl
                : staticImages.placeholder
            }
            alt={currentImage?.alt || ""}
            fill
            unoptimized
            quality={100}
            sizes={`${width}px`}
            className={clsx(
              "object-cover transition-opacity duration-400 ultra-sharp",
              shouldShowSkeleton ? "opacity-0" : "opacity-100",
            )}
            priority={false}
          />

          {/* Content Overlay */}
          <div className="relative w-full h-full">
            {/* Gradient Overlay (only bottom 50%) */}
            <div className="absolute bottom-0 right-0 h-1/2 w-full bg-gradient-to-t from-black/40 to-transparent rounded-b-xl" />

            {/* Text Content */}
            <div className="absolute bottom-0 right-0 p-4 text-white font-bold w-full">
              <h3 className="lg:text-[1rem] 3xl:text-[1.5rem] line-clamp-1">
                {feedItem?.name}
              </h3>
              <div className="flex items-center gap-2">
                <IconImage icon="location" width={20} height={20} />
                <span className="md:text-sm">
                  {feedItem?.address?.location
                    ? feedItem?.address?.location
                    : "Tel Aviv"}
                </span>
              </div>
              <div className="hidden group-hover:block">
                <div
                  dangerouslySetInnerHTML={{
                    __html: removeInlineStylesFromHTML(feedItem?.description),
                  }}
                  className="line-clamp-2 font-bold text-[12px] text-white mt-1"
                />
                {!isEventPage && images.length > 1 && (
                  <ImageCarouselControls
                    totalImages={feedItem?.images?.length}
                    activeIndex={activeImageIndex}
                    setActiveImageIndex={setActiveImageIndex}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Action Icons */}
          <div className="hidden absolute top-4 right-4 group-hover:flex items-center gap-2.5">
            <IconImage width={30} height={30} icon="circular-heart" />
            {!isEventPage && pathname !== "/trails" && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleMapIconClick(feedItem._id);
                }}
              >
                <IconImage width={30} height={30} icon="circular-map-fold" />
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FeedCard;
