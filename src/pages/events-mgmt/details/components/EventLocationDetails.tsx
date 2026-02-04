import { MapPin, Globe2, Navigation, Map } from "lucide-react";
import { useEffect, useState, type FC } from "react";
import clsx from "clsx";

import { MarkerMap } from "@/components/maps";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface EventLocationDetailsProps {
  t: (key: string) => string;
  eventDetails: any;
}

const EventLocationDetails: FC<EventLocationDetailsProps> = ({
  t,
  eventDetails,
}) => {
  const { isDark } = useThemeClasses();
  const [geo, setGeo] = useState<Geo>({ lat: "", lng: "" });
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!eventDetails) return;

    // Set geo location
    if (eventDetails?.geoLocation) {
      setGeo({
        lat: String(eventDetails.geoLocation.lat),
        lng: String(
          eventDetails.geoLocation.lng || eventDetails.geoLocation.long,
        ),
      });
    }

    // Set formatted address
    if (eventDetails.address) {
      const formatted = [
        eventDetails.address.location,
        eventDetails.address.city,
        eventDetails.address.country,
      ]
        .filter(Boolean)
        .join(", ");

      setAddress(formatted);
    }
  }, [eventDetails]);

  const hasLocation =
    eventDetails?.address?.location ||
    eventDetails?.address?.city ||
    eventDetails?.address?.country;

  const hasCoordinates =
    eventDetails?.geoLocation?.lat &&
    (eventDetails?.geoLocation?.lng || eventDetails?.geoLocation?.long);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2
          className={clsx(
            "text-2xl font-bold",
            isDark ? "text-white" : "text-gray-900",
          )}
        >
          Event Location
        </h2>
        <p
          className={clsx(
            "text-sm mt-1",
            isDark ? "text-gray-400" : "text-gray-600",
          )}
        >
          Find out where this event is taking place
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Address Card */}
        {hasLocation && (
          <div
            className={clsx(
              "rounded-xl border p-6 transition-all duration-200",
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200",
            )}
          >
            <div className="flex items-start gap-3 mb-4">
              <div
                className={clsx(
                  "p-2 rounded-lg",
                  isDark ? "bg-blue-500/20" : "bg-blue-100",
                )}
              >
                <MapPin
                  className={clsx(
                    "w-5 h-5",
                    isDark ? "text-blue-400" : "text-blue-600",
                  )}
                />
              </div>
              <div className="flex-1">
                <h3
                  className={clsx(
                    "text-sm font-semibold uppercase tracking-wide mb-1",
                    isDark ? "text-gray-400" : "text-gray-600",
                  )}
                >
                  {t("address")}
                </h3>
                <p
                  className={clsx(
                    "text-xs",
                    isDark ? "text-gray-500" : "text-gray-500",
                  )}
                >
                  Physical location of the event
                </p>
              </div>
            </div>

            <div
              className={clsx(
                "rounded-lg p-4 space-y-2",
                isDark ? "bg-gray-900/50" : "bg-gray-50",
              )}
            >
              {/* Location */}
              {eventDetails?.address?.location && (
                <div className="flex items-start gap-3">
                  <div
                    className={clsx(
                      "mt-0.5",
                      isDark ? "text-gray-400" : "text-gray-500",
                    )}
                  >
                    <MapPin className="w-4 h-4" />
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
                        "text-base font-medium",
                        isDark ? "text-gray-200" : "text-gray-800",
                      )}
                    >
                      {eventDetails.address.location}
                    </p>
                  </div>
                </div>
              )}

              {/* City */}
              {eventDetails?.address?.city && (
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
                      City
                    </p>
                    <p
                      className={clsx(
                        "text-base font-medium",
                        isDark ? "text-gray-200" : "text-gray-800",
                      )}
                    >
                      {eventDetails.address.city}
                    </p>
                  </div>
                </div>
              )}

              {/* Country */}
              {eventDetails?.address?.country && (
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
                      {eventDetails.address.country}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Coordinates Card */}
        {hasCoordinates && (
          <div
            className={clsx(
              "rounded-xl border p-6 transition-all duration-200",
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200",
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div
                  className={clsx(
                    "p-2 rounded-lg",
                    isDark ? "bg-green-500/20" : "bg-green-100",
                  )}
                >
                  <Navigation
                    className={clsx(
                      "w-5 h-5",
                      isDark ? "text-green-400" : "text-green-600",
                    )}
                  />
                </div>
                <div>
                  <h3
                    className={clsx(
                      "text-sm font-semibold uppercase tracking-wide mb-1",
                      isDark ? "text-gray-400" : "text-gray-600",
                    )}
                  >
                    {t("geo_coordinates")}
                  </h3>
                  <p
                    className={clsx(
                      "text-xs",
                      isDark ? "text-gray-500" : "text-gray-500",
                    )}
                  >
                    Exact geographical position
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Latitude */}
              <div
                className={clsx(
                  "rounded-lg p-4",
                  isDark ? "bg-gray-900/50" : "bg-gray-50",
                )}
              >
                <p
                  className={clsx(
                    "text-xs font-medium uppercase tracking-wide mb-2",
                    isDark ? "text-gray-400" : "text-gray-600",
                  )}
                >
                  {t("latitude")}
                </p>
                <p
                  className={clsx(
                    "text-lg font-bold font-mono",
                    isDark ? "text-green-400" : "text-green-600",
                  )}
                >
                  {eventDetails.geoLocation.lat || "-"}
                </p>
              </div>

              {/* Longitude */}
              <div
                className={clsx(
                  "rounded-lg p-4",
                  isDark ? "bg-gray-900/50" : "bg-gray-50",
                )}
              >
                <p
                  className={clsx(
                    "text-xs font-medium uppercase tracking-wide mb-2",
                    isDark ? "text-gray-400" : "text-gray-600",
                  )}
                >
                  {t("longitude")}
                </p>
                <p
                  className={clsx(
                    "text-lg font-bold font-mono",
                    isDark ? "text-green-400" : "text-green-600",
                  )}
                >
                  {eventDetails.geoLocation.lng ||
                    eventDetails.geoLocation.long ||
                    "-"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Map */}
      <div
        className={clsx(
          "rounded-xl border overflow-hidden",
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
        )}
      >
        <div
          className={clsx(
            "p-4 border-b",
            isDark
              ? "border-gray-700 bg-gray-900/50"
              : "border-gray-200 bg-gray-50",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={clsx(
                "p-2 rounded-lg",
                isDark ? "bg-purple-500/20" : "bg-purple-100",
              )}
            >
              <Map
                className={clsx(
                  "w-5 h-5",
                  isDark ? "text-purple-400" : "text-purple-600",
                )}
              />
            </div>
            <div>
              <h3
                className={clsx(
                  "text-sm font-semibold",
                  isDark ? "text-gray-200" : "text-gray-800",
                )}
              >
                {t("location_address")}
              </h3>
              <p
                className={clsx(
                  "text-xs mt-0.5",
                  isDark ? "text-gray-400" : "text-gray-600",
                )}
              >
                Interactive map view of the event location
              </p>
            </div>
          </div>
        </div>

        <div className="w-full h-100">
          <MarkerMap
            geo={geo}
            setGeo={setGeo}
            address={address}
            setAddress={setAddress}
          />
        </div>
      </div>

      {/* Empty State */}
      {!hasLocation && !hasCoordinates && (
        <div
          className={clsx(
            "rounded-xl border p-12 text-center",
            isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-200",
          )}
        >
          <MapPin
            className={clsx(
              "w-12 h-12 mx-auto mb-3",
              isDark ? "text-gray-600" : "text-gray-400",
            )}
          />
          <h3
            className={clsx(
              "text-base font-semibold mb-1",
              isDark ? "text-gray-300" : "text-gray-700",
            )}
          >
            No Location Information
          </h3>
          <p
            className={clsx(
              "text-sm",
              isDark ? "text-gray-400" : "text-gray-500",
            )}
          >
            Location details have not been provided for this event
          </p>
        </div>
      )}
    </div>
  );
};

export default EventLocationDetails;
