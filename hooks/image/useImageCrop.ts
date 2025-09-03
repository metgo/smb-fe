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
    try {
      const result = await handleCropImage(imageItem, aspectRatio);
      setCroppedImage(result);
    } catch (error) {
      setImageError(true);
      setCroppedImage(null);
      console.log("-----error", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset states when imageItem changes
  useEffect(() => {
    cropImage();
    setImageError(false);
    setIsImageTransitionComplete(false);
  }, [imageItem]);

  const handleImageLoad = () => {
    setImageError(false);
    setLoading(false);
    setTimeout(() => setIsImageTransitionComplete(true), 50);
  };

  const handleImageError = () => {
    setImageError(true);
    setLoading(false);
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
