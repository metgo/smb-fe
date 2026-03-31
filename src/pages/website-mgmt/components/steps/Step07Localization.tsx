import clsx from "clsx";
import { Globe } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface Props {
  formData: SiteSettingsFormData;
  errors: SiteSettingsErrors;
  onChange: (
    field: keyof SiteSettingsFormData,
    value: string | boolean,
  ) => void;
}

const LANGUAGES = [
  "English",
  "Hebrew",
  "Arabic",
  "French",
  "Spanish",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese",
  "Japanese",
];
const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Jerusalem",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
];
const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "ILS",
  "AED",
  "SAR",
  "JPY",
  "CNY",
  "CAD",
  "AUD",
];
const DATE_FORMATS = [
  "MM/DD/YYYY",
  "DD/MM/YYYY",
  "YYYY-MM-DD",
  "DD-MM-YYYY",
  "MMM DD, YYYY",
];

export default function Step07Localization({ formData, onChange }: Props) {
  const { textPrimary, textSecondary, inputClasses, isDark } =
    useThemeClasses();

  const selectCls = clsx(
    "px-4 py-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-teal-500/20 text-sm",
    inputClasses,
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Globe className="w-5 h-5 text-teal-500" />
        <h2 className={clsx("text-lg font-semibold", textPrimary)}>
          Regional Settings
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className={clsx("text-sm font-medium", textPrimary)}>
            Default Language
          </label>
          <select
            value={formData.defaultLanguage}
            onChange={(e) => onChange("defaultLanguage", e.target.value)}
            className={selectCls}
          >
            <option value="">Select language…</option>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className={clsx("text-sm font-medium", textPrimary)}>
            Timezone
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => onChange("timezone", e.target.value)}
            className={selectCls}
          >
            <option value="">Select timezone…</option>
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className={clsx("text-sm font-medium", textPrimary)}>
            Currency
          </label>
          <select
            value={formData.currency}
            onChange={(e) => onChange("currency", e.target.value)}
            className={selectCls}
          >
            <option value="">Select currency…</option>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className={clsx("text-sm font-medium", textPrimary)}>
            Date Format
          </label>
          <select
            value={formData.dateFormat}
            onChange={(e) => onChange("dateFormat", e.target.value)}
            className={selectCls}
          >
            <option value="">Select format…</option>
            {DATE_FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Multi-language toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className={clsx("text-sm font-medium", textPrimary)}>
            Multi-Language Support
          </p>
          <p className={clsx("text-xs mt-0.5", textSecondary)}>
            Enable multiple languages on the public-facing website
          </p>
        </div>
        <button
          onClick={() =>
            onChange("multiLanguageEnabled", !formData.multiLanguageEnabled)
          }
          className={clsx(
            "relative w-12 h-6 rounded-full transition-colors",
            formData.multiLanguageEnabled
              ? "bg-teal-500"
              : isDark
                ? "bg-gray-700"
                : "bg-gray-300",
          )}
        >
          <span
            className={clsx(
              "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
              formData.multiLanguageEnabled
                ? "translate-x-6"
                : "translate-x-0.5",
            )}
          />
        </button>
      </div>
    </div>
  );
}
