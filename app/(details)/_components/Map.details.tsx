"use client";

import { useGoogleMap } from "@/hooks/useGoogleMap";

const Map = ({ className = "w-[91vw] h-[30vh]" }: { className?: string }) => {
  const { mapRef } = useGoogleMap();

  return (
    <div className={`${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-2xl" />
    </div>
  );
};

export default Map;
