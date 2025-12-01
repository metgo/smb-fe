import { createRoot } from "react-dom/client";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

import { businessMarkers } from "@/lib/utils";
import useGeneralStore from "@/stores/generalStore";
import { useGoogleMapInit } from "./useGoogleMapInit";
import { getAllLocations } from "@/actions/commonActions";
import CustomInfoWindow from "@/components/CustomInfoWindow";

export const useMobileGoogleMap = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const hasFetchedRef = useRef(false);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const activeMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const searchParams = useSearchParams();
  const activeCategoryId = searchParams.get("categoryId") || "";

  const { activeFilterTab, clickedBusinessId } = useGeneralStore();

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [businesses, setBusinesses] = useState<BusinessMakerProps[]>([]);
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  // Check if Google Maps API is loaded
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (
        typeof window !== "undefined" &&
        window.google &&
        window.google.maps
      ) {
        setIsGoogleMapsLoaded(true);
        return true;
      }
      return false;
    };

    if (checkGoogleMaps()) return;

    // Poll for Google Maps API availability
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval);
      }
    }, 100);

    // Cleanup after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      console.error("Google Maps API failed to load within 10 seconds");
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("Google Maps loaded:", isGoogleMapsLoaded);
    console.log("Map reference:", mapRef.current);
    console.log("Map state:", map);
  }, [isGoogleMapsLoaded, map]);

  // 1. Load Map - only when Google Maps API is available
  useGoogleMapInit({
    mapRef,
    setMap,
    infoWindowRef,
    activeMarkerRef,
    // isGoogleMapsLoaded
  });

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

      // Offset upward so InfoWindow isn't cut off
      const offsetLat = screenHeight < 600 ? 0.001 : 0.002;

      const newCenter = {
        lat: position.lat() - offsetLat,
        lng: position.lng(),
      };

      map.panTo(newCenter);

      const currentZoom = map.getZoom();
      if (currentZoom && currentZoom < 14) {
        const targetZoom =
          screenWidth < 640 ? 15 : screenWidth < 1024 ? 14 : 13;
        map.setZoom(targetZoom);
      }
    }
  };

  const closeInfoWindow = useCallback(() => {
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
    if (activeMarkerRef.current) {
      const prev = activeMarkerRef.current;
      const prevCategory = (prev as any).categoryId;
      if (businessMarkers[prevCategory]) {
        prev.setIcon({
          url: `./images/markers/${businessMarkers[prevCategory]}`,
          scaledSize: new window.google.maps.Size(50, 50),
        });
      }
    }
    activeMarkerRef.current = null;
    setOverlayVisible(false);
  }, []);

  const addMarkers = () => {
    if (
      !map ||
      !infoWindowRef.current ||
      !mapRef.current ||
      businesses.length === 0 ||
      !isGoogleMapsLoaded
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

      // Skip invalid coordinates
      if (isNaN(lat) || isNaN(lng)) return;

      const key = `${lat.toFixed(6)}_${lng.toFixed(6)}`;
      if (uniqueLocations.has(key)) return;
      uniqueLocations.add(key);

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map,
        icon: {
          url: `./images/markers/${
            businessMarkers[business.primaryCategoryId as any]
          }`,
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

        // Reset previous active marker
        if (activeMarkerRef.current && activeMarkerRef.current !== marker) {
          const prev = activeMarkerRef.current;
          const prevCategory = (prev as any).categoryId;

          if (businessMarkers[prevCategory]) {
            prev.setIcon({
              url: `./images/markers/${businessMarkers[prevCategory]}`,
              scaledSize: new window.google.maps.Size(50, 50),
            });
          }
        }

        if (isSameMarker && isOpen) {
          closeInfoWindow();
        } else {
          // Highlight clicked marker
          if (businessMarkers[business.primaryCategoryId as any]) {
            marker.setIcon({
              url: `./images/markers/${
                businessMarkers[business.primaryCategoryId as any]
              }`,
              scaledSize: new window.google.maps.Size(60, 60),
            });
          }

          infoWindowRef.current?.setContent(container);
          infoWindowRef.current?.open(map, marker);
          activeMarkerRef.current = marker;

          setOverlayVisible(true);
          centerMapOnMarker(marker);
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
        setOverlayVisible(true);
      }
    }

    // Dynamic zoom based on screen size
    if (businesses.length > 0) {
      if (businesses.length === 1) {
        const location = businesses?.[0]?.geoLocation;
        const lat = parseFloat(location?.lat);
        const lng = parseFloat(location?.long);

        if (!isNaN(lat) && !isNaN(lng)) {
          map.setCenter({ lat, lng });

          const screenWidth = window.innerWidth;
          let zoomLevel;
          if (screenWidth < 640) zoomLevel = 15;
          else if (screenWidth < 1024) zoomLevel = 14;
          else zoomLevel = 13;
          map.setZoom(zoomLevel);
        }
      } else {
        const bounds = new google.maps.LatLngBounds();
        let hasValidCoords = false;

        businesses.forEach((location) => {
          const coords = location?.geoLocation;
          if (coords) {
            const lat = parseFloat(coords.lat);
            const lng = parseFloat(coords.long);
            if (!isNaN(lat) && !isNaN(lng)) {
              bounds.extend({ lat, lng });
              hasValidCoords = true;
            }
          }
        });

        if (hasValidCoords) {
          const basePadding = 20;
          const screenWidth = window.innerWidth;

          const paddingScale =
            screenWidth < 640 ? 0.5 : screenWidth < 1024 ? 0.75 : 1;
          const padding = {
            top: basePadding * paddingScale,
            bottom: basePadding * paddingScale,
            left: basePadding * paddingScale,
            right: basePadding * paddingScale,
          };

          map.fitBounds(bounds, padding);

          const listener = google.maps.event.addListenerOnce(
            map,
            "bounds_changed",
            () => {
              const currentZoom = map.getZoom();
              const maxZoom =
                screenWidth < 640 ? 16 : screenWidth < 1024 ? 15 : 14;
              if (currentZoom && currentZoom > maxZoom) map.setZoom(maxZoom);
              google.maps.event.removeListener(listener);
            },
          );
        }
      }
    }
  };

  useEffect(() => {
    if (businesses.length > 0 && isGoogleMapsLoaded) {
      addMarkers();
    }
  }, [businesses, activeCategoryId, clickedBusinessId, isGoogleMapsLoaded]);

  // Overlay component
  const Overlay = () =>
    isOverlayVisible ? (
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10"
        onClick={closeInfoWindow}
      />
    ) : null;

  return { mapRef, Overlay, isGoogleMapsLoaded };
};
