"use client";
import { useGoogleRouteMap } from "@/hooks/useGoogleRouteMap";
import { useEffect, useState } from "react";

const TrailDetailsRouteMap = ({
  _id,
  name,
  description,
  stations,
}: TrailDetailsProps) => {
  const [updatedTripStations, setUpdatedTripStations] = useState<
    TrailStationRouteProps | any
  >();

  const { mapRef } = useGoogleRouteMap(true, updatedTripStations);

  useEffect(() => {
    if (stations?.length > 0) {
      const updatedStations = stations?.map((station) => {
        return {
          _id: station?._id,
          name: station?.name,
          description: station?.description,
          geoLocation: station?.geoLocation,
          primaryCategoryId: station?.primaryCategoryId?._id,
          order: station?.order,
          type: station?.type,
        };
      });

      const updatedTripStations = {
        _id,
        name,
        description,
        stations: updatedStations,
      };
      setUpdatedTripStations(updatedTripStations);
    }
  }, [stations]);

  return <div ref={mapRef} className="w-full h-full" />;
};

export default TrailDetailsRouteMap;
