import { MapPin, Globe2, Navigation, Map } from "lucide-react";
import { useEffect, useState, type FC } from "react";
import clsx from "clsx";

import { MarkerMap } from "@/components/maps";
import { useThemeClasses } from "@/hooks/useThemeClasses";
// import SectionHeader from "./SectionHeader";
import { useTranslation } from "react-i18next";

interface LocationDetailsProps {
  lat: string | number;
  long: string | number;
  address: {
    location: string;
    city: string;
    country: string;
  };
  purpose: string;
}

const LocationDetails: FC<LocationDetailsProps> = ({
  lat,
  long,
  address,
  purpose,
}) => {
  const { t } = useTranslation("common");
  const { isDark } = useThemeClasses();
  const [geo, setGeo] = useState<Geo>(() => ({
    lat: lat ? String(lat) : "",
    long: long ? String(long) : "",
  }));
  const [formattedAddress, setFormatAddress] = useState(() => {
    if (!address) return "";
    return [address.location, address.city, address.country]
      .filter(Boolean)
      .join(", ");
  });

  useEffect(() => {
    if (!lat && !long) return;
    setGeo({ lat: String(lat), long: String(long) });
    if (address) {
      setFormatAddress(
        [address.location, address.city, address.country]
          .filter(Boolean)
          .join(", "),
      );
    }
  }, [lat, long, address]);

  const hasLocation = address?.location || address?.city || address?.country;

  const hasCoordinates = lat && long;
  // const subTitle =
  //   purpose === "Event"
  //     ? "Find out where this event is taking place"
  //     : "Find out where this business is located";

  return (
    <div className="space-y-3 md:space-y-6">
      {/* <SectionHeader title={`${purpose} Location`} subTitle={subTitle} /> */}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
        <div className=" col-span-12  md:col-span-4 space-y-2 md:space-y-4 flex gap-2 md:flex-col ">
          {/* Address Card */}
          {hasLocation && (
            <div
              className={clsx(
                "rounded-xl border p-3 md:p-6 transition-all duration-200",
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200",
              )}
            >
              <div className="flex items-start gap-2 md:gap-3 mb-2 md:mb-4">
                <div
                  className={clsx(
                    "p-1.5 md:p-2 rounded-lg",
                    isDark ? "bg-blue-500/20" : "bg-blue-100",
                  )}
                >
                  <MapPin
                    className={clsx(
                      "w-4 h-4 md:w-5 md:h-5",
                      isDark ? "text-blue-400" : "text-blue-600",
                    )}
                  />
                </div>
                <div className="flex-1">
                  <h3
                    className={clsx(
                      "text-xs md:text-sm font-semibold uppercase tracking-wide mb-0.5 md:mb-1",
                      isDark ? "text-gray-400" : "text-gray-600",
                    )}
                  >
                    {t("address")}
                  </h3>
                  <p
                    className={clsx(
                      "text-xs hidden md:block",
                      isDark ? "text-gray-500" : "text-gray-500",
                    )}
                  >
                    Physical location of the {purpose}
                  </p>
                </div>
              </div>

              <div
                className={clsx(
                  "rounded-lg p-2 md:p-4 space-y-1.5 md:space-y-2",
                  isDark ? "bg-gray-900/50" : "bg-gray-50",
                )}
              >
                {/* Location */}
                {address?.location && (
                  <div className="flex items-start gap-2 md:gap-3">
                    <div
                      className={clsx(
                        "mt-0.5",
                        isDark ? "text-gray-400" : "text-gray-500",
                      )}
                    >
                      <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </div>
                    <div className="flex-1">
                      <p
                        className={clsx(
                          "text-xs font-medium mb-0.5",
                          isDark ? "text-gray-400" : "text-gray-600",
                        )}
                      >
                        Location
                      </p>
                      <p
                        className={clsx(
                          "text-sm md:text-base font-medium",
                          isDark ? "text-gray-200" : "text-gray-800",
                        )}
                      >
                        {address.location}
                      </p>
                    </div>
                  </div>
                )}

                {/* City */}
                {address?.city && (
                  <div className="flex items-start gap-2 md:gap-3">
                    <div
                      className={clsx(
                        "mt-0.5",
                        isDark ? "text-gray-400" : "text-gray-500",
                      )}
                    >
                      <Globe2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </div>
                    <div className="flex-1">
                      <p
                        className={clsx(
                          "text-xs font-medium mb-0.5",
                          isDark ? "text-gray-400" : "text-gray-600",
                        )}
                      >
                        City
                      </p>
                      <p
                        className={clsx(
                          "text-sm md:text-base font-medium",
                          isDark ? "text-gray-200" : "text-gray-800",
                        )}
                      >
                        {address.city}
                      </p>
                    </div>
                  </div>
                )}

                {/* Country */}
                {/* {address?.country && (
                  <div className="flex items-start gap-3">
                    <div
                      className={clsx(
                        "mt-0.5",
                        isDark ? "text-gray-400" : "text-gray-500",
                      )}
                    >
                      <Globe2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p
                        className={clsx(
                          "text-xs font-medium mb-0.5",
                          isDark ? "text-gray-400" : "text-gray-600",
                        )}
                      >
                        Country
                      </p>
                      <p
                        className={clsx(
                          "text-base font-medium",
                          isDark ? "text-gray-200" : "text-gray-800",
                        )}
                      >
                        {address.country}
                      </p>
                    </div>
                  </div>
                )} */}
              </div>
            </div>
          )}

          {/* Coordinates Card */}
          {hasCoordinates && (
            <div
              className={clsx(
                "rounded-xl border p-3 md:p-6 transition-all duration-200",
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200",
              )}
            >
              <div className="flex items-start justify-between mb-2 md:mb-4">
                <div className="flex items-start gap-2 md:gap-3">
                  <div
                    className={clsx(
                      "p-1.5 md:p-2 rounded-lg",
                      isDark ? "bg-green-500/20" : "bg-green-100",
                    )}
                  >
                    <Navigation
                      className={clsx(
                        "w-4 h-4 md:w-5 md:h-5",
                        isDark ? "text-green-400" : "text-green-600",
                      )}
                    />
                  </div>
                  <div>
                    <h3
                      className={clsx(
                        "text-xs md:text-sm font-semibold uppercase tracking-wide mb-0.5 md:mb-1",
                        isDark ? "text-gray-400" : "text-gray-600",
                      )}
                    >
                      {t("geo_coordinates")}
                    </h3>
                    <p
                      className={clsx(
                        "text-xs hidden md:block",
                        isDark ? "text-gray-500" : "text-gray-500",
                      )}
                    >
                      Exact geographical position
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 md:gap-4">
                {/* Latitude */}
                <div
                  className={clsx(
                    "rounded-lg p-2 md:p-4",
                    isDark ? "bg-gray-900/50" : "bg-gray-50",
                  )}
                >
                  <p
                    className={clsx(
                      "text-xs font-medium uppercase tracking-wide mb-1 md:mb-2",
                      isDark ? "text-gray-400" : "text-gray-600",
                    )}
                  >
                    {t("latitude")}
                  </p>
                  <p
                    className={clsx(
                      "text-sm md:text-lg font-bold font-mono",
                      isDark ? "text-green-400" : "text-green-600",
                    )}
                  >
                    {lat || "-"}
                  </p>
                </div>

                {/* Longitude */}
                <div
                  className={clsx(
                    "rounded-lg p-2 md:p-4",
                    isDark ? "bg-gray-900/50" : "bg-gray-50",
                  )}
                >
                  <p
                    className={clsx(
                      "text-xs font-medium uppercase tracking-wide mb-1 md:mb-2",
                      isDark ? "text-gray-400" : "text-gray-600",
                    )}
                  >
                    {t("longitude")}
                  </p>
                  <p
                    className={clsx(
                      "text-sm md:text-lg font-bold font-mono",
                      isDark ? "text-green-400" : "text-green-600",
                    )}
                  >
                    {long || "-"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        {(hasCoordinates || hasLocation) && (
          <div
            className={clsx(
              "rounded-xl border overflow-hidden col-span-12 md:col-span-8",
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200",
            )}
          >
            <div
              className={clsx(
                "p-3 md:p-4 border-b",
                isDark
                  ? "border-gray-700 bg-gray-900/50"
                  : "border-gray-200 bg-gray-50",
              )}
            >
              <div className="flex items-center gap-2 md:gap-3">
                <div
                  className={clsx(
                    "p-1.5 md:p-2 rounded-lg",
                    isDark ? "bg-purple-500/20" : "bg-purple-100",
                  )}
                >
                  <Map
                    className={clsx(
                      "w-4 h-4 md:w-5 md:h-5",
                      isDark ? "text-purple-400" : "text-purple-600",
                    )}
                  />
                </div>
                <div>
                  <h3
                    className={clsx(
                      "text-xs md:text-sm font-semibold",
                      isDark ? "text-gray-200" : "text-gray-800",
                    )}
                  >
                    {t("location_address")}
                  </h3>
                  <p
                    className={clsx(
                      "text-xs mt-0.5 hidden md:block",
                      isDark ? "text-gray-400" : "text-gray-600",
                    )}
                  >
                    Interactive map view of the {purpose} location
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full h-100">
              <MarkerMap
                geo={geo}
                setGeo={setGeo}
                address={formattedAddress}
                setAddress={setFormatAddress}
              />
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {!hasLocation && !hasCoordinates && (
        <div
          className={clsx(
            "rounded-xl border p-6 md:p-12 text-center",
            isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-200",
          )}
        >
          <MapPin
            className={clsx(
              "w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 md:mb-3",
              isDark ? "text-gray-600" : "text-gray-400",
            )}
          />
          <h3
            className={clsx(
              "text-sm md:text-base font-semibold mb-1",
              isDark ? "text-gray-300" : "text-gray-700",
            )}
          >
            No Location Information
          </h3>
          <p
            className={clsx(
              "text-xs md:text-sm",
              isDark ? "text-gray-400" : "text-gray-500",
            )}
          >
            Location details have not been provided for this {purpose}
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationDetails;
