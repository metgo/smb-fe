"use client";

import Image from "next/image";
import { stationCategory } from "@/lib/utils";
import { IconImage, MapNavButton, NextImage } from "@/components/ui";

// Station Card Component
const StationCard = ({ station }: { station: TrailStationProps }) => {
  return (
    <div className="group grid grid-cols-6 items-center gap-2.5 p-2.5 border-t border-primary bg-white">
      {/* Image */}
      <div className="col-span-2 h-[118px] relative">
        <NextImage
          width={140}
          height={118}
          alt={station?.name || "station image"}
          imgSrc={station?.images?.[0]?.image}
          className="rounded-md object-cover h-full"
        />
        <div className="h-7.5 w-7.5 rounded-full bg-white absolute top-1 right-1">
          <Image
            width={30}
            height={30}
            alt="category icon"
            src={`/images/category/${stationCategory[station?.primaryCategoryId?._id]}`}
            className="object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="col-span-4">
        <div className="flex items-start justify-between">
          <h2 className="font-bold text-dark max-w-68">{station?.name}</h2>
        </div>
        <div
          className="font-normal text-theme text-sm line-clamp-2"
          dangerouslySetInnerHTML={{ __html: station?.description }}
        />
        <div className="flex items-center justify-end gap-2 w-full mt-1.75">
          <MapNavButton
            lat={station?.geoLocation?.lat}
            lng={station?.geoLocation?.long}
            clssName="border border-theme rounded-lg flex"
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
  );
};

const FunDayStations = ({ stations }: { stations: TrailStationProps[] }) => {
  return (
    <div>
      <div className="max-h-[55%] overflow-y-scroll">
        {stations?.map((station, index) => (
          <StationCard key={station?._id || index} station={station} />
        ))}
      </div>
    </div>
  );
};

export default FunDayStations;
