import React from "react";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { misc } from "@/constant/hebrew";
import { businessMarkers, stationMarkers } from "@/lib/utils";
import { loadGoogleMapsScript } from "@/lib/googleMap";
import { googlePointOfInterest } from "@/constant/googlePoi";
import { centerIseral, fetchSegmentRoute } from "@/lib/mapUtils";
import CustomInfoWindow from "@/components/CustomInfoWindow";

export const useGoogleRouteDetailsMap = (
  locations: LocationListProps,
  routeStation: TrailStationRouteProps,
) => {
  const mapRef = useRef(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // 1. Load Map
  useEffect(() => {
    loadGoogleMapsScript(() => {
      if (!window.google || !mapRef.current) return;

      const googleMap = new window.google.maps.Map(mapRef.current, {
        center: centerIseral,
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
        maxWidth: 420,
        disableAutoPan: true,
        pixelOffset: new google.maps.Size(0, -10),
      });

      googleMap.addListener("click", () => {
        infoWindowRef.current?.close();
      });
    });
  }, []);

  // 2. Add all location markers
  // useEffect(() => {
  //   if (!map || !locations?.length) return;

  //   markersRef.current.forEach((marker) => marker.setMap(null));
  //   markersRef.current = [];

  //   const bounds = new google.maps.LatLngBounds();

  //   locations.forEach((location) => {
  //     const coords = location?.geoLocation;
  //     if (!coords) return;

  //     const lat = parseFloat(coords.lat);
  //     const lng = parseFloat(coords.long);
  //     const position = { lat, lng };

  //     // Check if the current location is part of routeStation
  //     const isInRouteStation = routeStation?.stations.some((s) => s._id === location._id);

  //     const iconUrl = isInRouteStation
  //       ? `/images/markers/${businessMarkers[location.primaryCategoryId as any]}`
  //       : `/images/markers/${stationMarkers[location.primaryCategoryId as any]}`;

  //     const iconSize = isInRouteStation ? new window.google.maps.Size(60, 60) : new window.google.maps.Size(35, 35)

  //     const marker = new window.google.maps.Marker({
  //       position,
  //       map,
  //       icon: {
  //         url: iconUrl,
  //         scaledSize: iconSize,
  //       },
  //     });

  //     (marker as any).businessId = location._id;
  //     markersRef.current.push(marker);
  //     bounds.extend(position);
  //   });

  //   // Fit map to all locations
  //   const screenWidth = window.innerWidth;
  //   const padding = screenWidth < 640 ? 30 : 60;

  //   map.fitBounds(bounds, {
  //     top: padding,
  //     bottom: padding,
  //     left: padding,
  //     right: padding,
  //   });
  // }, [map, locations]);

  useEffect(() => {
    if (!map || !locations?.length) return;

    // Clear previous markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    locations.forEach((location) => {
      const coords = location?.geoLocation;
      if (!coords) return;

      const lat = parseFloat(coords.lat);
      const lng = parseFloat(coords.long);
      const position = { lat, lng };

      // Check if this marker is from routeStation
      const isInRouteStation = routeStation?.stations.some(
        (s) => s._id === location._id,
      );

      const iconUrl = isInRouteStation
        ? `/images/markers/${businessMarkers[location.primaryCategoryId as any]}`
        : `/images/markers/${stationMarkers[location.primaryCategoryId as any]}`;

      const iconSize = isInRouteStation
        ? new window.google.maps.Size(60, 60)
        : new window.google.maps.Size(35, 35);

      const marker = new window.google.maps.Marker({
        position,
        map,
        icon: {
          url: iconUrl,
          scaledSize: iconSize,
        },
      });

      // 🟡 Attach InfoWindow with React component
      marker.addListener("click", () => {
        const container = document.createElement("div");
        createRoot(container).render(
          <CustomInfoWindow stationId={location._id} />,
        );

        if (!infoWindowRef.current) {
          infoWindowRef.current = new google.maps.InfoWindow();
        }

        infoWindowRef.current.setContent(container);
        infoWindowRef.current.open(map, marker);
      });

      (marker as any).businessId = location._id;
      markersRef.current.push(marker);
      bounds.extend(position);
    });

    // Fit map to bounds
    const screenWidth = window.innerWidth;
    const padding = screenWidth < 640 ? 30 : 60;

    map.fitBounds(bounds, {
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
    });
  }, [map, locations]);

  // 3. Draw route between matched stations
  useEffect(() => {
    if (!map || !routeStation || !window.google || !locations?.length) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const drawRoute = async () => {
      // Clear old route lines only
      polylinesRef.current.forEach((line) => line.setMap(null));
      polylinesRef.current = [];

      const stations = routeStation.stations
        .sort((a, b) => a.order - b.order)
        .map((station) => locations.find((loc) => loc._id === station._id))
        .filter(Boolean);

      if (stations.length < 2) return;

      const bounds = new google.maps.LatLngBounds();

      for (let i = 0; i < stations.length; i++) {
        const station = stations[i]!;
        const pos = {
          lat: parseFloat(station.geoLocation.lat),
          lng: parseFloat(station.geoLocation.long),
        };

        bounds.extend(pos);

        // Add labels for start and end
        if (i === 0 || i === stations.length - 1) {
          const label = i === 0 ? misc.start : misc.end;
          const infoDiv = `
            <div style="
              background-color: black;
              color: white;
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 14px;
              font-family: 'Ploni Bold'
            ">${label}</div>
          `;

          const infoWindow = new google.maps.InfoWindow({
            content: infoDiv,
          });

          const marker = markersRef.current.find(
            (m: any) => m.businessId === station._id,
          );
          if (marker) infoWindow.open(map, marker);
        }

        // Draw path to next
        if (i < stations.length - 1) {
          const next = stations[i + 1]!;
          const pathPoints = await fetchSegmentRoute(
            station.geoLocation,
            next.geoLocation,
            signal,
          );

          if (pathPoints.length) {
            const polyline = new google.maps.Polyline({
              path: pathPoints,
              geodesic: true,
              strokeColor: "#1976D2",
              strokeOpacity: 1.0,
              strokeWeight: 3,
            });
            polyline.setMap(map);
            polylinesRef.current.push(polyline);
          }
        }
      }

      // Adjust to route path as well
      map.fitBounds(bounds, {
        top: 60,
        bottom: 60,
        left: 60,
        right: 60,
      });
    };

    drawRoute();
    return () => controller.abort();
  }, [map, routeStation, locations]);

  return { mapRef };
};
