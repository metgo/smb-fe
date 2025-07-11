"use client";

import Image from "next/image";
import { useState } from "react";

import { staticImages } from "@/constant/staticImages";

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
  setIsImageLoaded?: (isLoaded: boolean) => void;
}

const NextImage: React.FC<NextImageProps> = ({
  imgSrc,
  alt = "",
  width,
  height,
  scale = 1,
  quality = 75,
  isFill = false,
  isOptimized = false,
  setIsImageLoaded,
  className = "rounded-xl object-cover",
}) => {
  const [hasError, setHasError] = useState(false);

  const src = hasError || !imgSrc ? staticImages.placeholder : imgSrc;

  return (
    <Image
      alt={alt}
      src={src}
      fill={isFill}
      width={isFill ? undefined : width! * scale}
      height={isFill ? undefined : height! * scale}
      quality={quality}
      className={className}
      unoptimized={!isOptimized}
      priority={false}
      onLoad={() => setIsImageLoaded?.(true)}
      onError={() => {
        setHasError(true);
        setIsImageLoaded?.(false);
      }}
    />
  );
};

export default NextImage;
