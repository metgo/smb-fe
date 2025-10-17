"use client";

import clsx from "clsx";
import { useState, useEffect } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import { useLongPress } from "use-long-press";

import { NextImage } from "@/components/ui";
import { useGoogleRouteDetailsMapMobile } from "@/hooks";
import useTrailStationStore from "@/stores/trailStationStore";
import MobileFeedScreenActionIcons from "@/components/mobile/FeedScreenActionIcons.mobile";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  // DragStartEvent,
  TouchSensor,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

interface MobileTrailDetailsRouteMapProps {
  _id: string;
  name: string;
  description: string;
  handleRemove: (id: string) => void;
  locations: LocationListProps;
  visibleStations: LocalstoreTrailStaionsProps[];
}

const MobileTrailDetailsRouteMap = ({
  _id,
  name,
  description,
  locations,
  visibleStations,
  handleRemove,
}: MobileTrailDetailsRouteMapProps) => {
  const { getStationsByTrailId } = useTrailStationStore();
  const localStorageStations = getStationsByTrailId(_id);
  const { mapRef } = useGoogleRouteDetailsMapMobile(
    _id,
    locations,
    localStorageStations,
  );

  // Maintain local order state
  const [stationOrder, setStationOrder] = useState<string[]>([]);

  useEffect(() => {
    // Initialize the order from visibleStations
    setStationOrder(visibleStations.map((st) => st._id));
  }, [visibleStations]);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));
  const handleDragStart = () => {
    // you can handle side effects when drag starts if needed
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setStationOrder((items) => {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  // Helper: get station object by id
  const stationById = (id: string) =>
    visibleStations.find((st) => st._id === id) as LocalstoreTrailStaionsProps;

  return (
    <div className="">
      <div className="p-6">
        <MobileFeedScreenActionIcons strokColor="black" hideThreedotIcon />
        <h1 className="text-3xl font-bold max-w-80">{name}</h1>
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

      <div className="px-4 py-2 fixed bottom-0 left-0 right-0 bg-white">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={stationOrder}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-3 overflow-x-auto">
              {stationOrder.map((stationId) => {
                const station = stationById(stationId);
                if (!station) return null;
                return (
                  <SortableStationCard
                    key={station._id}
                    station={station}
                    onRemove={handleRemove}
                    canRemove={stationOrder.length > 2}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

interface SortableStationCardProps {
  station: LocalstoreTrailStaionsProps;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

const SortableStationCard = ({
  station,
  onRemove,
  canRemove,
}: SortableStationCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: station._id });

  // Use transform and transition from dnd-kit
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  // Long-press logic for showing remove button
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
        setTimeout(() => setIsPressed(false), 3000);
      },
    },
  );

  // Decide card size: if dragging this card, make it bigger
  const cardSize = isDragging ? 80 : 60;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        ...style,
        width: `${cardSize}px`,
        height: `${cardSize}px`,
      }}
      className={clsx(
        "relative flex-shrink-0 rounded-md overflow-hidden transition-all duration-200",
        isDragging ? "shadow-lg" : "",
      )}
    >
      <div {...bind()} className="w-full h-full relative">
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
    </div>
  );
};

export default MobileTrailDetailsRouteMap;
