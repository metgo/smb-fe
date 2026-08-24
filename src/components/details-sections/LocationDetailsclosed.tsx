import { MapPin, Globe2, Navigation, Compass } from "lucide-react";
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
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className="w-4 h-4 shrink-0"
  >
    <path
      fill="#48b564"
      d="M35.76 26.36h.01C36.64 25.07 37 23.58 37 22c0-7.18-5.82-13-13-13S11 14.82 11 22c0 1.58.36 3.07 1.01 4.36h.01L24 44l11.76-17.64z"
    />
    <path
      fill="#4285F4"
      d="M24 4C15.16 4 8 11.16 8 20c0 6.08 3.37 11.36 8.33 14.17L24 44l7.67-9.83C36.63 31.36 40 26.08 40 20c0-8.84-7.16-16-16-16z"
    />
    <path
      fill="#fff"
      d="M24 14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"
    />
  </svg>
);

const WazeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className="w-4 h-4 shrink-0"
  >
    <ellipse cx="24" cy="26" rx="18" ry="16" fill="#33CCFF" />
    <path
      fill="#fff"
      d="M17 22c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm10 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z"
    />
    <path fill="#fff" d="M19 28s1.5 3 5 3 5-3 5-3H19z" />
  </svg>
);

/* ---------- Component ---------- */

const LocationDetailsclosed: FC<LocationDetailsclosedProps> = ({
  lat,
  long,
  address,
  purpose,
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

  if (!hasLocation && !hasCoordinates) {
    return (
      <div
        className={clsx(
          "rounded-xl border px-4 py-6 text-center",
          isDark
            ? "bg-gray-800/60 border-gray-700"
            : "bg-gray-50 border-gray-200",
        )}
      >
        <MapPin
          className={clsx(
            "w-7 h-7 mx-auto mb-2",
            isDark ? "text-gray-600" : "text-gray-300",
          )}
        />
        <p
          className={clsx(
            "text-sm",
            isDark ? "text-gray-400" : "text-gray-500",
          )}
        >
          No location information for this {purpose}
        </p>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "rounded-xl border p-3 md:p-4 space-y-3",
        isDark ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200",
      )}
    >
      {/* Address rows */}
      {hasLocation && (
        <div className="space-y-2">
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

          {(address?.city || address?.country) && (
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
                {[address.city, address.country].filter(Boolean).join(", ")}
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
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleOpenGoogleMaps}
            className={clsx(
              "flex md:min-w-[310px] min-w-[110px] items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-medium transition-colors",
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
              " flex items-center md:min-w-[310px] min-w-[110px] justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors",
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
