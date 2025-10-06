"use client";

import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import { misc } from "@/constant/hebrew";
import { useGoogleMapInit } from "./useGoogleMapInit";
import CustomInfoWindow from "@/components/CustomInfoWindow";
import { createGradientRoute, fetchSegmentRoute } from "@/lib/googleMapUtils";
import { businessMarkers, categoryColors, stationMarkers } from "@/lib/utils";

function getIconUrl(categoryId: string, isInRoute: boolean) {
  return isInRoute
    ? `/images/markers/${businessMarkers[categoryId]}`
    : `/images/markers/${stationMarkers[categoryId]}`;
}

function getIconSize(isInRoute: boolean, isActive = false) {
  if (isActive) return new google.maps.Size(70, 71);
  return isInRoute
    ? new google.maps.Size(68, 69)
    : new google.maps.Size(40, 41);
}

export const useGoogleRouteDetailsMap = (
  trailId: string,
  locations: LocationListProps,
  routeStation: LocalstoreTrailStaionsProps[],
) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const activeMarkerRef = useRef<google.maps.Marker | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const startInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const endInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isModalClose, setIsModalClose] = useState(false);

  useGoogleMapInit({ mapRef, setMap, infoWindowRef, activeMarkerRef });

  const centerMapOnMarker = (marker: google.maps.Marker) => {
    if (!map) return;

    const position = marker.getPosition();
    if (position) {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Offset upward so InfoWindow isn’t cut off
      const offsetLat = screenHeight < 600 ? 0.001 : 0.002;
      const offsetLng = 0;

      const newCenter = {
        lat: position.lat() - offsetLat,
        lng: position.lng() + offsetLng,
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

  // --- Add markers ---
  useEffect(() => {
    if (!map || !locations?.length) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    locations.forEach((location) => {
      const coords = location.geoLocation;
      if (!coords) return;

      const position = {
        lat: parseFloat(coords.lat),
        lng: parseFloat(coords.long),
      };
      const isInRoute = routeStation?.some((s) => s?._id === location?._id);

      const marker = new google.maps.Marker({
        position,
        map,
        icon: {
          url: getIconUrl(location.primaryCategoryId, isInRoute),
          scaledSize: getIconSize(isInRoute),
        },
      });

      (marker as any).stationId = location._id;
      (marker as any).categoryId = location.primaryCategoryId;
      (marker as any).isInRoute = isInRoute;

      marker.addListener("click", () => {
        const isSameMarker = activeMarkerRef.current === marker;
        const isOpen = infoWindowRef.current?.get("map") != null;

        // Toggle info window
        if (isSameMarker && isOpen) {
          infoWindowRef.current?.close();
          activeMarkerRef.current = null;

          const stillInRoute = routeStation?.some(
            (s) => s?._id === location?._id,
          );
          marker.setIcon({
            url: getIconUrl(location.primaryCategoryId, stillInRoute),
            scaledSize: getIconSize(stillInRoute),
          });
          openStartEndInfoWindows();
          return;
        }

        // Close previous info windows
        startInfoWindowRef.current?.close();
        endInfoWindowRef.current?.close();

        const container = document.createElement("div");
        createRoot(container).render(
          <CustomInfoWindow
            isTrailMap
            stationId={location._id}
            trailId={trailId}
            geoLocation={location.geoLocation}
            primaryCategoryId={location.primaryCategoryId}
            setIsModalClose={setIsModalClose}
          />,
        );

        // Reset all other markers
        markersRef.current.forEach((m) => {
          if (m !== marker) {
            const markerStationId = (m as any).stationId;
            const stillInRoute = routeStation?.some(
              (s) => s._id === markerStationId,
            );
            m.setIcon({
              url: getIconUrl((m as any).categoryId, stillInRoute),
              scaledSize: getIconSize(stillInRoute),
            });
            (m as any).isInRoute = stillInRoute;
          }
        });

        // Highlight clicked marker
        marker.setIcon({
          url: getIconUrl(location.primaryCategoryId, true),
          scaledSize: getIconSize(true, true),
        });
        activeMarkerRef.current = marker;

        centerMapOnMarker(marker);

        if (!infoWindowRef.current)
          infoWindowRef.current = new google.maps.InfoWindow();
        infoWindowRef.current.setContent(container);
        infoWindowRef.current.open(map, marker);

        checkInfoWindowClosed();
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    // const padding = window.innerWidth < 640 ? 30 : 60;
    map.fitBounds(bounds, {
      top: 40,
      bottom: 40,
      left: 40,
      right: 800,
    });
  }, [map, locations, routeStation]);

  // --- Modal close ---
  useEffect(() => {
    if (isModalClose && infoWindowRef.current) {
      infoWindowRef.current.close();
      activeMarkerRef.current = null;
      setTimeout(() => setIsModalClose(false), 100);
    }
  }, [isModalClose]);

  // --- Draw route ---
  useEffect(() => {
    if (!map || !routeStation || !window.google || !locations?.length) return;
    const controller = new AbortController();
    const signal = controller.signal;

    const drawRoute = async () => {
      polylinesRef.current.forEach((line) => line.setMap(null));
      polylinesRef.current = [];
      startInfoWindowRef.current?.close();
      endInfoWindowRef.current?.close();
      startInfoWindowRef.current = null;
      endInfoWindowRef.current = null;

      if (routeStation.length < 2) return;

      const bounds = new google.maps.LatLngBounds();

      for (let i = 0; i < routeStation.length; i++) {
        const station = routeStation[i];
        const pos = {
          lat: parseFloat(station.geoLocation.lat),
          lng: parseFloat(station.geoLocation.long),
        };
        bounds.extend(pos);

        // Show Start/End info windows only once
        if (i === 0 || i === routeStation.length - 1) {
          const label = i === 0 ? misc.start : misc.end;
          const marker = markersRef.current.find(
            (m) => (m as any).stationId === station._id,
          );
          if (marker) {
            const infoWindow = new google.maps.InfoWindow({
              content: `<div style="background:black;color:white;padding:8px 12px;border-radius:6px;font-size:14px;font-family:'Ploni Bold';">${label}</div>`,
            });
            infoWindow.open(map, marker);
            if (i === 0) startInfoWindowRef.current = infoWindow;
            if (i === routeStation.length - 1)
              endInfoWindowRef.current = infoWindow;
          }
        }

        // Draw segments
        if (i < routeStation.length - 1) {
          const next = routeStation[i + 1]!;
          const pathPoints = await fetchSegmentRoute(
            station?.geoLocation,
            next?.geoLocation,
            signal,
          );
          if (!pathPoints.length) continue;

          const polyline = new google.maps.Polyline({
            path: pathPoints,
            geodesic: true,
            strokeColor: await createGradientRoute(
              categoryColors[station.primaryCategoryId] || "#1976D2",
              categoryColors[next.primaryCategoryId] || "#4CAF50",
            ),
            strokeOpacity: 1.0,
            strokeWeight: 6,
          });

          polyline.setMap(map);
          polylinesRef.current.push(polyline);
        }
      }

      map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 600 });
    };

    drawRoute();
    return () => controller.abort();
  }, [map, routeStation, locations]);

  // --- Helpers ---
  const openStartEndInfoWindows = () => {
    const startMarker = markersRef.current.find(
      (m) => (m as any).stationId === routeStation[0]?._id,
    );
    const endMarker = markersRef.current.find(
      (m) =>
        (m as any).stationId === routeStation[routeStation.length - 1]?._id,
    );

    if (startInfoWindowRef.current && startMarker)
      startInfoWindowRef.current.open(map, startMarker);
    if (endInfoWindowRef.current && endMarker)
      endInfoWindowRef.current.open(map, endMarker);
  };

  const checkInfoWindowClosed = () => {
    const interval = setInterval(() => {
      if (!infoWindowRef.current || infoWindowRef.current.get("map") != null)
        return;
      openStartEndInfoWindows();
      clearInterval(interval);
    }, 100);
  };

  return { mapRef };
};
