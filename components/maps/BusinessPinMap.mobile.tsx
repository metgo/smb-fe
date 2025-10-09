"use client";

import { useGoogleMapMobile } from "@/hooks";

const MobileBusinessPinMap = ({
  className = "w-full",
  mapHeight = "95vh",
}: {
  className?: string;
  mapHeight?: string;
}) => {
  const { mapRef } = useGoogleMapMobile();
  return (
    <div style={{ height: mapHeight }} className={`${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-md" />
    </div>
  );
};

export default MobileBusinessPinMap;
