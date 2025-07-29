import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { loadGoogleMapsScript } from "@/lib/googleMap";
import { googlePointOfInterest } from "@/constant/googlePoi";
import { getTrailDetailsBySlug } from "@/actions/trailActions";
import { GOOGLE_API_KEY } from "@/constant/envConstants";

// Utility: Decode polyline
const decodePolyline = (encoded: string): google.maps.LatLng[] => {
  const poly: google.maps.LatLng[] = [];
  let index = 0,
    lat = 0,
    lng = 0;

  while (index < encoded.length) {
    let result = 0,
      shift = 0,
      b;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    result = 0;
    shift = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    poly.push(new google.maps.LatLng(lat / 1e5, lng / 1e5));
  }
  return poly;
};

// Utility: Fetch route segment between two stations
const fetchSegmentRoute = async (
  from: GeoLocation,
  to: GeoLocation,
  signal: AbortSignal,
) => {
  const modes: Array<"DRIVE" | "BICYCLE" | "WALK"> = [
    "DRIVE",
    "BICYCLE",
    "WALK",
  ];

  for (const mode of modes) {
    try {
      const response = await fetch(
        `https://routes.googleapis.com/directions/v2:computeRoutes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLE_API_KEY!,
            "X-Goog-FieldMask": "routes.polyline.encodedPolyline",
          },
          body: JSON.stringify({
            origin: {
              location: {
                latLng: {
                  latitude: parseFloat(from.lat),
                  longitude: parseFloat(from.long),
                },
              },
            },
            destination: {
              location: {
                latLng: {
                  latitude: parseFloat(to.lat),
                  longitude: parseFloat(to.long),
                },
              },
            },
            travelMode: mode,
          }),
          signal,
        },
      );

      if (signal.aborted) return [];

      const data: RouteResponse = await response.json();

      if (data.routes?.[0]) {
        return decodePolyline(data.routes[0].polyline.encodedPolyline);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error(`Error with travelMode ${mode}:`, error);
      }
    }
  }

  // If all modes fail
  return [];
};

const center = { lat: 31.0461, lng: 34.8516 };

export const useGoogleRouteMap = () => {
  const mapRef = useRef(null);
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const markersRef = useRef<google.maps.Marker[]>([]);
  const activeMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeTrailRoute, setActiveTrailRoute] =
    useState<TrailStationRoute | null>(null);

  useEffect(() => {
    if (slug !== undefined) {
      async function getTrailRouteData() {
        setActiveTrailRoute(null);
        const res = await getTrailDetailsBySlug(slug!, true);
        setActiveTrailRoute(res);
      }
      getTrailRouteData();
    }
  }, [slug]);

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

  // In your useEffect:
  useEffect(() => {
    if (!map || !activeTrailRoute || !window.google) return;
    const controller = new AbortController();
    const signal = controller.signal;

    const drawRoute = async () => {
      const stations = [...activeTrailRoute.stations].sort(
        (a, b) => a.order - b.order,
      );

      if (stations.length < 2) return;

      // Clear previous markers
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      // Clear previous polylines
      polylinesRef.current.forEach((polyline) => polyline.setMap(null));
      polylinesRef.current = [];

      for (let i = 0; i < stations.length; i++) {
        const station = stations[i];
        const position = {
          lat: parseFloat(station.geoLocation.lat),
          lng: parseFloat(station.geoLocation.long),
        };

        // Create marker
        const marker = new google.maps.Marker({
          position,
          map,
          title: station.name,
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scaledSize: new google.maps.Size(32, 32),
          },
        });

        marker.addListener("click", () => {
          infoWindowRef.current?.setContent(
            `<div style="max-width: 200px">
          <h3 style="margin:0">${station.name}</h3>
          <p style="margin:0">${station.description}</p>
        </div>`,
          );
          infoWindowRef.current?.open(map, marker);
          activeMarkerRef.current = marker;
        });

        markersRef.current.push(marker);

        // Draw route segment
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
    };

    drawRoute();

    return () => controller.abort(); // cleanup on unmount
  }, [map, activeTrailRoute]);

  return { mapRef };
};
