import { useThemeClasses } from "@/hooks/useThemeClasses";

function getLastNMonths(n: number): { value: string; label: string }[] {
  const months = [];
  const now = new Date();

  for (let i = 0; i < n; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const value = `${month}-${year}`;
    const label = `${month}/${year}`;
    months.push({ value, label });
  }

  return months;
}

export default function MonthFilter({
  label,
  value,
  onChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  t,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  t: any;
}) {
  const { isDark, isRTL } = useThemeClasses();
  const last12Months = getLastNMonths(12);

  return (
    <div>
      <label
        className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"} ${isRTL ? "text-right" : ""}`}
      >
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (e.target.value !== "custom") {
              onDateFromChange("");
              onDateToChange("");
            }
          }}
          className={`w-full px-3 py-2 rounded-lg border transition-colors ${isRTL ? "text-right" : ""} ${
            isDark
              ? "bg-gray-800 border-gray-700 text-gray-100"
              : "bg-white border-gray-300 text-gray-900"
          }`}
        >
          <option value="all">{t("all")}</option>
          {(last12Months ).map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
          <option value="custom">{t("customRange")}</option>
        </select>

      </div>

      {value === "custom" && (
        <div className="mt-2 space-y-2">
          <div>
            <label
              className={`block text-xs mb-1 ${isDark ? "text-gray-500" : "text-gray-500"} ${isRTL ? "text-right" : ""}`}
            >
              {t("from")}
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className={`w-full px-3 py-1.5 text-sm rounded-lg border transition-colors ${isRTL ? "text-right" : ""} ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>
          <div>
            <label
              className={`block text-xs mb-1 ${isDark ? "text-gray-500" : "text-gray-500"} ${isRTL ? "text-right" : ""}`}
            >
              {t("to")}
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className={`w-full px-3 py-1.5 text-sm rounded-lg border transition-colors ${isRTL ? "text-right" : ""} ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
