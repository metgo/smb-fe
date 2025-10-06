"use client";

import { useEffect, useRef, useState } from "react";

import { businessMarkers } from "@/lib/utils";
import { useGoogleMapInit } from "./useGoogleMapInit";

declare global {
  interface Window {
    prevSlide: () => void;
    nextSlide: () => void;
  }
}

export const useGoogleSinglePinMap = (
  primaryCategoryId: string = "6566e31ca77d2a477266d2d6",
  geoLocation: GeoLocation,
) => {
  const mapRef = useRef(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const activeMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const addMarker = () => {
    if (!map || !geoLocation) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const lat = parseFloat(geoLocation.lat);
    const lng = parseFloat(geoLocation.long);

    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map,
      icon: {
        url: `/images/markers/${businessMarkers[primaryCategoryId]}`,
        scaledSize: new window.google.maps.Size(60, 60),
      },
    });

    markersRef.current.push(marker);

    // marker.addListener("click", () => {
    //   if (infoWindowRef.current) {
    //     infoWindowRef.current.setContent("Business info here");
    //     infoWindowRef.current.open(map, marker);
    //   }
    // });

    map.setCenter({ lat, lng });

    const screenWidth = window.innerWidth;
    let zoomLevel = screenWidth < 640 ? 15 : screenWidth < 1024 ? 14 : 13;
    map.setZoom(zoomLevel);
  };

  // 1. Load Map
  useGoogleMapInit({ mapRef, setMap, infoWindowRef, activeMarkerRef });

  useEffect(() => {
    if (map && geoLocation) {
      addMarker();
    }
  }, [map, primaryCategoryId, geoLocation]);

  return { mapRef };
};
