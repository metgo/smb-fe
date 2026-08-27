import { useEffect, useMemo, useRef } from "react";
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
import { MarkerMap } from "@/components/maps";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { type ParsedAddressParts } from "@/helpers";

const WEEKDAYS = [
  { value: "Sunday", label: "sun" },
  { value: "Monday", label: "mon" },
  { value: "Tuesday", label: "tue" },
  { value: "Wednesday", label: "wed" },
  { value: "Thursday", label: "thu" },
  { value: "Friday", label: "fri" },
  { value: "Saturday", label: "sat" },
];

interface DateTimeStepProps {
  geo: Geo;
  setGeo: (v: Geo) => void;
  isMultiDay: boolean;
  setIsMultiDay: React.Dispatch<React.SetStateAction<boolean>>;
  startDate: string;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;
  eventDays: EventDay[];
  setEventDays: React.Dispatch<React.SetStateAction<EventDay[]>>;
  eventFormat: "physical" | "online" | "hybrid";
  setEventFormat: React.Dispatch<
    React.SetStateAction<"physical" | "online" | "hybrid">
  >;
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  onAddressParts?: (parts: ParsedAddressParts) => void;
  onlineLink: string;
  setOnlineLink: React.Dispatch<React.SetStateAction<string>>;
  errors: { startDate?: string; address?: string; onlineLink?: string };
  addEventDay: () => void;
  removeEventDay: (id: string) => void;
  isRecurring: boolean;
  setIsRecurring: (v: boolean) => void;
  recurrencePattern: RecurrencePattern;
  setRecurrencePattern: (v: RecurrencePattern) => void;
  monthlyType: TMonthlyType;
  setMonthlyType: (v: TMonthlyType) => void;
  toggleWeekday: (v: string) => void;
  selectedWeekdays: string[];
  recurrenceEndType: RecurrenceEndType;
  setRecurrenceEndType: (v: RecurrenceEndType) => void;
  recurrenceEndCount: number;
  setRecurrenceEndCount: (v: number) => void;
  recurrenceEndDate: string;
  setRecurrenceEndDate: (v: string) => void;
  specificDate: number;
  setSpecificDate: (v: number) => void;
  relativeDate: number;
  setRelativeDate: (v: number) => void;
  relativeDay: string;
  setRelativeDay: (v: string) => void;
  customInterval: number;
  setCustomInterval: (v: number) => void;
  customUnit: string;
  setCustomUnit: (v: string) => void;
  markDirty: (step: number) => void;
}

const DateTimeStep: React.FC<DateTimeStepProps> = ({
  markDirty,
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
  onAddressParts,
  onlineLink,
  setOnlineLink,
  errors,
  addEventDay,
  removeEventDay,
  isRecurring,
  setIsRecurring,
  recurrencePattern,
  setRecurrencePattern,
  toggleWeekday,
  selectedWeekdays,
  geo,
  setGeo,
  specificDate,
  setSpecificDate,
  relativeDate,
  setRelativeDate,
  relativeDay,
  setRelativeDay,
  customInterval,
  setCustomInterval,
  customUnit,
  setCustomUnit,
  monthlyType,
  setMonthlyType,
  recurrenceEndCount,
  setRecurrenceEndCount,
  recurrenceEndDate,
  setRecurrenceEndDate,
  recurrenceEndType,
  setRecurrenceEndType,
}) => {
  const { t } = useTranslation("events");
  const { t: cT } = useTranslation("common");
  const { textSecondary, textTertiary, inputClasses, textPrimary, isDark } =
    useThemeClasses();

  useEffect(() => {
    markDirty(2);
  }, [
    startDate,
    eventDays,
    eventFormat,
    address,
    onlineLink,
    geo,
    recurrencePattern,
    markDirty,
  ]);

  const startDateRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);
  const onlineLinkRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track if this is the first render to prevent auto-scrolling to errors on mount
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Always scroll to the top of this section when the user first arrives
      if (containerRef.current) {
        containerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
      return;
    }

    // On subsequent renders, handle scrolling to validation errors if any exist
    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0) return;

    const refs: Record<string, React.RefObject<any>> = {
      address: addressRef,
      startDate: startDateRef,
      onlineLink: onlineLinkRef,
    };
    const target = refs[errorKeys[0]];
    if (target?.current) {
      target.current.scrollIntoView({ behavior: "smooth", block: "center" });
      (target.current as HTMLElement).focus?.();
    }
  }, [errors]);

  // Memoized so we don't recompute 3x per render in JSX
  const recurringOccurrences = useMemo(() => {
    if (!isRecurring || !startDate) return [];

    const start = new Date(startDate);
    const startTime = eventDays[0]?.startTime || "09:00";
    const currentDate = new Date(start);
    const maxEndDate = new Date(start);
    maxEndDate.setFullYear(maxEndDate.getFullYear() + 1);

    let endDate: Date;
    if (recurrenceEndType === "date" && recurrenceEndDate) {
      endDate = new Date(recurrenceEndDate);
      if (endDate > maxEndDate) endDate = maxEndDate;
    } else {
      endDate = maxEndDate;
    }

    const occurrences: Array<{ date: string; time: string }> = [];
    const maxCount = recurrenceEndType === "count" ? recurrenceEndCount : 365;
    let count = 0;

    while (currentDate <= endDate && count < maxCount && count < 100) {
      let shouldAdd = false;

      if (recurrencePattern === "daily") {
        shouldAdd = true;
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (recurrencePattern === "weekly") {
        const dayName = WEEKDAYS[currentDate.getDay()].value;
        if (selectedWeekdays.includes(dayName)) shouldAdd = true;
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (recurrencePattern === "monthly") {
        if (monthlyType === "SPECIFIC_DATE") {
          if (currentDate.getDate() === start.getDate()) shouldAdd = true;
          currentDate.setDate(currentDate.getDate() + 1);
        } else {
          shouldAdd = true;
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      } else if (recurrencePattern === "custom") {
        shouldAdd = true;
        currentDate.setDate(currentDate.getDate() + customInterval);
      }

      if (shouldAdd && currentDate <= endDate) {
        occurrences.push({
          date: currentDate.toISOString().split("T")[0],
          time: startTime,
        });
        count++;
      }
    }

    return occurrences;
  }, [
    isRecurring,
    startDate,
    eventDays,
    recurrencePattern,
    recurrenceEndType,
    recurrenceEndDate,
    recurrenceEndCount,
    selectedWeekdays,
    monthlyType,
    customInterval,
  ]);

  const endDateExceedsMax =
    isRecurring &&
    startDate &&
    recurrenceEndType === "date" &&
    recurrenceEndDate &&
    (() => {
      const end = new Date(recurrenceEndDate);
      const max = new Date(startDate);
      max.setFullYear(max.getFullYear() + 1);
      return end > max;
    })();

  return (
    <div ref={containerRef} className="space-y-6 max-w-3xl mx-auto">
      {/* ── Duration toggle ──────────────────────────────────────────── */}
      <div>
        <label className={`block text-sm mb-2 ${textSecondary}`}>
          {t("event_duration")}
        </label>
        <div className="flex gap-4">
          {[
            { label: t("single_day"), value: false },
            { label: t("multi_day"), value: true },
          ].map(({ label, value }) => (
            <button
              key={String(value)}
              onClick={() => setIsMultiDay(value)}
              className={`flex-1 px-4 py-3 rounded-lg border transition-colors flex flex-col items-center ${
                isMultiDay === value
                  ? "border-teal-500 bg-teal-500/10 text-teal-500"
                  : isDark
                    ? "border-gray-700 hover:bg-gray-800 text-white/70"
                    : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Calendar className="w-5 h-5 mb-1" />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Date & Time inputs ───────────────────────────────────────── */}
      {!isMultiDay ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div ref={startDateRef}>
            <label className={`block text-sm mb-2 ${textSecondary}`}>
              {t("date")} <span className="text-red-500">*</span>
            </label>
            <DatePicker
              disablePast
              value={
                startDate ? new Date(startDate).toISOString().split("T")[0] : ""
              }
              onChange={(date) => {
                setStartDate(date);
                setEventDays((prev) => [{ ...prev[0], date }]);
              }}
              placeholder={t("select_date")}
              error={errors.startDate}
            />
          </div>
          <div>
            <label className={`block text-sm mb-2 ${textSecondary}`}>
              {t("start_time")}
            </label>
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
            <label className={`block text-sm mb-2 ${textSecondary}`}>
              {t("end_time")}
            </label>
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
              className={`p-4 rounded-lg border ${
                isDark
                  ? "border-gray-700 bg-gray-800/50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm ${textSecondary}`}>
                  {t("day")} {index + 1}
                </span>
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
                  disablePast
                  value={
                    day.date
                      ? new Date(day.date).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(date) =>
                    setEventDays((prev) =>
                      prev.map((item, i) =>
                        i === index ? { ...item, date } : item,
                      ),
                    )
                  }
                  placeholder={t("select_date")}
                />
                <input
                  type="time"
                  value={day.startTime}
                  onChange={(e) =>
                    setEventDays((prev) => {
                      const updated = [...prev];
                      updated[index] = {
                        ...updated[index],
                        startTime: e.target.value,
                      };
                      return updated;
                    })
                  }
                  className={`px-3 py-2 rounded-lg border ${inputClasses}`}
                />
                <input
                  type="time"
                  value={day.endTime}
                  onChange={(e) =>
                    setEventDays((prev) => {
                      const updated = [...prev];
                      updated[index] = {
                        ...updated[index],
                        endTime: e.target.value,
                      };
                      return updated;
                    })
                  }
                  className={`px-3 py-2 rounded-lg border ${inputClasses}`}
                />
              </div>
            </div>
          ))}

          <button
            onClick={addEventDay}
            className={`w-full px-4 py-2 rounded-lg border-2 border-dashed transition-colors flex items-center justify-center gap-2 ${
              isDark
                ? "border-gray-700 hover:border-teal-500 hover:bg-gray-800 text-gray-300"
                : "border-gray-300 hover:border-teal-500 hover:bg-gray-50"
            }`}
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm">{t("add_another_day")}</span>
          </button>
        </div>
      )}

      {/* ── Recurring events ─────────────────────────────────────────── */}
      {!isMultiDay && (
        <div
          className={`p-6 rounded-lg border ${
            isDark
              ? "border-gray-700 bg-gray-800/50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Repeat className="w-5 h-5 text-teal-500" />
              <label className={`text-sm font-medium ${textPrimary}`}>
                {t("recurring_event")}
              </label>
              <span
                title={t("recurring_event_tooltip")}
                className="cursor-help p-1"
              >
                <Info className="w-4 h-4 text-gray-400" />
              </span>
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
              {/* Pattern */}
              <div>
                <label className={`block text-sm mb-2 ${textSecondary}`}>
                  {t("recurrence_pattern")}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["daily", "weekly", "monthly", "custom"] as const).map(
                    (pattern) => (
                      <label
                        key={pattern}
                        className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                          recurrencePattern === pattern
                            ? "border-teal-500 bg-teal-500/10"
                            : isDark
                              ? "border-gray-700 hover:bg-gray-800"
                              : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="recurrence-pattern"
                          value={pattern}
                          checked={recurrencePattern === pattern}
                          onChange={(e) =>
                            setRecurrencePattern(
                              e.target.value as RecurrencePattern,
                            )
                          }
                          className="w-4 h-4 text-teal-600"
                        />
                        <span className={`text-sm ${textPrimary} capitalize`}>
                          {t(`recurrence_${pattern}`)}
                        </span>
                      </label>
                    ),
                  )}
                </div>
              </div>

              {/* Weekly: day picker */}
              {recurrencePattern === "weekly" && (
                <div>
                  <label className={`block text-sm mb-2 ${textSecondary}`}>
                    {t("select_days")}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {WEEKDAYS.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleWeekday(day.value)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium ${
                          selectedWeekdays.includes(day.value)
                            ? "bg-teal-600 text-white"
                            : isDark
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {cT(day.label)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Monthly */}
              {recurrencePattern === "monthly" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        checked={monthlyType === "SPECIFIC_DATE"}
                        onChange={() => setMonthlyType("SPECIFIC_DATE")}
                        className="w-4 h-4 text-teal-600"
                      />
                      <span className={textSecondary}>
                        {t("by_specific_date")}
                      </span>
                    </label>
                    <select
                      value={specificDate}
                      onChange={(e) => setSpecificDate(Number(e.target.value))}
                      className={`w-24 px-3 py-2 rounded-lg border ${inputClasses}`}
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      checked={monthlyType === "RELATIVE_DAY"}
                      onChange={() => setMonthlyType("RELATIVE_DAY")}
                      className="w-4 h-4 text-teal-600"
                    />
                    <span className={textSecondary}>
                      {t("by_relative_day")}
                    </span>
                  </label>

                  {monthlyType === "RELATIVE_DAY" && (
                    <div className="flex gap-3 ml-7">
                      <select
                        value={relativeDate}
                        onChange={(e) =>
                          setRelativeDate(parseInt(e.target.value))
                        }
                        className={`flex-1 px-3 py-2 rounded-lg border ${inputClasses}`}
                      >
                        {[1, 2, 3, 4, 5].map((n, i) => (
                          <option key={n} value={n}>
                            {
                              [
                                cT("first"),
                                cT("second"),
                                cT("third"),
                                cT("fourth"),
                                cT("fifth"),
                              ][i]
                            }
                          </option>
                        ))}
                      </select>
                      <select
                        value={relativeDay}
                        onChange={(e) => setRelativeDay(e.target.value)}
                        className={`flex-1 px-3 py-2 rounded-lg border ${inputClasses}`}
                      >
                        {[
                          "sunday",
                          "monday",
                          "tuesday",
                          "wednesday",
                          "thursday",
                          "friday",
                          "saturday",
                        ].map((d) => (
                          <option key={d} value={d}>
                            {cT(d)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Custom interval */}
              {recurrencePattern === "custom" && (
                <div>
                  <label className={`block text-sm mb-2 ${textSecondary}`}>
                    {t("every")}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={customInterval}
                      onChange={(e) =>
                        setCustomInterval(parseInt(e.target.value) || 1)
                      }
                      className={`w-20 px-3 py-2 rounded-lg border ${inputClasses}`}
                    />
                    <select
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value)}
                      className={`flex-1 px-3 py-2 rounded-lg border ${inputClasses}`}
                    >
                      <option value="day">{cT("days")}</option>
                      <option value="week">{cT("weeks")}</option>
                      <option value="month">{cT("months")}</option>
                      <option value="year">{cT("years")}</option>
                    </select>
                  </div>
                </div>
              )}

              {/* End condition */}
              <div>
                <label className={`block text-sm mb-2 ${textSecondary}`}>
                  {t("recurrence_ends")}
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="end-type"
                      checked={recurrenceEndType === "count"}
                      onChange={() => setRecurrenceEndType("count")}
                      className="w-4 h-4 text-teal-600"
                    />
                    <span className={textSecondary}>{t("after")}</span>
                    {recurrenceEndType === "count" && (
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={recurrenceEndCount}
                        onChange={(e) =>
                          setRecurrenceEndCount(parseInt(e.target.value) || 10)
                        }
                        className={`w-20 px-2 py-1 rounded border ${inputClasses}`}
                      />
                    )}
                    <span className={textSecondary}>{t("occurrences")}</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="end-type"
                      checked={recurrenceEndType === "date"}
                      onChange={() => setRecurrenceEndType("date")}
                      className="w-4 h-4 text-teal-600"
                    />
                    <span className={textSecondary}>{t("end_on")}</span>
                    {recurrenceEndType === "date" && (
                      <DatePicker
                        value={recurrenceEndDate}
                        onChange={setRecurrenceEndDate}
                        placeholder={t("select_date")}
                      />
                    )}
                  </label>
                </div>
              </div>

              {/* Info banner */}
              <div
                className={`p-3 rounded-lg ${
                  isDark
                    ? "bg-blue-900/20 border border-blue-800"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  {t("recurring_instances_managed")}
                </p>
              </div>

              {/* Occurrences preview */}
              {startDate && recurringOccurrences.length > 0 && (
                <div
                  className={`p-4 rounded-lg border ${
                    isDark
                      ? "border-gray-700 bg-gray-900/50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-medium ${textPrimary}`}>
                      {t("generated_occurrences")}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        isDark
                          ? "bg-teal-900/30 text-teal-400"
                          : "bg-teal-100 text-teal-700"
                      }`}
                    >
                      {recurringOccurrences.length} {t("occurrences")}
                    </span>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {recurringOccurrences.slice(0, 5).map((occ, i) => (
                      <div
                        key={i}
                        className={`text-xs ${textTertiary} flex items-center gap-2`}
                      >
                        <Calendar className="w-3 h-3" />
                        {new Date(occ.date).toLocaleDateString()} at {occ.time}
                      </div>
                    ))}
                    {recurringOccurrences.length > 5 && (
                      <p className={`text-xs ${textTertiary} italic`}>
                        + {recurringOccurrences.length - 5} {t("more")}...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Max 1-year warning */}
              {endDateExceedsMax && (
                <div
                  className={`p-3 rounded-lg ${
                    isDark
                      ? "bg-red-900/20 border border-red-800"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {t("recurrence_max_one_year")}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Event format ─────────────────────────────────────────────── */}
      <div>
        <label className={`block text-sm mb-2 ${textSecondary}`}>
          {t("event_format")}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(["physical", "online", "hybrid"] as const).map((format) => (
            <button
              key={format}
              onClick={() => setEventFormat(format)}
              className={`px-4 py-3 rounded-lg border capitalize transition-colors flex flex-col items-center ${
                eventFormat === format
                  ? "border-teal-500 bg-teal-500/10 text-teal-500"
                  : isDark
                    ? "border-gray-700 hover:bg-gray-800 text-white/70"
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

      {/* ── Physical / Hybrid: map ────────────────────────────────────── */}
      {eventFormat !== "online" && (
        <div ref={addressRef}>
          <label className={`block text-sm mb-2 ${textSecondary}`}>
            {t("location_address")} <span className="text-red-500">*</span>
          </label>
          {errors.address && (
            <p className="text-red-500 text-sm mb-2">{errors.address}</p>
          )}
          <MarkerMap
            geo={geo}
            setGeo={setGeo}
            address={address}
            setAddress={setAddress}
            onAddressParts={onAddressParts}
          />
        </div>
      )}

      {/* ── Online / Hybrid: link ─────────────────────────────────────── */}
      {eventFormat !== "physical" && (
        <div>
          <label className={`block text-sm mb-2 ${textSecondary}`}>
            {t("online_event_link")} <span className="text-red-500">*</span>
          </label>
          <input
            ref={onlineLinkRef}
            type="url"
            value={onlineLink}
            onChange={(e) => setOnlineLink(e.target.value)}
            placeholder="https://zoom.us/..."
            className={`w-full px-4 py-2 rounded-lg border ${inputClasses} ${
              errors.onlineLink ? "border-red-500" : ""
            }`}
          />
          {errors.onlineLink && (
            <p className="text-red-500 text-sm mt-1">{errors.onlineLink}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DateTimeStep;
