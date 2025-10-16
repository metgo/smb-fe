"use client";

import clsx from "clsx";
import { useState } from "react";
import { useLongPress } from "use-long-press";
import { IoIosCloseCircle } from "react-icons/io";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

import { NextImage } from "@/components/ui";
import { useGoogleRouteDetailsMapMobile } from "@/hooks";
import useTrailStationStore from "@/stores/trailStationStore";
import MobileFeedScreenActionIcons from "@/components/mobile/FeedScreenActionIcons.mobile";

interface MobileTrailDetailsRouteMapProps {
  _id: string;
  name: string;
  description: string;
  handleRemove: any;
  handleDragEnd: any;
  locations: LocationListProps;
  visibleStations: LocalstoreTrailStaionsProps[];
}

const MobileTrailDetailsRouteMap = ({
  _id,
  name,
  description,
  locations,
  visibleStations,
  handleDragEnd,
  handleRemove,
}: MobileTrailDetailsRouteMapProps) => {
  const { getStationsByTrailId } = useTrailStationStore();
  const localStorageStations = getStationsByTrailId(_id);
  const { mapRef } = useGoogleRouteDetailsMapMobile(
    _id,
    locations,
    localStorageStations,
  );

  return (
    <div className="">
      <div className="p-6">
        <div className="">
          <MobileFeedScreenActionIcons strokColor="black" hideThreedotIcon />
          <h1 className="text-3xl font-bold">{name}</h1>
        </div>
        <p className="text-theme font-normal line-clamp-2">{description}</p>
      </div>
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{
          height: "100vh",
          width: "100%",
          position: "relative" as const,
          borderRadius: "0",
          overflow: "hidden",
        }}
      />

      <div className="px-4 py-2 fixed bottom-0 right-0">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="stations-list" direction="horizontal">
            {(provided, snapshot) => (
              <div
                className={clsx(
                  "flex gap-3 overflow-x-auto",
                  snapshot.isDraggingOver ? "overflow-x-hidden" : "",
                )}
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  scrollbarWidth: "thin",
                }}
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
    </div>
  );
};

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
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const bind = useLongPress(
    () => {
      setIsPressed(true);
    },
    {
      threshold: 500,
      captureEvent: true,
      cancelOnMovement: true,
      onFinish: () => {
        // Reset after long press action completes
        setTimeout(() => setIsPressed(false), 3000);
      },
    },
  );

  return (
    <Draggable draggableId={station._id} index={index}>
      {(provided, snapshot) => {
        const isDragging = snapshot.isDragging;

        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            {...bind()}
            className={clsx(
              "relative transition-all duration-200 rounded-md overflow-hidden flex-shrink-0",
              isDragging ? "shadow-lg z-50" : "",
            )}
            style={{
              ...provided.draggableProps.style,
              width: isDragging ? "80px" : "60px",
              height: isDragging ? "80px" : "60px",
            }}
          >
            {/* Station Image */}
            <NextImage
              width={80}
              height={80}
              imgSrc={station.image}
              alt={station.name}
              className="object-cover w-full h-full pointer-events-none"
            />

            {canRemove && isPressed && !isDragging && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(station._id);
                  setIsPressed(false);
                }}
                className="absolute top-1 left-1 z-10 bg-white text-red-500 rounded-full p-0.5 shadow-md"
              >
                <IoIosCloseCircle size={18} />
              </button>
            )}
          </div>
        );
      }}
    </Draggable>
  );
};

export default MobileTrailDetailsRouteMap;
