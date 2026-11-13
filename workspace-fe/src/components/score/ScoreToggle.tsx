import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ScoreToggleProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  onText: string;
  offText: string;
  disabled?: boolean;
}

// on/off switch that reads clearly in both themes: green track + "On" when
// on, outlined grey track + "Off" when off
const ScoreToggle = ({
  id,
  checked,
  onChange,
  label,
  onText,
  offText,
  disabled,
}: ScoreToggleProps) => {
  const { isDark } = useThemeClasses();

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full"
    >
      <span
        className={clsx(
          "relative inline-flex h-6 w-11 items-center rounded-full border-2 transition-colors",
          checked
            ? "bg-emerald-500 border-emerald-500"
            : isDark
              ? "bg-gray-700 border-gray-500"
              : "bg-gray-200 border-gray-300",
        )}
      >
        <span
          className={clsx(
            "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
            checked
              ? "translate-x-[22px] rtl:-translate-x-[22px]"
              : "translate-x-[2px] rtl:-translate-x-[2px]",
          )}
        />
      </span>
      <span
        className={clsx(
          "w-7 text-xs font-semibold text-start",
          checked
            ? isDark
              ? "text-emerald-400"
              : "text-emerald-700"
            : isDark
              ? "text-gray-400"
              : "text-gray-500",
        )}
      >
        {checked ? onText : offText}
      </span>
    </button>
  );
};

export default ScoreToggle;
