"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { IconImage, MapNavButton, NextImage } from "@/components/ui";
import { stationCategory } from "@/lib/utils";
import useTrailStationStore from "@/stores/trailStationStore";

const TrailStations = ({ stations, _id }: TrailDetailsProps) => {
  const { setTrailStations, getStationsByTrailId } = useTrailStationStore();
  const [tripStation, setTripStation] = useState<LocalstoreTrailStaionsProps[]>(
    [],
  );
  const localStorageStations = getStationsByTrailId(_id);

  useEffect(() => {
    if (!localStorageStations || localStorageStations.length === 0) {
      const flatStations =
        stations?.map((station) => ({
          _id: station._id,
          name: station.name,
          description: station.description,
          image: station.images?.[0]?.image,
          geoLocation: station.geoLocation,
          primaryCategoryId: station.primaryCategoryId._id,
        })) || [];

      setTrailStations(_id, flatStations);
      setTripStation(flatStations);
    } else {
      setTripStation(localStorageStations);
    }
  }, [
    stations,
    _id,
    getStationsByTrailId,
    setTrailStations,
    localStorageStations,
  ]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const reordered = [...tripStation];
    const [removed] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, removed);

    setTripStation(reordered);
    setTrailStations(_id, reordered);
  };

  return (
    <div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="stations-list">
          {(provided) => (
            <div
              className="max-h-[55%] overflow-y-scroll"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {tripStation?.map((station, index) => {
                if (!station || !station._id) return null;

                return (
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

                        <div className="col-span-4">
                          <h2 className="font-bold text-dark">
                            {station.name}
                          </h2>
                          <div
                            className="font-normal text-theme text-sm line-clamp-2"
                            dangerouslySetInnerHTML={{
                              __html: station?.description,
                            }}
                          />
                          <div className="flex items-center justify-end gap-2 w-full mt-1.75">
                            <MapNavButton
                              lat={station?.geoLocation?.lat}
                              lng={station?.geoLocation?.long}
                              clssName="border border-theme rounded-lg"
                            />
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
                );
              })}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default TrailStations;
