"use client";

import clsx from "clsx";
import Image from "next/image";
import { FaHeart } from "react-icons/fa6";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, useInView, useAnimation } from "framer-motion";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";

import { categoryIds, navigationPathsByServiceType } from "@/lib/utils";
import useGeneralStore from "@/stores/generalStore";
import { startLoading } from "../wrappers/ProgressBar";
import { IconImage, ImageCarouselControls } from "@/components/ui";
import {
  getCityOrCenter,
  getPrimaryCategoryId,
  removeInlineStylesFromHTML,
} from "@/lib/helpers";
import { googleSendGtmEvent, triggerName } from "@/lib/googleEventsConfig";
import { CardSkeleton } from "../skeletons";
import { staticImages } from "@/constant/staticImages";
import {
  ANIMATION_CONFIG,
  cardVariants,
  MOTION_CONFIG,
} from "@/lib/animationConfig";
import useFavoriteFeedItemStore from "@/stores/favoriteFeedItemStore";

interface FeedCardProps {
  height: number;
  width: number;
  feedItem: any;
}

const FeedCard = ({ height, width, feedItem }: FeedCardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false); // Changed from imageLoading to imageLoaded
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const { setActiveFilterTab, setClickedBusinessId } = useGeneralStore();
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

  // Get images directly from feedItem
  const images = useMemo(() => feedItem?.images ?? [], [feedItem?.images]);

  // Animation controls
  const animationControls = useAnimation();
  const isCardInView = useInView(containerRef, MOTION_CONFIG as any);

  // Mount effect
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Reset image loaded state when activeImageIndex changes
  useEffect(() => {
    setImageLoaded(false);
  }, [activeImageIndex]);

  // Check if image is already loaded (cached)
  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      setImageLoaded(true);
    }
  }, [activeImageIndex]);

  // Animation effect
  useEffect(() => {
    if (isCardInView) {
      animationControls.start("visible");
    }
  }, [isCardInView, animationControls]);

  // Add this useEffect as a safety fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!imageLoaded) {
        setImageLoaded(true);
      }
    }, 500); // 5 msecond timeout

    return () => clearTimeout(timer);
  }, [imageLoaded]);

  // Memoized computed values
  const computedValues = useMemo(
    () => ({
      primaryCategoryId: getPrimaryCategoryId(
        pathname,
        urlParams.activeCategoryKey || "",
        feedItem.primaryCategoryId!,
      ),
      currentImage: images?.[activeImageIndex],
      shouldShowSkeleton: !hasMounted || !imageLoaded, // Changed to check !imageLoaded
      locationText: getCityOrCenter(feedItem?.address),
    }),
    [
      pathname,
      urlParams.activeCategoryKey,
      feedItem.primaryCategoryId,
      feedItem?.address,
      images,
      activeImageIndex,
      hasMounted,
      imageLoaded, // Changed to imageLoaded
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

  // Handle image load
  const handleImageLoad = useCallback(() => {
    console.log("Image loaded successfully");
    setImageLoaded(true);
  }, []);

  // Handle image error
  const handleImageError = useCallback(() => {
    console.log("Image failed to load");
    setImageLoaded(true); // Set to true even on error to show fallback
  }, []);

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
          ref={imageRef}
          src={computedValues.currentImage?.image || staticImages.placeholder}
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
          onLoad={handleImageLoad}
          onError={handleImageError}
          onLoadingComplete={() => {
            console.log("Next.js loading complete");
            setImageLoaded(true);
          }}
        />

        {/* Content Overlay */}
        <FeedCardContent
          feedItem={feedItem}
          images={images}
          activeImageIndex={activeImageIndex}
          setActiveImageIndex={setActiveImageIndex}
        />

        {/* Action Icons */}
        <FeedCardActions
          feedItem={feedItem}
          onMapIconClick={handleMapIconClick}
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

// Extracted sub-components remain the same...

// Extracted sub-components for better organization
const FeedCardContent = ({
  feedItem,
  images,
  activeImageIndex,
  setActiveImageIndex,
}: {
  feedItem: any;
  images: any[];
  activeImageIndex: number;
  setActiveImageIndex: React.Dispatch<React.SetStateAction<number>>;
}) => (
  <div className="relative w-full h-full">
    {/* Gradient Overlay */}
    <div className="absolute bottom-0 right-0 h-full w-full bg-gradient-to-t from-black/40 via-black/30 to-black/5 rounded-b-xl" />

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
        {images.length > 1 && (
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
  onMapIconClick,
  addFavoriteFeedItemId,
  favoriteFeedItemIds,
}: {
  feedItem: any;
  favoriteFeedItemIds: string[];
  addFavoriteFeedItemId: (feedId: string) => void;
  onMapIconClick: (e: React.MouseEvent, id: string) => void;
}) => {
  const handleMapClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMapIconClick(e, feedItem._id);
  };

  return (
    <div className="absolute top-2 flex items-center justify-between w-full px-4">
      <div className="group-hover:flex gap-2.5 hidden mt-1">
        <button
          type="button"
          className="custom-cursor border border-transparent hover:border-white rounded-full"
          aria-label="Circular heart"
          onClick={() => addFavoriteFeedItemId(feedItem._id)}
        >
          {favoriteFeedItemIds.includes(feedItem._id) ? (
            <div className="h-7.5 w-7.5 p-1 bg-black/20 rounded-full flex items-center justify-center">
              <FaHeart size={16} className="text-white" />
            </div>
          ) : (
            <IconImage width={30} height={30} icon="circular-heart" />
          )}
        </button>

        <button
          type="button"
          onClick={handleMapClick}
          className="custom-cursor border border-transparent hover:border-white rounded-full"
          aria-label="Show on map"
        >
          <IconImage width={30} height={30} icon="circular-map-fold" />
        </button>
      </div>
      {feedItem.serviceType === "point_of_interest" && (
        <div className="bg-[#29C368] flex items-center justify-center absolute left-[11px] top-1 text-white text-[12px] font-bold px-3 py-1.5 rounded-md">
          <span>{"נקודת עניין"}</span>
        </div>
      )}
      {feedItem.serviceType === "event" && (
        <div className="bg-[#B471B5] flex items-center justify-center absolute left-[11px] top-1 text-white text-[12px] font-bold px-3 py-1.5 rounded-md">
          <span>{"אירוע"}</span>
        </div>
      )}
      {feedItem.serviceType === "trip" && (
        <div className="bg-[#FEBF3A] flex items-center justify-center absolute left-[11px] top-1 text-white text-[12px] font-bold px-3 py-1.5 rounded-md">
          <span>{"מסלול"}</span>
        </div>
      )}
      {feedItem.serviceType === "funday" && (
        <div className="bg-[#4C95D8] flex items-center justify-center absolute left-[11px] top-1 text-white text-[12px] font-bold px-3 py-1.5 rounded-md">
          <span>{"יום גיבוש"}</span>
        </div>
      )}
    </div>
  );
};

export default FeedCard;
