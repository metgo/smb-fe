"use client";

import { useGoogleMap } from "@/hooks/useGoogleMap";

const Map = () => {
  const { mapRef } = useGoogleMap();

  return (
    <div className={`w-[91vw] h-[30vh]`}>
      <div ref={mapRef} className="w-full h-full rounded-md" />
    </div>
  );
};

export default Map;
