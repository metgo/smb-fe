import Select, {
  type MultiValue,
  components,
  type OptionProps,
  type MultiValueGenericProps,
} from "react-select";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";
import ImageWithFallback from "@/components/shared/ImageWithFallback";

export interface MultiSelectOption {
  label: string;
  value: string;
  image?: string;
}

const OptionWithImage = (props: OptionProps<MultiSelectOption, true>) => {
  const { data } = props;
  return (
    <components.Option {...props}>
      <div className="flex items-center gap-2">
        {data.image && (
          <ImageWithFallback
            src={data.image}
            alt={data.label}
            className="h-6 w-6 rounded object-cover shrink-0"
          />
        )}
        <span>{data.label}</span>
      </div>
    </components.Option>
  );
};

const MultiValueLabelWithImage = (
  props: MultiValueGenericProps<MultiSelectOption, true>,
) => {
  const { data } = props;
  return (
    <components.MultiValueLabel {...props}>
      <div className="flex items-center gap-1">
        {data.image && (
          <ImageWithFallback
            src={data.image}
            alt={data.label}
            className="h-4 w-4 rounded object-cover shrink-0"
          />
        )}
        <span>{data.label}</span>
      </div>
    </components.MultiValueLabel>
  );
};

interface ReactMultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  isDisabled?: boolean;
}

const ReactMultiSelect: React.FC<ReactMultiSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  isDisabled = false,
}) => {
  const { isDark } = useThemeClasses();
  const { t } = useTranslation("common");
  const finalPlaceholder = placeholder || t("select_options_placeholder");

  // Convert string[] → option[]
  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  const handleChange = (selected: MultiValue<MultiSelectOption>) => {
    const values = selected.map((opt) => opt.value);
    onChange(values);
  };

  return (
    <div>
      {label && (
        <label
          className={`block text-sm mb-2 ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {label}
        </label>
      )}

      <Select
        isMulti
        closeMenuOnSelect={false}
        // hideSelectedOptions={false}
        isDisabled={isDisabled}
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        placeholder={finalPlaceholder}
        components={{
          Option: OptionWithImage,
          MultiValueLabel: MultiValueLabelWithImage,
        }}
        classNamePrefix="react-select"
        styles={{
          control: (base, state) => ({
            ...base,
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            borderColor: state.isFocused
              ? "#14b8a6"
              : isDark
                ? "#374151"
                : "#d1d5db",
            boxShadow: state.isFocused ? "0 0 0 1px #14b8a6" : "none",
            borderRadius: 8,
            "&:hover": {
              borderColor: "#14b8a6",
            },
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: isDark ? "#111827" : "#ffffff",
            color: isDark ? "#ffffff" : "#111827",
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
              ? isDark
                ? "#0f766e" // selected dark
                : "#d1fae5" // selected light
              : state.isFocused
                ? isDark
                  ? "#1f2937"
                  : "#f3f4f6"
                : "transparent",
            color: isDark ? "#ffffff" : "#111827",
            cursor: "pointer",
          }),
          multiValue: (base) => ({
            ...base,
            backgroundColor: isDark ? "#0f766e" : "#d1fae5",
          }),
          multiValueLabel: (base) => ({
            ...base,
            color: isDark ? "#ffffff" : "#065f46",
          }),
          multiValueRemove: (base) => ({
            ...base,
            color: isDark ? "#ffffff" : "#065f46",
            ":hover": {
              backgroundColor: "#ef4444",
              color: "#ffffff",
            },
          }),
          input: (base) => ({
            ...base,
            color: isDark ? "#ffffff" : "#111827",
          }),
          placeholder: (base) => ({
            ...base,
            color: isDark ? "#9ca3af" : "#6b7280",
          }),
        }}
      />
    </div>
  );
};

export default ReactMultiSelect;
