import { useEffect, useRef } from "react";

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
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const polygonRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

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
    if (!mapRef.current || !g?.maps?.drawing) return;

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
      styles: googlePointOfInterest,
    });

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

    // Drawing manager
    const dm = new g.maps.drawing.DrawingManager({
      drawingMode: g.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: g.maps.ControlPosition.TOP_RIGHT,
        drawingModes: [g.maps.drawing.OverlayType.POLYGON],
      },
      polygonOptions: { ...POLYGON_STYLE, editable: true },
    });
    dm.setMap(map);

    g.maps.event.addListener(dm, "polygoncomplete", (polygon: any) => {
      if (polygonRef.current) polygonRef.current.setMap(null);
      polygonRef.current = polygon;
      dm.setDrawingMode(null);
      attachPolygonListeners(polygon);
      emitPolygon(polygon);

      const centroid = computeCentroid(polygon);
      if (centroid && markerRef.current) {
        markerRef.current.setPosition(centroid);
        onCenterRef.current({
          type: "Point",
          coordinates: [centroid.lng, centroid.lat],
        });
      }
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ((window as any).google?.maps?.drawing) {
      initMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `${endpoints.googleMap}?key=${envKeys.googleMapApiKey}&libraries=drawing`;
    script.async = true;
    script.onload = initMap;
    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current) {
        document.body.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={mapRef} className="w-full h-94 rounded-lg" />;
};

export default BoundaryMap;
