"use client";

import { useGoogleFunDayDetailsMap } from "@/hooks/map/useGoogleFunDayDetailsMap";
import useTrailStationStore from "@/stores/trailStationStore";

const FunDayDetailsRouteMap = ({ _id, locations }: TrailDetailsRouteProps) => {
  const { getStationsByTrailId } = useTrailStationStore();
  const localStorageStations = getStationsByTrailId(_id);
  const { mapRef } = useGoogleFunDayDetailsMap(
    _id,
    locations,
    localStorageStations,
  );

  return <div ref={mapRef} className="w-full h-full" />;
};

export default FunDayDetailsRouteMap;
