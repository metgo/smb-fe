import { useEffect, useRef, useState } from "react";
import { staticImages } from "@/constant/staticImages";

function getPrimaryImgObj(images: ImageItem[]): ImageItem | undefined {
  return images?.find((item) => item?.isPrimary);
}

export const handleCropImage = async (
  imageItem: ImageItem,
  aspect: number,
  setIsLoading: (isLoading: boolean) => void,
  setCroppedImageUrl: (value: { imageUrl: string; alt: string }) => void,
) => {
  const encodedImageUrl = encodeURIComponent(imageItem?.image);
  const {
    xMin = 0,
    yMin = 0,
    xMax = 0,
    yMax = 0,
  } = imageItem?.subCoordinates || {};

  if (!xMin && !yMin && !xMax && !yMax) {
    setCroppedImageUrl({ imageUrl: imageItem.image, alt: imageItem.alt });
    setIsLoading(false);
    return;
  }

  const query = `url=${encodedImageUrl}&xMin=${xMin}&yMin=${yMin}&xMax=${xMax}&yMax=${yMax}&aspect=${aspect}`;
  setIsLoading(true);
  try {
    const res = await fetch(`/api/crop-image?${query}`);
    if (!res.ok) throw new Error("Failed to crop image");

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    setCroppedImageUrl({ imageUrl: objectUrl, alt: imageItem.alt });
  } catch (error) {
    console.error("Error cropping image", error);
  } finally {
    setIsLoading(false);
  }
};

type ImageInput = ImageItem[] | ImageItem;

export const useImagePresent = (
  aspectRatio: number,
  imagesInput: ImageInput,
  activeImageIndex: number,
  dependencies: any[] = [],
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(true);
  const [updatedImage, setUpdatedImage] = useState({
    imageUrl: staticImages.placeholder,
    alt: "Business",
  });
  const [updatedImageList, setUpdatedImageList] = useState<
    { _id: number; imageUrl: string; alt: string }[]
  >([]);

  const processedIndexesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (
      !Array.isArray(imagesInput) ||
      imagesInput.length === 0 ||
      activeImageIndex == null
    ) {
      return;
    }

    // Skip if index has already been processed
    if (processedIndexesRef.current.has(activeImageIndex)) {
      return;
    }

    const imageToProcess = imagesInput[activeImageIndex];
    if (!imageToProcess) return;

    setIsLoading(true);

    const timer = setTimeout(() => {
      const handleProcessed = (resultImage: {
        imageUrl: string;
        alt: string;
      }) => {
        setUpdatedImageList((prev) => [
          ...prev,
          {
            _id: activeImageIndex,
            imageUrl: resultImage.imageUrl,
            alt: resultImage.alt || "Business",
          },
        ]);
        processedIndexesRef.current.add(activeImageIndex);
        setIsLoading(false);
      };

      if (imageToProcess?.subCoordinates) {
        handleCropImage(
          imageToProcess,
          aspectRatio,
          () => {}, // no-op for loading; we already set it
          (cropped) => handleProcessed(cropped),
        );
      } else {
        handleProcessed({
          imageUrl: imageToProcess.image,
          alt: imageToProcess.alt,
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [activeImageIndex, aspectRatio, imagesInput]);

  useEffect(() => {
    if (
      !imagesInput ||
      (Array.isArray(imagesInput) && imagesInput.length === 0)
    )
      return;

    const imageToProcess = Array.isArray(imagesInput)
      ? getPrimaryImgObj(imagesInput) || imagesInput[0]
      : imagesInput;
    const timer = setTimeout(() => {
      if (imageToProcess?.subCoordinates) {
        handleCropImage(
          imageToProcess,
          aspectRatio,
          setIsLoading,
          setUpdatedImage,
        );
      } else {
        setUpdatedImage({
          imageUrl: imageToProcess?.image,
          alt: imageToProcess?.alt,
        });
        setIsLoading(false);
      }
    }, 100);
    setIsLoading(true);

    return () => clearTimeout(timer);
  }, [aspectRatio, ...dependencies]);

  return {
    isLoading,
    updatedImage,
    setUpdatedImage,
    isImageLoaded,
    setIsImageLoaded,
    updatedImageList,
  };
};
