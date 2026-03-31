"use client";

import { useTrailStations } from "@/hooks";
import useGeneralStore from "@/stores/generalStore";
import TrailStations from "../_components/TrailStations";
import AttributePills from "@/components/AttributePills";
import { removeInlineStylesFromHTML } from "@/lib/helpers";
import MobileTrailDetailsRouteMap from "./TrailDetailsRouteMap.mobile";
import MobileFeedScreenActionIcons from "@/components/mobile/FeedScreenActionIcons.mobile";

interface MobileTrailFeedDetailsProps {
  _id: string;
  name: string;
  description: string;
  stations: TrailStationProps[];
  locations: LocationListProps;
  attributes: Attributes[];
}

const MobileTrailFeedDetails = ({
  _id,
  name,
  description,
  stations,
  locations,
  attributes,
}: MobileTrailFeedDetailsProps) => {
  const { visibleStations, handleRemove } = useTrailStations(_id, stations);
  const { activeFilterTabMobile } = useGeneralStore();

  return (
    <div className="max-sm:block md:hidden">
      {activeFilterTabMobile === "gallery" && (
        <>
          <MobileFeedScreenActionIcons strokColor="black" hideThreedotIcon />

          <div className="flex flex-col relative mt-40">
            <div className="px-8 my-8">
              <h1 className="text-2xl text-dark font-bold text-wrap">{name}</h1>
              <div
                dangerouslySetInnerHTML={{
                  __html: removeInlineStylesFromHTML(description || ""),
                }}
                className=" font-normal text-theme mt-1"
              />
              <AttributePills items={attributes} />
            </div>

            <TrailStations _id={_id} stations={stations} />
          </div>
        </>
      )}

      {activeFilterTabMobile === "map" && (
        <MobileTrailDetailsRouteMap
          _id={_id}
          name={name}
          description={description}
          handleRemove={handleRemove}
          locations={locations}
          stations={stations}
          visibleStations={visibleStations}
        />
      )}

      <style jsx>{`
        .pb-safe-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
};

export default MobileTrailFeedDetails;
