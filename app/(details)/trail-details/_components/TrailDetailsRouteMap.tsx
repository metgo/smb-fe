"use client";

import useTrailStationStore from "@/stores/trailStationStore";
import { useGoogleRouteDetailsMap } from "@/hooks/useGoogleRouteDetailsMap";

const TrailDetailsRouteMap = ({ _id, locations }: TrailDetailsRouteProps) => {
  const { getStationsByTrailId } = useTrailStationStore();
  const localStorageStations = getStationsByTrailId(_id);
  const { mapRef } = useGoogleRouteDetailsMap(
    _id,
    locations,
    localStorageStations,
  );

  return <div ref={mapRef} className="w-full h-full" />;
};

export default TrailDetailsRouteMap;
