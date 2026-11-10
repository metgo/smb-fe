import clsx from "clsx";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

import { CardSkeleton } from "../skeletons";
import { staticImages } from "@/constant/staticImages";
import { useSingleImagePresent } from "@/hooks/image/useSingleImagePresent";
import {
  ANIMATION_CONFIG,
  cardVariants,
  INTERSECTION_CONFIG,
  MOTION_CONFIG,
} from "@/lib/animationConfig";

interface FeedCardProps {
  height: number;
  width: number;
  feedItem: ImageItem;
  onClick: () => void;
  primaryCategoryId: string;
}

const GalleryImageCard = ({
  height,
  width,
  feedItem,
  onClick,
  primaryCategoryId,
}: FeedCardProps) => {
  const [hasMounted, setHasMounted] = useState(false);

  // Image loading hook
  const { isLoading, updatedImage, inView, containerRef } =
    useSingleImagePresent(width / height, feedItem, INTERSECTION_CONFIG);

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
      currentImage: updatedImage,
      shouldShowSkeleton: !hasMounted || !inView || isLoading,
    }),
    [updatedImage, hasMounted, inView, isLoading, feedItem],
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
      onClick={onClick}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <div
        className={clsx(
          "w-full h-full relative group rounded-xl overflow-hidden custom-cursor",
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
            "object-cover transition-transform duration-500 ease-in-out ultra-sharp",
            "group-hover:scale-140",
          )}
          priority={false}
        />
      </div>
    </motion.div>
  );
};

export default GalleryImageCard;
