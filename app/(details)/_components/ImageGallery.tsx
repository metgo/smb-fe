"use client";

import clsx from "clsx";
import Image from "next/image";
import { useEffect, useState } from "react";

import { categoryIds } from "@/lib/utils";
import { staticImages } from "@/constant/staticImages";
import { CardSkeleton } from "@/components/skeletons";
import { useImageScale } from "@/hooks/image/useImageScale";
import {
  getRoundedClass,
  layouts,
  rowsLayout,
} from "@/constant/collageLayouts";
import { handleCropImage } from "@/lib/helpers";

// ImageCard component
const ImageCard = ({
  width,
  height,
  scale,
  imageItem,
  className = "",
  primaryCategoryId,
}: {
  width: number;
  height: number;
  primaryCategoryId: string;
  imageItem: ImageItem;
  scale: number;
  className?: string;
}) => {
  const aspectRatio = (width * scale) / 450;
  const [imageError, setImageError] = useState(false);
  const [isImageTransitionComplete, setIsImageTransitionComplete] =
    useState(false);

  const [croppedImage, setCroppedImage] = useState<{
    imageUrl: string;
    alt: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const cropImage = async () => {
    setLoading(true);
    const result = await handleCropImage(imageItem, aspectRatio);
    setCroppedImage(result);
    setLoading(false);
  };

  useEffect(() => {
    cropImage();
  }, [imageItem]);

  // Reset states when imageItem changes
  useEffect(() => {
    setImageError(false);
    setIsImageTransitionComplete(false);
  }, [imageItem]);

  // Determine when to show skeleton

  const handleImageLoad = () => {
    setImageError(false);
    // Small delay to ensure image is fully rendered
    setTimeout(() => setIsImageTransitionComplete(true), 50);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsImageTransitionComplete(true);
  };

  const finalImageSrc =
    imageError || !croppedImage?.imageUrl
      ? staticImages.placeholder
      : croppedImage?.imageUrl;

  return (
    <div
      style={{
        width: Math.round(width * scale),
        height: height > 450 ? 450 : height,
        overflow: "hidden",
      }}
      className={clsx("relative flex-initial", className)}
    >
      {/* Skeleton shown while cropping OR image still loading */}
      {(loading || !isImageTransitionComplete) && (
        <CardSkeleton
          className="w-full h-full absolute inset-0"
          primaryCategoryId={primaryCategoryId}
        />
      )}

      {/* Image container */}
      <div
        className={clsx(
          "relative w-full h-full transition-opacity duration-300",
          isImageTransitionComplete ? "opacity-100" : "opacity-0",
        )}
      >
        <Image
          width={width}
          height={height}
          alt={croppedImage?.alt || "Gallery image"}
          src={finalImageSrc}
          className="object-cover w-full h-full"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    </div>
  );
};

const ImageGallery = ({
  images,
  primaryCategoryId = categoryIds.attraction,
}: {
  images: ImageItem[];
  primaryCategoryId?: string;
}) => {
  const { scale } = useImageScale();
  const imageCount = images?.length;

  const layoutName = `layout${imageCount}`;
  const layout = layouts[layoutName as keyof typeof layouts];
  const columns = rowsLayout[`row${imageCount}` as keyof typeof rowsLayout];

  if (!images || images.length === 0) {
    return (
      <div style={{ height: 450 }} className="flex gap-2.5">
        <CardSkeleton
          className="w-full h-full"
          primaryCategoryId={primaryCategoryId}
        />
      </div>
    );
  }

  return (
    <div style={{ height: 450 }} className="flex gap-2.5">
      {columns?.map((column, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-2.5 w-full">
          {column?.map((imgIdx) => {
            const { width, height } = layout[imgIdx];
            const rounded = getRoundedClass(layoutName, imgIdx);

            return (
              <ImageCard
                key={`${imgIdx}-${images[imgIdx]?.image || imgIdx}`}
                width={width}
                height={height}
                scale={scale}
                primaryCategoryId={primaryCategoryId}
                imageItem={images[imgIdx]}
                className={rounded}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;
