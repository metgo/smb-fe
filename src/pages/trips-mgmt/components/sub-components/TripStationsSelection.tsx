import { useState } from "react";
import { Check, Plus, X } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useAppDispatch } from "@/hooks/hooks";
import {
  addSelectedStation,
  removeSelectedStation,
} from "@/features/stationsSlice";
import { useGoogleRouteMap } from "../../hooks/useGoogleRouteMap";
import CustomInfoWindow from "./CustomInfoWindow";

interface TripStationsSelectionProps {
  t: (key: string) => string;
  businesses: ITripStations[];
  selectedStationDetails: IStationDetailsProps[];
  activeCategoryIds: string[];
  setClickedStation: (v: IClickedStationProps) => void;
}

const TripStationsSelection = ({
  t,
  businesses,
  selectedStationDetails,
  activeCategoryIds,
  setClickedStation,
}: TripStationsSelectionProps) => {
  const { isDark, isRTL, borderColor, bgTertiary, textPrimary } =
    useThemeClasses();
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState("");

  const { mapRef } = useGoogleRouteMap(activeCategoryIds, setClickedStation);

  const selectedIds = new Set(selectedStationDetails.map((s) => s._id));


  const toggleStation = (station: ITripStations) => {
    if (selectedIds.has(station._id)) {
      dispatch(removeSelectedStation(station._id));
      return;
    }
    // dispatch(
    //   addSelectedStation({
    //     station,
    //     clickedStation: {
    //       stationId: station._id,
    //       geoLocation: station.geoLocation,
    //     },
    //     details: {
    //       _id: station._id,
    //       description: "",
    //       serviceType: station.serviceType,
    //       images: [],
    //       logo: { image: "", caption: "", alt: "" } as IStationDetailsProps["logo"],
    //       slug: "",
    //     },
    //   }),
    // );
  };

  return (
    <div className="space-y-6">
      <h3 className={`text-lg ${isDark ? "text-gray-200" : "text-gray-800"}`}>
        {t("stations")}
      </h3>

      <div className="grid grid-cols-12 gap-4">

        {/* Map + selected stations strip */}
        <div className="col-span-12">
          <div className={`relative h-[60vh] rounded-lg overflow-hidden border ${borderColor}`}>
            <div ref={mapRef} className="w-full h-full" />

            {selectedStationDetails.length > 0 && (
              <div
                className={`absolute bottom-0 left-0 right-0 z-20 p-2 flex gap-2 overflow-x-auto ${
                  isRTL ? "flex-row-reverse" : "flex-row"
                }`}
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
                }}
              >
                {selectedStationDetails.map((station) => (
                  <div key={station._id} className="shrink-0">
                    <CustomInfoWindow
                      isHebrew={isRTL}
                      markers={businesses}
                      clickedStation={{
                        stationId: station._id,
                        geoLocation:
                          businesses.find((b) => b._id === station._id)
                            ?.geoLocation ?? { lat: "", long: "" },
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedStationDetails.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedStationDetails.map((station) => (
                <span
                  key={station._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-teal-500/20 text-teal-600"
                >
                  {station.name}
                  <button
                    onClick={() => dispatch(removeSelectedStation(station._id))}
                    className="cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripStationsSelection;
