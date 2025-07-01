"use client";

import Image from "next/image";
import React, { useState } from "react";

interface NextImageProps {
  imgSrc?: string;
  alt: string;
  scale?: number;
  width?: number;
  height?: number;
  quality?: number;
  isFill?: boolean;
  isOptimized?: boolean;
  className?: string;
  skeletonClassName?: string;
}
const placeholderImage = "/images/image-placeholder.jpg";

const NextImage: React.FC<NextImageProps> = ({
  imgSrc,
  alt = "",
  width,
  height,
  scale = 1,
  quality = 75,
  isFill = false,
  isOptimized = false,
  className = "rounded-xl object-cover",
  skeletonClassName = null,
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const src = hasError || !imgSrc ? placeholderImage : imgSrc;

  return (
    <>
      {!isImageLoaded && !hasError && (
        <div
          className={`absolute inset-0 shimmer ${skeletonClassName || className}`}
        />
      )}
      <Image
        alt={alt}
        src={src}
        fill={isFill}
        width={isFill ? undefined : width! * scale}
        height={isFill ? undefined : height! * scale}
        quality={quality}
        className={className}
        unoptimized={isOptimized}
        priority={false}
        onLoad={() => setIsImageLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsImageLoaded(true);
        }}
      />
    </>
  );
};

export default NextImage;
