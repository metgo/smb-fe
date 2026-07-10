import { ChevronDown, Check } from "lucide-react";
import clsx from "clsx";
import { useState, useRef, useEffect } from "react";

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
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <div ref={fieldRef ?? containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "h-12 w-full border rounded-lg px-4 py-2 pr-10 text-sm text-start focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors",
          selectInputClasses,
          error && "border-red-500",
          isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        )}
      >
        <span className={clsx(!selected && "opacity-50")}>
          {selected?.label ?? placeholder}
        </span>
      </button>

      <ChevronDown
        className={clsx(
          "absolute top-1/2 ltr:right-3 rtl:left-3 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none transition-transform duration-200",
          open && "rotate-180",
        )}
      />

      {/* Dropdown — rendered inside the same stacking context, always below the trigger */}
      {open && !isDisabled && (
        <ul
          className={clsx(
            "absolute left-0 right-0 top-full mt-1 z-200",
            "max-h-56 overflow-y-auto rounded-lg border shadow-lg",
            "divide-y",
            selectInputClasses.includes("bg-gray-800") ||
              selectInputClasses.includes("dark")
              ? "bg-gray-800 border-gray-700 divide-gray-700"
              : "bg-white border-gray-200 divide-gray-100",
          )}
        >
          <li>
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={clsx(
                "w-full text-start px-4 py-2.5 text-sm transition-colors",
                !value
                  ? "text-teal-500 font-medium"
                  : "text-gray-400 hover:bg-black/5",
              )}
            >
              {placeholder}
            </button>
          </li>
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={clsx(
                  "w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors",
                  opt.value === value
                    ? "text-teal-500 font-medium"
                    : selectInputClasses.includes("bg-gray-800")
                      ? "text-gray-300 hover:bg-white/5"
                      : "text-gray-700 hover:bg-gray-50",
                )}
              >
                {opt.label}
                {opt.value === value && (
                  <Check className="w-3.5 h-3.5 shrink-0" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default SelectField;
