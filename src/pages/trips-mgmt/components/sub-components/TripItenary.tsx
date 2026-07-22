import { Plus, Trash2 } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { FormFieldWrapper } from "@/components/form-fields";

interface TripItenaryProps {
  t: (key: string) => string;
  schedules: ScheduleItem[];
  setSchedules: (schedules: ScheduleItem[]) => void;
}

const TripItenary = ({ t, schedules, setSchedules }: TripItenaryProps) => {
  const { isDark, borderColor, bgTertiary, textPrimary } = useThemeClasses();

  const inputClass = `w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-teal-500`;

  const handleChange = (
    index: number,
    field: keyof ScheduleItem,
    value: string,
  ) => {
    const updated = schedules.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    setSchedules(updated);
  };

  const handleAdd = () => {
    setSchedules([...schedules, { title: "", startTime: null, endTime: null }]);
  };

  const handleRemove = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <h3 className={`text-lg ${isDark ? "text-gray-200" : "text-gray-800"}`}>
        {t("step_itenary")}
      </h3>

      <div className="space-y-4">
        {schedules.map((schedule, index) => (
          <div
            key={index}
            className={`relative p-4 rounded-lg border ${borderColor} ${bgTertiary}`}
          >
            {schedules.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-3 right-3 cursor-pointer p-1 text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <FormFieldWrapper label={t("itenary_title")}>
              <input
                type="text"
                value={schedule.title}
                onChange={(e) => handleChange(index, "title", e.target.value)}
                placeholder={t("itenary_title")}
                className={inputClass}
              />
            </FormFieldWrapper>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <FormFieldWrapper label={t("start_time")}>
                <input
                  type="time"
                  value={schedule.startTime ?? ""}
                  onChange={(e) =>
                    handleChange(index, "startTime", e.target.value)
                  }
                  className={inputClass}
                />
              </FormFieldWrapper>

              <FormFieldWrapper label={t("end_time")}>
                <input
                  type="time"
                  value={schedule.endTime ?? ""}
                  onChange={(e) =>
                    handleChange(index, "endTime", e.target.value)
                  }
                  className={inputClass}
                />
              </FormFieldWrapper>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-teal-500 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        {t("add_itenary_item")}
      </button>
    </div>
  );
};

export default TripItenary;
