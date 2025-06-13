"use client";

import Image from "next/image";
import React, { useState } from "react";

interface NextImageProps {
  imgSrc?: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  isFill?: boolean;
  isOptimized?: boolean;
  className?: string;
  skeletonClassName?: string;
}

const NextImage: React.FC<NextImageProps> = ({
  imgSrc,
  alt = "",
  width,
  height,
  quality = 75,
  isFill = false,
  isOptimized = false,
  className = "rounded-xl object-cover",
  skeletonClassName = null,
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const src = hasError || !imgSrc ? "" : imgSrc;

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
        width={isFill ? undefined : width}
        height={isFill ? undefined : height}
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
