"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { staticImages } from "@/constant/staticImages";
import { handleCropImage } from "@/lib/helpers";

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
  const hasProcessedRef = useRef(false);
  const previousImagesHashRef = useRef<string>("");

  // Memoize dependencies to prevent unnecessary re-renders
  const depsKey = useMemo(() => {
    try {
      return JSON.stringify(dependencies);
    } catch {
      return String(dependencies?.length || 0);
    }
  }, [dependencies]);

  // Generate a hash for the images input to detect changes
  const imagesHash = useMemo(() => {
    if (!imagesInput) return "";

    try {
      if (Array.isArray(imagesInput)) {
        return JSON.stringify(
          imagesInput.map((img) => ({
            image: img.image,
            alt: img.alt,
            subCoordinates: img.subCoordinates,
          })),
        );
      } else {
        return JSON.stringify({
          image: imagesInput.image,
          alt: imagesInput.alt,
          subCoordinates: imagesInput.subCoordinates,
        });
      }
    } catch {
      return String(imagesInput);
    }
  }, [imagesInput]);

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
    async (
      image: ImageItem,
      idx?: number,
    ): Promise<{ _id: number; imageUrl: string; alt: string }> => {
      const cacheKey = `${image.image}_${aspectRatio}`;

      // Check cache first
      if (imageCacheRef.current.has(cacheKey)) {
        const cached = imageCacheRef.current.get(cacheKey)!;
        return { _id: idx ?? 0, ...cached };
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

      try {
        await waitForImageLoad(result.imageUrl);
      } catch (err) {
        console.log(err);
        result = {
          imageUrl: staticImages.placeholder,
          alt: image.alt || "Business",
        };
      }

      const processedImage = { _id: idx ?? 0, ...result };

      // Cache the result
      imageCacheRef.current.set(cacheKey, {
        imageUrl: result.imageUrl,
        alt: result.alt,
      });

      if (typeof idx === "number") {
        processedIndexesRef.current.add(idx);
      }

      return processedImage;
    },
    [aspectRatio, waitForImageLoad],
  );

  // Process all images - prioritize index 0
  const processAllImages = useCallback(async () => {
    if (!Array.isArray(imagesInput) || imagesInput.length === 0) return;

    // Skip processing if already processed the same images
    if (
      hasProcessedRef.current &&
      previousImagesHashRef.current === imagesHash
    ) {
      setIsImageLoaded(true);
      return;
    }

    setIsLoading(true);
    setIsImageLoaded(false);

    try {
      // Process primary image (index 0) first
      const primaryImage = await processImage(imagesInput[0], 0);

      // Update state immediately with primary image
      setUpdatedImageList([primaryImage]);
      setUpdatedImage({
        imageUrl: primaryImage.imageUrl,
        alt: primaryImage.alt,
      });

      // Set loading to false as soon as primary image is ready
      setIsLoading(false);

      // Continue processing remaining images in background
      if (imagesInput.length > 1) {
        const remainingPromises = imagesInput
          .slice(1)
          .map((image, index) => processImage(image, index + 1));

        const remainingImages = await Promise.all(remainingPromises);

        // Update the full list with all images
        setUpdatedImageList([primaryImage, ...remainingImages]);
      }

      setIsImageLoaded(true);

      // Mark as processed and store the hash
      hasProcessedRef.current = true;
      previousImagesHashRef.current = imagesHash;
    } catch (error) {
      console.error("Error processing images:", error);
      setIsImageLoaded(true);
      setIsLoading(false);
    }
  }, [imagesInput, processImage, imagesHash]);

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

  // Handle processing all images when in view
  useEffect(() => {
    if (!inView || !imagesInput) {
      return;
    }

    if (Array.isArray(imagesInput) && imagesInput.length === 0) {
      return;
    }

    // If it's a single image, process it normally
    if (!Array.isArray(imagesInput)) {
      // Check if already processed
      if (
        hasProcessedRef.current &&
        previousImagesHashRef.current === imagesHash
      ) {
        setIsImageLoaded(true);
        return;
      }

      let cancelled = false;
      setIsLoading(true);

      processImage(imagesInput)
        .then((result) => {
          if (!cancelled) {
            setUpdatedImage(result);
            setUpdatedImageList([result]);
            setIsImageLoaded(true);

            // Mark as processed and store the hash
            hasProcessedRef.current = true;
            previousImagesHashRef.current = imagesHash;
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
    }

    // If it's an array of images, process all of them (primary first)
    processAllImages();
  }, [
    imagesInput,
    processImage,
    processAllImages,
    inView,
    depsKey,
    imagesHash,
    aspectRatio,
  ]);

  // Update active image when activeImageIndex changes (no processing needed)
  useEffect(() => {
    if (!Array.isArray(imagesInput) || !updatedImageList.length) return;

    const activeImage = updatedImageList.find(
      (img) => img._id === activeImageIndex,
    );
    if (activeImage) {
      setUpdatedImage({
        imageUrl: activeImage.imageUrl,
        alt: activeImage.alt,
      });
    }
  }, [activeImageIndex, imagesInput, updatedImageList]);

  // Reset processing state when images change significantly
  useEffect(() => {
    if (previousImagesHashRef.current !== imagesHash) {
      hasProcessedRef.current = false;
    }
  }, [imagesHash]);

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
