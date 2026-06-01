import { useThemeClasses } from "@/hooks/useThemeClasses";
import clsx from "clsx";
import React from "react";
import { useTranslation } from "react-i18next";

interface OperatingHour {
  day: string;
  open: string;
  close: string;
  isHoliday: boolean;
}

interface BusinessOpeningHoursProps {
  formData: { operatingHours: OperatingHour[] };
  setFormData: (data: any) => void;
}

const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const dayFullKey: Record<string, string> = {
  SUN: "sunday",
  MON: "monday",
  TUE: "tuesday",
  WED: "wednesday",
  THU: "thursday",
  FRI: "friday",
  SAT: "saturday",
};

const BusinessOpeningHours = ({
  formData,
  setFormData,
}: BusinessOpeningHoursProps) => {
  const { t } = useTranslation("common");
  const { isDark, textSecondary } = useThemeClasses();

  React.useEffect(() => {
    if (!formData.operatingHours || formData.operatingHours.length === 0) {
      setFormData({
        ...formData,
        operatingHours: daysOfWeek.map((day) => ({
          day,
          open: "10:00",
          close: "17:00",
          isHoliday: false,
        })),
      });
    }
  }, [formData, setFormData]);

  const handleToggleHoliday = (index: number) => {
    const newHours = [...formData.operatingHours];
    const current = newHours[index];
    if (!current.isHoliday) {
      newHours[index] = { ...current, isHoliday: true, open: "", close: "" };
    } else {
      newHours[index] = { ...current, isHoliday: false };
    }
    setFormData({ ...formData, operatingHours: newHours });
  };

  const handleTimeChange = (
    index: number,
    field: "open" | "close",
    value: string,
  ) => {
    const newHours = [...formData.operatingHours];
    newHours[index] = { ...newHours[index], [field]: value };
    setFormData({ ...formData, operatingHours: newHours });
  };

  return (
    <div className="space-y-6">
      {formData?.operatingHours?.map((hour, idx) => (
        <div
          key={hour.day}
          className={clsx(
            "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-5 border rounded-md",
            isDark ? "bg-gray-800" : "bg-gray-100",
          )}
        >
          <div className="flex flex-col">
            <div
              className={clsx("font-semibold capitalize mb-1", textSecondary)}
            >
              {t(dayFullKey[hour.day])}
            </div>
            <div className="flex gap-2 sm:gap-4 items-center flex-wrap">
              <input
                type="time"
                value={hour.open}
                onChange={(e) => handleTimeChange(idx, "open", e.target.value)}
                disabled={hour.isHoliday}
                className={`px-2 sm:px-3 py-2 sm:py-3 rounded-lg border text-sm ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
              <div className={clsx("text-sm", textSecondary)}>{t("to")}</div>
              <input
                type="time"
                value={hour.close}
                onChange={(e) => handleTimeChange(idx, "close", e.target.value)}
                disabled={hour.isHoliday}
                className={`px-2 sm:px-3 py-2 sm:py-3 rounded-lg border text-sm ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer self-start sm:self-auto">
            <input
              type="checkbox"
              checked={hour.isHoliday}
              onChange={() => handleToggleHoliday(idx)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span
              className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {t("closed")}
            </span>
          </label>
        </div>
      ))}
    </div>
  );
};

export default BusinessOpeningHours;
