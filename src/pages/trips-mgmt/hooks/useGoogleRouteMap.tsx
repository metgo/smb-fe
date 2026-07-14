'use client';

import { createRoot } from 'react-dom/client';
import { useEffect, useRef, useState } from 'react';


import { envKeys } from '@/lib/envKeys';
import { useAppSelector } from '@/hooks/hooks';
import { useThemeClasses } from '@/hooks/useThemeClasses';
import CustomInfoWindow from '../components/sub-components/CustomInfoWindow';
import { centerIseral, decodePolyline, goolgeMapControlers, loadGoogleMapsScript } from '@/utils/googleMapUtils';

// Simplified icon sizing - only two states
function getIconSize(isActiveOrInRoute: boolean) {
  return isActiveOrInRoute
    ? new google.maps.Size(36, 48)
    : new google.maps.Size(26, 36);
}

const fetchSegmentRoute = async (
  from: GeoLocation,
  to: GeoLocation,
  signal: AbortSignal
) => {
  const modes: Array<'DRIVE' | 'BICYCLE' | 'WALK'> = [
    'DRIVE',
    'BICYCLE',
    'WALK',
  ];

  for (const mode of modes) {
    try {
      const response = await fetch(
        `https://routes.googleapis.com/directions/v2:computeRoutes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': envKeys.googleMapApiKey,
            'X-Goog-FieldMask': 'routes.polyline.encodedPolyline',
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
        }
      );

      if (signal.aborted) return [];

      const data: TRouteResponse = await response.json();

      if (data.routes?.[0]) {
        return decodePolyline(data.routes[0].polyline?.encodedPolyline || '');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error(`Error with travelMode ${mode}:`, error);
      }
    }
  }

  return [];
};

export const useGoogleRouteMap = (
  activeCategoryIds: string[],
  setClickedStation: (v: IClickedStationProps) => void,
) => {
  const { isRTL } = useThemeClasses()
  const markers = useAppSelector((state) => state.stations.businesses);
  const selectedStations = useAppSelector(
    (state) => state.stations.selectedStations,
  );

  const mapRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const numberedMarkersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const activeMarkerRef = useRef<google.maps.Marker | null>(null);

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isModalClose, setIsModalClose] = useState(false);
  // const isInitialLoadRef = useRef(true);


  useEffect(() => {
    loadGoogleMapsScript(() => {
      if (!window.google || !mapRef.current) return;

      setTimeout(() => {
        const googleMap = new window.google.maps.Map(mapRef.current!, {
          ...goolgeMapControlers,
          center: centerIseral,
          zoom: 10,
        });

        setMap(googleMap);
        infoWindowRef.current = new google.maps.InfoWindow({
          maxWidth: 420,
          disableAutoPan: false,
          pixelOffset: new google.maps.Size(0, -10),
        });

        googleMap.addListener('click', () => {
          infoWindowRef.current?.close();
          if (activeMarkerRef.current) {
            // Reset active marker to normal or in-route size
            const stationId = (activeMarkerRef.current as any).stationId;
            const iconUrl = (activeMarkerRef.current as any).iconUrl;
            const isInRoute = selectedStations?.some(
              (s) => s?.stationId === stationId
            );
            activeMarkerRef.current.setIcon({
              url: iconUrl,
              scaledSize: getIconSize(isInRoute),
            });
            activeMarkerRef.current = null;
          }
        });
      }, 100);
    });
  }, []);

  const centerMapOnMarker = (marker: google.maps.Marker) => {
    if (!map) return;

    const position = marker.getPosition();
    if (position) {
      map.panTo(position);

      // Only zoom in if current zoom is too far out
      const currentZoom = map.getZoom();
      if (currentZoom && currentZoom < 12) {
        map.setZoom(13);
      }
    }
  };

  // --- Add markers ---
  useEffect(() => {
    if (!map || !markers?.length) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    markers.forEach((location) => {
      const coords = location.geoLocation;
      if (!coords) return;

      const position = {
        lat: parseFloat(coords.lat),
        lng: parseFloat(coords.long),
      };

      const isInRoute =
        selectedStations.length > 0
          ? selectedStations?.some((s) => s?.stationId === location?._id)
          : false;

      // Get icon URL
      const iconUrl = location?.iconPath || '/assets/img/metgo/map-pin.png';

      const marker = new google.maps.Marker({
        position,
        map,
        icon: {
          url: iconUrl,
          scaledSize: getIconSize(isInRoute),
        },
      });

      // Store metadata
      (marker as any).stationId = location._id;
      (marker as any).iconUrl = iconUrl;

      marker.addListener('click', () => {
        setClickedStation({
          stationId: location?._id,
          geoLocation: location?.geoLocation,
        });
        const isSameMarker = activeMarkerRef.current === marker;
        const isOpen = infoWindowRef.current?.get('map') != null;

        // Toggle info window if clicking same marker
        if (isSameMarker && isOpen) {
          infoWindowRef.current?.close();

          // Reset to in-route size or normal
          const stillInRoute = selectedStations?.some(
            (s) => s?.stationId === location?._id
          );
          marker.setIcon({
            url: iconUrl,
            scaledSize: getIconSize(stillInRoute),
          });
          activeMarkerRef.current = null;
          return;
        }

        // Reset previous active marker
        if (activeMarkerRef.current && activeMarkerRef.current !== marker) {
          const prevStationId = (activeMarkerRef.current as any).stationId;
          const prevIconUrl = (activeMarkerRef.current as any).iconUrl;
          const prevInRoute = selectedStations?.some(
            (s) => s.stationId === prevStationId
          );
          activeMarkerRef.current.setIcon({
            url: prevIconUrl,
            scaledSize: getIconSize(prevInRoute),
          });
        }

        // Set new active marker to large size
        marker.setIcon({
          url: iconUrl,
          scaledSize: getIconSize(true),
        });
        activeMarkerRef.current = marker;

        // Center map on clicked marker
        centerMapOnMarker(marker);

        // Create info window content
        const container = document.createElement('div');
        createRoot(container).render(
          <CustomInfoWindow
            isHebrew={isRTL}
            markers={markers}
            setIsModalClose={setIsModalClose}
            clickedStation={{
              stationId: location?._id,
              geoLocation: location?.geoLocation,
            }}
          />
        );

        if (!infoWindowRef.current) {
          infoWindowRef.current = new google.maps.InfoWindow();
        }
        infoWindowRef.current.setContent(container);
        infoWindowRef.current.open(map, marker);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds on initial load only
    // if (isInitialLoadRef.current && markersRef.current.length > 0) {
    //   fitBoundsToContent();
    //   isInitialLoadRef.current = false;
    // }
  }, [map, markers, activeCategoryIds]);

  // Update marker sizes when selectedStations changes
  useEffect(() => {
    if (!markersRef.current.length) return;

    markersRef.current.forEach((marker) => {
      const stationId = (marker as any).stationId;
      const iconUrl = (marker as any).iconUrl;
      const isInRoute = selectedStations?.some(
        (s) => s?.stationId === stationId
      );
      const isActive = activeMarkerRef.current === marker;

      marker.setIcon({
        url: iconUrl,
        scaledSize: getIconSize(isActive || isInRoute),
      });
    });
  }, [selectedStations]);

  // --- Modal close ---
  useEffect(() => {
    if (isModalClose && infoWindowRef.current) {
      infoWindowRef.current.close();
      if (activeMarkerRef.current) {
        const stationId = (activeMarkerRef.current as any).stationId;
        const iconUrl = (activeMarkerRef.current as any).iconUrl;
        const isInRoute = selectedStations?.some(
          (s) => s.stationId === stationId
        );
        activeMarkerRef.current.setIcon({
          url: iconUrl,
          scaledSize: getIconSize(isInRoute),
        });
        activeMarkerRef.current = null;
      }
      setTimeout(() => setIsModalClose(false), 1000);
    }
  }, [isModalClose, selectedStations]);

  // --- Draw route and fit bounds ---
  useEffect(() => {
    if (!map || !selectedStations || !window.google || !markers?.length) return;
    const controller = new AbortController();
    const signal = controller.signal;

    const drawRoute = async () => {
      // Clear previous polylines and numbered markers
      polylinesRef.current.forEach((line) => line.setMap(null));
      polylinesRef.current = [];

      numberedMarkersRef.current.forEach((m) => m.setMap(null));
      numberedMarkersRef.current = [];

      // if (selectedStations.length < 2) {
      //   // If less than 2 stations, just fit to markers
      //   fitBoundsToContent();
      //   return;
      // }

      for (let i = 0; i < selectedStations.length; i++) {
        const station = selectedStations[i];
        const pos = {
          lat: parseFloat(station.geoLocation.lat),
          lng: parseFloat(station.geoLocation.long),
        };

        // Add numbered marker
        const numberMarker = new google.maps.Marker({
          position: pos,
          map,
          label: {
            text: String(i + 1),
            color: '#fff',
            fontSize: '12px',
            fontWeight: 'bold',
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#1976D2',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
            scale: 14,
          },
          zIndex: 1000, // Keep numbers on top
        });

        numberedMarkersRef.current.push(numberMarker);

        // Draw route segment
        if (i < selectedStations.length - 1) {
          const next = selectedStations[i + 1]!;
          const pathPoints = await fetchSegmentRoute(
            station.geoLocation,
            next.geoLocation,
            signal
          );
          if (!pathPoints.length) continue;

          const polyline = new google.maps.Polyline({
            path: pathPoints,
            geodesic: true,
            strokeColor: '#1976D2',
            strokeOpacity: 1.0,
            strokeWeight: 6,
          });

          polyline.setMap(map);
          polylinesRef.current.push(polyline);
        }
      }

      // Fit bounds after all routes are drawn
      // setTimeout(() => {
      //   fitBoundsToContent();
      // }, 300);
    };

    drawRoute();
    return () => controller.abort();
  }, [map, selectedStations, markers]);

  return { mapRef };
};
