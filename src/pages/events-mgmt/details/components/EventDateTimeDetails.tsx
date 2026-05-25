import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { formatDate } from "@/helpers/formatter";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  Calendar,
  Clock,
  Repeat,
  CalendarDays,
  AlertCircle,
} from "lucide-react";

interface DayDescription {
  date: string;
  startTime: string;
  endTime: string;
  _id: string;
}

interface RecurringEventRule {
  _id: string;
  pattern: string;
  daysOfWeek?: string[];
  monthlyType?: string;
  specificDate?: number;
  relativeDate?: number;
  relativeDay?: string;
  customInterval?: number;
  customUnit?: string;
  endType?: string;
  occurrenceLimit?: number;
  endDate?: string | null;
}

interface EventDateTimeDetailsProps {
  dayDescription: DayDescription[];
  recurringEventRuleId?: RecurringEventRule | null;
}

const EventDateTimeDetails: React.FC<EventDateTimeDetailsProps> = ({
  dayDescription,
  recurringEventRuleId,
}) => {
  const { t } = useTranslation("events");
  const { isDark, language } = useThemeClasses();

  const getPatternLabel = (pattern: string) => {
    const patterns: Record<string, string> = {
      DAILY: "Daily",
      WEEKLY: "Weekly",
      MONTHLY: "Monthly",
      YEARLY: "Yearly",
      CUSTOM: "Custom",
    };
    return patterns[pattern] || pattern;
  };

  const getDayBadgeColor = (day: string) => {
    const colors: Record<string, string> = {
      Monday: isDark
        ? "bg-blue-500/20 text-blue-400"
        : "bg-blue-100 text-blue-700",
      Tuesday: isDark
        ? "bg-green-500/20 text-green-400"
        : "bg-green-100 text-green-700",
      Wednesday: isDark
        ? "bg-yellow-500/20 text-yellow-400"
        : "bg-yellow-100 text-yellow-700",
      Thursday: isDark
        ? "bg-purple-500/20 text-purple-400"
        : "bg-purple-100 text-purple-700",
      Friday: isDark
        ? "bg-pink-500/20 text-pink-400"
        : "bg-pink-100 text-pink-700",
      Saturday: isDark
        ? "bg-orange-500/20 text-orange-400"
        : "bg-orange-100 text-orange-700",
      Sunday: isDark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-700",
    };
    return (
      colors[day] ||
      (isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700")
    );
  };

  const calculateDuration = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return "";

    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) return "";

    const durationMinutes = endMinutes - startMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {recurringEventRuleId && (
          <div
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg",
              isDark
                ? "bg-indigo-500/20 text-indigo-400"
                : "bg-indigo-100 text-indigo-700",
            )}
          >
            <Repeat size={18} />
            <span className="text-sm font-medium">
              {getPatternLabel(recurringEventRuleId.pattern)}
            </span>
          </div>
        )}
      </div>

      {/* Date & Time Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {dayDescription?.map((day, index) => (
          <div
            key={index}
            className={clsx(
              "rounded-xl border p-6 transition-all duration-200 hover:shadow-lg",
              isDark
                ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                : "bg-white border-gray-200 hover:border-gray-300",
            )}
          >
            {/* Date Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={clsx(
                    "p-3 rounded-lg",
                    isDark ? "bg-blue-500/20" : "bg-blue-100",
                  )}
                >
                  <Calendar
                    className={clsx(
                      "w-5 h-5",
                      isDark ? "text-blue-400" : "text-blue-600",
                    )}
                  />
                </div>
                <div>
                  <p
                    className={clsx(
                      "text-lg font-semibold",
                      isDark ? "text-white" : "text-gray-900",
                    )}
                  >
                    {formatDate(day.date, language)}
                  </p>
                  <p
                    className={clsx(
                      "text-xs",
                      isDark ? "text-gray-400" : "text-gray-500",
                    )}
                  >
                    Day {index + 1}
                  </p>
                </div>
              </div>

              <span
                className={clsx(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  isDark
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-600",
                )}
              >
                {new Date(day.date).toLocaleDateString("en-US", {
                  weekday: "short",
                })}
              </span>
            </div>

            {/* Time Details */}
            <div
              className={clsx(
                "rounded-lg p-4 space-y-3",
                isDark ? "bg-gray-900/50" : "bg-gray-50",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock
                    className={clsx(
                      "w-4 h-4",
                      isDark ? "text-gray-400" : "text-gray-500",
                    )}
                  />
                  <span
                    className={clsx(
                      "text-sm font-medium",
                      isDark ? "text-gray-300" : "text-gray-700",
                    )}
                  >
                    {t("start_time")}
                  </span>
                </div>
                <span
                  className={clsx(
                    "text-lg font-semibold",
                    isDark ? "text-white" : "text-gray-900",
                  )}
                >
                  {day.startTime}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock
                      className={clsx(
                        "w-4 h-4",
                        isDark ? "text-gray-400" : "text-gray-500",
                      )}
                    />
                    <span
                      className={clsx(
                        "text-sm font-medium",
                        isDark ? "text-gray-300" : "text-gray-700",
                      )}
                    >
                      {t("end_time")}
                    </span>
                  </div>
                  <span
                    className={clsx(
                      "text-lg font-semibold",
                      isDark ? "text-white" : "text-gray-900",
                    )}
                  >
                    {day.endTime}
                  </span>
                </div>
              </div>

              {/* Duration Badge */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span
                    className={clsx(
                      "text-xs",
                      isDark ? "text-gray-400" : "text-gray-500",
                    )}
                  >
                    {t("duration")}
                  </span>
                  <span
                    className={clsx(
                      "px-2 py-1 rounded-md text-xs font-semibold",
                      isDark
                        ? "bg-green-500/20 text-green-400"
                        : "bg-green-100 text-green-700",
                    )}
                  >
                    {calculateDuration(day.startTime, day.endTime)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recurring Event Details */}
      {recurringEventRuleId && dayDescription?.length === 1 && (
        <div
          className={clsx(
            "rounded-xl border p-6",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
          )}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={clsx(
                "p-3 rounded-lg",
                isDark ? "bg-indigo-500/20" : "bg-indigo-100",
              )}
            >
              <Repeat
                className={clsx(
                  "w-5 h-5",
                  isDark ? "text-indigo-400" : "text-indigo-600",
                )}
              />
            </div>
            <div>
              <h3
                className={clsx(
                  "text-lg font-semibold",
                  isDark ? "text-white" : "text-gray-900",
                )}
              >
                {t("recurring_event_pattern")}
              </h3>
              <p
                className={clsx(
                  "text-sm",
                  isDark ? "text-gray-400" : "text-gray-600",
                )}
              >
                {t("recurring_event_pattern_desc")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pattern */}
            <div
              className={clsx(
                "p-4 rounded-lg",
                isDark ? "bg-gray-900/50" : "bg-gray-50",
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays
                  className={clsx(
                    "w-4 h-4",
                    isDark ? "text-gray-400" : "text-gray-500",
                  )}
                />
                <span
                  className={clsx(
                    "text-xs font-medium uppercase tracking-wide",
                    isDark ? "text-gray-400" : "text-gray-500",
                  )}
                >
                  {t("pattern")}
                </span>
              </div>
              <p
                className={clsx(
                  "text-base font-semibold",
                  isDark ? "text-white" : "text-gray-900",
                )}
              >
                {getPatternLabel(recurringEventRuleId.pattern)}
              </p>
              {recurringEventRuleId.customInterval &&
                recurringEventRuleId.customUnit && (
                  <p
                    className={clsx(
                      "text-sm mt-1",
                      isDark ? "text-gray-400" : "text-gray-600",
                    )}
                  >
                    Every {recurringEventRuleId.customInterval}{" "}
                    {recurringEventRuleId.customUnit.toLowerCase()}(s)
                  </p>
                )}
            </div>

            {/* Days of Week */}
            {recurringEventRuleId?.daysOfWeek &&
              recurringEventRuleId?.daysOfWeek?.length > 0 && (
                <div
                  className={clsx(
                    "p-4 rounded-lg",
                    isDark ? "bg-gray-900/50" : "bg-gray-50",
                  )}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar
                      className={clsx(
                        "w-4 h-4",
                        isDark ? "text-gray-400" : "text-gray-500",
                      )}
                    />
                    <span
                      className={clsx(
                        "text-xs font-medium uppercase tracking-wide",
                        isDark ? "text-gray-400" : "text-gray-500",
                      )}
                    >
                      {t("days_of_week")}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recurringEventRuleId?.daysOfWeek?.map((day) => (
                      <span
                        key={day}
                        className={clsx(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          getDayBadgeColor(day),
                        )}
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* End Type */}
            {recurringEventRuleId?.endType && (
              <div
                className={clsx(
                  "p-4 rounded-lg",
                  isDark ? "bg-gray-900/50" : "bg-gray-50",
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle
                    className={clsx(
                      "w-4 h-4",
                      isDark ? "text-gray-400" : "text-gray-500",
                    )}
                  />
                  <span
                    className={clsx(
                      "text-xs font-medium uppercase tracking-wide",
                      isDark ? "text-gray-400" : "text-gray-500",
                    )}
                  >
                    {t("ends")}
                  </span>
                </div>
                <p
                  className={clsx(
                    "text-base font-semibold",
                    isDark ? "text-white" : "text-gray-900",
                  )}
                >
                  {recurringEventRuleId?.endType === "END_DATE"
                    ? "On specific date"
                    : "Never"}
                </p>
                {recurringEventRuleId?.occurrenceLimit && (
                  <p
                    className={clsx(
                      "text-sm mt-1",
                      isDark ? "text-gray-400" : "text-gray-600",
                    )}
                  >
                    After {recurringEventRuleId?.occurrenceLimit} occurrences
                  </p>
                )}
              </div>
            )}

            {/* Monthly Type */}
            {recurringEventRuleId?.monthlyType && (
              <div
                className={clsx(
                  "p-4 rounded-lg",
                  isDark ? "bg-gray-900/50" : "bg-gray-50",
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays
                    className={clsx(
                      "w-4 h-4",
                      isDark ? "text-gray-400" : "text-gray-500",
                    )}
                  />
                  <span
                    className={clsx(
                      "text-xs font-medium uppercase tracking-wide",
                      isDark ? "text-gray-400" : "text-gray-500",
                    )}
                  >
                    {t("monthly_type")}
                  </span>
                </div>
                <p
                  className={clsx(
                    "text-base font-semibold",
                    isDark ? "text-white" : "text-gray-900",
                  )}
                >
                  {recurringEventRuleId?.monthlyType === "SPECIFIC_DATE"
                    ? `Day ${recurringEventRuleId?.specificDate}`
                    : "Relative date"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDateTimeDetails;
