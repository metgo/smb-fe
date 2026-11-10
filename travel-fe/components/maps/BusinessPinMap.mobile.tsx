"use client";

import { useGoogleMapMobile } from "@/hooks";

const MobileBusinessPinMap = () => {
  const { mapRef, getMapContainerStyles } = useGoogleMapMobile();
  return (
    <div className="w-full h-screen">
      <div ref={mapRef} style={getMapContainerStyles()} />
    </div>
  );
};

export default MobileBusinessPinMap;
