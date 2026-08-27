import {
  MapPin,
  Globe2,
  Navigation,
  Compass,
  Building2,
  Map,
} from "lucide-react";
import { type FC } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { openWithUserLocation } from "@/utils/googleMapUtils";

interface LocationDetailsclosedProps {
  lat: string | number;
  long: string | number;
  address: {
    location: string;
    city: string;
    country: string;
  };
  purpose: string;
}

/* ---------- Icons ---------- */

const GoogleMapsIcon = () => (
  <img
    src="/assets/images/google-map-icon.png"
    alt="Google Maps"
    className="w-6 h-6 shrink-0 object-contain"
  />
);

const WazeIcon = () => (
  <img
    src="/assets/images/waze-map-icon.png"
    alt="Waze"
    className="w-6 h-6 shrink-0 object-contain"
  />
);

/* ---------- Component ---------- */

const LocationDetailsclosed: FC<LocationDetailsclosedProps> = ({
  lat,
  long,
  address,
}) => {
  const { t } = useTranslation("common");
  const { isDark } = useThemeClasses();

  const hasLocation = address?.location || address?.city || address?.country;
  const hasCoordinates = Boolean(lat && long);

  const handleOpenGoogleMaps = () => {
    const dest = `${lat},${long}`;
    openWithUserLocation(
      (uLat, uLng) =>
        `https://www.google.com/maps/dir/?api=1&origin=${uLat},${uLng}&destination=${dest}&travelmode=driving`,
      `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`,
    );
  };

  const handleOpenWaze = () => {
    const dest = `${lat},${long}`;
    openWithUserLocation(
      (uLat, uLng) =>
        `https://waze.com/ul?ll=${dest}&navigate=yes&from=${uLat},${uLng}`,
      `https://waze.com/ul?ll=${dest}&navigate=yes`,
    );
  };

  const header = (
    <div className={clsx("flex items-center gap-2 md:gap-3 pb-3 border-b")}>
      <div
        className={clsx(
          "p-1.5 md:p-2 rounded-lg shrink-0",
          isDark ? "bg-blue-500/20" : "bg-blue-100",
        )}
      >
        <Map
          className={clsx(
            "w-4 h-4 md:w-5 md:h-5",
            isDark ? "text-blue-400" : "text-blue-600",
          )}
        />
      </div>
      <h3
        className={clsx(
          "text-sm md:text-base font-semibold",
          isDark ? "text-gray-100" : "text-gray-900",
        )}
      >
        {t("location")}
      </h3>
    </div>
  );

  if (!hasLocation && !hasCoordinates) {
    return null;
  }

  return (
    <div
      className={clsx(
        "rounded-xl border p-3 md:p-4 space-y-3",
        isDark ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200",
      )}
    >
      {header}

      {/* Address row – location, city, country side by side */}
      {hasLocation && (
        <div className="flex items-center gap-4 flex-wrap ">
          {address?.location && (
            <div className="flex items-center gap-2 min-w-0">
              <MapPin
                className={clsx(
                  "w-4 h-4 shrink-0",
                  isDark ? "text-blue-400" : "text-blue-600",
                )}
              />
              <span
                className={clsx(
                  "text-sm truncate",
                  isDark ? "text-gray-200" : "text-gray-800",
                )}
              >
                {address.location}
              </span>
            </div>
          )}

          {address?.city && (
            <div className="flex items-center gap-2 min-w-0">
              <Building2
                className={clsx(
                  "w-4 h-4 shrink-0",
                  isDark ? "text-gray-400" : "text-gray-500",
                )}
              />
              <span
                className={clsx(
                  "text-sm truncate",
                  isDark ? "text-gray-300" : "text-gray-700",
                )}
              >
                {address.city}
              </span>
            </div>
          )}

          {address?.country && (
            <div className="flex items-center gap-2 min-w-0">
              <Globe2
                className={clsx(
                  "w-4 h-4 shrink-0",
                  isDark ? "text-gray-400" : "text-gray-500",
                )}
              />
              <span
                className={clsx(
                  "text-sm truncate",
                  isDark ? "text-gray-300" : "text-gray-700",
                )}
              >
                {address.country}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Coordinates – icon + value only */}
      {hasCoordinates && (
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Compass
              className={clsx(
                "w-3.5 h-3.5 shrink-0",
                isDark ? "text-emerald-400" : "text-emerald-600",
              )}
            />
            <span
              className={clsx(
                "text-xs font-mono",
                isDark ? "text-gray-300" : "text-gray-700",
              )}
            >
              {lat}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Navigation
              className={clsx(
                "w-3.5 h-3.5 shrink-0",
                isDark ? "text-emerald-400" : "text-emerald-600",
              )}
            />
            <span
              className={clsx(
                "text-xs font-mono",
                isDark ? "text-gray-300" : "text-gray-700",
              )}
            >
              {long}
            </span>
          </div>
        </div>
      )}

      {/* Navigation buttons – compact */}
      {hasCoordinates && (
        <div className="flex gap-2.5 pt-1">
          <button
            onClick={handleOpenGoogleMaps}
            className={clsx(
              "flex md:min-w-[310px] min-w-[130px] items-center justify-center gap-2 py-3 px-3 rounded-lg text-sm font-medium transition-colors",
              isDark
                ? "bg-gray-700/80 hover:bg-gray-700 text-gray-200 border border-gray-600"
                : "bg-gray-50 hover:bg-blue-50 text-gray-700 border border-gray-200 hover:border-blue-200",
            )}
          >
            <GoogleMapsIcon />
            <span>{t("open_in_google_maps")}</span>
          </button>

          <button
            onClick={handleOpenWaze}
            className={clsx(
              "flex items-center md:min-w-[310px] min-w-[130px] justify-center gap-2 py-3 px-3 rounded-lg text-sm font-medium transition-colors",
              isDark
                ? "bg-gray-700/80 hover:bg-gray-700 text-gray-200 border border-gray-600"
                : "bg-gray-50 hover:bg-sky-50 text-gray-700 border border-gray-200 hover:border-sky-200",
            )}
          >
            <WazeIcon />
            <span>{t("open_in_waze")}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationDetailsclosed;
