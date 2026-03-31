"use client";

import clsx from "clsx";
import { useState, useEffect, useRef } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import { useLongPress } from "use-long-press";
import { TiLocation } from "react-icons/ti";

import { NextImage } from "@/components/ui";
import { useGoogleRouteDetailsMapMobile } from "@/hooks";
import useTrailStationStore from "@/stores/trailStationStore";
import MobileFeedScreenActionIcons from "@/components/mobile/FeedScreenActionIcons.mobile";

import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { useDrag, useDrop, DndProvider } from "react-dnd";

import MobileTrailStationsSheet from "./TrailStationsSheet.mobile";
import { categoryColors } from "@/lib/utils";
import { ensureListStyles } from "@/lib/helpers";

interface MobileTrailDetailsRouteMapProps {
  _id: string;
  name: string;
  description: string;
  handleRemove: (id: string) => void;
  locations: LocationListProps;
  stations: TrailStationProps[];
  visibleStations: LocalstoreTrailStaionsProps[];
}

// Check if touch device
const isTouchDevice = () => {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

const MobileTrailDetailsRouteMap = ({
  _id,
  name,
  description,
  locations,
  visibleStations,
  stations,
  handleRemove,
}: MobileTrailDetailsRouteMapProps) => {
  // Maintain local order state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [stationOrder, setStationOrder] = useState<string[]>([]);
  const [isMarkerFiltered, setIsMarkerFiltered] = useState(false);
  const [activeStationId, setActiveStationId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { getStationsByTrailId, setTrailStations } = useTrailStationStore();
  const localStorageStations = getStationsByTrailId(_id);
  const { mapRef } = useGoogleRouteDetailsMapMobile(
    _id,
    locations,
    localStorageStations,
    isMarkerFiltered,
  );

  useEffect(() => {
    // Initialize the order from visibleStations
    setStationOrder(visibleStations.map((st) => st._id));
  }, [visibleStations]);

  const moveStation = (fromIndex: number, toIndex: number) => {
    setStationOrder((items) => {
      const newItems = [...items];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      return newItems;
    });

    // Update the actual stations in the store and check for modifications
    const reorderedStations = [...visibleStations];
    const [removed] = reorderedStations.splice(fromIndex, 1);
    reorderedStations.splice(toIndex, 0, removed);

    // Update the store with reordered stations
    setTrailStations(_id, reorderedStations);
  };

  // Helper: get station object by id
  const stationById = (id: string) =>
    visibleStations.find((st) => st._id === id) as LocalstoreTrailStaionsProps;

  // Function to center the clicked card
  const centerCard = (stationId: string, index: number) => {
    setActiveStationId(stationId);

    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cards = container.getElementsByClassName("station-card");

      if (cards[index]) {
        const card = cards[index] as HTMLElement;
        const cardRect = card.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Calculate the scroll position to center the card
        const scrollLeft =
          card.offsetLeft - containerRect.width / 2 + cardRect.width / 2;

        container.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <DndProvider
      backend={isTouchDevice() ? TouchBackend : HTML5Backend}
      options={{
        enableMouseEvents: true,
        enableKeyboardEvents: true,
      }}
    >
      <div className="mt-36">
        <div className="p-6">
          <MobileFeedScreenActionIcons strokColor="black" hideThreedotIcon />
          <h1 className="text-3xl font-bold max-w-60">{name}</h1>
          {description && (
            <div
              className="text-theme font-normal line-clamp-2"
              dangerouslySetInnerHTML={{
                __html: ensureListStyles(description) || "",
              }}
            />
          )}

          <button type="button" onClick={() => setIsSheetOpen(true)}></button>

          <div
            onClick={() => setIsMarkerFiltered(!isMarkerFiltered)}
            className={clsx(
              isMarkerFiltered ? "bg-[#29C368]" : "bg-gray-400",
              "absolute top-80 right-4 z-30 w-10 h-10 flex items-center justify-center rounded-md",
            )}
          >
            <TiLocation size={36} className="text-white" />
          </div>
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

        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white/80 to-transparent">
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-3 overflow-x-auto pt-12 pb-6 scrollbar-hide px-8"
          >
            {stationOrder.map((stationId, index) => {
              const station = stationById(stationId);
              if (!station) return null;
              return (
                <SortableStationCard
                  index={index}
                  key={station._id}
                  station={station}
                  onRemove={handleRemove}
                  moveStation={moveStation}
                  canRemove={stationOrder.length > 2}
                  isActive={activeStationId === station._id}
                  onClick={() => centerCard(station._id, index)}
                />
              );
            })}
          </div>
        </div>

        <MobileTrailStationsSheet
          _id={_id}
          stations={stations}
          isOpen={isSheetOpen}
          setIsOpen={setIsSheetOpen}
        />
      </div>
    </DndProvider>
  );
};

interface SortableStationCardProps {
  station: LocalstoreTrailStaionsProps;
  index: number;
  onRemove: (id: string) => void;
  moveStation: (fromIndex: number, toIndex: number) => void;
  canRemove: boolean;
  isActive: boolean;
  onClick: () => void;
}

const ItemType = "STATION_CARD";

const SortableStationCard = ({
  station,
  index,
  onRemove,
  moveStation,
  canRemove,
  isActive,
  onClick,
}: SortableStationCardProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { index, id: station._id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (draggedItem: { index: number; id: string }) => {
      if (draggedItem.index !== index) {
        moveStation(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  // Long-press logic for showing remove button
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

  // Combine drag and drop refs
  const dragDropRef = (node: HTMLDivElement | null) => {
    drag(node);
    drop(node);
  };

  // Handle click without interfering with drag
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging) {
      onClick();
    }
  };

  // Decide card size: if dragging this card, make it bigger
  const cardSize = isDragging ? 80 : isActive ? 100 : 60;
  const borderWidth = isDragging ? "3px" : isActive ? "3px" : "1px";
  const color = categoryColors[station.primaryCategoryId];

  return (
    <div
      ref={dragDropRef}
      style={{
        width: `${cardSize}px`,
        height: `${cardSize}px`,
        opacity: isDragging ? 0.5 : 1,
        border: `${borderWidth} solid ${color}`,
        transform: isActive ? "scale(1.05)" : "scale(1)",
      }}
      className={clsx(
        "station-card relative flex-shrink-0 rounded-md transition-all duration-200 cursor-move",
        isDragging ? "shadow-lg" : isActive ? "shadow-md" : "",
        isActive ? "z-10" : "z-0",
      )}
      onClick={handleClick}
    >
      <div {...bind()} className="w-full h-full relative">
        <NextImage
          width={80}
          height={80}
          alt={station.name}
          imgSrc={station.image}
          className={clsx(
            "object-cover rounded w-full h-full pointer-events-none",
          )}
        />
        {isActive && (
          <div
            style={{ background: color }}
            className={clsx(
              "absolute -top-10 -right-4 w-[120px] px-1 py-1 rounded font-bold line-clamp-1 overflow-hidden",
            )}
          >
            <span>{station.name}</span>
          </div>
        )}

        {canRemove && isPressed && !isDragging && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(station._id);
              setIsPressed(false);
            }}
            className="absolute -top-4 -left-2 z-10 bg-white text-black rounded-full p-[1px] shadow-md"
          >
            <IoIosCloseCircle size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileTrailDetailsRouteMap;
