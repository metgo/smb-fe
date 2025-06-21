import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { addMapTypeControl } from "@/lib/utils";


import { customMapStyle, googlePointOfInterest } from "@/constant/googlePoi";


const googleMapsScriptLoaded = {
  loaded: false,
  callbacks: [] as (() => void)[],
};


const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY

export const loadGoogleMapsScript = (callback: () => void) => {
  if (googleMapsScriptLoaded.loaded) {
    callback();
    return;
  }

  if (googleMapsScriptLoaded.callbacks.length === 0) {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&language=he&v=3.54`;
    script.async = true;
    script.onload = () => {
      googleMapsScriptLoaded.loaded = true;
      googleMapsScriptLoaded.callbacks.forEach((cb) => cb());
      googleMapsScriptLoaded.callbacks = [];
    };
    script.onerror = () => {
      console.error("Failed to load Google Maps script");
    };
    document.body.appendChild(script);
  }

  googleMapsScriptLoaded.callbacks.push(callback);
};

const center = { lat: 31.0461, lng: 34.8516 };

export const useGoogleMap = () => {
  const searchParams = useSearchParams();

  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const markersRef = useRef<{ [key: string]: google.maps.Marker }>({});
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isMarkerLoading, setIsMarkerLoading] = useState(false);
  const previousPopupMarkerRef = useRef<google.maps.Marker | null>(null);


  useEffect(() => {
    loadGoogleMapsScript(() => {
      setIsMapLoaded(true);
      initializeMap();

      const style = document.createElement("style");
      style.textContent = customMapStyle;
      document.head.appendChild(style);
    });

    return () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, []);

  const initializeMap = () => {
    if (!window.google || !mapRef.current) return;

    const googleMap = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 10,
      mapTypeControl: false,
      streetViewControl: false,
      gestureHandling: "greedy",
      zoomControl: false,
      fullscreenControl: false,
      keyboardShortcuts: false,
      rotateControl: false,
      scaleControl: false,
      styles: googlePointOfInterest,
    });
    setMap(googleMap);

    infoWindowRef.current = new google.maps.InfoWindow({
      maxWidth: 200,
      disableAutoPan: true,
    });
    addMapTypeControl(googleMap);

    // Add map click event listener to close info window
    googleMap.addListener("click", () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        // Reset all markers to original icon
        Object.values(markersRef.current).forEach((marker) => {
          marker.setIcon((marker as any).originalIcon);
        });
        previousPopupMarkerRef.current = null;
      }
    });
  };

  const addMarkers = () => {
    if (!map || !infoWindowRef.current || !mapRef.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.setMap(null));
    markersRef.current = {};
    infoWindowRef.current.close();



    const locationMap = new Map<string, any[]>();

    locationMap.forEach((locations) => {
      const firstLocation = locations[0];
      const lat = parseFloat(firstLocation?.businessId?.geoLocation?.lat);
      const lng = parseFloat(firstLocation?.businessId?.geoLocation?.long);

      const marker = new google.maps.Marker({
        position: { lat: 31.0461, lng: 34.8516 },
        map: map,
        icon: "/images/markers/local.svg"
      });

      const content = `<div class="custom-popup"><h2>${firstLocation?.businessId?.name}</h2></div>`;
      const markerKey = firstLocation?.businessId?._id;
      markersRef.current[markerKey] = marker;

      // Store original and hover/click icons in marker's custom properties

      // Click: Open info window and set hoverClickIcon
      marker.addListener("click", () => {
        Object.values(markersRef.current).forEach((m) => {
          if (m !== marker) {
            m.setIcon((m as any).originalIcon);
          }
        });

        infoWindowRef.current!.close();
        infoWindowRef.current!.setContent(content);
        infoWindowRef.current!.open(map, marker);
      });
    });

  };

  // Handle window resize to update zoom and bounds
  useEffect(() => {
    if (!map || !isMapLoaded) return;

    const handleResize = () => {
      addMarkers(); // Re-run addMarkers to adjust zoom and bounds
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [map, isMapLoaded]);

  useEffect(() => {
    if (map && isMapLoaded) {
      addMarkers();
    }
  }, [map, isMapLoaded]);


  return { mapRef, isMarkerLoading };
};
