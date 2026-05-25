import { useThemeClasses } from "@/hooks/useThemeClasses";
import { List, Grid3x3, Calendar } from "lucide-react";
import { useEffect } from "react";

type ViewMode = "list" | "grid" | "calendar" | any;

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  activeClassName?: string;
  showCalendor?: boolean;
  tableName?: string;
}

export default function ViewModeToggle({
  value,
  onChange,
  showCalendor = false,
  activeClassName = "bg-teal-500 text-white",
  tableName,
}: ViewModeToggleProps) {
  const themeColor = useThemeClasses();
  const baseBtn = "p-2 rounded transition-colors cursor-pointer";

  //persist view mode
  useEffect(() => {
    localStorage.setItem(`${tableName}`, value);
  }, [value]);

  return (
    <div
      className={`flex items-center gap-1 p-1 rounded md:rounded-lg border ${themeColor.borderColor} ${themeColor.bgSecondary}`}
    >
      <button
        onClick={() => onChange("list")}
        className={`${baseBtn} ${
          value === "list" ? activeClassName : themeColor.textTertiary
        }`}
        aria-label="List view"
      >
        <List className="w-4 h-4" />
      </button>

      <button
        onClick={() => onChange("grid")}
        className={`${baseBtn} ${
          value === "grid" ? activeClassName : themeColor.textTertiary
        }`}
        aria-label="Grid view"
      >
        <Grid3x3 className="w-4 h-4" />
      </button>

      {showCalendor && (
        <button
          onClick={() => onChange("calendar")}
          className={`${baseBtn} ${
            value === "calendar" ? activeClassName : themeColor.textTertiary
          }`}
          aria-label="Grid view"
        >
          <Calendar className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
