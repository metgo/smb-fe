"use client";

// import { toast } from "react-hot-toast";
import { createRoot } from "react-dom/client";
import { useSearchParams } from "next/navigation";
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

export const useGoogleMapMobile = () => {
  const mapRef = useRef(null);
  const hasFetchedRef = useRef(false);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const activeMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const searchParams = useSearchParams();
  const activeCategoryId = searchParams.get("categoryId") || "";

  const { activeFilterTabMobile, clickedBusinessId } = useGeneralStore();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [businesses, setBusinesses] = useState<BusinessMakerProps[]>([]);

  // Load Map
  useGoogleMapInit({ mapRef, setMap, infoWindowRef, activeMarkerRef });

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

    // Calculate offset to position InfoWindow at 20% from the bottom
    const infoWindowHeight = 240; // Approximate height of InfoWindow in pixels
    const targetPosition = 0.8; // 80% from top (20% from bottom)
    const pixelsFromTop = screenHeight * targetPosition;
    const pixelsToCenter =
      pixelsFromTop - screenHeight / 2 + infoWindowHeight / 2;
    const latOffset = (pixelsToCenter / screenHeight) * 0.008; // Convert pixels to approximate latitude degrees

    const newCenter = {
      lat: position.lat() - latOffset,
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

    // Center the map on the clicked marker
    setTimeout(() => {
      centerMapOnMarker(marker);
    }, INFO_WINDOW_RENDER_DELAY);
  };

  const handleMarkerClick = (
    marker: google.maps.Marker,
    business: BusinessMakerProps,
  ) => {
    const isSameMarker = activeMarkerRef.current === marker;
    const isOpen = infoWindowRef.current?.get("map") != null;

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
          scaledSize: new window.google.maps.Size(
            MARKER_SIZE_DEFAULT,
            MARKER_SIZE_DEFAULT,
          ),
        },
      });

      (marker as any).businessId = business._id;
      (marker as any).categoryId = business.primaryCategoryId;

      marker.addListener("click", () => {
        handleMarkerClick(marker, business);
      });

      markersRef.current.push(marker);
    });

    // Set initial map bounds/zoom
    setInitialMapView();
  };

  const setInitialMapView = () => {
    if (!map || businesses.length === 0) return;

    const { screenWidth, isMobile, isSmallMobile } = getScreenDimensions();

    if (businesses.length === 1) {
      const location = businesses[0]?.geoLocation;
      const lat = parseFloat(location?.lat);
      const lng = parseFloat(location?.long);
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

      const basePadding = 20;
      const paddingScale = isMobile
        ? isSmallMobile
          ? 0.3
          : 0.4
        : isSmallMobile
          ? 0.5
          : screenWidth < 1024
            ? 0.75
            : 1;

      const padding = basePadding * paddingScale;

      map.fitBounds(bounds, padding);

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
      // toast("No markers found on the map.");
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
      // toast.error("This location is not currently visible on the map.");
    }
  };

  // Add markers when businesses or category changes
  useEffect(() => {
    if (businesses.length > 0) {
      addMarkers();
    }
  }, [businesses, activeCategoryId]);

  // Separate effect to handle clickedBusinessId changes
  useEffect(() => {
    if (clickedBusinessId && markersRef.current.length > 0) {
      triggerMarkerClick(clickedBusinessId);
    }
  }, [clickedBusinessId, markersRef.current.length]);

  return { mapRef };
};
