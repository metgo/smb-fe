import clsx from "clsx";
import { Palette } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface Props {
  formData: SiteSettingsFormData;
  errors: SiteSettingsErrors;
  onChange: (
    field: keyof SiteSettingsFormData,
    value: string | boolean,
  ) => void;
}

const FONT_OPTIONS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Poppins",
  "Montserrat",
  "Lato",
  "Nunito",
  "Raleway",
];

const BUTTON_STYLES: {
  value: SiteSettingsFormData["buttonStyle"];
  label: string;
}[] = [
  { value: "rounded", label: "Rounded" },
  { value: "square", label: "Square" },
  { value: "custom", label: "Custom Radius" },
];

function ColorField({
  label,
  field,
  value,
  onChange,
  textPrimary,
  inputClasses,
}: {
  label: string;
  field: keyof SiteSettingsFormData;
  value: string;
  onChange: (f: keyof SiteSettingsFormData, v: string) => void;
  textPrimary: string;
  inputClasses: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className={clsx("text-sm font-medium", textPrimary)}>
        {label}
      </label>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(field, e.target.value)}
            className="w-10 h-10 rounded-lg border cursor-pointer p-0.5"
          />
        </div>
        <input
          type="text"
          value={value}
          maxLength={7}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder="#000000"
          className={clsx(
            "flex-1 px-4 py-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-teal-500/20 font-mono text-sm",
            inputClasses,
          )}
        />
      </div>
    </div>
  );
}

export default function Step02ThemeAppearance({ formData, onChange }: Props) {
  const { textPrimary, textSecondary, inputClasses, isDark } =
    useThemeClasses();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Palette className="w-5 h-5 text-teal-500" />
        <h2 className={clsx("text-lg font-semibold", textPrimary)}>
          Theme Customization
        </h2>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <ColorField
          label="Primary Color"
          field="primaryColor"
          value={formData.primaryColor}
          onChange={onChange}
          textPrimary={textPrimary}
          inputClasses={inputClasses}
        />
        <ColorField
          label="Secondary Color"
          field="secondaryColor"
          value={formData.secondaryColor}
          onChange={onChange}
          textPrimary={textPrimary}
          inputClasses={inputClasses}
        />
        <ColorField
          label="Background Color"
          field="backgroundColor"
          value={formData.backgroundColor}
          onChange={onChange}
          textPrimary={textPrimary}
          inputClasses={inputClasses}
        />
      </div>

      {/* Font */}
      <div className="flex flex-col gap-2">
        <label className={clsx("text-sm font-medium", textPrimary)}>
          Font Family
        </label>
        <select
          value={formData.fontFamily}
          onChange={(e) => onChange("fontFamily", e.target.value)}
          className={clsx(
            "px-4 py-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-teal-500/20",
            inputClasses,
          )}
        >
          <option value="">Select font…</option>
          {FONT_OPTIONS.map((f) => (
            <option key={f} value={f} style={{ fontFamily: f }}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Button Style */}
      <div className="flex flex-col gap-3">
        <label className={clsx("text-sm font-medium", textPrimary)}>
          Button Style
        </label>
        <div className="flex flex-wrap gap-3">
          {BUTTON_STYLES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onChange("buttonStyle", value)}
              className={clsx(
                "px-5 py-2.5 border-2 text-sm font-medium transition-all",
                value === "rounded" && "rounded-full",
                value === "square" && "rounded-none",
                value === "custom" && "rounded-lg",
                formData.buttonStyle === value
                  ? "border-teal-500 bg-teal-500/10 text-teal-600"
                  : isDark
                    ? "border-gray-700 text-gray-300 hover:border-gray-500"
                    : "border-gray-300 text-gray-600 hover:border-gray-400",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {formData.buttonStyle === "custom" && (
          <div className="flex items-center gap-3 mt-1">
            <input
              type="range"
              min="0"
              max="24"
              value={parseInt(formData.buttonRadius || "8")}
              onChange={(e) => onChange("buttonRadius", e.target.value)}
              className="flex-1"
            />
            <span className={clsx("text-sm w-14 text-right", textSecondary)}>
              {formData.buttonRadius || "8"}px
            </span>
          </div>
        )}
      </div>

      {/* Dark Mode Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className={clsx("text-sm font-medium", textPrimary)}>Dark Mode</p>
          <p className={clsx("text-xs mt-0.5", textSecondary)}>
            Allow visitors to switch between light and dark
          </p>
        </div>
        <button
          onClick={() => onChange("darkModeEnabled", !formData.darkModeEnabled)}
          className={clsx(
            "relative w-12 h-6 rounded-full transition-colors",
            formData.darkModeEnabled
              ? "bg-teal-500"
              : isDark
                ? "bg-gray-700"
                : "bg-gray-300",
          )}
        >
          <span
            className={clsx(
              "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
              formData.darkModeEnabled ? "translate-x-6" : "translate-x-0.5",
            )}
          />
        </button>
      </div>
    </div>
  );
}
