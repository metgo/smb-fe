import type { FC } from "react";
import { MapPin } from "lucide-react";

/* ---------- Types ---------- */

type Theme = "light" | "dark";

interface Coordinates {
  lat: number;
  lng: number;
}

interface LocationFormData {
  address: string;
  coordinates: Coordinates;
}

interface LocationErrors {
  address?: string;
}

/* ---------- Props ---------- */

interface BusinessLocationProps {
  theme: Theme;
  isRTL: boolean;
  t: (key: string) => string; // snake_case translation function
  formData: LocationFormData;
  errors: LocationErrors;
  setFormData: (data: LocationFormData) => void;
}

/* ---------- Component ---------- */

const BusinessLocation: FC<BusinessLocationProps> = ({
  theme,
  isRTL,
  t,
  formData,
  errors,
  setFormData,
}) => {
  return (
    <div className="space-y-6">
      {/* Address */}
      <div>
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
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
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

        {errors.address && (
          <p className="text-red-500 text-sm mt-1">{errors.address}</p>
        )}
      </div>

      {/* Map Placeholder */}
      <div
        className={`h-96 rounded-lg flex items-center justify-center ${
          theme === "dark"
            ? "bg-gray-800 border border-gray-700"
            : "bg-gray-100 border border-gray-300"
        }`}
      >
        <div className="text-center">
          <MapPin
            className={`w-12 h-12 mx-auto mb-2 ${
              theme === "dark" ? "text-gray-600" : "text-gray-400"
            }`}
          />
          <p className="text-gray-500">{t("google_maps_widget")}</p>
          <p
            className={`text-sm mt-1 ${
              theme === "dark" ? "text-gray-600" : "text-gray-400"
            }`}
          >
            {t("search_address")}, {t("pin_location")}
          </p>
        </div>
      </div>

      {/* Coordinates */}
      <div
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
          {t("geo_coordinates")}: {formData.coordinates.lat.toFixed(6)},{" "}
          {formData.coordinates.lng.toFixed(6)}
        </p>
      </div>
    </div>
  );
};

export default BusinessLocation;
