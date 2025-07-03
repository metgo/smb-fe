"use client";

import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

import { misc } from "@/constant/hebrew";
import { IconImage, NextImage } from "@/components/ui";
import AttributePills from "@/components/AttributePills";
import { trailsDetails } from "@/constant/placeholderData";
import { useGoogleRouteMap } from "@/hooks/useGoogleRouteMap";

const TrailMapIntegratedLayout = () => {
  const { mapRef } = useGoogleRouteMap();

  const [products, setProducts] = useState(trailsDetails.products || []);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const reordered = [...products];
    const [removed] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, removed);

    setProducts(reordered);
  };

  return (
    <div className="w-full h-[92vh] relative">
      <div ref={mapRef} className="w-full h-full" />

      {/* Trail's Details */}
      <section className="p-5 space-y-7 absolute right-2 top-2 bottom-2 w-[31.5rem] rounded-xl shadow-md bg-white">
        <div>
          <div className="w-full flex items-center justify-end gap-6 mb-4.5">
            <IconImage icon="share" />
            <IconImage icon="navigation" />
          </div>

          <div className="text-dark">
            <h1 className="text-2xl font-bold">{trailsDetails.title}</h1>
            <div className="font-bold my-1.5">{trailsDetails.distance}</div>
            <p className="font-normal">{trailsDetails.desc}</p>
          </div>
          <div className="my-7">
            <AttributePills />
          </div>
          <div className="w-full flex justify-end">
            <button
              type="button"
              className=" cursor-pointer bg-dark rounded-xl ps-2.5 pe-4 py-2 flex items-center gap-1.25"
            >
              <IconImage icon="basket-white" />
              <span className="text-white font-bold">
                {misc.addAllStationOnCart}
              </span>
            </button>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="products-list">
            {(provided) => (
              <div
                className="max-h-[46vh] overflow-y-scroll"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {products.map((product, index) => (
                  <Draggable
                    key={product.id}
                    draggableId={product.id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex items-center gap-2.5 p-2.5 border-t border-primary bg-white"
                      >
                        <div className="w-[350px] h-[118px] relative">
                          <NextImage
                            isFill
                            imgSrc={product.image}
                            alt={product.title}
                            className="rounded-md w-full h-full object-cover"
                          />
                        </div>

                        <div>
                          <h2 className="font-bold text-dark">
                            {product.title}
                          </h2>
                          <p className="font-normal text-theme text-sm">
                            {product.desc}
                          </p>

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
      </section>
    </div>
  );
};

export default TrailMapIntegratedLayout;
