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

  function isCurrentPage(targetPath: string) {
    return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
  }

  const calculateDistanceTo = (lat: number, lng: number): number | null => {
    if (!userLiveLocation) return null;
    return getDistanceFromLatLng(
      userLiveLocation.lat,
      userLiveLocation.lng,
      lat,
      lng,
    );
  };

  useEffect(() => {
    const updateHeight = () => setDeviceHeight(window.innerHeight);
    window.addEventListener("resize", updateHeight);
    window.addEventListener("orientationchange", updateHeight);

    updateHeight(); // initial height update

    return () => {
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("orientationchange", updateHeight);
    };
  }, []); // ✅ empty deps → runs only once

  return {
    deviceHeight,
    isCurrentPage,
    calculateDistanceTo,
  };
};
