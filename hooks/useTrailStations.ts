import useTrailStationStore from "@/stores/trailStationStore";
import { DropResult } from "@hello-pangea/dnd";
import { useEffect, useMemo, useState } from "react";

// Helper to flatten stations
const flattenStations = (stations: TrailDetailsProps["stations"]) =>
  stations?.map((station) => ({
    _id: station._id,
    name: station.name,
    description: station.description,
    image: station.images?.[0]?.image,
    geoLocation: station.geoLocation,
    primaryCategoryId: station.primaryCategoryId._id,
  })) || [];

export const useTrailStations = (
  _id: string,
  stations: TrailStationProps[],
) => {
  const {
    setTrailStations,
    getStationsByTrailId,
    removeTrailStation,
    getRemovedStationsByTrailId,
    resetTrailStation,
  } = useTrailStationStore();

  const [isTrailModified, setIsTrailModified] = useState(false);
  const localStations = getStationsByTrailId(_id);
  const removedStations = getRemovedStationsByTrailId(_id);
  const originalStations = useMemo(() => flattenStations(stations), [stations]);

  // Check if stations are modified
  const checkIfModified = useMemo(() => {
    if (!localStations || localStations.length === 0) return false;

    // Check if any stations are removed
    if (removedStations && removedStations.length > 0) return true;

    // Check if the length or order of stations has changed
    if (localStations.length !== originalStations.length) return true;

    // Check if the order or IDs are different
    return localStations.some(
      (station, index) => station._id !== originalStations[index]._id,
    );
  }, [localStations, removedStations, originalStations]);

  // Setup initial stations and update isTrailModified
  useEffect(() => {
    if (!localStations || localStations.length === 0) {
      setTrailStations(_id, originalStations);
      setIsTrailModified(false);
    } else {
      setIsTrailModified(checkIfModified);
    }
  }, [_id, localStations, originalStations, setTrailStations, checkIfModified]);

  const visibleStations = useMemo(
    () =>
      (localStations || []).filter((s) => !removedStations?.includes(s?._id)),
    [localStations, removedStations],
  );

  // Handlers
  const handleRemove = (stationId: string) => {
    removeTrailStation(_id, stationId);
    setIsTrailModified(true);
  };

  const handleReset = () => {
    resetTrailStation(_id);
    setTrailStations(_id, originalStations);
    setIsTrailModified(false);
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const reordered = [...visibleStations];
    const [removed] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, removed);

    setTrailStations(_id, reordered);
    // Check if the new order differs from original
    const isOrderModified = reordered.some(
      (station, index) => station._id !== originalStations[index]._id,
    );
    setIsTrailModified(isOrderModified || removedStations?.length > 0);
  };

  return {
    isTrailModified,
    handleReset,
    handleDragEnd,
    handleRemove,
    visibleStations,
  };
};
