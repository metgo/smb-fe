"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { pathNames } from "@/lib/endpoints";
import { navigationPaths } from "@/lib/utils";
import useGeneralStore from "@/stores/generalStore";
import { CardSkeleton } from "@/components/skeletons";
import { startLoading } from "../wrappers/ProgressBar";
import { useImagePresent } from "@/hooks/image/useImagePresent";
import { IconImage, ImageCarouselControls, NextImage } from "@/components/ui";
import {
  getPrimaryCategoryId,
  removeInlineStylesFromHTML,
} from "@/lib/helpers";
import { googleSendGtmEvent, triggerName } from "@/lib/googleEventsConfig";

const FeedCard = ({ height, width, feedItem }: FeedCardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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
  const { isLoading, isImageLoaded, updatedImageList } = useImagePresent(
    aspectRatio,
    feedItem?.images,
    activeImageIndex,
    [categoryId, subCategoryId],
  );

  const [hasMounted, setHasMounted] = useState(false);
  // Framer Motion setup
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });
  const controls = useAnimation();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (isInView) {
      controls.start({ y: 0, opacity: 1 });
    }
  }, [isInView, controls]);

  const primaryCategoryId = getPrimaryCategoryId(
    pathname,
    activeCategoryKey,
    feedItem.primaryCategoryId ?? "",
  );

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
      ref={ref}
      style={{ width: `${width}px`, height: `${height}px` }}
      initial={{ y: 0, opacity: 1 }}
      animate={controls}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {isLoading || !hasMounted || !isImageLoaded ? (
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
          <NextImage
            isFill
            quality={100}
            width={width}
            height={height}
            alt={updatedImageList?.[activeImageIndex]?.alt}
            imgSrc={updatedImageList?.[activeImageIndex]?.imageUrl}
            objectFit="cover"
            className=" h-full w-full rounded-xl object-cover"
          />
          <div className="relative w-full h-full">
            {/* Overlay (only bottom 50%) */}
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
                  className=" line-clamp-2 font-bold text-[12px] text-white mt-1"
                />
                <ImageCarouselControls
                  totalImages={feedItem?.images?.length}
                  activeIndex={activeImageIndex}
                  setActiveImageIndex={setActiveImageIndex}
                />
              </div>
            </div>
          </div>

          <div className="hidden absolute top-4 right-4 group-hover:flex items-center gap-2.5">
            <IconImage width={30} height={30} icon="circular-heart" />
            {pathname !== "/events" && pathname !== "/trails" && (
              <IconImage
                width={30}
                height={30}
                icon="circular-map-fold"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleMapIconClick(feedItem._id);
                }}
              />
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FeedCard;
