"use client";

import { staticImages } from "@/constant/staticImages";
import Image from "next/image";
import React, { useState, useRef } from "react";

interface NextImageProps {
  imgSrc?: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  isFill?: boolean;
  isOptimized?: boolean;
  className?: string;
  preserveTextQuality?: boolean;
  objectFit?: "contain" | "cover" | "fill" | "scale-down" | "auto";
}

const NextImage: React.FC<NextImageProps> = ({
  imgSrc,
  alt = "",
  width,
  height,
  quality = 100,
  isFill = false,
  isOptimized = false,
  className = "rounded-xl",
  preserveTextQuality = true,
  objectFit = "fill",
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const src = hasError || !imgSrc ? staticImages.placeholder : imgSrc;

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    setImageAspectRatio(aspectRatio);
    setIsImageLoaded(true);
  };

  // Determine the best object-fit based on conditions
  const getObjectFit = () => {
    if (objectFit !== "auto") return objectFit;

    if (preserveTextQuality) {
      return "contain"; // Best for text readability
    }

    if (imageAspectRatio && width && height) {
      const containerAspectRatio = width / height;
      const aspectDifference = Math.abs(
        imageAspectRatio - containerAspectRatio,
      );

      // If aspect ratios are similar, use cover; otherwise use contain
      return aspectDifference < 0.2 ? "cover" : "contain";
    }

    return "cover"; // Default fallback
  };

  const finalClassName = `${className} ${
    isImageLoaded ? `object-${getObjectFit()}` : ""
  }`;

  return (
    <Image
      ref={imgRef}
      alt={alt}
      src={src}
      fill={isFill}
      width={isFill ? undefined : width}
      height={isFill ? undefined : height}
      quality={preserveTextQuality ? 100 : quality} // Higher quality for text
      className={finalClassName}
      unoptimized={isOptimized}
      priority={false}
      onLoad={handleImageLoad}
      onError={() => {
        setHasError(true);
        setIsImageLoaded(true);
      }}
      style={{
        // Additional CSS for better text rendering
        imageRendering: preserveTextQuality ? "auto" : "auto",
        ...(preserveTextQuality && {
          filter: "contrast(1.05) brightness(1.02)",
        }),
      }}
    />
  );
};

export default NextImage;
