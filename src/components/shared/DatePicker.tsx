import { useState, useRef, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

type Theme = "light" | "dark";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  theme: Theme;
  error?: string;
  minDate?: string;
  disablePast?: boolean;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** ✅ Local YYYY-MM-DD formatter (NO timezone issues) */
const formatLocalDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  theme,
  error,
  minDate,
  disablePast = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  const todayStr = formatLocalDate(new Date());
  const effectiveMinDate = disablePast ? todayStr : minDate;

  const inputClasses =
    theme === "dark"
      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400";

  const textSecondary = theme === "dark" ? "text-gray-300" : "text-gray-700";
  const textTertiary = theme === "dark" ? "text-gray-400" : "text-gray-500";

  /** Close on outside click */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  /** Sync month with value */
  useEffect(() => {
    if (!value) return;
    const d = new Date(value + "T00:00:00");
    if (!isNaN(d.getTime())) setCurrentMonth(d);
  }, [value]);

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T00:00:00");
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);

    return days;
  };

  const isDateDisabled = (day: number) => {
    if (!effectiveMinDate) return false;
    const d = formatLocalDate(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day),
    );
    return d < effectiveMinDate;
  };

  const isToday = (day: number) => {
    const t = new Date();
    return (
      t.getDate() === day &&
      t.getMonth() === currentMonth.getMonth() &&
      t.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const d = new Date(value + "T00:00:00");
    return (
      d.getDate() === day &&
      d.getMonth() === currentMonth.getMonth() &&
      d.getFullYear() === currentMonth.getFullYear()
    );
  };

  const handleDateSelect = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    const formatted = formatLocalDate(date);

    if (effectiveMinDate && formatted < effectiveMinDate) return;

    onChange(formatted);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}
      <div className="relative">
        <CalendarIcon
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${textTertiary}`}
        />
        <input
          readOnly
          value={formatDisplayDate(value)}
          onClick={() => setIsOpen(!isOpen)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2 rounded-lg border cursor-pointer ${inputClasses} ${
            error ? "border-red-500" : ""
          }`}
        />
        {value && (
          <button
            onClick={handleClear}
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${textTertiary}`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Calendar */}
      {isOpen && (
        <div
          className={`absolute z-80 mt-1 p-4 rounded-lg border shadow-lg ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
          style={{ minWidth: 280 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() - 1,
                  ),
                )
              }
            >
              <ChevronLeft />
            </button>
            <div className={textSecondary}>
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1,
                  ),
                )
              }
            >
              <ChevronRight />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 text-xs mb-2">
            {DAYS.map((d) => (
              <div key={d} className={`text-center ${textTertiary}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) =>
              day === null ? (
                <div key={i} />
              ) : (
                <button
                  key={i}
                  disabled={isDateDisabled(day)}
                  onClick={() => handleDateSelect(day)}
                  className={`
                    aspect-square rounded text-sm
                    ${
                      isSelected(day)
                        ? "bg-teal-500 text-white"
                        : isToday(day)
                          ? "border border-teal-500 text-teal-500"
                          : isDateDisabled(day)
                            ? "text-gray-300 cursor-not-allowed"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  {day}
                </button>
              ),
            )}
          </div>

          {/* Today */}
          <button
            onClick={() => {
              if (!effectiveMinDate || todayStr >= effectiveMinDate) {
                onChange(todayStr);
                setIsOpen(false);
              }
            }}
            className={`w-full mt-3 py-2 border rounded-lg ${textSecondary}`}
          >
            Today
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
