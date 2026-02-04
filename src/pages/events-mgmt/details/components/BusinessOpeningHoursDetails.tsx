/* ---------- Types ---------- */

import type { FC } from "react";

type Theme = "light" | "dark";

interface OperatingHourRange {
  open: string;
  close: string;
}

interface OperatingHours {
  sunday: OperatingHourRange[];
  monday: OperatingHourRange[];
  tuesday: OperatingHourRange[];
  wednesday: OperatingHourRange[];
  thursday: OperatingHourRange[];
  friday: OperatingHourRange[];
  saturday: OperatingHourRange[];
}

/* ---------- Props ---------- */

interface BusinessOpeningHoursDetailsProps {
  theme: Theme;
  t: (key: string) => string;
  business: Business;
}

/* ---------- Component ---------- */

const BusinessOpeningHoursDetails: FC<BusinessOpeningHoursDetailsProps> = ({
  theme,
  t,
  business,
}) => {
  const daysOfWeek = [
    { key: "sunday", label: t("sunday") },
    { key: "monday", label: t("monday") },
    { key: "tuesday", label: t("tuesday") },
    { key: "wednesday", label: t("wednesday") },
    { key: "thursday", label: t("thursday") },
    { key: "friday", label: t("friday") },
    { key: "saturday", label: t("saturday") },
  ];

  return (
    <div className="space-y-4">
      <h3
        className={`mb-3 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
      >
        {t("weekly_schedule")}
      </h3>

      {daysOfWeek.map((day) => {
        const hours = business.operatingHours[day.key as keyof OperatingHours];
        return (
          <div
            key={day.key}
            className={`p-4 rounded-lg ${
              theme === "dark"
                ? "bg-gray-800/50 border border-gray-700"
                : "bg-gray-50 border border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
              >
                {day.label}
              </span>
              <div className="flex items-center gap-2">
                {hours && hours.length > 0 ? (
                  hours.map((range, idx) => (
                    <span
                      key={idx}
                      className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {range.open} - {range.close}
                    </span>
                  ))
                ) : (
                  <span
                    className={`text-sm ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}
                  >
                    {t("closed")}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BusinessOpeningHoursDetails;
