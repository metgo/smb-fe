"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import useGeneralStore from "@/stores/generalStore";
import { getDistanceFromLatLng } from "@/lib/helpers";

export const useCommonHook = () => {
  const pathname = usePathname();

  const { userLiveLocation } = useGeneralStore();
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

  const [deviceHeight, setDeviceHeight] = useState<number>(
    typeof window !== "undefined" ? window.innerHeight : 900,
  );

  useEffect(() => {
    const updateHeight = () => setDeviceHeight(window.innerHeight);
    window.addEventListener("resize", updateHeight);
    window.addEventListener("orientationchange", updateHeight);

    updateHeight(); // initial

    return () => {
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("orientationchange", updateHeight);
    };
  }, []);

  return {
    deviceHeight,
    isCurrentPage,
    calculateDistanceTo,
  };
};
