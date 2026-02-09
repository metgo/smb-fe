interface OperatingHour {
  day: string;
  open: string;
  close: string;
  isHoliday?: boolean;
}

interface BusinessOpeningHoursDetailsProps {
  isDark: boolean;
  business: {
    openingHrs: OperatingHour[];
  };
}
const dayOrder = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const getDayDisplay = (day: string) =>
  day?.charAt(0)?.toUpperCase() + day?.slice(1)?.toLowerCase();

const BusinessOpeningHoursDetails: React.FC<
  BusinessOpeningHoursDetailsProps
> = ({ isDark, business }) => {
  const openingHrs = business?.openingHrs || [];

  const formatTime = (time: string) => {
    if (!time) return null;
    return time.replace(/^0/, "") || "00:00";
  };

  if (openingHrs.length === 0) {
    return (
      <div
        className={`py-4 px-6 rounded ${
          isDark
            ? "bg-gray-800 text-white border-gray-700"
            : "bg-gray-50 text-gray-700 border-gray-200"
        }`}
      >
        No schedule available
      </div>
    );
  }

  const hoursMap = new Map(openingHrs?.map((h) => [h?.day?.toUpperCase(), h]));
  return (
    <div>
      <h2
        className={`mb-3 px-4 py-2 rounded ${
          isDark
            ? "border-gray-700 text-white bg-gray-900"
            : "bg-gray-50 border-gray-200 text-gray-900"
        }`}
      >
        Weekly Schedule
      </h2>

      <div className="space-y-3 px-4">
        {dayOrder?.map((day) => {
          const entry = hoursMap.get(day);

          let displayText = "Closed";

          if (entry) {
            if (entry.isHoliday) {
              displayText = "Holiday";
            } else if (entry.open && entry.close) {
              if (entry.open === "00:00" && entry.close === "00:00") {
                displayText = "Closed";
              } else {
                displayText = `${formatTime(entry.open)} – ${formatTime(
                  entry.close,
                )}`;
              }
            }
          }

          return (
            <div
              key={day}
              className={`flex justify-between items-center py-3 px-4 rounded-lg ${
                isDark
                  ? "bg-gray-800/50 border border-gray-700 text-white hover:bg-gray-700"
                  : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <span>{getDayDisplay(day)}</span>
              <span>{displayText}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BusinessOpeningHoursDetails;
