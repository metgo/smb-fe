"use client";

import clsx from "clsx";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";

import { IconImage } from "../ui";
import { CardSkeleton } from "../skeletons";
import {
  getCityOrCenter,
  removeInlineStylesFromHTML,
  sanitizeHtml,
} from "@/lib/helpers";
import { useSingleImagePresent } from "@/hooks/image/useSingleImagePresent";
import { INTERSECTION_CONFIG } from "@/lib/animationConfig";
import { staticImages } from "@/constant/staticImages";

interface GalleryViewProps {
  scale: number;
  currentImage: any;
  activeFeedItem: BusinessProps | null;
  geoLocation: { lat: number; long: number };
  onNavigate: (e: React.MouseEvent) => void;
  setActiveIndex: (v: number) => void;
  activeIndex: number;
}

const MobileBusinessFeedGalleryView = ({
  scale,
  currentImage,
  activeFeedItem,
  onNavigate,
}: GalleryViewProps) => {
  // Track device width/height
  const [deviceSize, setDeviceSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setDeviceSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
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

  if (computedValues.shouldShowSkeleton) {
    return (
      <div
        ref={containerRef}
        style={{ width: deviceSize.width, height: deviceSize.height }}
      >
        <CardSkeleton
          width={deviceSize.width}
          height={deviceSize.height}
          primaryCategoryId={
            activeFeedItem?.primaryCategoryId || "6566e31ca77d2a477266d2d6"
          }
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ width: deviceSize.width, height: deviceSize.height }}
    >
      <div
        onClick={onNavigate}
        className={clsx("custom-cursor block relative w-full h-full")}
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

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30 z-10" />

        {/* Content */}
        <div
          className="absolute right-16 left-10 z-20 text-white"
          style={{ marginTop: 230 * scale }}
        >
          <h1
            style={{ fontSize: 60 * scale }}
            className="font-bold line-clamp-2 leading-14"
          >
            {activeFeedItem?.name}
          </h1>
          <div
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(
                removeInlineStylesFromHTML(activeFeedItem?.description || ""),
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
    </div>
  );
};

export default MobileBusinessFeedGalleryView;
