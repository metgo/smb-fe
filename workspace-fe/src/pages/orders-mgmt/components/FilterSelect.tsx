import { useThemeClasses } from "@/hooks/useThemeClasses";

export default function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const { isDark, isRTL } = useThemeClasses();

  return (
    <div>
      {label && (
        <label
          className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"} ${isRTL ? "text-right" : ""}`}
        >
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 rounded-lg border transition-colors ${isRTL ? "text-right" : ""} ${
          isDark
            ? "bg-gray-800 border-gray-700 text-gray-100"
            : "bg-white border-gray-300 text-gray-900"
        }`}
      >
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
