import React, { useState, useEffect } from "react";
import { TimePickerWidget } from "@/components/shared/TimePickerWidget";

interface DaySchedule {
  day: string;
  open: string;
  close: string;
}

type View = "list" | "details" | "create" | "edit" | undefined;

interface BusinessOpeningHoursProps {
  initialHours?: DaySchedule[];
  onChange?: (hours: DaySchedule[]) => void;
  theme?: "light" | "dark";
  isRTL?: boolean;
  t?: (key: string) => string;
  business?: any;
  currentView: View;
}

const DAYS_OF_WEEK = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

// Flexible day name normalization
const normalizeDay = (raw: string): DayOfWeek | null => {
  const lower = (raw || "").trim().toLowerCase();
  if (DAYS_OF_WEEK.includes(lower as DayOfWeek)) return lower as DayOfWeek;

  // Abbreviation fallback
  const abbrMap: Record<string, DayOfWeek> = {
    sun: "sunday",
    mon: "monday",
    tue: "tuesday",
    tues: "tuesday",
    wed: "wednesday",
    thu: "thursday",
    thur: "thursday",
    thurs: "thursday",
    fri: "friday",
    sat: "saturday",
  };

  return abbrMap[lower] || null;
};

const createDefaultSchedule = (day: DayOfWeek): DaySchedule => ({
  day,
  open: "09:00",
  close: "18:00",
});

const BusinessOpeningHours: React.FC<BusinessOpeningHoursProps> = ({
  initialHours = [],
  onChange,
  theme = "light",
  isRTL = false,
  t = (key) => key,
  business,
  currentView,
}) => {
  const [schedules, setSchedules] = useState<DaySchedule[]>(() => {
    if (initialHours.length > 0) {
      const map = new Map(initialHours.map((h) => [h.day, h]));
      return DAYS_OF_WEEK.map(
        (day) => map.get(day) ?? createDefaultSchedule(day),
      );
    }
    return DAYS_OF_WEEK.map(createDefaultSchedule);
  });

  useEffect(() => {
    if (currentView !== "edit" || !business) return;

    const incoming =
      business.openingHrs ??
      business.operatingHours ??
      business.opening_hours ??
      business.hours ??
      [];

    if (!Array.isArray(incoming) || incoming.length === 0) return;

    const hoursMap = new Map<DayOfWeek, DaySchedule>();

    incoming.forEach((item: any) => {
      // Support both "day" and "days"
      const dayStr = item.day ?? item.days ?? "";
      const normalizedDay = normalizeDay(dayStr);

      if (!normalizedDay) return;

      // If there's isHoliday
      const isHoliday =
        item.isHoliday === "true" ||
        item.isHoliday === true ||
        item.isHoliday === "1";

      const openTime = (item.open || "").trim();
      const closeTime = (item.close || "").trim();

      hoursMap.set(normalizedDay, {
        day: normalizedDay,
        open: isHoliday ? "" : openTime,
        close: isHoliday ? "" : closeTime,
      });
    });

    // Fill missing days as closed
    const newSchedules = DAYS_OF_WEEK.map((day) => {
      return hoursMap.get(day) ?? { day, open: "", close: "" };
    });

    setSchedules(newSchedules);
  }, [business, currentView]);

  useEffect(() => {
    onChange?.(schedules);
  }, [schedules, onChange]);

  const handleTimeChange = (
    day: DayOfWeek,
    field: "open" | "close",
    time: string,
  ) => {
    setSchedules((prev) =>
      prev.map((item) =>
        item.day === day ? { ...item, [field]: time } : item,
      ),
    );
  };

  const handleClosedChange = (day: DayOfWeek, checked: boolean) => {
    setSchedules((prev) =>
      prev.map((item) => {
        if (item.day !== day) return item;
        return checked
          ? { ...item, open: "", close: "" }
          : { ...item, open: "09:00", close: "18:00" };
      }),
    );
  };

  const isClosed = (s: DaySchedule) => !s.open?.trim() && !s.close?.trim();

  return (
    <div className="space-y-6">
      <h3
        className={`text-lg font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
      >
        {t("operating_hours") || "Business Hours"}
      </h3>

      {schedules.map((schedule) => {
        const dayKey = schedule.day as DayOfWeek;
        const closed = isClosed(schedule);

        return (
          <div
            key={dayKey}
            className={`p-4 rounded-lg border ${
              theme === "dark"
                ? "bg-gray-800/50 border-gray-700"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={`font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
              >
                {t(dayKey) || dayKey.charAt(0).toUpperCase() + dayKey.slice(1)}
              </span>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={closed}
                  onChange={(e) => handleClosedChange(dayKey, e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span
                  className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                >
                  {t("closed") || "Closed"}
                </span>
              </label>
            </div>

            {!closed && (
              <div className="flex items-center gap-3">
                <TimePickerWidget
                  value={schedule.open}
                  onChange={(time) => handleTimeChange(dayKey, "open", time)}
                  theme={theme}
                  isRTL={isRTL}
                />
                <span
                  className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                >
                  {t("to") || "to"}
                </span>
                <TimePickerWidget
                  value={schedule.close}
                  onChange={(time) => handleTimeChange(dayKey, "close", time)}
                  theme={theme}
                  isRTL={isRTL}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BusinessOpeningHours;
