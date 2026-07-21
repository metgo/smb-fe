import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGoogleRouteMap } from "../../hooks/useGoogleRouteMap";
import TripRouteStations from "./TripRouteStations";

interface TripStationsSelectionProps {
  t: (key: string) => string;
  businesses: ITripStations[];
  selectedStationDetails: IStationDetailsProps[];
  activeCategoryIds: string[];
  setClickedStation: (v: IClickedStationProps) => void;
  selectedDmoId: string;
  selectedAuthorityId: string;
}

const TripStationsSelection = ({
  activeCategoryIds,
  setClickedStation,
}: TripStationsSelectionProps) => {
  const { borderColor } = useThemeClasses();

  const { mapRef } = useGoogleRouteMap(activeCategoryIds, setClickedStation);

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
