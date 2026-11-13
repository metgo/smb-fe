import { type FC } from "react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { MarkerMap } from "@/components/maps";
import { type ParsedAddressParts } from "@/helpers";

interface PoiLocationProps {
  t: (key: string) => string;
  geo: Geo;
  setGeo: (v: Geo) => void;
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  onAddressParts?: (parts: ParsedAddressParts) => void;
}

const PoiLocation: FC<PoiLocationProps> = ({
  t,
  geo,
  setGeo,
  address,
  setAddress,
  onAddressParts,
}) => {
  const { textSecondary } = useThemeClasses();

  return (
    <div className="space-y-6">
      <div>
        <label className={`block text-sm mb-2 ${textSecondary}`}>
          {t("location_address")} <span className="text-red-500">*</span>
        </label>
        <MarkerMap
          geo={geo}
          setGeo={setGeo}
          address={address}
          setAddress={setAddress}
          onAddressParts={onAddressParts}
        />
      </div>
    </div>
  );
};

export default PoiLocation;
