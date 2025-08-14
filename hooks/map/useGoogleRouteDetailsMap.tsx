import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import { useGoogleMapInit } from "./useGoogleMapInit";
import CustomInfoWindow from "@/components/CustomInfoWindow";
import { createGradientRoute, fetchSegmentRoute } from "@/lib/googleMapUtils";
import { businessMarkers, categoryColors, stationMarkers } from "@/lib/utils";
import { misc } from "@/constant/hebrew";

function getIconUrl(categoryId: string, isInRoute: boolean) {
  return isInRoute
    ? `/images/markers/${businessMarkers[categoryId]}`
    : `/images/markers/${stationMarkers[categoryId]}`;
}

function getIconSize(isInRoute: boolean, isActive = false) {
  if (isActive) return new google.maps.Size(70, 70);
  return isInRoute
    ? new google.maps.Size(60, 60)
    : new google.maps.Size(35, 35);
}

export const useGoogleRouteDetailsMap = (
  trailId: string,
  locations: LocationListProps,
  routeStation: LocalstoreTrailStaionsProps[],
) => {
  const mapRef = useRef(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const activeMarkerRef = useRef<google.maps.Marker | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const startInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const endInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isModalClose, setIsModalClose] = useState(false);

  useGoogleMapInit({ mapRef, setMap, infoWindowRef, activeMarkerRef });

  // Add markers
  useEffect(() => {
    if (!map || !locations?.length) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    locations.forEach((location) => {
      const coords = location?.geoLocation;
      if (!coords) return;

      const position = {
        lat: parseFloat(coords.lat),
        lng: parseFloat(coords.long),
      };

      const isInRoute = routeStation?.some((s) => s?._id === location?._id);
      const iconUrl = getIconUrl(location.primaryCategoryId, isInRoute);
      const iconSize = getIconSize(isInRoute);

      const marker = new google.maps.Marker({
        position,
        map,
        icon: {
          url: iconUrl,
          scaledSize: iconSize,
        },
      });

      // Store custom data on marker
      (marker as any).stationId = location._id;
      (marker as any).categoryId = location.primaryCategoryId;
      (marker as any).isInRoute = isInRoute;

      marker.addListener("click", () => {
        const isSameMarker = activeMarkerRef.current === marker;
        const isOpen = infoWindowRef.current?.get("map") != null;

        // If the same marker is clicked again and the info window is open → close it
        if (isSameMarker && isOpen) {
          infoWindowRef.current?.close();
          activeMarkerRef.current = null;

          // Reset the marker icon to its original state
          const isStillInRoute = routeStation?.some(
            (s) => s._id === location._id,
          );
          marker.setIcon({
            url: getIconUrl(location.primaryCategoryId, isStillInRoute),
            scaledSize: getIconSize(isStillInRoute),
          });

          // Reopen Start/End info windows
          const startMarker = markersRef.current.find(
            (m) => (m as any).stationId === routeStation[0]?._id,
          );
          const endMarker = markersRef.current.find(
            (m) =>
              (m as any).stationId ===
              routeStation[routeStation.length - 1]?._id,
          );

          if (startInfoWindowRef.current && startMarker) {
            startInfoWindowRef.current.open(map, startMarker);
          }

          if (endInfoWindowRef.current && endMarker) {
            endInfoWindowRef.current.open(map, endMarker);
          }

          return;
        }

        // Otherwise, proceed as normal
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

        // Reset all other marker icons
        markersRef.current.forEach((m) => {
          if (m !== marker) {
            const markerStationId = (m as any).stationId;
            const markerCategoryId = (m as any).categoryId;
            const isStillInRoute = routeStation?.some(
              (s) => s._id === markerStationId,
            );

            m.setIcon({
              url: getIconUrl(markerCategoryId, isStillInRoute),
              scaledSize: getIconSize(isStillInRoute),
            });

            (m as any).isInRoute = isStillInRoute;
          }
        });

        // Highlight clicked marker
        marker.setIcon({
          url: getIconUrl(location.primaryCategoryId, true),
          scaledSize: getIconSize(true, true),
        });

        activeMarkerRef.current = marker;

        if (!infoWindowRef.current) {
          infoWindowRef.current = new google.maps.InfoWindow({
            content: container,
          });
        }

        infoWindowRef.current.setContent(container);
        infoWindowRef.current.open(map, marker);

        // Check for when info window closes
        const checkInfoWindowClosed = () => {
          if (
            infoWindowRef.current &&
            (infoWindowRef.current as any).getMap() === null
          ) {
            setTimeout(() => {
              const startMarker = markersRef.current.find(
                (m) => (m as any).stationId === routeStation[0]?._id,
              );
              const endMarker = markersRef.current.find(
                (m) =>
                  (m as any).stationId ===
                  routeStation[routeStation.length - 1]?._id,
              );

              if (startInfoWindowRef.current && startMarker) {
                startInfoWindowRef.current.open(map, startMarker);
              }

              if (endInfoWindowRef.current && endMarker) {
                endInfoWindowRef.current.open(map, endMarker);
              }
            }, 50);
            return;
          }

          setTimeout(checkInfoWindowClosed, 100);
        };

        setTimeout(checkInfoWindowClosed, 100);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    const screenWidth = window.innerWidth;
    const padding = screenWidth < 640 ? 30 : 60;

    map.fitBounds(bounds, {
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
    });
  }, [map, locations]);

  useEffect(() => {
    if (isModalClose && infoWindowRef.current) {
      infoWindowRef.current.close();
      activeMarkerRef.current = null;
      setTimeout(() => setIsModalClose(false), 100);
    }
  }, [isModalClose]);

  // Draw route
  useEffect(() => {
    if (!map || !routeStation || !window.google || !locations?.length) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const drawRoute = async () => {
      // Clear old polylines
      polylinesRef.current.forEach((line) => line.setMap(null));
      polylinesRef.current = [];

      // Close previous Start and End InfoWindows
      startInfoWindowRef.current?.close();
      endInfoWindowRef.current?.close();
      startInfoWindowRef.current = null;
      endInfoWindowRef.current = null;

      if (routeStation?.length < 2) return;

      const bounds = new google.maps.LatLngBounds();

      for (let i = 0; i < routeStation?.length; i++) {
        const station = routeStation?.[i];
        const pos = {
          lat: parseFloat(station.geoLocation.lat),
          lng: parseFloat(station.geoLocation.long),
        };

        bounds.extend(pos);

        // Show "Start" and "End" info windows using index
        if (i === 0 || i === routeStation?.length - 1) {
          const label = i === 0 ? misc.start : misc.end;
          const infoDiv = `
            <div style="
              background-color: black;
              color: white;
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 14px;
              font-family: 'Ploni Bold';
            ">${label}</div>
          `;

          const infoWindow = new google.maps.InfoWindow({
            content: infoDiv,
          });

          const marker = markersRef.current.find(
            (m: any) => m.stationId === station._id,
          );
          if (marker) {
            // Only open if no CustomInfoWindow is currently active
            if (
              !activeMarkerRef.current ||
              !(infoWindowRef.current as any).getMap()
            ) {
              infoWindow.open(map, marker);
            }

            if (i === 0) startInfoWindowRef.current = infoWindow;
            if (i === routeStation.length - 1)
              endInfoWindowRef.current = infoWindow;
          }
        }

        if (i < routeStation.length - 1) {
          const next = routeStation[i + 1]!;
          const pathPoints = await fetchSegmentRoute(
            station.geoLocation,
            next.geoLocation,
            signal,
          );

          if (pathPoints.length) {
            // Get hex colors from current station and next station
            const currentStationColor =
              categoryColors[routeStation[i].primaryCategoryId] || "#1976D2"; // fallback to blue
            const nextStationColor =
              categoryColors[routeStation[i + 1].primaryCategoryId] ||
              "#4CAF50"; // fallback to green

            const polyline = new google.maps.Polyline({
              path: pathPoints,
              geodesic: true,
              strokeColor: await createGradientRoute(
                currentStationColor,
                nextStationColor,
              ),
              strokeOpacity: 1.0,
              strokeWeight: 6,
            });

            polyline.setMap(map);
            polylinesRef.current.push(polyline);
          }
        }
      }

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
