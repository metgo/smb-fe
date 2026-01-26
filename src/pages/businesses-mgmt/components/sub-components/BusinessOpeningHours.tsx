import { TimePickerWidget } from "@/components/shared/TimePickerWidget";
import type { FC } from "react";
import type { OperatingHours, OpeningHrPayload } from "@/types/openinghours";

interface BusinessOpeningHoursProps {
  theme: "light" | "dark";
  isRTL: boolean;
  formData: {
    operatingHours: OperatingHours;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      operatingHours: OperatingHours;
    }>
  >;
  t: (key: string) => string;
}

const BusinessOpeningHours: FC<BusinessOpeningHoursProps> = ({
  theme,
  isRTL,
  formData,
  setFormData,
  t,
}) => {
  const daysOfWeek = [
    { key: "sunday", label: t("sunday") },
    { key: "monday", label: t("monday") },
    { key: "tuesday", label: t("tuesday") },
    { key: "wednesday", label: t("wednesday") },
    { key: "thursday", label: t("thursday") },
    { key: "friday", label: t("friday") },
    { key: "saturday", label: t("saturday") },
  ] as const;

  const transformOperatingHoursToPayload = (
    operatingHours: OperatingHours,
  ): OpeningHrPayload[] => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    return Object.entries(operatingHours).flatMap(
      ([day, ranges]): OpeningHrPayload[] => {
        // Holiday (closed)
        if (ranges.length === 0) {
          return [
            {
              days: day,
              open: `${today}T00:00:00.000Z`,
              close: `${today}T00:00:00.000Z`,
              isHoliday: true,
            },
          ];
        }

        // Open hours
        return ranges.map((range: any) => ({
          days: day,
          open: `${today}T${range.open}:00.000Z`,
          close: `${today}T${range.close}:00.000Z`,
          isHoliday: false,
        }));
      },
    );
  };

  const payload = {
    openingHrs: transformOperatingHoursToPayload(formData.operatingHours),
  };
  console.log("payload opening hours", payload);
  return (
    <div className="space-y-6">
      <h3 className={theme === "dark" ? "text-gray-200" : "text-gray-800"}>
        {t("operating_hours")}
      </h3>

      {daysOfWeek.map((day) => {
        const hours = formData.operatingHours[day.key];

        return (
          <div
            key={day.key}
            className={`p-4 rounded-lg ${
              theme === "dark"
                ? "bg-gray-800/50 border border-gray-700"
                : "bg-gray-50 border border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={`font-medium ${
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                }`}
              >
                {day.label}
              </span>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hours.length === 0}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      operatingHours: {
                        ...prev.operatingHours,
                        [day.key]: e.target.checked
                          ? []
                          : [{ open: "09:00", close: "18:00" }],
                      },
                    }));
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t("closed")}
                </span>
              </label>
            </div>

            {hours.length > 0 && (
              <div className="space-y-2">
                {hours.map((range, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <TimePickerWidget
                      value={range.open}
                      onChange={(time) => {
                        setFormData((prev) => {
                          const updated = [...prev.operatingHours[day.key]];
                          updated[idx] = {
                            ...updated[idx],
                            open: time,
                          };

                          return {
                            ...prev,
                            operatingHours: {
                              ...prev.operatingHours,
                              [day.key]: updated,
                            },
                          };
                        });
                      }}
                      theme={theme}
                      isRTL={isRTL}
                    />

                    <span className="text-gray-500">{t("to")}</span>

                    <TimePickerWidget
                      value={range.close}
                      onChange={(time) => {
                        setFormData((prev) => {
                          const updated = [...prev.operatingHours[day.key]];
                          updated[idx] = {
                            ...updated[idx],
                            close: time,
                          };

                          return {
                            ...prev,
                            operatingHours: {
                              ...prev.operatingHours,
                              [day.key]: updated,
                            },
                          };
                        });
                      }}
                      theme={theme}
                      isRTL={isRTL}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BusinessOpeningHours;
