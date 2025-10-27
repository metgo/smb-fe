"use client";

import clsx from "clsx";
import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import { useMemo, useState, useEffect } from "react";

import { IconImage } from "../ui";
import { CardSkeleton } from "../skeletons";
import { getCityOrCenter, removeInlineStylesFromHTML } from "@/lib/helpers";
import MobileFeedScreenActionIcons from "./FeedScreenActionIcons.mobile";
import { useSingleImagePresent } from "@/hooks/image/useSingleImagePresent";
import {
  ANIMATION_CONFIG,
  cardVariants,
  INTERSECTION_CONFIG,
} from "@/lib/animationConfig";
import { staticImages } from "@/constant/staticImages";

interface GalleryViewProps {
  scale: number;
  currentImage: any;
  activeFeedItem: BusinessProps | null;
  geoLocation: { lat: number; long: number };
  onNavigate: (e: React.MouseEvent) => void;
}

const MobileBusinessFeedGalleryView = ({
  scale,
  currentImage,
  activeFeedItem,
  geoLocation,
  onNavigate,
}: GalleryViewProps) => {
  const animationControls = useAnimation();

  // Track device width/height
  const [deviceSize, setDeviceSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setDeviceSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateSize(); // Initial size
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const { isLoading, updatedImage, inView, containerRef } =
    useSingleImagePresent(
      deviceSize.width / deviceSize.height,
      activeFeedItem?.images[0],
      INTERSECTION_CONFIG,
    );

  const computedValues = useMemo(
    () => ({
      currentImage: updatedImage,
      shouldShowSkeleton: !inView || isLoading,
    }),
    [updatedImage, inView, isLoading, activeFeedItem],
  );
  console.log(
    "🚀 ~ MobileBusinessFeedGalleryView ~ computedValues:",
    computedValues?.currentImage?.imageUrl,
  );

  if (computedValues.shouldShowSkeleton) {
    return (
      <motion.div
        ref={containerRef}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        transition={ANIMATION_CONFIG}
        style={{ width: deviceSize.width, height: deviceSize.height }}
      >
        <CardSkeleton
          width={deviceSize.width}
          height={deviceSize.height}
          primaryCategoryId={
            activeFeedItem?.primaryCategoryId || "6566e31ca77d2a477266d2d6"
          }
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      initial="hidden"
      variants={cardVariants}
      animate={animationControls}
      transition={ANIMATION_CONFIG}
      style={{ width: deviceSize.width, height: deviceSize.height }}
    >
      <div
        onClick={onNavigate}
        className={clsx(
          "custom-cursor block relative w-full h-full transition-opacity duration-300",
        )}
      >
        <Image
          fill
          priority
          unoptimized
          src={
            computedValues.currentImage?.imageUrl || staticImages.placeholder
          }
          alt={currentImage?.alt || "Feed active image"}
          className="object-cover ultra-sharp"
        />

        <MobileFeedScreenActionIcons
          trailInfo={`?businessId=${activeFeedItem?._id}&slug=${activeFeedItem?.slug}`}
          geoLocation={geoLocation}
          posTop={scale * 140}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30 z-10" />

        {/* Content */}
        <div className="absolute top-50 right-10 left-10 z-20 text-white">
          <h1
            style={{ fontSize: 60 * scale }}
            className="font-bold line-clamp-2 leading-14"
          >
            {activeFeedItem?.name}
          </h1>
          <div
            dangerouslySetInnerHTML={{
              __html: removeInlineStylesFromHTML(
                activeFeedItem?.description || "",
              ),
            }}
            style={{ fontSize: 24 * scale }}
            className="line-clamp-3 font-bold mt-1"
          />
          {activeFeedItem?.serviceType !== "point_of_interest" &&
            activeFeedItem?.address?.city && (
              <div className="flex items-center gap-2 mt-4">
                <IconImage icon="location" width={30} height={30} />
                <span style={{ fontSize: 20 * scale }} className="font-bold">
                  {getCityOrCenter(activeFeedItem?.address)}
                </span>
              </div>
            )}
        </div>
      </div>
    </motion.div>
  );
};

export default MobileBusinessFeedGalleryView;
