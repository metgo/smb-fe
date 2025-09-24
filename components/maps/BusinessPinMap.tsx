"use client";

import { useGoogleMap } from "@/hooks/map/useGoogleMap";

const BusinessPinMap = ({
  className = "w-full",
  mapHeight = "95vh",
}: {
  className?: string;
  mapHeight?: string;
}) => {
  const { mapRef } = useGoogleMap();
  return (
    <div style={{ height: mapHeight }} className={`${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-md" />
    </div>
  );
};

export default BusinessPinMap;
