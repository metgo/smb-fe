import { useEffect, useRef, useState } from "react";
import { Pencil, Search, X } from "lucide-react";

import { envKeys } from "@/lib/envKeys";
import { endpoints } from "@/lib/endpoints";
import { googlePointOfInterest } from "@/lib/utils";

interface BoundaryMapProps {
  center: GeoJsonPoint | null;
  boundary: GeoJsonPolygon | null;
  onCenterChange: (c: GeoJsonPoint) => void;
  onBoundaryChange: (b: GeoJsonPolygon) => void;
}

const DEFAULT_CENTER = { lat: 31.304167, lng: 34.521977 };
const POLYGON_STYLE = {
  strokeColor: "#7c3aed",
  strokeOpacity: 0.9,
  strokeWeight: 2,
  fillColor: "#7c3aed",
  fillOpacity: 0.15,
};

const BoundaryMap = ({
  center,
  boundary,
  onCenterChange,
  onBoundaryChange,
}: BoundaryMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const polygonRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const draftPolygonRef = useRef<any>(null);
  const draftPathRef = useRef<any>(null);
  const mapClickListenerRef = useRef<any>(null);
  const isDrawingRef = useRef(false);
  const featureLayerRef = useRef<any>(null);

  const [isDrawing, setIsDrawing] = useState(false);

  const onCenterRef = useRef(onCenterChange);
  const onBoundaryRef = useRef(onBoundaryChange);
  onCenterRef.current = onCenterChange;
  onBoundaryRef.current = onBoundaryChange;

  const emitPolygon = (polygon: any) => {
    const coords: [number, number][] = polygon
      .getPath()
      .getArray()
      .map((ll: any) => [ll.lng(), ll.lat()] as [number, number]);
    coords.push(coords[0]);
    onBoundaryRef.current({ type: "Polygon", coordinates: [coords] });
  };

  const drawPolygonFromPaths = (
    map: any,
    paths: { lat: number; lng: number }[],
  ) => {
    const g = (window as any).google;
    if (polygonRef.current) polygonRef.current.setMap(null);
    const polygon = new g.maps.Polygon({
      paths,
      map,
      ...POLYGON_STYLE,
      editable: true,
    });
    polygonRef.current = polygon;
    attachPolygonListeners(polygon);
    emitPolygon(polygon);
    return polygon;
  };

  const styleRealBoundary = (placeId: string | null) => {
    const layer = featureLayerRef.current;
    if (!layer) return;
    layer.style = placeId
      ? (params: any) =>
          params.feature?.placeId === placeId
            ? {
                strokeColor: "#810FCB",
                strokeOpacity: 1,
                strokeWeight: 3,
                fillColor: "#810FCB",
                fillOpacity: 0.35,
              }
            : null
      : null;
  };

  const applyPlace = (place: any) => {
    const map = mapInstanceRef.current;
    if (!map || !place?.geometry) return;

    const location = place.geometry.location;
    const center = { lat: location.lat(), lng: location.lng() };

    markerRef.current?.setPosition(center);
    onCenterRef.current({
      type: "Point",
      coordinates: [center.lng, center.lat],
    });

    // Highlight the real administrative boundary shape (visual reference only —
    // Google's FeatureLayer API doesn't expose the polygon's coordinates).
    styleRealBoundary(place.place_id ?? null);

    const viewport = place.geometry.viewport;
    if (viewport) {
      const ne = viewport.getNorthEast();
      const sw = viewport.getSouthWest();
      const rectPaths = [
        { lat: ne.lat(), lng: sw.lng() },
        { lat: ne.lat(), lng: ne.lng() },
        { lat: sw.lat(), lng: ne.lng() },
        { lat: sw.lat(), lng: sw.lng() },
      ];
      drawPolygonFromPaths(map, rectPaths);
      map.fitBounds(viewport);
    } else {
      map.setCenter(center);
      map.setZoom(12);
    }
  };

  const attachPolygonListeners = (polygon: any) => {
    const path = polygon.getPath();
    (window as any).google.maps.event.addListener(path, "set_at", () =>
      emitPolygon(polygon),
    );
    (window as any).google.maps.event.addListener(path, "insert_at", () =>
      emitPolygon(polygon),
    );
  };

  const computeCentroid = (
    polygon: any,
  ): { lat: number; lng: number } | null => {
    const path = polygon.getPath().getArray();
    if (!path.length) return null;
    const lat =
      path.reduce((s: number, p: any) => s + p.lat(), 0) / path.length;
    const lng =
      path.reduce((s: number, p: any) => s + p.lng(), 0) / path.length;
    return { lat, lng };
  };

  const initMap = () => {
    const g = (window as any).google;
    if (!mapRef.current || !g?.maps) return;

    const initialCenter = center?.coordinates?.length
      ? { lat: center.coordinates[1], lng: center.coordinates[0] }
      : DEFAULT_CENTER;

    const map = new g.maps.Map(mapRef.current, {
      center: initialCenter,
      zoom: 10,
      mapTypeControl: false,
      streetViewControl: false,
      zoomControl: true,
      fullscreenControl: false,
      gestureHandling: "greedy",
      ...(envKeys.googleMapId
        ? { mapId: envKeys.googleMapId }
        : { styles: googlePointOfInterest }),
    });
    mapInstanceRef.current = map;

    // Real administrative boundary highlight — only available on a vector map (mapId).
    if (envKeys.googleMapId) {
      featureLayerRef.current = map.getFeatureLayer("LOCALITY");
    }

    // Place search box (fills boundary from the selected place's bounds)
    if (searchInputRef.current && g.maps.places) {
      const autocomplete = new g.maps.places.Autocomplete(
        searchInputRef.current,
        { fields: ["geometry", "name"] },
      );
      autocomplete.bindTo("bounds", map);
      autocomplete.addListener("place_changed", () => {
        applyPlace(autocomplete.getPlace());
      });
    }

    // Draggable center marker
    const marker = new g.maps.Marker({
      position: initialCenter,
      map,
      draggable: true,
      icon: {
        url: "/assets/images/map-pin.png",
        scaledSize: new g.maps.Size(30, 40),
      },
      title: "Center point — drag to adjust",
    });
    markerRef.current = marker;

    marker.addListener("dragend", (e: any) => {
      onCenterRef.current({
        type: "Point",
        coordinates: [e.latLng.lng(), e.latLng.lat()],
      });
    });

    // Render existing boundary
    if (boundary?.coordinates?.[0]?.length) {
      const paths = boundary.coordinates[0].map(([lng, lat]) => ({
        lat,
        lng,
      }));
      const polygon = new g.maps.Polygon({
        paths,
        map,
        ...POLYGON_STYLE,
        editable: true,
      });
      polygonRef.current = polygon;
      attachPolygonListeners(polygon);
    }

    // Manual click-to-draw polygon (DrawingManager was removed in Maps JS API v3.65+)
    mapClickListenerRef.current = map.addListener("click", (e: any) => {
      if (!isDrawingRef.current) return;
      draftPathRef.current.push(e.latLng);
    });
  };

  const finishDrawing = () => {
    // const g = (window as any).google;
    const map = mapInstanceRef.current;
    isDrawingRef.current = false;
    setIsDrawing(false);

    const path = draftPathRef.current;
    if (draftPolygonRef.current) draftPolygonRef.current.setMap(null);
    draftPolygonRef.current = null;
    draftPathRef.current = null;

    if (!path || path.getLength() < 3) return;

    const paths = path.getArray().map((ll: any) => ({
      lat: ll.lat(),
      lng: ll.lng(),
    }));
    const polygon = drawPolygonFromPaths(map, paths);

    const centroid = computeCentroid(polygon);
    if (centroid && markerRef.current) {
      markerRef.current.setPosition(centroid);
      onCenterRef.current({
        type: "Point",
        coordinates: [centroid.lng, centroid.lat],
      });
    }
  };

  const cancelDrawing = () => {
    isDrawingRef.current = false;
    setIsDrawing(false);
    if (draftPolygonRef.current) draftPolygonRef.current.setMap(null);
    draftPolygonRef.current = null;
    draftPathRef.current = null;
  };

  const startDrawing = () => {
    const g = (window as any).google;
    const map = mapInstanceRef.current;
    if (!g || !map) return;

    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }
    if (draftPolygonRef.current) draftPolygonRef.current.setMap(null);

    const path = new g.maps.MVCArray([]);
    draftPathRef.current = path;

    const draftPolygon = new g.maps.Polygon({
      paths: path,
      map,
      ...POLYGON_STYLE,
      editable: false,
    });
    draftPolygonRef.current = draftPolygon;

    isDrawingRef.current = true;
    setIsDrawing(true);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ((window as any).google?.maps?.places) {
      initMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `${endpoints.googleMap}?key=${envKeys.googleMapApiKey}&libraries=places`;
    script.async = true;
    script.onload = initMap;
    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current) {
        document.body.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
      if (mapClickListenerRef.current) {
        (window as any).google?.maps?.event?.removeListener(
          mapClickListenerRef.current,
        );
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full h-94">
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 w-72 max-w-[90%] flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for a city or area…"
            disabled={isDrawing}
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 shadow-md focus:ring-2 focus:ring-violet-500 focus:border-transparent transition disabled:opacity-50"
          />
        </div>
        {isDrawing ? (
          <>
            <button
              type="button"
              onClick={finishDrawing}
              className="px-3 py-2 rounded-lg bg-violet-600 text-white text-xs font-medium shadow-md hover:bg-violet-700 transition whitespace-nowrap"
            >
              Finish
            </button>
            <button
              type="button"
              onClick={cancelDrawing}
              className="px-2 py-2 rounded-lg bg-white border border-gray-300 text-gray-600 shadow-md hover:bg-gray-50 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={startDrawing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 text-xs font-medium shadow-md hover:bg-gray-50 transition whitespace-nowrap"
          >
            <Pencil className="w-3.5 h-3.5" />
            Draw
          </button>
        )}
      </div>
      {isDrawing && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-lg bg-black/70 text-white text-xs shadow-md">
          Click on the map to add points, then Finish
        </div>
      )}
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  );
};

export default BoundaryMap;
