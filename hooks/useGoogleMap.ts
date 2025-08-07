import { useEffect, useRef, useState } from "react";

import useGeneralStore from "@/stores/generalStore";
import {
  getAllBusinessLocation,
  getBusinessById,
} from "@/actions/businessActions";
import { googlePointOfInterest } from "@/constant/googlePoi";
import { businessMarkers, categoryGradinteColor } from "@/lib/utils";
import { loadGoogleMapsScript } from "@/lib/googleMap";

declare global {
  interface Window {
    prevSlide: () => void;
    nextSlide: () => void;
  }
}

function isRichText(content: string): boolean {
  const doc = new DOMParser().parseFromString(content, "text/html");
  // check if the body contains any element nodes
  return Array.from(doc.body.childNodes).some((node) => node.nodeType === 1);
}

const center = { lat: 31.0461, lng: 34.8516 };

export const useGoogleMap = () => {
  const mapRef = useRef(null);
  const hasFetchedRef = useRef(false);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const activeMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const { activeFilterTab, activeCategoryKey, clickedBusinessId } =
    useGeneralStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeBusinessData, setActiveBusinessData] = useState<any>();
  const [businesses, setBusinesses] = useState<BusinessMakerProps[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 3000); // delay 3s
    return () => clearTimeout(timeout);
  }, [activeBusinessData]);

  const gallery = activeBusinessData?.images;

  async function getBusinessData(businessId: string) {
    setActiveBusinessData(null);
    setIsLoading(true);
    try {
      const res = await getBusinessById(businessId);
      setActiveBusinessData(res);
    } catch (e) {
      console.log("---------error:", e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (
      !hasFetchedRef.current &&
      (activeFilterTab === "map" || activeFilterTab === "integrated")
    ) {
      hasFetchedRef.current = true;
      getAllBusinessLocation().then((locations) => {
        setBusinesses(locations);
      });
    }
  }, [activeFilterTab]);

  useEffect(() => {
    const count = gallery?.length;

    if (!count || count < 2) return;

    window.prevSlide = () => {
      setCurrentSlide((prev) => (prev - 1 + count) % count);
    };
    window.nextSlide = () => {
      setCurrentSlide((prev) => (prev + 1) % count);
    };
  }, [gallery]);

  const dimColor = categoryGradinteColor[activeCategoryId]?.dim;
  const lightColor = categoryGradinteColor[activeCategoryId]?.light;

  const generateContent = () => {
    if (isLoading) {
      return `
      <div style="width: 240px; height: 240px; border-radius: 8px; background: #ccc; position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.3); overflow: hidden;">
        <div style="background: #e0e0e0; height: 100%; width: 100%; animation: pulse 1.5s infinite;"></div>
        <style>
          @keyframes pulse {
            0% { background-color: ${dimColor}; }
            50% { background-color: ${lightColor}; }
            100% { background-color: ${dimColor}; }
          }
        </style>
      </div>
    `;
    }

    const item = activeBusinessData?.images[currentSlide];

    const wrappedDescription = isRichText(activeBusinessData?.description)
      ? activeBusinessData?.description
      : `<span>${activeBusinessData?.description}</span>`;

    const indicators = gallery
      ?.map((_: any, i: number) => {
        return `<div style="
      width: ${i === currentSlide ? "8px" : "8px"};
      height: ${i === currentSlide ? "8px" : "8px"};
      border-radius: 50%;
      margin: 0 3px;
      background-color: ${i === currentSlide ? "white" : "rgba(255,255,255,0.4)"};
      display: inline-block;
    "></div>`;
      })
      .join("");

    return `
  <div style="width: 240px; height: 240px; border:2px solid white; border-radius: 8px; overflow: hidden; position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-family: sans-serif;">
    <img src="${item?.image || "./images/image-placeholder.jpg"}" style="width: 100%; height: 100%; object-fit: cover; position: absolute;" />
    
    <!-- Gradient Overlay -->
    <div style="
      position: absolute;
      width: 100%;
      height: 100%;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent 75%);
      z-index: 1;
    "></div>

    <!-- Top content -->
    <div style="position: absolute; top: 16px; right: 16px; left: 16px; color: white; z-index: 2;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="width:40px; height:40px; border:2px solid #D3D3D3; border-radius:12px; overflow:hidden">
          <img src="${activeBusinessData?.logo?.image || "./images/image-placeholder.jpg"}" style="object-fit:cover; width:100%; height:100%" />
        </div>
        <div style="display: flex; align-items: center; gap:10px">
          <img src="/images/icons/pin.svg" style="cursor: pointer;"  />
          <img src="/images/icons/circular-heart.svg" style="cursor: pointer;" />
        </div>
      </div>
    </div>
    
    <!-- Bottom content -->
    <div style="position: absolute; bottom: 16px; right: 16px; left: 16px; color: white; z-index: 2; font-family: Ploni Bold">
      <h1 style="
        font-size: 16px;
        line-hight:16px;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        color:#fff;
        text-overflow: ellipsis;
      ">
        ${activeBusinessData?.name}
      </h1>
      <div style="
        font-size: 12px;
        overflow: hidden;
        height: 14px;
        text-overflow: ellipsis;
        display: -webkit-box;
        color: #fff;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
      "
      >
      ${wrappedDescription}
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; margin-top:10px">
        <button
          style="cursor: ${gallery?.length > 1 ? "pointer" : "not-allowed"};"
          ${gallery?.length === 1 ? "disabled" : ""}
          ${gallery?.length > 1 ? 'onclick="window.prevSlide()"' : ""}
        >
          <img src="/images/icons/next.svg" />
        </button>
        <div style="display:flex; align-items:center; justify-content:center; gap:2">${indicators}</div>
        <button
          style="cursor: ${gallery?.length > 1 ? "pointer" : "not-allowed"};"
          ${gallery?.length === 1 ? "disabled" : ""}
          ${gallery?.length > 1 ? 'onclick="window.nextSlide()"' : ""}
        >
          <img src="/images/icons/prev.svg" />
        </button>
      </div>
    </div>
  </div>
`;
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
          scaledSize: new window.google.maps.Size(60, 60),
        },
      });
      (marker as any).businessId = business._id;
      (marker as any).categoryId = business.primaryCategoryId;

      marker.addListener("click", () => {
        const isSameMarker = activeMarkerRef.current === marker;
        const isOpen = infoWindowRef.current?.get("map") != null;
        setCurrentSlide(0);
        if (isSameMarker && isOpen) {
          infoWindowRef.current?.close();
          activeMarkerRef.current = null;
        } else {
          const businessId = (marker as any).businessId;
          const categoryId = (marker as any).categoryId;
          getBusinessData(businessId);
          setActiveCategoryId(categoryId);
          activeMarkerRef.current = marker;
          infoWindowRef.current?.setContent(generateContent());
          infoWindowRef.current?.open(map, marker);
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
        let zoomLevel;
        if (screenWidth < 640) zoomLevel = 15;
        else if (screenWidth < 1024) zoomLevel = 14;
        else zoomLevel = 13;
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

        // Scale padding based on screen size
        const paddingScale =
          screenWidth < 640 ? 0.5 : screenWidth < 1024 ? 0.75 : 1;
        const padding = {
          top: basePadding * paddingScale,
          bottom: basePadding * paddingScale,
          left: basePadding * paddingScale,
          right: basePadding * paddingScale,
        };

        // Fit bounds with dynamic padding
        map.fitBounds(bounds, padding);

        // Adjust zoom to prevent excessive zoom-in on small screens
        const listner = google.maps.event.addListenerOnce(
          map,
          "bounds_changed",
          () => {
            const currentZoom = map.getZoom();
            const maxZoom =
              screenWidth < 640 ? 16 : screenWidth < 1024 ? 15 : 14;
            if (currentZoom && currentZoom > maxZoom) map.setZoom(maxZoom);
            google.maps.event.removeListener(listner);
          },
        );
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
    if (businesses.length > 0) addMarkers();
  }, [businesses, activeCategoryKey]);

  useEffect(() => {
    if (map && infoWindowRef.current && activeMarkerRef.current) {
      infoWindowRef.current.setContent(generateContent());
    }
  }, [currentSlide]);

  useEffect(() => {
    if (
      map &&
      infoWindowRef.current &&
      activeMarkerRef.current &&
      activeBusinessData
    ) {
      infoWindowRef.current.setContent(generateContent());
      infoWindowRef.current.open(map, activeMarkerRef.current);
    }
  }, [activeBusinessData]);

  return { mapRef };
};
