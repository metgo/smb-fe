"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  goolgeMapControlers,
  loadGoogleMapsScript,
} from "@/lib/googleMapUtils";

interface GoogleMapContextType {
  googleMap: google.maps.Map | null;
  infoWindowRef: React.MutableRefObject<google.maps.InfoWindow | null>;
  activeMarkerRef: React.MutableRefObject<google.maps.Marker | null>;
}

const GoogleMapContext = createContext<GoogleMapContextType | null>(null);

export const GoogleMapProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [googleMap, setGoogleMap] = useState<google.maps.Map | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const activeMarkerRef = useRef<google.maps.Marker | null>(null);

  // Initialize Google Map once globally
  useEffect(() => {
    loadGoogleMapsScript(() => {
      if (!window.google) return;

      // Create an offscreen map container (invisible but active)
      const mapContainer = document.createElement("div");
      mapContainer.style.width = "100%";
      mapContainer.style.height = "100%";
      mapRef.current = mapContainer;
      document.body.appendChild(mapContainer);
      mapContainer.style.display = "none"; // keep it hidden globally

      const map = new window.google.maps.Map(mapContainer, goolgeMapControlers);
      setGoogleMap(map);

      infoWindowRef.current = new google.maps.InfoWindow({
        maxWidth: 420,
        disableAutoPan: true,
        pixelOffset: new google.maps.Size(0, -10),
      });
    });
  }, []);

  return (
    <GoogleMapContext.Provider
      value={{ googleMap, infoWindowRef, activeMarkerRef }}
    >
      {children}
    </GoogleMapContext.Provider>
  );
};

export const useGoogleMapContext = () => {
  const context = useContext(GoogleMapContext);
  if (!context) {
    throw new Error(
      "useGoogleMapContext must be used within GoogleMapProvider",
    );
  }
  return context;
};
