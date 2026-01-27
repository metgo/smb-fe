import React from "react";

type Theme = "light" | "dark";
interface BusinessOpeningHoursDetailsProps {
  theme: Theme;
  t: (key: string) => string;
  business: any;
}

const BusinessOpeningHoursDetails: React.FC<
  BusinessOpeningHoursDetailsProps
> = ({ theme, business }) => {
  const openingHrs = business?.openingHrs || [];

  // Format UTC ISO time → HH:mm (24-hour) in local timezone
  const formatTime = (utcIsoString: any) => {
    if (!utcIsoString) return null;
    const date = new Date(utcIsoString);
    return date
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(/^0+/, "");
  };

  const dayOrder = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const getDayDisplay = (day: any) =>
    day.charAt(0).toUpperCase() + day.slice(1);

  const getHoursForDay = (dayName: any) =>
    openingHrs.find(
      (item: any) => item?.days?.toLowerCase() === dayName.toLowerCase(),
    );

  if (openingHrs.length === 0) {
    return (
      <div
        className={`py-4 px-6 rounded ${
          theme === "dark"
            ? "bg-gray-800 text-white  border-gray-700"
            : "bg-gray-50 text-gray-700  border-gray-200"
        }`}
      >
        No schedule available
      </div>
    );
  }

  return (
    <div>
      <h2
        className={`mb-3 ${
          theme === "dark"
            ? "border-gray-700 text-white hover:bg-gray-700"
            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
        }`}
      >
        Weekly Schedule
      </h2>

      <div className="space-y-3">
        {dayOrder.map((day) => {
          const entry = getHoursForDay(day);

          let displayText = "Closed";

          if (entry) {
            if (entry.isHoliday) {
              displayText = "Holiday";
            } else if (entry.open && entry.close) {
              const openTime = formatTime(entry.open);
              const closeTime = formatTime(entry.close);

              // 00:00-00:00 is often used to indicate closed
              if (openTime === "00:00" && closeTime === "00:00") {
                displayText = "Closed";
              } else {
                displayText = `${openTime} – ${closeTime}`;
              }
            }
          }

          return (
            <div
              key={day}
              className={`flex justify-between items-center py-3 px-4 rounded-lg ${
                theme === "dark"
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
