import { useEffect, useRef, useState, useCallback } from "react";
import { staticImages } from "@/constant/staticImages";

function getPrimaryImgObj(images: ImageItem[]): ImageItem | undefined {
  return images?.find((item) => item?.isPrimary);
}

export const handleCropImage = async (
  imageItem: ImageItem,
  aspect: number,
): Promise<{ imageUrl: string; alt: string }> => {
  const encodedImageUrl = encodeURIComponent(imageItem?.image);
  const {
    xMin = 0,
    yMin = 0,
    xMax = 0,
    yMax = 0,
  } = imageItem?.subCoordinates || {};

  if (!xMin && !yMin && !xMax && !yMax) {
    return { imageUrl: imageItem.image, alt: imageItem.alt };
  }

  const query = `url=${encodedImageUrl}&xMin=${xMin}&yMin=${yMin}&xMax=${xMax}&yMax=${yMax}&aspect=${aspect}`;
  const res = await fetch(`/api/crop-image?${query}`);
  if (!res.ok) throw new Error("Failed to crop image");

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);

  return { imageUrl: objectUrl, alt: imageItem.alt };
};

type ImageInput = ImageItem[] | ImageItem;

export const useImagePresent = (
  aspectRatio: number,
  imagesInput: ImageInput,
  activeImageIndex: number,
  dependencies: any[] = [],
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [updatedImage, setUpdatedImage] = useState({
    imageUrl: staticImages.placeholder,
    alt: "Business",
  });
  const [updatedImageList, setUpdatedImageList] = useState<
    { _id: number; imageUrl: string; alt: string }[]
  >([]);

  const processedIndexesRef = useRef<Set<number>>(new Set());
  const imageCacheRef = useRef<Map<string, { imageUrl: string; alt: string }>>(
    new Map(),
  );

  // Utility: wait until an image URL is fully loaded
  const waitForImageLoad = (src: string): Promise<void> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = (err) => reject(err);
      img.src = src;
    });

  const processImage = useCallback(
    async (image: ImageItem, idx?: number) => {
      const cacheKey = `${image.image}-${aspectRatio}`;
      if (imageCacheRef.current.has(cacheKey)) {
        return imageCacheRef.current.get(cacheKey)!;
      }

      let result = image?.subCoordinates
        ? await handleCropImage(image, aspectRatio)
        : { imageUrl: image.image, alt: image.alt };

      setIsImageLoaded(false);
      try {
        await waitForImageLoad(result.imageUrl);
        setIsImageLoaded(true);
      } catch (err) {
        console.error("Image failed to load:", result.imageUrl, err);
        result = {
          imageUrl: staticImages.placeholder,
          alt: image.alt || "Business",
        };
        setIsImageLoaded(false);
      }

      imageCacheRef.current.set(cacheKey, result);

      if (typeof idx === "number") {
        setUpdatedImageList((prev) => {
          if (prev.some((i) => i._id === idx)) return prev;
          return [...prev, { _id: idx, ...result }];
        });
        processedIndexesRef.current.add(idx);
      }

      return result;
    },
    [aspectRatio],
  );

  // Handle active image switching
  useEffect(() => {
    if (!Array.isArray(imagesInput) || imagesInput.length === 0) return;
    if (
      activeImageIndex == null ||
      processedIndexesRef.current.has(activeImageIndex)
    )
      return;

    const imageToProcess = imagesInput[activeImageIndex];
    if (!imageToProcess) return;

    let cancelled = false;
    setIsLoading(true);

    processImage(imageToProcess, activeImageIndex).finally(
      () => !cancelled && setIsLoading(false),
    );

    return () => {
      cancelled = true;
    };
  }, [activeImageIndex, imagesInput, processImage]);

  // Handle initial primary/default image
  useEffect(() => {
    if (
      !imagesInput ||
      (Array.isArray(imagesInput) && imagesInput.length === 0)
    )
      return;

    const imageToProcess = Array.isArray(imagesInput)
      ? getPrimaryImgObj(imagesInput) || imagesInput[0]
      : imagesInput;

    let cancelled = false;
    setIsLoading(true);

    processImage(imageToProcess)
      .then((result) => !cancelled && setUpdatedImage(result))
      .finally(() => !cancelled && setIsLoading(false));

    return () => {
      cancelled = true;
    };
  }, [imagesInput, processImage, ...dependencies]);

  return {
    isLoading,
    updatedImage,
    setUpdatedImage,
    isImageLoaded,
    setIsImageLoaded,
    updatedImageList,
  };
};
