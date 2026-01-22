import type { FC } from "react";
import { MapPin } from "lucide-react";
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
   geo: Geo,
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
  geo, setGeo, address, setAddress
}) => {
  const { textSecondary} = useThemeClasses();
  
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
      {/* Address */}
      {/* <div>
        <label
          className={`block text-sm mb-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {t("address")} *
        </label>

        <div className="relative">
          <MapPin
            className={`absolute ${
              isRTL ? "right-3" : "left-3"
            } top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`}
          />

          <input
            type="text"
            value={formData.address.city}
            onChange={(e) =>
              setFormData({
                ...formData,
                address: {
                  ...formData.address,
                  city: e.target.value,
                },
              })
            }
            placeholder={t("enter_full_address")}
            className={`w-full ${
              isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
            } py-2 rounded-lg border ${
              errors.address
                ? "border-red-500"
                : theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-gray-200"
                  : "bg-white border-gray-300 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>

      
      </div> */}

      

      {/* Coordinates */}
      {/* <div
        className={`p-4 rounded-lg ${
          theme === "dark"
            ? "bg-gray-800/50 border border-gray-700"
            : "bg-gray-50 border border-gray-200"
        }`}
      >
        <p
          className={`text-sm ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {t("geo_coordinates")}: {formData.geoLocation.lat},{" "}
          {formData.geoLocation.long}
        </p>
      </div> */}
    </div>
  );
};

export default BusinessLocation;
