"use client";
import { useEffect, useState } from "react";
import useTrailStationStore from "@/stores/trailStationStore";
import { useGoogleRouteDetailsMap } from "@/hooks/useGoogleRouteDetailsMap";

const TrailDetailsRouteMap = ({
  _id,
  name,
  description,
  stations,
  locations,
}: TrailDetailsRouteProps) => {
  const [updatedTripStations, setUpdatedTripStations] = useState<
    TrailStationRouteProps | undefined
  >();

  const { mapRef } = useGoogleRouteDetailsMap(locations, updatedTripStations!);
  const { getStationIdsByTrailId } = useTrailStationStore();
  const stationIds = getStationIdsByTrailId(_id);

  useEffect(() => {
    if (!stations || stations.length === 0) return;

    const flatStations = stations.map((station) => ({
      _id: station._id,
      name: station.name,
      description: station.description,
      geoLocation: station.geoLocation,
      primaryCategoryId: station.primaryCategoryId?._id,
      order: station.order,
      type: station.type,
    }));

    let reorderedStations = flatStations;

    if (stationIds && stationIds.length > 0) {
      reorderedStations = stationIds
        .map((id, index) => {
          const matched = flatStations.find((s) => s._id === id);
          return matched ? { ...matched, order: index + 1 } : null;
        })
        .filter(Boolean) as typeof flatStations;
    }

    const newTripStations = {
      _id,
      name,
      description,
      stations: reorderedStations,
    };

    // Prevent unnecessary state updates
    setUpdatedTripStations((prev) => {
      const hasChanged =
        JSON.stringify(prev) !== JSON.stringify(newTripStations);
      return hasChanged ? newTripStations : prev;
    });
  }, [stations, stationIds, _id, name, description]);

  return <div ref={mapRef} className="w-full h-full" />;
};

export default TrailDetailsRouteMap;
