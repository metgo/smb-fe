import Select from "react-select";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import ImageWithFallback from "./ImageWithFallback";

export type WebsiteOption = {
  value: string;
  label: string;
  logo: string;
};

type Props = {
  websites?: {
    _id: string;
    name: string;
    logo: string;
  }[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isClearable?: boolean;
  isDisabled?: boolean;
};

export default function WebsiteSelect({
  websites,
  value,
  onChange,
  placeholder = "Select website",
  isClearable = false,
  isDisabled = false,
}: Props) {
  const { isDark } = useThemeClasses();

  if (!websites?.length) return null;

  const options: WebsiteOption[] = websites.map((site) => ({
    value: site._id,
    label: site.name,
    logo: site.logo,
  }));

  const selectedOption = options.find((o) => o.value === value) || null;

  return (
    <Select
      options={options}
      value={selectedOption}
      isClearable={isClearable}
      isSearchable
      isDisabled={isDisabled}
      placeholder={placeholder}
      onChange={(opt) => onChange(opt?.value ?? "")}
      styles={{
        container: (base) => ({ ...base, minWidth: 160, zIndex: 30 }),
        control: (base, state) => ({
          ...base,
          borderRadius: 12,
          borderColor: state.isFocused
            ? isDark
              ? "#2dd4bf"
              : "#14b8a6"
            : isDark
              ? "#374151"
              : "#d1d5db",
          backgroundColor: isDark ? "#1f2937" : "#ffffff",
          color: isDark ? "#f9fafb" : "#111827",
          boxShadow: state.isFocused
            ? isDark
              ? "0 0 0 2px #2dd4bf"
              : "0 0 0 2px #14b8a6"
            : undefined,
          "&:hover": {
            borderColor: state.isFocused
              ? isDark
                ? "#2dd4bf"
                : "#14b8a6"
              : isDark
                ? "#4b5563"
                : "#9ca3af",
          },
        }),
        menu: (base) => ({
          ...base,
          borderRadius: 8,
          borderColor: isDark ? "#374151" : "#e5e7eb",
          backgroundColor: isDark ? "#111827" : "#ffffff",
          color: isDark ? "#f9fafb" : "#111827",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? isDark
              ? "#0f766e"
              : "#d1fae5"
            : state.isFocused
              ? isDark
                ? "#1f2937"
                : "#f3f4f6"
              : isDark
                ? "#111827"
                : "#ffffff",
          color: isDark ? "#f9fafb" : "#111827",
          cursor: "pointer",
        }),
        singleValue: (base) => ({
          ...base,
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: isDark ? "#f9fafb" : "#111827",
        }),
        placeholder: (base) => ({
          ...base,
          color: isDark ? "#9ca3af" : "#6b7280",
        }),
        indicatorSeparator: () => ({ display: "none" }),
        dropdownIndicator: (base) => ({
          ...base,
          color: isDark ? "#9ca3af" : "#6b7280",
        }),
        clearIndicator: (base) => ({
          ...base,
          color: isDark ? "#9ca3af" : "#6b7280",
          "&:hover": {
            color: isDark ? "#f87171" : "#ef4444",
          },
        }),
      }}
      formatOptionLabel={(option: WebsiteOption) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ImageWithFallback
            src={option.logo}
            alt={option.label}
            style={{ width: 24, height: 24, objectFit: "contain" }}
          />
          <span>{option.label}</span>
        </div>
      )}
    />
  );
}
