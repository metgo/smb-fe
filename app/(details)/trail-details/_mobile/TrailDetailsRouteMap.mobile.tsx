"use client";

import useTrailStationStore from "@/stores/trailStationStore";
import { useGoogleRouteDetailsMapMobile } from "@/hooks";

const MobileTrailDetailsRouteMap = ({
  _id,
  locations,
}: TrailDetailsRouteProps) => {
  const { getStationsByTrailId } = useTrailStationStore();
  const localStorageStations = getStationsByTrailId(_id);
  const { mapRef, getMapContainerStyles } = useGoogleRouteDetailsMapMobile(
    _id,
    locations,
    localStorageStations,
  );

  return (
    <div className="">
      <div
        ref={mapRef}
        className="w-full h-full"
        style={getMapContainerStyles()}
      />
      ;
    </div>
  );
};

export default MobileTrailDetailsRouteMap;
