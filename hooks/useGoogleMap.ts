import { useEffect, useRef, useState } from "react";

import { slides } from "@/constant/placeholderData";
import useGeneralStore from "@/stores/generalStore";
import { getAllBusinessLocation } from "@/actions/businessActions";
import { googlePointOfInterest } from "@/constant/googlePoi";
import { GOOGLE_API_KEY } from "@/constant/envConstants";

declare global {
  interface Window {
    prevSlide: () => void;
    nextSlide: () => void;
  }
}

const googleMapsScriptLoaded = {
  loaded: false,
  callbacks: [] as (() => void)[],
};

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
  const mapRef = useRef(null);
  const { activeFilterTab } = useGeneralStore();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const activeMarkerRef = useRef<google.maps.Marker | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedRef.current && activeFilterTab === "map") {
      hasFetchedRef.current = true;
      getAllBusinessLocation().then((locations) => {
        setBusinesses(locations);
      });
    }
  }, [activeFilterTab]);

  useEffect(() => {
    window.prevSlide = () => {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };
    window.nextSlide = () => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    };
  }, []);


  const generateContent = () => {
    const slide = slides[currentSlide];
    console.log("--------slide", slide)
    const indicators = slides.map((_, i) => {
      return `<div style="
      width: ${i === currentSlide ? "12px" : "6px"};
      height: ${i === currentSlide ? "12px" : "6px"};
      border-radius: 50%;
      margin: 0 3px;
      background-color: ${i === currentSlide ? "white" : "rgba(255,255,255,0.4)"};
      display: inline-block;
    "></div>`;
    }).join("");

    return `
    <div style="width: 240px; height: 240px; border:2px solid white; border-radius: 8px; overflow: hidden; position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-family: sans-serif;">
      <img src="${slide?.imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
      
      <div style="position: absolute; top: 16px; right: 16px; left: 16px; color: white;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>logo</div>
          <div style="display: flex; align-items: center; gap:10px">
            <img src="/images/icons/pin.svg" style="cursor: pointer;" onclick="window.nextSlide()" />
            <img src="/images/icons/circular-heart.svg" style="cursor: pointer;" onclick="window.prevSlide()" />
          </div>
        </div>
      </div>
      
      <div style="position: absolute; bottom: 16px; right: 16px; left: 16px; color: white;">
        <h1 style="font-size: 16px; font-weight: bold; margin: 0;">${slide.name}</h1>
        <p style="font-size: 12px; margin: 4px 0 8px;">${slide.desc}</p>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <img src="/images/icons/next.svg" style="cursor: pointer;" onclick="window.prevSlide()" />
          <div>${indicators}</div>
          <img src="/images/icons/prev.svg" style="cursor: pointer;" onclick="window.nextSlide()" />
        </div>
      </div>
    </div>
  `;
  };

  const addMarkers = () => {
    if (!map || !infoWindowRef.current || !mapRef.current || businesses.length === 0) return;

    const uniqueLocations = new Set();

    businesses.forEach((business, index) => {
      const coords = business?.businessId?.geoLocation;
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
          url: "/images/markers/travel.svg",
          scaledSize: new window.google.maps.Size(60, 60),
        },
      });

      
      marker.addListener("click", () => {
        const isSameMarker = activeMarkerRef.current === marker;
        console.log("isSameMarker", isSameMarker)
        const isOpen = infoWindowRef.current?.get("map") != null;

        if (isSameMarker && isOpen) {
          infoWindowRef.current?.close();
          activeMarkerRef.current = null;
        } else {
          activeMarkerRef.current = marker;
          infoWindowRef.current?.setContent(generateContent());
          infoWindowRef.current?.open(map, marker);

          // Hide the close button after a slight delay to ensure the InfoWindow is rendered
          setTimeout(() => {
            const iw = document.querySelector(".gm-style-iw");
            const closeButton = iw?.parentElement?.querySelector('button[aria-label="Close"]');
            if (closeButton) (closeButton as HTMLElement).style.display = "none";
          }, 0);
        }
      });
    });
  };

  useEffect(() => {
    loadGoogleMapsScript(() => {
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
      infoWindowRef.current = new window.google.maps.InfoWindow({
        maxWidth: 420,
        disableAutoPan: true,
        pixelOffset: new window.google.maps.Size(0, -10),
      });

      addMarkers(); // Call addMarkers immediately after map initialization

      googleMap.addListener("click", () => {
        infoWindowRef.current?.close();
        activeMarkerRef.current = null;
      });
    });
  }, []);

  useEffect(() => {
    if (businesses.length > 0)
      addMarkers()
  }, [businesses])

  useEffect(() => {
    if (map && infoWindowRef.current && activeMarkerRef.current) {
      infoWindowRef.current.setContent(generateContent());
    }
  }, [currentSlide]);

  return { mapRef };
};