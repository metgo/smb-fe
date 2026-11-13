"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getDistanceFromLatLng } from "@/lib/helpers";
import useGeneralStore from "@/stores/generalStore";

export const useCommonHook = () => {
  const pathname = usePathname();
  const { userLiveLocation } = useGeneralStore();

  const [deviceHeight, setDeviceHeight] = useState<number>(
    typeof window !== "undefined" ? window.innerHeight : 900,
  );

  // Mobile detection: < 768px OR touch device with portrait orientation
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Helper: Check current page
  function isCurrentPage(targetPath: string) {
    return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
  }

  // Helper: Calculate distance from user's live location
  const calculateDistanceTo = (lat: number, lng: number): number | null => {
    if (!userLiveLocation) return null;
    return getDistanceFromLatLng(
      userLiveLocation.lat,
      userLiveLocation.lng,
      lat,
      lng,
    );
  };

  // Update device height + mobile status
  useEffect(() => {
    const updateDimensions = () => {
      const vh = window.innerHeight;
      setDeviceHeight(vh);

      // Responsive breakpoint + touch capability check
      const mobile =
        window.innerWidth < 768 || // Standard mobile breakpoint
        (window.innerWidth <= 1024 &&
          "ontouchstart" in window &&
          window.innerWidth < window.innerHeight); // Tablets in portrait

      setIsMobile(mobile);
    };

    // Initial check
    updateDimensions();

    // Listen to resize & orientation change
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("orientationchange", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("orientationchange", updateDimensions);
    };
  }, []);

  return {
    deviceHeight,
    isMobile,
    isCurrentPage,
    calculateDistanceTo,
  };
};
