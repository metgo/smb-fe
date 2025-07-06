"use client";

import { useGoogleSinglePinMap } from "@/hooks/useGoogleSinglePinMap";

const Map = ({
  className = "w-[91vw] h-[30vh]",
  primaryCategoryId,
  geoLocation,
}: {
  className?: string;
  geoLocation: GeoLocation;
  primaryCategoryId: string;
}) => {
  const { mapRef } = useGoogleSinglePinMap(primaryCategoryId, geoLocation);

  return (
    <div className={`${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-2xl" />
    </div>
  );
};

export default Map;
