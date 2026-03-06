import { type FC } from "react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { MarkerMap } from "@/components/maps";

interface BusinessLocationProps {
  t: (key: string) => string;
  geo: Geo;
  setGeo: (v: Geo) => void;
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
}

/* ---------- Component ---------- */

const BusinessLocation: FC<BusinessLocationProps> = ({
  t,
  geo,
  setGeo,
  address,
  setAddress,
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
        />
      </div>
    </div>
  );
};

export default BusinessLocation;
