import { useEffect, useState } from "react";
import { handleCropImage } from "@/lib/helpers";
import { staticImages } from "@/constant/staticImages";

export const useImageCrop = (imageItem: ImageItem, aspectRatio: number) => {
  const [imageError, setImageError] = useState(false);
  const [isImageTransitionComplete, setIsImageTransitionComplete] =
    useState(false);

  const [croppedImage, setCroppedImage] = useState<{
    imageUrl: string;
    alt: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const cropImage = async () => {
    setLoading(true);
    const result = await handleCropImage(imageItem, aspectRatio);
    setCroppedImage(result);
    setLoading(false);
  };
  // Reset states when imageItem changes
  useEffect(() => {
    cropImage();
    setImageError(false);
    setIsImageTransitionComplete(false);
  }, [imageItem]);

  // Determine when to show skeleton

  const handleImageLoad = () => {
    setImageError(false);
    // Small delay to ensure image is fully rendered
    setTimeout(() => setIsImageTransitionComplete(true), 50);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsImageTransitionComplete(true);
  };

  const finalImageSrc =
    imageError || !croppedImage?.imageUrl
      ? staticImages.placeholder
      : croppedImage?.imageUrl;

  const shouldShowSkeleton = loading || !isImageTransitionComplete;

  return {
    finalImageSrc,
    handleImageLoad,
    handleImageError,
    loading,
    isImageTransitionComplete,
    shouldShowSkeleton,
  };
};
