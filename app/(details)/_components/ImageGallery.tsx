"use client";

import clsx from "clsx";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

import { categoryIds } from "@/lib/utils";
import { CardSkeleton } from "@/components/skeletons";
import { useImageScale } from "@/hooks/image/useImageScale";
import {
  getRoundedClass,
  layouts,
  rowsLayout,
} from "@/constant/collageLayouts";
import { staticImages } from "@/constant/staticImages";
import PreviewImageGallaryModal from "./PreviewImageGallaryModal";
import { useSingleImagePresent } from "@/hooks/image/useSingleImagePresent";
import {
  ANIMATION_CONFIG,
  cardVariants,
  INTERSECTION_CONFIG,
  MOTION_CONFIG,
} from "@/lib/animationConfig";

// Main Component
const ImageGallery = ({
  images,
  primaryCategoryId = categoryIds.attraction,
}: {
  images: ImageItem[];
  primaryCategoryId?: string;
}) => {
  const { scale } = useImageScale();
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const imageCount = images?.length;
  const displayCount = Math.min(imageCount, 5); // show up to 5

  const layoutName = `layout${displayCount}`;
  const layout = layouts[layoutName as keyof typeof layouts];
  const columns = rowsLayout[`row${displayCount}` as keyof typeof rowsLayout];

  return (
    <div className="relative w-full h-full">
      <div
        style={{ height: 450 }}
        className="flex gap-2.5 max-sm:hidden md:flex"
      >
        {columns?.map((column, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-2.5 w-full">
            {column?.map((imgIdx) => {
              const { width, height } = layout[imgIdx];
              const rounded = getRoundedClass(layoutName, imgIdx);
              const isLastVisible =
                imgIdx === displayCount - 1 && imageCount > 5;

              return (
                <ImageCard
                  key={`${imgIdx}-${images[imgIdx]?.image || imgIdx}`}
                  width={width}
                  height={height}
                  scale={scale}
                  primaryCategoryId={primaryCategoryId}
                  imageItem={images[imgIdx]}
                  className={rounded}
                  onClick={() => setIsPreviewModalOpen(true)}
                  overlayText={
                    isLastVisible ? `+${imageCount - displayCount}` : undefined
                  }
                />
              );
            })}
          </div>
        ))}
      </div>

      {isPreviewModalOpen && (
        <PreviewImageGallaryModal
          images={images}
          primaryCategoryId={primaryCategoryId}
          setIsOpen={setIsPreviewModalOpen}
        />
      )}
    </div>
  );
};

// ImageCard component
const ImageCard = ({
  width,
  height,
  scale,
  imageItem,
  primaryCategoryId,
  onClick,
  overlayText,
  className,
}: {
  width: number;
  height: number;
  primaryCategoryId: string;
  imageItem: ImageItem;
  scale: number;
  className?: string;
  onClick?: () => void;
  overlayText?: string;
}) => {
  const aspectRatio = (width * scale) / 450;
  // Image loading hook
  const { isLoading, updatedImage, inView, containerRef } =
    useSingleImagePresent(aspectRatio, imageItem, INTERSECTION_CONFIG);

  // Animation controls
  const animationControls = useAnimation();
  const isCardInView = useInView(containerRef, MOTION_CONFIG as any);

  // Animation effect
  useEffect(() => {
    if (isCardInView) {
      animationControls.start("visible");
    }
  }, [isCardInView, animationControls]);

  // Memoized computed values
  const computedValues = useMemo(
    () => ({
      currentImage: updatedImage,
      shouldShowSkeleton: !inView || isLoading,
    }),
    [updatedImage, inView, isLoading, imageItem],
  );

  if (computedValues.shouldShowSkeleton) {
    return (
      <motion.div
        ref={containerRef}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        transition={ANIMATION_CONFIG}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <CardSkeleton
          width={width}
          height={height}
          primaryCategoryId={primaryCategoryId}
          className={className}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      initial="hidden"
      onClick={onClick}
      variants={cardVariants}
      animate={animationControls}
      transition={ANIMATION_CONFIG}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <div
        className={clsx(
          "w-full h-full relative group overflow-hidden custom-cursor",
        )}
      >
        {/* Main Image */}
        <Image
          fill
          src={
            computedValues.currentImage?.imageUrl || staticImages.placeholder
          }
          alt={computedValues.currentImage?.alt || ""}
          unoptimized
          quality={100}
          sizes={`${width}px`}
          className={clsx(
            className,
            "object-cover transition-transform duration-500 ease-in-out ultra-sharp",
          )}
          priority={false}
        />
        {/* Optional overlay for +N images */}
        {overlayText && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-bl-xl">
            <span className="text-white text-3xl font-bold">{overlayText}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ImageGallery;
