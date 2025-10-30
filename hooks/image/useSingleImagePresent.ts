"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { staticImages } from "@/constant/staticImages";
import { handleCropImage } from "@/lib/helpers";

interface ProcessedImage {
  imageUrl: string;
  alt: string;
}

interface UseSingleImagePresentReturn {
  isLoading: boolean;
  isImageLoaded: boolean;
  updatedImage: ProcessedImage;
  setUpdatedImage: React.Dispatch<React.SetStateAction<ProcessedImage>>;
  setIsImageLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  inView: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const useSingleImagePresent = (
  aspectRatio: number,
  image: ImageItem | undefined,
  options: {
    threshold?: number;
    rootMargin?: string;
    enabled?: boolean;
  } = {},
): UseSingleImagePresentReturn => {
  const { threshold = 0.1, rootMargin = "50px", enabled = true } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [inView, setInView] = useState(!enabled);
  const [updatedImage, setUpdatedImage] = useState<ProcessedImage>({
    imageUrl: staticImages.placeholder,
    alt: "Business",
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageCacheRef = useRef<Map<string, ProcessedImage>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  /** ✅ Setup Intersection Observer (lazy loading) */
  useEffect(() => {
    if (!enabled) {
      setInView(true);
      return;
    }

    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observerRef.current?.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observerRef.current.observe(containerRef.current);

    return () => observerRef.current?.disconnect();
  }, [enabled, threshold, rootMargin]);

  /** ✅ Helper: Wait until an image fully loads */
  const waitForImageLoad = useCallback(
    (src: string): Promise<void> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = src;
      }),
    [],
  );

  /** ✅ Core image processor */
  const processImage = useCallback(
    async (img: ImageItem): Promise<ProcessedImage> => {
      const cacheKey = `${img.image}-${aspectRatio}`;
      if (imageCacheRef.current.has(cacheKey)) {
        const cached = imageCacheRef.current.get(cacheKey)!;
        setIsImageLoaded(true);
        return cached;
      }

      let result: ProcessedImage = img?.subCoordinates
        ? await handleCropImage(img, aspectRatio)
        : { imageUrl: img.image, alt: img.alt };

      setIsImageLoaded(false);

      try {
        await waitForImageLoad(result.imageUrl);
        setIsImageLoaded(true);
      } catch (err) {
        console.error("Image failed to load:", result.imageUrl, err);
        result = {
          imageUrl: staticImages.placeholder,
          alt: img.alt || "Business",
        };
        setIsImageLoaded(true);
      }

      // Cache and return
      imageCacheRef.current.set(cacheKey, result);
      return result;
    },
    [aspectRatio, waitForImageLoad],
  );

  /** ✅ Process when image or dependencies change */
  useEffect(() => {
    if (!inView) return;

    let cancelled = false;
    setIsLoading(true);

    if (!image) {
      setIsLoading(false);
      setUpdatedImage({
        imageUrl: staticImages.placeholder,
        alt: "Business Image",
      });
      return () => (cancelled = true);
    }
    processImage(image)
      .then((result) => !cancelled && setUpdatedImage(result))
      .finally(() => !cancelled && setIsLoading(false));

    return () => {
      cancelled = true;
    };
  }, [image, processImage, inView]);

  /** ✅ Cleanup blob URLs on unmount */
  useEffect(() => {
    return () => {
      imageCacheRef.current.forEach((cached) => {
        if (cached.imageUrl.startsWith("blob:")) {
          URL.revokeObjectURL(cached.imageUrl);
        }
      });
    };
  }, []);

  return {
    isLoading,
    updatedImage,
    setUpdatedImage,
    isImageLoaded,
    setIsImageLoaded,
    inView,
    containerRef,
  };
};
