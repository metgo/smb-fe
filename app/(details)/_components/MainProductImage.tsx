"use client";

import clsx from "clsx";
import Image from "next/image";

import { useImageCrop } from "@/hooks";
import { CardSkeleton } from "@/components/skeletons";

const width = 575;
const height = 533;

const MainProductImage = ({
  imageItem,
  primaryCategoryId,
}: {
  imageItem: ImageItem;
  primaryCategoryId: string;
}) => {
  const aspectRatio = 575 / 533;
  const {
    finalImageSrc,
    handleImageLoad,
    handleImageError,
    isImageTransitionComplete,
    shouldShowSkeleton,
  } = useImageCrop(imageItem, aspectRatio);

  return (
    <div className="col-span-1 h-[533px]">
      {shouldShowSkeleton && (
        <CardSkeleton
          className="w-full h-full absolute inset-0"
          primaryCategoryId={primaryCategoryId}
        />
      )}

      <div
        className={clsx(
          "relative w-full h-full transition-opacity duration-300",
          isImageTransitionComplete ? "opacity-100" : "opacity-0",
        )}
      >
        <Image
          width={width}
          height={height}
          src={finalImageSrc}
          alt={imageItem?.alt || "Gallery image"}
          className="object-cover w-full h-full rounded-xl ultra-sharp"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    </div>
  );
};

export default MainProductImage;
