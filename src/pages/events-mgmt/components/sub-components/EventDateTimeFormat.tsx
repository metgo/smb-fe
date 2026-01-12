import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Trash2,
  Plus,
  MapPin,
  Globe,
  Info,
  Repeat,
  AlertCircle,
} from "lucide-react";
import DatePicker from "@/components/shared/DatePicker";
import GooglePlacesAutocomplete from "@/components/shared/GooglePlacesAutocomplete";

interface EventDay {
  id: string;
  date: string; // ISO date string, e.g., "2026-01-15"
  startTime: string; // "14:30"
  endTime: string; // "18:00"
  description: string
}

type EventFormat = "physical" | "online" | "hybrid";

interface EventDateTimeFormatProps {
  // Multi-day toggle
  isMultiDay: boolean;
  setIsMultiDay: React.Dispatch<React.SetStateAction<boolean>>;

  // Single day
  startDate: string;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;

  // Event days (for both single and multi-day)
  eventDays: EventDay[];
  setEventDays: React.Dispatch<React.SetStateAction<EventDay[]>>;

  // Event format
  eventFormat: EventFormat;
  setEventFormat: React.Dispatch<React.SetStateAction<EventFormat>>;

  // Location & online link
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  onlineLink: string;
  setOnlineLink: React.Dispatch<React.SetStateAction<string>>;

  // Errors
  errors: {
    startDate?: string;
    address?: string;
    onlineLink?: string;
  };

  // Helper functions for multi-day
  addEventDay: () => void;
  removeEventDay: (id: string) => void;

  // Recurring event
  isRecurring: boolean;
  setIsRecurring: (v: boolean) => void;
  recurrencePattern: RecurrencePattern;
  setRecurrencePattern: (v: RecurrencePattern) => void;
  toggleWeekday: (v: number) => void;
  monthlyType: MonthlyType;
  setMonthlyType: (v: MonthlyType) => void;
  monthlyOrdinal: MonthlyOrdinal;
  setMonthlyOrdinal: (v: MonthlyOrdinal) => void;
  monthlyWeekday: number;
  setMonthlyWeekday: (v: number) => void;
  selectedWeekdays: number[];

  recurrenceEndType: RecurrenceEndType;
  setRecurrenceEndType: (v: RecurrenceEndType) => void;
  recurrenceEndCount: number,
  setRecurrenceEndCount: (v: number) => void;
  recurrenceEndDate: string;
  setRecurrenceEndDate: (v: string) => void;
  recurrenceInterval: number,
  setRecurrenceInterval: (v: number) => void;

}

const EventDateTimeFormat: React.FC<EventDateTimeFormatProps> = ({
  isMultiDay,
  setIsMultiDay,
  startDate,
  setStartDate,
  eventDays,
  setEventDays,
  eventFormat,
  setEventFormat,
  address,
  setAddress,
  onlineLink,
  setOnlineLink,
  errors,
  addEventDay,
  removeEventDay,
  isRecurring, setIsRecurring,
  recurrencePattern, setRecurrencePattern,
  toggleWeekday,
  selectedWeekdays,
  monthlyType, setMonthlyType,
  monthlyOrdinal, setMonthlyOrdinal,
  monthlyWeekday, setMonthlyWeekday,
  recurrenceEndCount, setRecurrenceEndCount,
  recurrenceEndDate, setRecurrenceEndDate,
  recurrenceEndType, setRecurrenceEndType,
  recurrenceInterval, setRecurrenceInterval,

}) => {
  const { t } = useTranslation("events");
  const { textSecondary, textTertiary, inputClasses, textPrimary } = useThemeClasses();
  const { theme, isRTL } = useAppSelector((state) => state.settings);



  // Generate recurring occurrences
  const generateRecurringOccurrences = () => {
    if (!isRecurring || !startDate) return [];

    const occurrences: Array<{ date: string; time: string }> = [];
    const start = new Date(startDate);
    const startTime = eventDays[0]?.startTime || '09:00';
    let currentDate = new Date(start);

    // Calculate end date (max 1 year)
    const maxEndDate = new Date(start);
    maxEndDate.setFullYear(maxEndDate.getFullYear() + 1);

    let endDate: Date;
    if (recurrenceEndType === 'date' && recurrenceEndDate) {
      endDate = new Date(recurrenceEndDate);
      if (endDate > maxEndDate) endDate = maxEndDate;
    } else if (recurrenceEndType === 'count') {
      endDate = maxEndDate; // Will stop at count anyway
    } else {
      endDate = maxEndDate;
    }

    let count = 0;
    const maxCount = recurrenceEndType === 'count' ? recurrenceEndCount : 365;

    while (currentDate <= endDate && count < maxCount) {
      let shouldAdd = false;

      if (recurrencePattern === 'daily') {
        shouldAdd = true;
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (recurrencePattern === 'weekly') {
        const dayOfWeek = currentDate.getDay();
        if (selectedWeekdays.includes(dayOfWeek)) {
          shouldAdd = true;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (recurrencePattern === 'monthly') {
        if (monthlyType === 'date') {
          // Same date each month
          if (currentDate.getDate() === start.getDate()) {
            shouldAdd = true;
          }
          currentDate.setDate(currentDate.getDate() + 1);
        } else {
          // Relative day (e.g., 2nd Tuesday)
          // Simplified: just monthly on same weekday
          shouldAdd = true;
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      } else if (recurrencePattern === 'custom') {
        shouldAdd = true;
        currentDate.setDate(currentDate.getDate() + recurrenceInterval);
      }

      if (shouldAdd && currentDate <= endDate) {
        occurrences.push({
          date: currentDate.toISOString().split('T')[0],
          time: startTime
        });
        count++;
      }

      // Safety break
      if (count >= 100) break;
    }

    return occurrences;
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Event Duration: Single vs Multi-day */}
      <div>
        <label className={`block text-sm mb-2 ${textSecondary}`}>{t("event_duration")}</label>
        <div className="flex gap-4">
          <button
            onClick={() => setIsMultiDay(false)}
            className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${!isMultiDay
              ? "border-teal-500 bg-teal-500/10 text-teal-500"
              : theme === "dark"
                ? "border-gray-700 hover:bg-gray-800"
                : "border-gray-300 hover:bg-gray-50"
              }`}
          >
            <Calendar className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm">{t("single_day")}</span>
          </button>
          <button
            onClick={() => setIsMultiDay(true)}
            className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${isMultiDay
              ? "border-teal-500 bg-teal-500/10 text-teal-500"
              : theme === "dark"
                ? "border-gray-700 hover:bg-gray-800"
                : "border-gray-300 hover:bg-gray-50"
              }`}
          >
            <Calendar className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm">{t("multi_day")}</span>
          </button>
        </div>
      </div>

      {/* Date & Time Input */}
      {!isMultiDay ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm mb-2 ${textSecondary}`}>
              {t("date")} <span className="text-red-500">*</span>
            </label>
            <DatePicker
              value={startDate}
              onChange={(date) => setStartDate(date)}
              placeholder={t("select_date")}
              theme={theme}
              error={errors.startDate}
            />
          </div>
          <div>
            <label className={`block text-sm mb-2 ${textSecondary}`}>{t("start_time")}</label>
            <input
              type="time"
              value={eventDays[0]?.startTime || ""}
              onChange={(e) =>
                setEventDays([{ ...eventDays[0], startTime: e.target.value }])
              }
              className={`w-full px-4 py-2 rounded-lg border ${inputClasses}`}
            />
          </div>
          <div>
            <label className={`block text-sm mb-2 ${textSecondary}`}>{t("end_time")}</label>
            <input
              type="time"
              value={eventDays[0]?.endTime || ""}
              onChange={(e) =>
                setEventDays([{ ...eventDays[0], endTime: e.target.value }])
              }
              className={`w-full px-4 py-2 rounded-lg border ${inputClasses}`}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {eventDays.map((day, index) => (
            <div
              key={day.id}
              className={`p-4 rounded-lg border ${theme === "dark" ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"
                }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm ${textSecondary}`}>{t("day")} {index + 1}</span>
                {eventDays.length > 1 && (
                  <button
                    onClick={() => removeEventDay(day.id)}
                    className="text-red-500 hover:text-red-600 p-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <DatePicker
                  value={day.date}
                  onChange={(date) => {
                    const updated = [...eventDays];
                    updated[index].date = date;
                    setEventDays(updated);
                  }}
                  placeholder={t("select_date")}
                  theme={theme}
                />
                <input
                  type="time"
                  value={day.startTime}
                  onChange={(e) => {
                    const updated = [...eventDays];
                    updated[index].startTime = e.target.value;
                    setEventDays(updated);
                  }}
                  className={`px-3 py-2 rounded-lg border ${inputClasses}`}
                />
                <input
                  type="time"
                  value={day.endTime}
                  onChange={(e) => {
                    const updated = [...eventDays];
                    updated[index].endTime = e.target.value;
                    setEventDays(updated);
                  }}
                  className={`px-3 py-2 rounded-lg border ${inputClasses}`}
                />
              </div>
            </div>
          ))}

          <button
            onClick={addEventDay}
            className={`w-full px-4 py-2 rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-center ${theme === "dark"
              ? "border-gray-700 hover:border-teal-500 hover:bg-gray-800"
              : "border-gray-300 hover:border-teal-500 hover:bg-gray-50"
              }`}
          >
            <Plus className="w-5 h-5 mb-1" />
            <span className="text-sm">{t("add_another_day")}</span>
          </button>
        </div>
      )}

      {/* Recurring Events Section */}
      {!isMultiDay && (
        <div
          className={`p-6 rounded-lg border ${theme === 'dark'
            ? 'border-gray-700 bg-gray-800/50'
            : 'border-gray-200 bg-gray-50'
            }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''
              }`}
          >
            <div
              className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''
                }`}
            >
              <Repeat className="w-5 h-5 text-teal-500" />
              <label className={`text-sm font-medium ${textPrimary}`}>
                {t('recurring_event') || 'Recurring Event'}
              </label>
              <button
                type="button"
                className="p-1 hover:bg-gray-700 rounded"
                title={
                  t('recurring_event_tooltip') ||
                  'Create multiple event occurrences based on a repeating schedule'
                }
              >
                <Info className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer dark:bg-gray-700 peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>

          {isRecurring && (
            <div className="space-y-4 mt-4">
              {/* Recurrence Pattern */}
              <div>
                <label className={`block text-sm mb-2 ${textSecondary}`}>
                  {t('recurrence_pattern') || 'Recurrence Pattern'}
                </label>

                <div className="space-y-2">
                  {['daily', 'weekly', 'monthly', 'custom'].map((pattern) => (
                    <label
                      key={pattern}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${recurrencePattern === pattern
                        ? 'border-teal-500 bg-teal-500/10'
                        : theme === 'dark'
                          ? 'border-gray-700 hover:bg-gray-800'
                          : 'border-gray-200 hover:bg-gray-50'
                        } ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <input
                        type="radio"
                        name="recurrence-pattern"
                        value={pattern}
                        checked={recurrencePattern === pattern}
                        onChange={(e) =>
                          setRecurrencePattern(e.target.value as any)
                        }
                        className="w-4 h-4 text-teal-600"
                      />
                      <span className={`text-sm ${textPrimary} capitalize`}>
                        {t(`recurrence_${pattern}`) || pattern}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Weekly */}
              {recurrencePattern === 'weekly' && (
                <div>
                  <label className={`block text-sm mb-2 ${textSecondary}`}>
                    {t('select_days') || 'Select Days'}
                  </label>

                  <div className="flex gap-2 flex-wrap">
                    {(isRTL
                      ? [6, 5, 4, 3, 2, 1, 0]
                      : [0, 1, 2, 3, 4, 5, 6]
                    ).map((day) => {
                      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                      const dayNamesRTL = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleWeekday(day)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium ${selectedWeekdays.includes(day)
                            ? 'bg-teal-600 text-white'
                            : theme === 'dark'
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                          {isRTL ? dayNamesRTL[day] : dayNames[day]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Monthly */}
              {recurrencePattern === 'monthly' && (
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={monthlyType === 'date'}
                      onChange={() => setMonthlyType('date')}
                    />
                    <span className={textSecondary}>
                      {t('by_specific_date') || 'By specific date'}
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={monthlyType === 'day'}
                      onChange={() => setMonthlyType('day')}
                    />
                    <span className={textSecondary}>
                      {t('by_relative_day') || 'By relative day'}
                    </span>
                  </label>

                  {monthlyType === 'day' && (
                    <div className="flex gap-3">
                      <select
                        value={monthlyOrdinal}
                        onChange={(e) =>
                          setMonthlyOrdinal(e.target.value as any)
                        }
                        className={`flex-1 px-3 py-2 rounded-lg border ${inputClasses}`}
                      >
                        <option value="1st">{t('first') || '1st'}</option>
                        <option value="2nd">{t('second') || '2nd'}</option>
                        <option value="3rd">{t('third') || '3rd'}</option>
                        <option value="4th">{t('fourth') || '4th'}</option>
                        <option value="last">{t('last') || 'Last'}</option>
                      </select>

                      <select
                        value={monthlyWeekday}
                        onChange={(e) =>
                          setMonthlyWeekday(Number(e.target.value))
                        }
                        className={`flex-1 px-3 py-2 rounded-lg border ${inputClasses}`}
                      >
                        <option value="0">{t('sunday')}</option>
                        <option value="1">{t('monday')}</option>
                        <option value="2">{t('tuesday')}</option>
                        <option value="3">{t('wednesday')}</option>
                        <option value="4">{t('thursday')}</option>
                        <option value="5">{t('friday')}</option>
                        <option value="6">{t('saturday')}</option>
                      </select>
                    </div>
                  )}
                </div>
              )}



              {/* Custom Interval */}
              {recurrencePattern === 'custom' && (
                <div>
                  <label className={`block text-sm mb-2 ${textSecondary}`}>
                    {t('every')}
                  </label>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <input
                      type="number"
                      min="1"
                      value={recurrenceInterval}
                      onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                      className={`w-20 px-3 py-2 rounded-lg border ${inputClasses}`}
                    />
                    <span className={textSecondary}>{t('days')}</span>
                  </div>
                </div>
              )}

              {/* End Condition */}
              <div>
                <label className={`block text-sm mb-2 ${textSecondary}`}>
                  {t('recurrence_ends')}
                </label>
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <input
                      type="radio"
                      name="end-type"
                      checked={recurrenceEndType === 'count'}
                      onChange={() => setRecurrenceEndType('count')}
                      className="w-4 h-4"
                    />
                    <span className={textSecondary}>{t('after')}</span>
                    {recurrenceEndType === 'count' && (
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={recurrenceEndCount}
                        onChange={(e) => setRecurrenceEndCount(parseInt(e.target.value) || 10)}
                        className={`w-20 px-2 py-1 rounded border ${inputClasses}`}
                      />
                    )}
                    <span className={textSecondary}>{t('occurrences')}</span>
                  </label>

                  <label className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <input
                      type="radio"
                      name="end-type"
                      checked={recurrenceEndType === 'date'}
                      onChange={() => setRecurrenceEndType('date')}
                      className="w-4 h-4"
                    />
                    <span className={textSecondary}>{t('end_on')}</span>
                    {recurrenceEndType === 'date' && (
                      <DatePicker
                        value={recurrenceEndDate}
                        onChange={(date) => setRecurrenceEndDate(date)}
                        placeholder={t('select_date')}
                        theme={theme}
                      />
                    )}
                  </label>
                </div>
              </div>

              {/* Helper Text */}
              <div
                className={`p-3 rounded-lg ${theme === 'dark'
                  ? 'bg-blue-900/20 border border-blue-800'
                  : 'bg-blue-50 border border-blue-200'
                  }`}
              >
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  <Info className="w-4 h-4 inline mr-2" />
                  {t('recurring_instances_managed')}
                </p>
              </div>

              {/* Preview Occurrences */}
              {startDate && (
                <div
                  className={`p-4 rounded-lg border ${theme === 'dark'
                    ? 'border-gray-700 bg-gray-900/50'
                    : 'border-gray-200 bg-white'
                    }`}
                >
                  <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className={`text-sm font-medium ${textPrimary}`}>
                      {t('generated_occurrences')}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${theme === 'dark'
                        ? 'bg-teal-900/30 text-teal-400'
                        : 'bg-teal-100 text-teal-700'
                        }`}
                    >
                      {generateRecurringOccurrences().length} {t('occurrences')}
                    </span>
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {generateRecurringOccurrences().slice(0, 5).map((occ, i) => (
                      <div key={i} className={`text-xs ${textTertiary} flex items-center gap-2`}>
                        <Calendar className="w-3 h-3" />
                        {new Date(occ.date).toLocaleDateString()} at {occ.time}
                      </div>
                    ))}

                    {generateRecurringOccurrences().length > 5 && (
                      <div className={`text-xs ${textTertiary} italic`}>
                        + {generateRecurringOccurrences().length - 5} {t('more')}...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Validation Warning */}
              {startDate && recurrenceEndType === 'date' && recurrenceEndDate &&
                (() => {
                  const start = new Date(startDate);
                  const end = new Date(recurrenceEndDate);
                  const maxEnd = new Date(start);
                  maxEnd.setFullYear(maxEnd.getFullYear() + 1);

                  if (end > maxEnd) {
                    return (
                      <div
                        className={`p-3 rounded-lg ${theme === 'dark'
                          ? 'bg-red-900/20 border border-red-800'
                          : 'bg-red-50 border border-red-200'
                          }`}
                      >
                        <p className="text-sm text-red-600 dark:text-red-400">
                          <AlertCircle className="w-4 h-4 inline mr-2" />
                          {t('recurrence_max_one_year')}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
            </div>
          )}
        </div>
      )}

      {/* Event Format */}
      <div>
        <label className={`block text-sm mb-2 ${textSecondary}`}>{t("event_format")}</label>
        <div className="grid grid-cols-3 gap-3">
          {(["physical", "online", "hybrid"] as const).map((format) => (
            <button
              key={format}
              onClick={() => setEventFormat(format)}
              className={`px-4 py-3 rounded-lg border capitalize transition-colors flex flex-col items-center ${eventFormat === format
                ? "border-teal-500 bg-teal-500/10 text-teal-500"
                : theme === "dark"
                  ? "border-gray-700 hover:bg-gray-800"
                  : "border-gray-300 hover:bg-gray-50"
                }`}
            >
              {format === "physical" ? (
                <MapPin className="w-5 h-5 mb-1" />
              ) : (
                <Globe className="w-5 h-5 mb-1" />
              )}
              <span className="text-sm">{t(format)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Physical / Hybrid Location */}
      {eventFormat !== "online" && (
        <div>
          <label className={`block text-sm mb-2 ${textSecondary}`}>
            {t("location_address")} <span className="text-red-500">*</span>
          </label>
          <GooglePlacesAutocomplete
            value={address}
            onChange={(value) => setAddress(value)}
            placeholder={t("search_location")}
            theme={theme}
            error={errors.address}
          />
        </div>
      )}

      {/* Online / Hybrid Link */}
      {eventFormat !== "physical" && (
        <div>
          <label className={`block text-sm mb-2 ${textSecondary}`}>
            {t("online_event_link")} <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={onlineLink}
            onChange={(e) => setOnlineLink(e.target.value)}
            placeholder="https://zoom.us/..."
            className={`w-full px-4 py-2 rounded-lg border ${inputClasses} ${errors.onlineLink ? "border-red-500" : ""}`}
          />
          {errors.onlineLink && (
            <p className="text-red-500 text-sm mt-1">{errors.onlineLink}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EventDateTimeFormat;