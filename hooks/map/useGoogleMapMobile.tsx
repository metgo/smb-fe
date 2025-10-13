"use client";

import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";

import { businessMarkers } from "@/lib/utils";
import useGeneralStore from "@/stores/generalStore";
import { useGoogleMapInit } from "./useGoogleMapInit";
import { getAllLocations } from "@/actions/commonActions";
import CustomInfoWindow from "@/components/CustomInfoWindow";

// Constants
const MOBILE_BREAKPOINT = 768;
const MARKER_SIZE_ACTIVE = 60;
const MARKER_SIZE_DEFAULT = 50;
const SMALL_MOBILE_BREAKPOINT = 640;
const INFO_WINDOW_RENDER_DELAY = 100;

interface MapDimensions {
  height: string;
  padding: number;
  infoWindowOffset: number;
}

export const useGoogleMapMobile = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const hasFetchedRef = useRef(false);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const activeMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const { activeFilterTabMobile, clickedBusinessId, activeCategoryKey } =
    useGeneralStore();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [businesses, setBusinesses] = useState<BusinessMakerProps[]>([]);
  const [mapDimensions, setMapDimensions] = useState<MapDimensions>({
    height: "100vh",
    padding: 20,
    infoWindowOffset: 0,
  });
  const pendingBusinessIdRef = useRef<string | null>(null);

  // Load Map
  useGoogleMapInit({ mapRef, setMap, infoWindowRef, activeMarkerRef });

  // Calculate responsive map dimensions - Now with 100vh height
  const calculateMapDimensions = (): MapDimensions => {
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;

    let padding: number, infoWindowOffset: number;

    if (screenWidth < 375) {
      // Very small phones (iPhone SE, etc.)
      padding = 10;
      infoWindowOffset = screenHeight * 0.15;
    } else if (screenWidth < SMALL_MOBILE_BREAKPOINT) {
      // 640px
      padding = 15;
      infoWindowOffset = screenHeight * 0.12;
    } else if (screenWidth < MOBILE_BREAKPOINT) {
      // 768px
      padding = 20;
      infoWindowOffset = screenHeight * 0.1;
    } else if (screenWidth < 1024) {
      // Tablets
      padding = 25;
      infoWindowOffset = screenHeight * 0.08;
    } else {
      // Desktop
      padding = 30;
      infoWindowOffset = screenHeight * 0.05;
    }

    // Always use 100vh for height
    return {
      height: "100vh",
      padding,
      infoWindowOffset,
    };
  };

  // Update dimensions on resize and initial load
  useEffect(() => {
    const updateDimensions = () => {
      setMapDimensions(calculateMapDimensions());
    };

    // Set initial dimensions
    updateDimensions();

    // Add resize listener with debounce
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateDimensions, 250);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Fetch locations when map tab is active
  useEffect(() => {
    if (!hasFetchedRef.current && activeFilterTabMobile === "map") {
      hasFetchedRef.current = true;
      getAllLocations().then((locations) => {
        setBusinesses(locations);
      });
    }
  }, [activeFilterTabMobile]);

  const getScreenDimensions = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isMobile = screenWidth < MOBILE_BREAKPOINT;
    const isSmallMobile = screenWidth < SMALL_MOBILE_BREAKPOINT;

    return { screenWidth, screenHeight, isMobile, isSmallMobile };
  };

  const centerMapOnMarker = (marker: google.maps.Marker) => {
    if (!map) return;

    const position = marker.getPosition();
    if (!position) return;

    const { screenHeight } = getScreenDimensions();
    // const { infoWindowOffset } = mapDimensions;

    // Calculate offset to center the InfoWindow vertically on screen
    // const infoWindowHeight = 240; // Approximate height of InfoWindow in pixels
    // const markerHeight = MARKER_SIZE_ACTIVE; // Height of the marker

    // Use dynamic offset based on screen size
    // const totalHeight = infoWindowHeight + markerHeight;
    // const pixelsToShift = (totalHeight / 2) + infoWindowOffset;

    // Convert pixels to latitude offset (approximate)
    const latOffset = (3000 / screenHeight) * 0.01;

    const newCenter = {
      lat: position.lat() + latOffset, // Shift DOWN (positive) to center info window
      lng: position.lng(),
    };

    map.panTo(newCenter);

    const currentZoom = map.getZoom();
    if (currentZoom && currentZoom < 14) {
      const { screenWidth, isMobile, isSmallMobile } = getScreenDimensions();
      const targetZoom = isMobile
        ? isSmallMobile
          ? 12
          : 10
        : isSmallMobile
          ? 15
          : screenWidth < 1024
            ? 14
            : 13;
      map.setZoom(targetZoom);
    }
  };

  const openInfoWindow = (
    marker: google.maps.Marker,
    business: BusinessMakerProps,
  ) => {
    if (!map || !infoWindowRef.current) return;

    const container = document.createElement("div");
    createRoot(container).render(
      <CustomInfoWindow
        stationId={business._id}
        primaryCategoryId={business.primaryCategoryId}
      />,
    );

    // Reset the previous active marker's icon
    if (activeMarkerRef.current && activeMarkerRef.current !== marker) {
      const prev = activeMarkerRef.current;
      const prevCategory = (prev as any).categoryId;

      prev.setIcon({
        url: `./images/markers/${businessMarkers[prevCategory]}`,
        scaledSize: new window.google.maps.Size(
          MARKER_SIZE_DEFAULT,
          MARKER_SIZE_DEFAULT,
        ),
      });
    }

    // Highlight clicked marker
    marker.setIcon({
      url: `./images/markers/${businessMarkers[business.primaryCategoryId as any]}`,
      scaledSize: new window.google.maps.Size(
        MARKER_SIZE_ACTIVE,
        MARKER_SIZE_ACTIVE,
      ),
    });

    infoWindowRef.current.setContent(container);
    infoWindowRef.current.open(map, marker);
    activeMarkerRef.current = marker;

    // Center the map on the clicked marker with proper offset
    setTimeout(() => {
      centerMapOnMarker(marker);
    }, INFO_WINDOW_RENDER_DELAY);
  };

  const handleMarkerClick = (
    marker: google.maps.Marker,
    business: BusinessMakerProps,
  ) => {
    const isSameMarker = activeMarkerRef.current === marker;
    const isOpen = infoWindowRef.current?.get("map") !== null;

    if (isSameMarker && isOpen) {
      // Close if clicking the same marker
      infoWindowRef.current?.close();

      // Reset icon size
      marker.setIcon({
        url: `./images/markers/${businessMarkers[business.primaryCategoryId as any]}`,
        scaledSize: new window.google.maps.Size(
          MARKER_SIZE_DEFAULT,
          MARKER_SIZE_DEFAULT,
        ),
      });

      activeMarkerRef.current = null;
    } else {
      // Open new info window
      openInfoWindow(marker, business);
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
    const filteredBusiness = activeCategoryKey
      ? businesses.filter(
          (item) => item.primaryCategoryId === activeCategoryKey,
        )
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
          scaledSize: new window.google.maps.Size(
            MARKER_SIZE_DEFAULT,
            MARKER_SIZE_DEFAULT,
          ),
        },
        animation: window.google.maps.Animation.DROP,
      });

      (marker as any).businessId = business._id;
      (marker as any).categoryId = business.primaryCategoryId;

      marker.addListener("click", () => {
        handleMarkerClick(marker, business);
      });

      markersRef.current.push(marker);
    });

    // Set initial map bounds/zoom with dynamic padding
    setInitialMapView();
  };

  const setInitialMapView = () => {
    if (!map || businesses.length === 0) return;

    const { screenWidth, isMobile, isSmallMobile } = getScreenDimensions();

    if (businesses.length === 1) {
      // Single business - center on it with appropriate zoom
      const location = businesses[0]?.geoLocation;
      if (!location) return;

      const lat = parseFloat(location.lat);
      const lng = parseFloat(location.long);
      map.setCenter({ lat, lng });

      const zoomLevel = isMobile
        ? isSmallMobile
          ? 16
          : 15
        : isSmallMobile
          ? 15
          : screenWidth < 1024
            ? 14
            : 13;

      map.setZoom(zoomLevel);
    } else {
      // Multiple businesses - fit bounds with dynamic padding
      const bounds = new google.maps.LatLngBounds();
      let hasValidLocations = false;

      businesses.forEach((location) => {
        const coords = location?.geoLocation;
        if (coords) {
          bounds.extend({
            lat: parseFloat(coords.lat),
            lng: parseFloat(coords.long),
          });
          hasValidLocations = true;
        }
      });

      if (!hasValidLocations) return;

      // Use dynamic padding from mapDimensions
      const padding = mapDimensions.padding;

      map.fitBounds(bounds, padding);

      // Set maximum zoom level after fitting bounds
      const listener = google.maps.event.addListenerOnce(
        map,
        "bounds_changed",
        () => {
          const currentZoom = map.getZoom();
          const maxZoom = isMobile
            ? isSmallMobile
              ? 17
              : 16
            : isSmallMobile
              ? 16
              : screenWidth < 1024
                ? 15
                : 14;

          if (currentZoom && currentZoom > maxZoom) {
            map.setZoom(maxZoom);
          }
          google.maps.event.removeListener(listener);
        },
      );
    }
  };

  // Trigger marker click when clickedBusinessId is set
  const triggerMarkerClick = (businessId: string) => {
    if (!businessId || markersRef.current.length === 0) {
      console.warn("No markers found on the map.");
      return;
    }

    const targetMarker = markersRef.current.find(
      (marker) => (marker as any).businessId === businessId,
    );

    if (targetMarker) {
      // Use requestAnimationFrame to ensure DOM is ready, especially on mobile
      requestAnimationFrame(() => {
        setTimeout(() => {
          google.maps.event.trigger(targetMarker, "click");
        }, 200); // Slightly longer delay for mobile
      });
    } else {
      console.warn("This location is not currently visible on the map.");
    }
  };

  // Apply map container styles
  const applyMapContainerStyles = () => {
    if (!mapRef.current) return;

    const container = mapRef.current;
    container.style.height = "100vh";
    container.style.width = "100%";
    container.style.position = "relative";
    container.style.borderRadius = "0"; // Remove borderRadius for full-height
    container.style.overflow = "hidden";
    container.style.boxShadow = "none"; // Remove shadow for full-height
  };

  // Apply styles when dimensions change
  useEffect(() => {
    applyMapContainerStyles();
  }, [mapDimensions]);

  // Add markers when businesses or category changes
  useEffect(() => {
    if (businesses.length > 0) {
      addMarkers();
    }
  }, [businesses, activeCategoryKey, mapDimensions.padding]);

  // Separate effect to handle clickedBusinessId changes
  useEffect(() => {
    if (!clickedBusinessId) return;

    if (markersRef.current.length > 0 && businesses?.length > 0) {
      triggerMarkerClick(clickedBusinessId);
      pendingBusinessIdRef.current = null;
    }
  }, [clickedBusinessId, markersRef.current.length, businesses]);

  // Cleanup markers when component unmounts
  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, []);

  return {
    mapRef,
    mapDimensions,
    getMapContainerStyles: () => ({
      height: "100vh",
      width: "100%",
      position: "relative" as const,
      borderRadius: "0",
      overflow: "hidden",
    }),
  };
};

// Export type for use in components
export type { MapDimensions };
