"use client";

import { useEffect, useCallback } from "react";

interface ImagePreloaderOptions {
  images: string[];
  priority?: "high" | "low";
  delay?: number;
}

export const useImagePreloader = ({
  images,
  priority = "low",
  delay = 1000,
}: ImagePreloaderOptions) => {
  const preloadImage = useCallback(
    (src: string) => {
      if (typeof window === "undefined" || !src) return;

      // Use the browser's built-in image preloading
      const link = document.createElement("link");
      link.rel = priority === "high" ? "preload" : "prefetch";
      link.as = "image";
      link.href = src;

      // Add fetchpriority attribute for modern browsers
      if (priority === "high") {
        link.setAttribute("fetchpriority", "high");
      }

      document.head.appendChild(link);

      // Also create an Image object for caching
      const img = new Image();
      img.src = src;

      return () => {
        // Cleanup function
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    },
    [priority],
  );

  useEffect(() => {
    if (!images || images.length === 0) return;

    const cleanupFunctions: (() => void)[] = [];

    // Preload images with a slight delay to avoid blocking main thread
    const timeouts: NodeJS.Timeout[] = [];

    images.forEach((src, index) => {
      if (src) {
        const timeout = setTimeout(() => {
          const cleanup = preloadImage(src);
          if (cleanup) cleanupFunctions.push(cleanup);
        }, index * delay); // Stagger preloading

        timeouts.push(timeout);
      }
    });

    return () => {
      // Clear all timeouts
      timeouts.forEach(clearTimeout);
      // Run all cleanup functions
      cleanupFunctions.forEach((fn) => fn());
    };
  }, [images, preloadImage, delay]);
};

// Hook for preloading next images in a carousel
export const useCarouselImagePreloader = (
  images: { imageUrl?: string }[],
  currentIndex: number,
  preloadCount: number = 2,
) => {
  useEffect(() => {
    if (!images || images.length === 0) return;

    const imagesToPreload: string[] = [];

    // Preload next images
    for (let i = 1; i <= preloadCount; i++) {
      const nextIndex = (currentIndex + i) % images.length;
      const imageUrl = images[nextIndex]?.imageUrl;
      if (imageUrl) {
        imagesToPreload.push(imageUrl);
      }
    }

    // Use requestIdleCallback for non-blocking preloading
    if ("requestIdleCallback" in window) {
      const handle = requestIdleCallback(() => {
        imagesToPreload.forEach((src) => {
          const img = new Image();
          img.src = src;
        });
      });

      return () => {
        if ("cancelIdleCallback" in window) {
          cancelIdleCallback(handle);
        }
      };
    } else {
      // Fallback for browsers without requestIdleCallback
      const timeout = setTimeout(() => {
        imagesToPreload.forEach((src) => {
          const img = new Image();
          img.src = src;
        });
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [images, currentIndex, preloadCount]);
};
