"use client";

import Image from "next/image";
import { useState } from "react";
import { misc } from "@/constant/hebrew";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { IconImage, NextImage } from "@/components/ui";
import { stationCategory } from "@/lib/utils";

const TripStations = ({ stations }: TrailDetailsProps) => {
  const [tripStation, setTripStation] = useState(stations || []);
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const reordered = [...tripStation];
    const [removed] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, removed);

    setTripStation(reordered);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="products-list">
        {(provided) => (
          <div
            className="max-h-[55%] overflow-y-scroll"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tripStation?.map((station, index) => (
              <Draggable
                key={station._id}
                draggableId={station._id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="grid grid-cols-6 items-center gap-2.5 p-2.5 border-t border-primary bg-white"
                  >
                    <div className=" col-span-2 h-[118px] relative">
                      <NextImage
                        width={140}
                        height={118}
                        alt={station.name}
                        imgSrc={station?.images[0]?.image}
                        className="rounded-md  object-cover h-full"
                      />
                      <div className="h-7.5 w-7.5 rounded-full bg-white  absolute top-1 right-1">
                        <Image
                          width={30}
                          height={30}
                          alt={station.type}
                          src={`/images/category/${stationCategory[station.primaryCategoryId._id as string]}`}
                          className=" object-cover"
                        />
                      </div>
                    </div>

                    <div className="col-span-4">
                      <h2 className="font-bold text-dark">{station.name}</h2>
                      <div
                        className="font-normal text-theme text-sm line-clamp-2"
                        dangerouslySetInnerHTML={{
                          __html: station?.description,
                        }}
                      />

                      <div className="flex items-center justify-end gap-2 w-full mt-1.75">
                        <button
                          type="button"
                          className="border border-theme rounded-lg flex items-center gap-1.25 ps-2 pe-4 py-1 cursor-pointer"
                        >
                          <IconImage icon="navigation" />
                          <span className="text-theme font-bold text-sm">
                            {misc.navigation}
                          </span>
                        </button>
                        <button
                          type="button"
                          className="bg-dark rounded-lg p-1"
                        >
                          <IconImage icon="basket-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default TripStations;
