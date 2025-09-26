import { createRoot } from "react-dom/client";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { businessMarkers } from "@/lib/utils";
import useGeneralStore from "@/stores/generalStore";
import { useGoogleMapInit } from "./useGoogleMapInit";
import { getAllLocations } from "@/actions/commonActions";
import CustomInfoWindow from "@/components/CustomInfoWindow";

export const useGoogleMap = () => {
  const mapRef = useRef(null);
  const hasFetchedRef = useRef(false);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const activeMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const searchParams = useSearchParams();
  const activeCategoryId = searchParams.get("categoryId") || "";

  const { activeFilterTab, clickedBusinessId } = useGeneralStore();
  console.log("------√clickedBusinessId", clickedBusinessId);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [businesses, setBusinesses] = useState<BusinessMakerProps[]>([]);

  // 1. Load Map
  useGoogleMapInit({ mapRef, setMap, infoWindowRef, activeMarkerRef });

  useEffect(() => {
    if (
      !hasFetchedRef.current &&
      (activeFilterTab === "map" || activeFilterTab === "integrated")
    ) {
      hasFetchedRef.current = true;
      getAllLocations().then((locations) => {
        setBusinesses(locations);
      });
    }
  }, [activeFilterTab]);

  const centerMapOnMarker = (marker: google.maps.Marker) => {
    if (!map) return;

    const position = marker.getPosition();
    if (position) {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const isMobile = screenWidth < 768; // Consider mobile breakpoint

      let offsetLat: number;
      let offsetLng = 0;

      if (isMobile) {
        // Mobile: Center the InfoWindow in the middle of the screen
        // Calculate offset to position marker so InfoWindow appears in center
        const infoWindowHeight = 200; // Approximate InfoWindow height
        const mapCenterToInfoWindowCenter = infoWindowHeight / 12;

        // Convert pixel offset to lat/lng offset
        offsetLat = (mapCenterToInfoWindowCenter / screenHeight) * 0.008; // Adjust multiplier as needed
      } else {
        // Desktop: Keep original behavior - offset upward to prevent cutoff
        offsetLat = screenHeight < 600 ? 0.001 : 0.002;
      }

      const newCenter = {
        lat: position.lat() - offsetLat,
        lng: position.lng() + offsetLng,
      };

      map.panTo(newCenter);

      const currentZoom = map.getZoom();
      if (currentZoom && currentZoom < 14) {
        const targetZoom = isMobile
          ? screenWidth < 640
            ? 12
            : 10 // Slightly higher zoom for mobile
          : screenWidth < 640
            ? 15
            : screenWidth < 1024
              ? 14
              : 13;
        map.setZoom(targetZoom);
      }
    }
  };

  const addMarkers = () => {
    if (
      !map ||
      !infoWindowRef.current ||
      !mapRef.current ||
      businesses.length === 0
    )
      return;

    // Clear previous markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const uniqueLocations = new Set();

    const filteredBusiness = activeCategoryId
      ? businesses.filter((item) => item.primaryCategoryId === activeCategoryId)
      : businesses;

    filteredBusiness.forEach((business) => {
      const coords = business?.geoLocation;
      if (!coords) return;

      const lat = parseFloat(coords.lat);
      const lng = parseFloat(coords.long);

      const key = `${lat.toFixed(6)}_${lng.toFixed(6)}`;
      if (uniqueLocations.has(key)) return;
      uniqueLocations.add(key);

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map,
        icon: {
          url: `./images/markers/${businessMarkers[business.primaryCategoryId as any]}`,
          scaledSize: new window.google.maps.Size(50, 50),
        },
      });
      (marker as any).businessId = business._id;
      (marker as any).categoryId = business.primaryCategoryId;

      marker.addListener("click", () => {
        const container = document.createElement("div");

        createRoot(container).render(
          <CustomInfoWindow stationId={business._id} />,
        );

        const isSameMarker = activeMarkerRef.current === marker;
        const isOpen = infoWindowRef.current?.get("map") != null;

        // Reset the previous active marker's icon
        if (activeMarkerRef.current && activeMarkerRef.current !== marker) {
          const prev = activeMarkerRef.current;
          const prevCategory = (prev as any).categoryId;

          prev.setIcon({
            url: `./images/markers/${businessMarkers[prevCategory]}`,
            scaledSize: new window.google.maps.Size(50, 50), // smaller
          });
        }

        if (isSameMarker && isOpen) {
          infoWindowRef.current?.close();
          activeMarkerRef.current = null;
        } else {
          // Highlight clicked marker (size 60x60)
          marker.setIcon({
            url: `./images/markers/${businessMarkers[business.primaryCategoryId as any]}`,
            scaledSize: new window.google.maps.Size(60, 60),
          });

          infoWindowRef.current?.setContent(container);
          infoWindowRef.current?.open(map, marker);
          activeMarkerRef.current = marker;

          // Center the map on the clicked marker with info window
          // Use setTimeout to allow InfoWindow to render first
          setTimeout(() => {
            centerMapOnMarker(marker);
          }, 100);
        }
      });

      markersRef.current.push(marker);
    });

    // Auto-open marker if clickedBusinessId matches
    if (clickedBusinessId) {
      const targetMarker = markersRef.current.find(
        (marker) => (marker as any).businessId === clickedBusinessId,
      );
      if (targetMarker) {
        google.maps.event.trigger(targetMarker, "click");
      }
    }

    // Dynamic zoom based on screen size
    if (businesses.length > 0) {
      if (businesses.length === 1) {
        const location = businesses?.[0]?.geoLocation;
        const lat = parseFloat(location?.lat);
        const lng = parseFloat(location?.long);
        map.setCenter({ lat, lng });

        const screenWidth = window.innerWidth;
        const isMobile = screenWidth < 768;
        let zoomLevel;

        if (isMobile) {
          zoomLevel = screenWidth < 640 ? 16 : 15; // Higher zoom for mobile
        } else {
          zoomLevel = screenWidth < 640 ? 15 : screenWidth < 1024 ? 14 : 13;
        }
        map.setZoom(zoomLevel);
      } else {
        const bounds = new google.maps.LatLngBounds();
        businesses.forEach((location) => {
          const coords = location?.geoLocation;
          if (coords) {
            bounds.extend({
              lat: parseFloat(coords.lat),
              lng: parseFloat(coords.long),
            });
          }
        });

        // Calculate dynamic padding based on screen size
        const basePadding = 20;
        const screenWidth = window.innerWidth;
        const isMobile = screenWidth < 768;

        // Scale padding based on screen size
        const paddingScale = isMobile
          ? screenWidth < 640
            ? 0.3
            : 0.4 // Less padding for mobile
          : screenWidth < 640
            ? 0.5
            : screenWidth < 1024
              ? 0.75
              : 1;

        const padding = {
          top: basePadding * paddingScale,
          bottom: basePadding * paddingScale,
          left: basePadding * paddingScale,
          right: basePadding * paddingScale,
        };

        // Fit bounds with dynamic padding
        map.fitBounds(bounds, padding);

        // Adjust zoom to prevent excessive zoom-in on small screens
        const listener = google.maps.event.addListenerOnce(
          map,
          "bounds_changed",
          () => {
            const currentZoom = map.getZoom();
            const maxZoom = isMobile
              ? screenWidth < 640
                ? 17
                : 16 // Allow higher zoom on mobile
              : screenWidth < 640
                ? 16
                : screenWidth < 1024
                  ? 15
                  : 14;

            if (currentZoom && currentZoom > maxZoom) map.setZoom(maxZoom);
            google.maps.event.removeListener(listener);
          },
        );
      }
    }
  };

  useEffect(() => {
    if (businesses.length > 0) addMarkers();
  }, [businesses, activeCategoryId]);

  return { mapRef };
};
