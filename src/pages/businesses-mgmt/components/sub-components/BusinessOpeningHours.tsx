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
          open: "",
          close: "",
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
          className={`flex justify-between items-start p-5 border rounded-md ${
            isDark ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          {/* Left side: Day and open time (open time below day) */}
          <div className="flex flex-col">
            <div className={clsx("w-12 font-semibold", textSecondary)}>
              {t(hour.day)}
            </div>
            <div className="flex gap-4 items-center">
              <input
                type="time"
                value={hour.open}
                onChange={(e) => handleTimeChange(idx, "open", e.target.value)}
                disabled={hour.isHoliday}
                className={`mt-1 px-3 py-3 rounded-lg border text-sm ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
              <div className={clsx(textSecondary)}>{t("to")}</div>
              <input
                type="time"
                value={hour.close}
                onChange={(e) => handleTimeChange(idx, "close", e.target.value)}
                disabled={hour.isHoliday}
                className={`px-3 py-3 rounded-lg border text-sm ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
          </div>

          {/* Right side: close time and checkbox (stacked vertically) */}
          <div className="flex flex-col items-end space-y-2">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={hour.isHoliday}
                onChange={() => handleToggleHoliday(idx)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                Closed
              </span>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BusinessOpeningHours;
