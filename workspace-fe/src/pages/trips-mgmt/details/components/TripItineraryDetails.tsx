import clsx from "clsx";
import { CalendarClock } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";

interface TripItineraryDetailsProps {
  t: (key: string) => string;
  itenary?: ITripItinerary[];
}

const TripItineraryDetails: React.FC<TripItineraryDetailsProps> = ({
  t,
  itenary = [],
}) => {
  const { isDark, textPrimary, textTertiary, borderColor } = useThemeClasses();

  if (itenary.length === 0) {
    return (
      <div
        className={clsx(
          "rounded-xl border-2 border-dashed p-12 text-center",
          isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-300",
        )}
      >
        <CalendarClock
          className={clsx(
            "w-12 h-12 mx-auto mb-3",
            isDark ? "text-gray-600" : "text-gray-400",
          )}
        />
        <p className={clsx("text-sm", textTertiary)}>
          {t("no_stations_found")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {itenary.map((item, idx) => (
        <div
          key={idx}
          className={clsx(
            "flex items-center gap-4 rounded-xl border p-4",
            borderColor,
            isDark ? "bg-gray-800" : "bg-white",
          )}
        >
          <div
            className={clsx(
              "shrink-0 p-2 rounded-lg",
              isDark ? "bg-teal-500/20" : "bg-teal-100",
            )}
          >
            <CalendarClock
              className={clsx(
                "w-5 h-5",
                isDark ? "text-teal-400" : "text-teal-600",
              )}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className={clsx("text-sm font-medium truncate", textPrimary)}>
              {item.title}
            </p>
            <p className={clsx("text-xs mt-0.5", textTertiary)}>
              {t("start_time")}: {item.startTime || "-"} · {t("end_time")}:{" "}
              {item.endTime || "-"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TripItineraryDetails;
