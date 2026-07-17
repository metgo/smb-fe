import clsx from "clsx";
import { MapPin } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ImageWithFallback } from "@/components/shared";

interface TripStationsDetailsProps {
  t: (key: string) => string;
  stations?: ITripStation[];
}

const TripStationsDetails: React.FC<TripStationsDetailsProps> = ({
  t,
  stations = [],
}) => {
  const { isDark, textPrimary, textTertiary, borderColor } = useThemeClasses();

  const sortedStations = [...stations].sort((a, b) => a.order - b.order);

  if (sortedStations.length === 0) {
    return (
      <div
        className={clsx(
          "rounded-xl border-2 border-dashed p-12 text-center",
          isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-300",
        )}
      >
        <MapPin
          className={clsx(
            "w-12 h-12 mx-auto mb-3",
            isDark ? "text-gray-600" : "text-gray-400",
          )}
        />
        <p className={clsx("text-sm", textTertiary)}>
          {t("station_not_selected_yet")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedStations.map((station) => (
        <div
          key={station._id}
          className={clsx(
            "flex items-center gap-4 rounded-xl border p-3",
            borderColor,
            isDark ? "bg-gray-800" : "bg-white",
          )}
        >
          <div
            className={clsx(
              "shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
              isDark
                ? "bg-teal-500/20 text-teal-400"
                : "bg-teal-100 text-teal-700",
            )}
          >
            {station.order}
          </div>

          <ImageWithFallback
            src={station.image}
            alt={station.name}
            className="w-14 h-14 rounded-lg object-cover shrink-0 border border-gray-200 dark:border-gray-700"
          />

          <div className="min-w-0 flex-1">
            <p className={clsx("text-sm font-medium truncate", textPrimary)}>
              {station.name}
            </p>
            <p className={clsx("text-xs line-clamp-1", textTertiary)}>
              {station.shortDescription || "-"}
            </p>
          </div>

          <span
            className={clsx(
              "shrink-0 px-2 py-1 rounded-full text-xs capitalize",
              isDark
                ? "bg-gray-700 text-gray-300"
                : "bg-gray-100 text-gray-600",
            )}
          >
            {station.type}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TripStationsDetails;
