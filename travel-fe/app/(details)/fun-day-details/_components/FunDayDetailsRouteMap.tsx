"use client";

import { useGoogleFunDayDetailsMap } from "@/hooks/map/useGoogleFunDayDetailsMap";

interface FunDayDetailsRouteMapProps {
  _id: string;
  locations: LocationListProps;
  routes: any;
}

const FunDayDetailsRouteMap = ({
  _id,
  locations,
  routes,
}: FunDayDetailsRouteMapProps) => {
  const { mapRef } = useGoogleFunDayDetailsMap(_id, locations, routes);

  return <div ref={mapRef} className="w-full h-full" />;
};

export default FunDayDetailsRouteMap;
