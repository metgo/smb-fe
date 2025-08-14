"use client";

import { useGoogleMap } from "@/hooks/map/useGoogleMap";

const BusinessPinMap = ({ className = "w-full" }: { className?: string }) => {
  const { mapRef } = useGoogleMap();
  return (
    <div className={`${className} h-[95vh]`}>
      <div ref={mapRef} className="w-full h-full rounded-md" />
    </div>
  );
};

export default BusinessPinMap;
