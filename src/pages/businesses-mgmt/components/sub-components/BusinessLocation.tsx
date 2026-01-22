import type { FC } from "react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { MarkerMap } from "@/components/maps";

/* ---------- Types ---------- */

type Theme = "light" | "dark";

interface Coordinates {
  lat: string;
  long: string;
}

interface Address {
  country: string;
  city: string;
  location: string;
}

interface LocationFormData {
  address: Address;
  geoLocation: Coordinates;
}

interface LocationErrors {
  address?: Address;
}

/* ---------- Props ---------- */

interface BusinessLocationProps {
  theme: Theme;
  isRTL: boolean;
  t: (key: string) => string; // snake_case translation function
  formData: LocationFormData;
  errors: LocationErrors;
  setFormData: (data: LocationFormData) => void;
  geo: Geo;
  setGeo: (v: Geo) => void;
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
}

/* ---------- Component ---------- */

const BusinessLocation: FC<BusinessLocationProps> = ({
  theme,
  isRTL,
  t,
  formData,
  errors,
  setFormData,
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
