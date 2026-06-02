import Select from "react-select";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ImageWithFallback } from "../shared";

export type ItemOption = {
  value: string;
  label: string;
  logo?: string | undefined;
};

type Props = {
  items?: {
    _id: string;
    name: string;
    logo?: string | undefined;
  }[];
  value?: string | null;
  onChange: (value: string) => void;

  onSearch?: (keyword: string) => void;
  isLoading?: boolean;

  placeholder?: string;
  isClearable?: boolean;
  isDisabled?: boolean;
  minWidth?: number;

  logoSize?: {
    width: number;
    height: number;
  };
  optionGap?: number;
};

export default function ReactSelect({
  items,
  value,
  onChange,
  minWidth = 260,
  placeholder = "Select website",
  isClearable = false,
  isDisabled = false,
  isLoading = false,
  onSearch,
  logoSize = { width: 40, height: 30 },
  optionGap = 4,
}: Props) {
  const { isDark } = useThemeClasses();

  const options: ItemOption[] =
    items?.map((site) => ({
      value: site._id,
      label: site.name,
      logo: site.logo,
    })) || [];

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
      isLoading={isLoading}
      onInputChange={(inputValue, { action }) => {
        if (action === "input-change") {
          onSearch?.(inputValue);
        }
      }}
      styles={{
        container: (base) => ({ ...base, minWidth, zIndex: 40 }),
        control: (base, state) => ({
          ...base,
          borderRadius: 8,
          height: 44,
          borderColor: state.isFocused
            ? isDark
              ? "#2dd4bf"
              : "#14b8a6"
            : isDark
              ? "#374151"
              : "#d1d5db",
          backgroundColor: isDark ? "#1f2937" : "#ffffff",
          color: isDark ? "#ffffff" : "#111827",
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
        input: (base) => ({
          ...base,
          color: isDark ? "#ffffff" : "#111827",
        }),
        menu: (base) => ({
          ...base,
          borderRadius: 8,
          borderColor: isDark ? "#374151" : "#e5e7eb",
          backgroundColor: isDark ? "#111827" : "#ffffff",
          color: isDark ? "#ffffff" : "#111827",
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
          color: isDark ? "#fff" : "#111827",
          cursor: "pointer",
        }),
        singleValue: (base) => ({
          ...base,
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: isDark ? "#fff" : "#111827",
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
      formatOptionLabel={(option: ItemOption) => (
        <div style={{ display: "flex", alignItems: "center", gap: optionGap }}>
          {option.logo !== undefined && (
            <ImageWithFallback
              src={option.logo}
              alt={option.label}
              style={{
                width: logoSize.width,
                height: logoSize.height,
                objectFit: "contain",
              }}
            />
          )}
          <span className="font-semibold">{option.label}</span>
        </div>
      )}
    />
  );
}
