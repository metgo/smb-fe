import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { misc } from "@/constant/hebrew";
import { businessMarkers } from "@/lib/utils";
import useGeneralStore from "@/stores/generalStore";
import { loadGoogleMapsScript } from "@/lib/googleMap";
import { googlePointOfInterest } from "@/constant/googlePoi";
import { getTrailDetailsBySlug } from "@/actions/trailActions";
import { centerIseral, fetchSegmentRoute } from "@/lib/mapUtils";

export const useGoogleRouteMap = (
  isDetailsPage: boolean = false,
  routeStation?: TrailStationRouteProps,
) => {
  const mapRef = useRef(null);
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const { activeFilterTab } = useGeneralStore();

  const markersRef = useRef<google.maps.Marker[]>([]);
  const activeMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeTrailRoute, setActiveTrailRoute] =
    useState<TrailStationRouteProps | null>(null);

  useEffect(() => {
    if (
      slug !== undefined &&
      activeFilterTab === "integrated" &&
      !isDetailsPage
    ) {
      const timeoutId = setTimeout(() => {
        async function getTrailRouteData() {
          setActiveTrailRoute(null);
          const res = await getTrailDetailsBySlug(slug!, true);
          setActiveTrailRoute(res);
        }
        getTrailRouteData();
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setActiveTrailRoute(routeStation ? routeStation : null);
    }
  }, [slug, activeFilterTab, routeStation, isDetailsPage]);

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
    if (!map || !activeTrailRoute || !window.google) return;
    const controller = new AbortController();
    const signal = controller.signal;

    const drawRoute = async () => {
      const stations = [...activeTrailRoute.stations].sort(
        (a, b) => a.order - b.order,
      );

      if (stations.length < 2) return;

      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      polylinesRef.current.forEach((polyline) => polyline.setMap(null));
      polylinesRef.current = [];

      const bounds = new google.maps.LatLngBounds();

      for (let i = 0; i < stations.length; i++) {
        const station = stations[i];
        const position = {
          lat: parseFloat(station?.geoLocation?.lat),
          lng: parseFloat(station?.geoLocation?.long),
        };

        const marker = new google.maps.Marker({
          position,
          map,
          title: station.name,
          icon: {
            url: `/images/markers/${businessMarkers[station.primaryCategoryId as any]}`,
            scaledSize: new window.google.maps.Size(60, 60),
          },
        });

        markersRef.current.push(marker);
        bounds.extend(position); // <== Important for zooming to fit

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

          infoWindow.open(map, marker);
        }
        // else {
        //   marker.addListener("click", () => {
        //     infoWindowRef.current?.setContent(
        //       `<div style="max-width: 200px">
        //     <h3 style="margin:0">${station.name}</h3>
        //     <p style="margin:0">${station.description}</p>
        //   </div>`,
        //     );
        //     infoWindowRef.current?.open(map, marker);
        //     activeMarkerRef.current = marker;
        //   });
        // }

        if (i < stations.length - 1) {
          const nextStation = stations[i + 1];
          const pathPoints = await fetchSegmentRoute(
            station.geoLocation,
            nextStation.geoLocation,
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

      // Fit all markers with 30px padding
      map.fitBounds(bounds, {
        top: 60,
        bottom: 60,
        left: 60,
        right: 60,
      });
    };

    drawRoute();

    return () => controller.abort(); // cleanup
  }, [map, activeTrailRoute]);

  return { mapRef };
};
