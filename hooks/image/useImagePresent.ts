"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { staticImages } from "@/constant/staticImages";
import { handleCropImage } from "@/lib/helpers";

function getPrimaryImgObj(images: ImageItem[]): ImageItem | undefined {
  return images?.find((item) => item?.isPrimary);
}

type ImageInput = ImageItem[] | ImageItem;

interface UseImagePresentReturn {
  isLoading: boolean;
  isImageLoaded: boolean;
  updatedImage: { imageUrl: string; alt: string };
  updatedImageList: { _id: number; imageUrl: string; alt: string }[];
  setUpdatedImage: React.Dispatch<
    React.SetStateAction<{ imageUrl: string; alt: string }>
  >;
  setIsImageLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  inView: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const useImagePresent = (
  aspectRatio: number,
  imagesInput: ImageInput,
  activeImageIndex: number,
  dependencies: any[] = [],
  options: {
    threshold?: number;
    rootMargin?: string;
    enabled?: boolean;
  } = {},
): UseImagePresentReturn => {
  const { threshold = 0.1, rootMargin = "50px", enabled = true } = options;

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL LOGIC
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [inView, setInView] = useState(!enabled);
  const [updatedImage, setUpdatedImage] = useState({
    imageUrl: staticImages.placeholder,
    alt: "Business",
  });
  const [updatedImageList, setUpdatedImageList] = useState<
    { _id: number; imageUrl: string; alt: string }[]
  >([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const processedIndexesRef = useRef<Set<number>>(new Set());
  const imageCacheRef = useRef<Map<string, { imageUrl: string; alt: string }>>(
    new Map(),
  );
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Memoize dependencies to prevent unnecessary re-renders
  const depsKey = useMemo(() => {
    try {
      return JSON.stringify(dependencies);
    } catch {
      return String(dependencies?.length || 0);
    }
  }, [dependencies]);

  // Utility: wait until an image URL is fully loaded
  const waitForImageLoad = useCallback(
    (src: string): Promise<void> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = (err) => reject(err);
        img.src = src;
      }),
    [],
  );

  const processImage = useCallback(
    async (image: ImageItem, idx?: number) => {
      const cacheKey = `${image.image}-${aspectRatio}`;
      if (imageCacheRef.current.has(cacheKey)) {
        const cached = imageCacheRef.current.get(cacheKey)!;
        setIsImageLoaded(true);
        return cached;
      }

      const hasValidCoordinates =
        image?.subCoordinates &&
        (image.subCoordinates.xMax !== 0 ||
          image.subCoordinates.xMin !== 0 ||
          image.subCoordinates.yMax !== 0 ||
          image.subCoordinates.yMin !== 0);

      let result = hasValidCoordinates
        ? await handleCropImage(image, aspectRatio)
        : { imageUrl: image.image, alt: image.alt };

      setIsImageLoaded(false);
      try {
        await waitForImageLoad(result.imageUrl);
        setIsImageLoaded(true);
      } catch (err) {
        result = {
          imageUrl: staticImages.placeholder,
          alt: image.alt || "Business",
        };
        console.error("Image failed to load:", result.imageUrl, err);
        setIsImageLoaded(true);
      }

      if (typeof idx === "number") {
        setUpdatedImageList((prev) => {
          if (prev.some((i) => i._id === idx)) return prev;
          return [...prev, { _id: idx, ...result }];
        });
        processedIndexesRef.current.add(idx);
      }

      return result;
    },
    [aspectRatio, waitForImageLoad],
  );

  // Setup Intersection Observer
  useEffect(() => {
    if (!enabled) {
      setInView(true);
      return;
    }

    const currentRef = containerRef.current;
    if (!currentRef) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    observerRef.current.observe(currentRef);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [enabled, threshold, rootMargin]);

  // Handle active image switching (only when in view)
  useEffect(() => {
    if (!inView || !Array.isArray(imagesInput) || imagesInput.length === 0) {
      return;
    }

    if (
      activeImageIndex == null ||
      processedIndexesRef.current.has(activeImageIndex)
    ) {
      return;
    }

    const imageToProcess = imagesInput[activeImageIndex];
    if (!imageToProcess) return;

    let cancelled = false;
    setIsLoading(true);

    processImage(imageToProcess, activeImageIndex).finally(() => {
      if (!cancelled) {
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [activeImageIndex, imagesInput, processImage, inView]);

  // Handle primary/initial image processing
  useEffect(() => {
    if (!inView || !imagesInput) {
      return;
    }

    if (Array.isArray(imagesInput) && imagesInput.length === 0) {
      return;
    }

    const imageToProcess = Array.isArray(imagesInput)
      ? getPrimaryImgObj(imagesInput) || imagesInput[0]
      : imagesInput;

    if (!imageToProcess) return;

    let cancelled = false;
    setIsLoading(true);

    processImage(imageToProcess)
      .then((result) => {
        if (!cancelled) {
          setUpdatedImage(result);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [imagesInput, processImage, inView, depsKey]);

  // Cleanup object URLs on unmount
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
    updatedImageList,
    inView,
    containerRef,
  };
};
