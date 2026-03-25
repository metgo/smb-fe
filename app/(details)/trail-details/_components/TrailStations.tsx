"use client";

import clsx from "clsx";
import Image from "next/image";
import { Tooltip } from "react-tooltip";
import { createPortal } from "react-dom";
import { IoIosCloseCircle } from "react-icons/io";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import { misc } from "@/constant/hebrew";
import { sanitizeHtml } from "@/lib/helpers";
import { useTrailStations } from "@/hooks";
import { stationCategory } from "@/lib/utils";
import { IconImage, MapNavButton, NextImage } from "@/components/ui";

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
  <Draggable draggableId={station?._id} index={index}>
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
            alt={station?.name || "station image"}
            imgSrc={station?.image}
            className="rounded-md object-cover h-full"
          />
          <div className="h-7.5 w-7.5 rounded-full bg-white absolute top-1 right-1">
            <Image
              width={30}
              height={30}
              alt="category icon"
              src={`/images/category/${stationCategory[station?.primaryCategoryId]}`}
              className="object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="col-span-4">
          <div className="flex items-start justify-between">
            <h2 className="font-bold text-dark max-w-68">{station?.name}</h2>
            {canRemove && (
              <>
                <IoIosCloseCircle
                  size={24}
                  data-tooltip-id="remove-info"
                  className="hidden group-hover:block custom-cursor"
                  onClick={() => onRemove(station?._id)}
                />
                {createPortal(
                  <Tooltip
                    id="remove-info"
                    place="left"
                    offset={10}
                    content={misc.statingRemoving}
                  />,
                  document.body,
                )}
              </>
            )}
          </div>
          <div
            className="font-normal text-theme text-sm max-sm:line-clamp-3 md:line-clamp-2"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(station?.description || ""),
            }}
          />
          <div className="flex items-center justify-end gap-2 w-full mt-1.75">
            <MapNavButton
              lat={station?.geoLocation?.lat}
              lng={station?.geoLocation?.long}
              clssName="border border-theme rounded-lg flex"
            />
            <button
              type="button"
              className="bg-dark rounded-lg p-1 custom-cursor md:block max-sm:hidden"
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
    isTrailModified,
    handleReset,
    handleDragEnd,
    handleRemove,
    visibleStations,
  } = useTrailStations(_id, stations);

  return (
    <div>
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-4 max-sm:px-4">
        <button
          type="button"
          disabled={!isTrailModified}
          onClick={handleReset}
          className={clsx(
            !isTrailModified
              ? "cursor-not-allowed bg-secondary"
              : "custom-cursor bg-black",
            "rounded-xl px-4 py-2 font-bold text-white flex items-center gap-2 max-sm:text-sm",
          )}
        >
          <IconImage icon="reset" />
          {misc.cancelChanges}
        </button>
        <button
          type="button"
          className="custom-cursor bg-dark rounded-xl ps-2.5 pe-4 py-2 md:flex items-center gap-1.25 max-sm:hidden"
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
              className="max-h-[55%] overflow-y-scroll max-sm:mb-4 md:mb-8"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {visibleStations?.map((station, index) => (
                <StationCard
                  key={station?._id || index}
                  station={station}
                  index={index}
                  onRemove={handleRemove}
                  canRemove={visibleStations?.length > 2}
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
