"use client";

import { useEffect, useState, useRef } from "react";
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

  // Track loaded images to avoid showing skeleton on already loaded images
  const loadedImagesRef = useRef<Set<string>>(new Set());

  const cropImage = async () => {
    const imageKey = imageItem?.image || "";
    const isAlreadyLoaded = loadedImagesRef.current.has(imageKey);

    // Only show loading skeleton for images that haven't been loaded yet
    if (!isAlreadyLoaded) {
      setLoading(true);
      setIsImageTransitionComplete(false);
    } else {
      // For already loaded images, show them immediately
      setIsImageTransitionComplete(true);
    }

    try {
      const result = await handleCropImage(imageItem, aspectRatio);
      setCroppedImage(result);

      // Mark this image as loaded
      if (imageKey) {
        loadedImagesRef.current.add(imageKey);
      }
    } catch (error) {
      setImageError(true);
      setCroppedImage(null);
      console.log("-----error", error);
    } finally {
      if (!isAlreadyLoaded) {
        setLoading(false);
      }
    }
  };

  // Reset states when imageItem changes
  useEffect(() => {
    const imageKey = imageItem?.image || "";
    const isAlreadyLoaded = loadedImagesRef.current.has(imageKey);

    setImageError(false);

    // Don't reset transition state for already loaded images
    if (!isAlreadyLoaded) {
      setIsImageTransitionComplete(false);
    }

    cropImage();
  }, [imageItem]);

  const handleImageLoad = () => {
    const imageKey = imageItem?.image || "";
    if (imageKey) {
      loadedImagesRef.current.add(imageKey);
    }

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

  const imageKey = imageItem?.image || "";
  const isAlreadyLoaded = loadedImagesRef.current.has(imageKey);
  const shouldShowSkeleton =
    loading && !isAlreadyLoaded && !isImageTransitionComplete;

  return {
    finalImageSrc,
    handleImageLoad,
    handleImageError,
    loading,
    isImageTransitionComplete,
    shouldShowSkeleton,
  };
};
