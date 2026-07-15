import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useAppDispatch } from "@/hooks/hooks";
import { removeSelectedStation } from "@/features/stationsSlice";
import { useGoogleRouteMap } from "../../hooks/useGoogleRouteMap";
import TripRouteStations from "./TripRouteStations";

interface TripStationsSelectionProps {
  t: (key: string) => string;
  businesses: ITripStations[];
  selectedStationDetails: IStationDetailsProps[];
  activeCategoryIds: string[];
  setClickedStation: (v: IClickedStationProps) => void;
}

const TripStationsSelection = ({
  t,
  selectedStationDetails,
  activeCategoryIds,
  setClickedStation,
}: TripStationsSelectionProps) => {
  const { isDark, isRTL, borderColor, bgTertiary, textPrimary } =
    useThemeClasses();
  const dispatch = useAppDispatch();

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
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-4">
          <TripRouteStations />
        </div>

        {/* Map + selected stations strip */}
        <div className="col-span-12 md:col-span-8">
          <div
            className={`relative h-[60vh] rounded-lg overflow-hidden border ${borderColor}`}
          >
            <div ref={mapRef} className="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripStationsSelection;
