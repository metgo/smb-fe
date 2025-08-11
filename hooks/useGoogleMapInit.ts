import { useEffect } from "react";

import {
  goolgeMapControlers,
  loadGoogleMapsScript,
} from "@/lib/googleMapUtils";

interface UseGoogleMapInitOptions {
  mapRef: React.RefObject<HTMLDivElement | any>;
  setMap: (map: google.maps.Map) => void;
  infoWindowRef: React.MutableRefObject<google.maps.InfoWindow | null | any>;
  activeMarkerRef?: React.MutableRefObject<google.maps.Marker | null>;
}

export const useGoogleMapInit = ({
  mapRef,
  setMap,
  infoWindowRef,
  activeMarkerRef,
}: UseGoogleMapInitOptions) => {
  useEffect(() => {
    loadGoogleMapsScript(() => {
      if (!window.google || !mapRef.current) return;

      const googleMap = new window.google.maps.Map(
        mapRef.current,
        goolgeMapControlers,
      );

      setMap(googleMap);

      infoWindowRef.current = new google.maps.InfoWindow({
        maxWidth: 420,
        disableAutoPan: true,
        pixelOffset: new google.maps.Size(0, -10),
      });

      googleMap.addListener("click", () => {
        infoWindowRef.current?.close();
        if (activeMarkerRef) activeMarkerRef.current = null;
      });
    });
  }, []);
};
