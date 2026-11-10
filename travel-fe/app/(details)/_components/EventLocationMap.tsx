"use client";

import { useEventPinMap } from "@/hooks/useEventPinMap";

const EventLocationMap = ({
  className = "w-[91vw] h-[30vh]",
  geoLocation,
}: {
  className?: string;
  geoLocation: GeoLocation;
}) => {
  const { mapRef } = useEventPinMap(geoLocation);

  return (
    <div className={`${className}`}>
      <div ref={mapRef} className="w-[98%] h-full rounded-2xl" />
    </div>
  );
};

export default EventLocationMap;
