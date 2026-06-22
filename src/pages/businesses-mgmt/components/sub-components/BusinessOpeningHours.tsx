import { useThemeClasses } from "@/hooks/useThemeClasses";
import clsx from "clsx";
import { Plus, Trash2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

interface TimeSlot {
  open: string;
  close: string;
}

interface OperatingHour {
  day: string;
  slots: TimeSlot[];
  isHoliday: boolean;
  byAppointment: boolean;
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

const defaultSlot: TimeSlot = { open: "10:00", close: "17:00" };

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
          slots: [{ ...defaultSlot }],
          isHoliday: false,
          byAppointment: false,
        })),
      });
    }
  }, [formData, setFormData]);

  const hours = formData?.operatingHours ?? [];
  const allByAppointment =
    hours.length > 0 && hours.every((h) => h.byAppointment);

  const handleToggleAllByAppointment = () => {
    const next = !allByAppointment;
    setFormData({
      ...formData,
      operatingHours: hours.map((h) => ({ ...h, byAppointment: next })),
    });
  };

  const handleToggleHoliday = (index: number) => {
    const newHours = [...hours];
    const current = newHours[index];
    newHours[index] = { ...current, isHoliday: !current.isHoliday };
    setFormData({ ...formData, operatingHours: newHours });
  };

  const handleToggleByAppointment = (index: number) => {
    const newHours = [...hours];
    newHours[index] = {
      ...newHours[index],
      byAppointment: !newHours[index].byAppointment,
    };
    setFormData({ ...formData, operatingHours: newHours });
  };

  const handleSlotChange = (
    dayIndex: number,
    slotIndex: number,
    field: "open" | "close",
    value: string,
  ) => {
    const newHours = [...hours];
    const newSlots = [...newHours[dayIndex].slots];
    newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value };
    newHours[dayIndex] = { ...newHours[dayIndex], slots: newSlots };
    setFormData({ ...formData, operatingHours: newHours });
  };

  const handleAddSlot = (dayIndex: number) => {
    const newHours = [...hours];
    newHours[dayIndex] = {
      ...newHours[dayIndex],
      slots: [...newHours[dayIndex].slots, { ...defaultSlot }],
    };
    setFormData({ ...formData, operatingHours: newHours });
  };

  const handleRemoveSlot = (dayIndex: number, slotIndex: number) => {
    const newHours = [...hours];
    newHours[dayIndex] = {
      ...newHours[dayIndex],
      slots: newHours[dayIndex].slots.filter((_, i) => i !== slotIndex),
    };
    setFormData({ ...formData, operatingHours: newHours });
  };

  const inputClass = `px-2 sm:px-3 py-2 sm:py-3 rounded-lg border text-sm ${
    isDark
      ? "bg-gray-700 border-gray-600 text-gray-200"
      : "bg-white border-gray-300 text-gray-900"
  }`;

  return (
    <div className="space-y-4">
      {/* Global by-appointment toggle */}
      <label
        className={clsx(
          "flex items-center gap-2 cursor-pointer p-3 rounded-md border",
          isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200",
        )}
      >
        <input
          type="checkbox"
          checked={allByAppointment}
          onChange={handleToggleAllByAppointment}
          className="w-4 h-4 rounded border-gray-300"
        />
        <span
          className={clsx(
            "text-sm font-medium",
            isDark ? "text-gray-200" : "text-gray-700",
          )}
        >
          {t("by_appointment")}
        </span>
        <span className={clsx("text-xs", textSecondary)}>
          {t("for_entire_week")}
        </span>
      </label>

      {hours.map((hour, dayIdx) => (
        <div
          key={hour.day}
          className={clsx(
            "flex flex-col gap-3 p-3 sm:p-5 border rounded-md",
            isDark ? "bg-gray-800" : "bg-gray-100",
          )}
        >
          {/* Day header row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className={clsx("font-semibold capitalize", textSecondary)}>
              {t(dayFullKey[hour.day])}
            </div>

            <div className="flex gap-4 items-center flex-wrap">
              {/* Per-day by appointment */}
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hour.byAppointment}
                  onChange={() => handleToggleByAppointment(dayIdx)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span
                  className={clsx(
                    "text-sm",
                    isDark ? "text-gray-300" : "text-gray-700",
                  )}
                >
                  {t("by_appointment")}
                </span>
              </label>

              {/* Closed */}
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hour.isHoliday}
                  onChange={() => handleToggleHoliday(dayIdx)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span
                  className={clsx(
                    "text-sm",
                    isDark ? "text-gray-300" : "text-gray-700",
                  )}
                >
                  {t("closed")}
                </span>
              </label>
            </div>
          </div>

          {/* Time slots */}
          {!hour.isHoliday && (
            <div className="space-y-2">
              {hour.slots.map((slot, slotIdx) => (
                <div
                  key={slotIdx}
                  className="flex gap-2 sm:gap-4 items-center flex-wrap"
                >
                  <input
                    type="time"
                    value={slot.open}
                    onChange={(e) =>
                      handleSlotChange(dayIdx, slotIdx, "open", e.target.value)
                    }
                    className={inputClass}
                  />
                  <div className={clsx("text-sm", textSecondary)}>
                    {t("to")}
                  </div>
                  <input
                    type="time"
                    value={slot.close}
                    onChange={(e) =>
                      handleSlotChange(dayIdx, slotIdx, "close", e.target.value)
                    }
                    className={inputClass}
                  />
                  {hour.slots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(dayIdx, slotIdx)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => handleAddSlot(dayIdx)}
                className={clsx(
                  "flex items-center gap-1 text-xs mt-1",
                  isDark
                    ? "text-teal-400 hover:text-teal-300"
                    : "text-teal-600 hover:text-teal-700",
                )}
              >
                <Plus className="w-3 h-3" />
                {t("add_time_slot")}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BusinessOpeningHours;
