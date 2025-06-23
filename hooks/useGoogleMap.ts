import { useEffect, useRef, useState } from "react";

import { slides } from "@/constant/placeholderData";
import useGeneralStore from "@/stores/generalStore";
import { getAllBusinessLocation, getBusinessById } from "@/actions/businessActions";
import { googlePointOfInterest } from "@/constant/googlePoi";
import { GOOGLE_API_KEY } from "@/constant/envConstants";
import { businessMarkers } from "@/lib/utils";

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
  const hasFetchedRef = useRef(false);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const activeMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [activeBusinessData, setActiveBusinessData] = useState<any>()
  console.log("activeBusinessData", activeBusinessData)

  const { activeFilterTab, activeCategoryKey } = useGeneralStore();

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [businesses, setBusinesses] = useState<BusinessMakerProps[]>([]);


  async function getBusinessData(businessId: string) {
    console.log("getBusiessData", businessId)
    const res = await getBusinessById(businessId)
    setActiveBusinessData(res)
  }


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
    const item = activeBusinessData?.images[currentSlide];
    const indicators = activeBusinessData?.images?.map((_: any, i: number) => {
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
      <img src="${item?.image}" style="width: 100%; height: 100%; object-fit: cover;" />
      
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
        <h1 style="font-size: 16px; font-weight: bold; margin: 0;">${activeBusinessData.name}</h1>
        <p style="font-size: 12px; margin: 4px 0 8px;">${activeBusinessData.description}</p>
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

    // Clear previous markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const uniqueLocations = new Set();

    const filteredBusiness = activeCategoryKey ? businesses.filter(item => item.primaryCategoryId === activeCategoryKey) : businesses;

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
          scaledSize: new window.google.maps.Size(60, 60),
        },
      });
      (marker as any).businessId = business._id;

      marker.addListener("click", () => {
        const isSameMarker = activeMarkerRef.current === marker;
        const isOpen = infoWindowRef.current?.get("map") != null;

        if (isSameMarker && isOpen) {
          infoWindowRef.current?.close();
          activeMarkerRef.current = null;
          console.log("Closed InfoWindow. Cleared active marker.");
        } else {
          const businessId = (marker as any).businessId;
          console.log("Clicked Marker ID:", businessId);
          getBusinessData(businessId)
          activeMarkerRef.current = marker;
          infoWindowRef.current?.setContent(generateContent());
          infoWindowRef.current?.open(map, marker);
        }
      });

      markersRef.current.push(marker);
    });

    // Dynamic zoom based on screen size
    if (businesses.length > 0) {
      if (businesses.length === 1) {
        const location = businesses?.[0]?.geoLocation
        const lat = parseFloat(location?.lat)
        const lng = parseFloat(location?.long)
        map.setCenter({ lat, lng })

        const screenWidth = window.innerWidth;
        let zoomLevel;
        if (screenWidth < 640)
          zoomLevel = 15;
        else if (screenWidth < 1024)
          zoomLevel = 14
        else
          zoomLevel = 13
        map.setZoom(zoomLevel)
      } else {
        const bounds = new google.maps.LatLngBounds();
        businesses.forEach(location => {
          const coords = location?.geoLocation;
          if (coords) {
            bounds.extend({
              lat: parseFloat(coords.lat),
              lng: parseFloat(coords.long),
            })
          }
        })

        // Calculate dynamic padding based on screen size
        const basePadding = 40
        const screenWidth = window.innerWidth;

        // Scale padding based on screen size
        const paddingScale = screenWidth < 640 ? 0.5 : screenWidth < 1024 ? 0.75 : 1;
        const padding = {
          top: basePadding * paddingScale,
          bottom: basePadding * paddingScale,
          left: basePadding * paddingScale,
          right: basePadding * paddingScale,
        }

        // Fit bounds with dynamic padding
        map.fitBounds(bounds, padding)

        // Adjust zoom to prevent excessive zoom-in on small screens
        const listner = google.maps.event.addListenerOnce(
          map,
          "bounds_changed",
          () => {
            const currentZoom = map.getZoom();
            const maxZoom = screenWidth < 640 ? 16 : screenWidth < 1024 ? 15 : 14;
            if (currentZoom && currentZoom > maxZoom)
              map.setZoom(maxZoom)
            google.maps.event.removeListener(listner)
          }
        )
      }
    }
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

      googleMap.addListener("click", () => {
        infoWindowRef.current?.close();
        activeMarkerRef.current = null;
      });
    });
  }, []);

  useEffect(() => {
    if (businesses.length > 0)
      addMarkers()
  }, [businesses, activeCategoryKey])

  useEffect(() => {
    if (map && infoWindowRef.current && activeMarkerRef.current) {
      infoWindowRef.current.setContent(generateContent());
    }
  }, [currentSlide]);

  return { mapRef };
};