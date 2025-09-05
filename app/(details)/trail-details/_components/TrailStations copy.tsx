"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Tooltip } from "react-tooltip";

import { misc } from "@/constant/hebrew";
import { stationCategory } from "@/lib/utils";
import useTrailStationStore from "@/stores/trailStationStore";
import { IconImage, MapNavButton, NextImage } from "@/components/ui";
import clsx from "clsx";

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

// Station Card Component
const StationCard = ({
  station,
  index,
  onRemove,
  canRemove,
}: {
  station: LocalstoreTrailStaionsProps;
  index: number;
  onRemove: (id: string) => void;
  canRemove: boolean;
}) => (
  <Draggable draggableId={station._id} index={index}>
    {(provided) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className="group grid grid-cols-6 items-center gap-2.5 p-2.5 border-t border-primary bg-white"
      >
        {/* Image */}
        <div className="col-span-2 h-[118px] relative">
          <NextImage
            width={140}
            height={118}
            alt={station.name}
            imgSrc={station?.image}
            className="rounded-md object-cover h-full"
          />
          <div className="h-7.5 w-7.5 rounded-full bg-white absolute top-1 right-1">
            <Image
              width={30}
              height={30}
              alt="category icon"
              src={`/images/category/${stationCategory[station.primaryCategoryId]}`}
              className="object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="col-span-4">
          <div className="flex items-start justify-between">
            <h2 className="font-bold text-dark max-w-68">{station.name}</h2>
            {canRemove && (
              <>
                <IoIosCloseCircle
                  size={24}
                  data-tooltip-id="remove-info"
                  className="hidden group-hover:block custom-cursor"
                  onClick={() => onRemove(station._id)}
                />
                <Tooltip
                  id="remove-info"
                  place="left"
                  offset={10}
                  content={misc.statingRemoving}
                />
              </>
            )}
          </div>
          <div
            className="font-normal text-theme text-sm line-clamp-2"
            dangerouslySetInnerHTML={{ __html: station?.description }}
          />
          <div className="flex items-center justify-end gap-2 w-full mt-1.75">
            <MapNavButton
              lat={station?.geoLocation?.lat}
              lng={station?.geoLocation?.long}
              clssName="border border-theme rounded-lg"
            />
            <button
              type="button"
              className="bg-dark rounded-lg p-1 custom-cursor"
            >
              <IconImage icon="basket-white" />
            </button>
          </div>
        </div>
      </div>
    )}
  </Draggable>
);

const TrailStations = ({ stations, _id }: TrailDetailsProps) => {
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

  // Setup initial stations
  useEffect(() => {
    if (!localStations || localStations.length === 0) {
      setIsTrailModified(false);
      setTrailStations(_id, flattenStations(stations));
    } else {
      setIsTrailModified(true);
    }
  }, [stations, _id, localStations, setTrailStations]);

  // Get visible stations (memoized)
  const visibleStations = useMemo(
    () =>
      (localStations || []).filter((s) => !removedStations?.includes(s._id)),
    [localStations, removedStations],
  );

  // Handlers
  const handleRemove = (stationId: string) =>
    removeTrailStation(_id, stationId);

  const handleReset = () => {
    resetTrailStation(_id);
    setTrailStations(_id, flattenStations(stations));
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const reordered = [...visibleStations];
    const [removed] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, removed);

    setTrailStations(_id, reordered);
  };

  return (
    <div>
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-4">
        <button
          type="button"
          disabled={isTrailModified}
          onClick={handleReset}
          className={clsx(
            isTrailModified
              ? "cursor-not-allowed bg-secondary"
              : "custom-cursor bg-black",
            "rounded-xl px-4 py-2  font-bold text-white flex items-center gap-2",
          )}
        >
          <IconImage icon="reset" />
          {misc.cancelChanges}
        </button>
        <button
          type="button"
          className="custom-cursor bg-dark rounded-xl ps-2.5 pe-4 py-2 flex items-center gap-1.25"
        >
          <IconImage icon="basket-white" />
          <span className="text-white font-bold">
            {misc.addAllStationOnCart}
          </span>
        </button>
      </div>

      {/* Drag & Drop List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="stations-list">
          {(provided) => (
            <div
              className="max-h-[55%] overflow-y-scroll"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {visibleStations?.map((station, index) => (
                <StationCard
                  key={station._id}
                  station={station}
                  index={index}
                  onRemove={handleRemove}
                  canRemove={visibleStations.length > 2}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default TrailStations;
