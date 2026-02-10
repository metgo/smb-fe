import { ChevronDown } from "lucide-react";
import clsx from "clsx";

interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  error?: string;
  isDisabled?: boolean;
  fieldRef?: React.RefObject<HTMLDivElement | null>;
  selectInputClasses: string;
}

const SelectField = ({
  value,
  onChange,
  options,
  placeholder,
  error,
  fieldRef,
  isDisabled = false,
  selectInputClasses,
}: SelectFieldProps) => {
  return (
    <div ref={fieldRef} className="relative">
      <select
        value={value}
        disabled={isDisabled}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(
          "appearance-none h-12 w-full border rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500",
          selectInputClasses,
          error && "border-red-500",
          isDisabled ? "cursor-not-allowed" : "cursor-pointer",
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <ChevronDown className="absolute top-1/2 ltr:right-3 rtl:left-3 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
    </div>
  );
};
export default SelectField;
