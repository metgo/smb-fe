import { useThemeClasses } from "@/hooks/useThemeClasses";
import { Columns, ChevronUp, ChevronDown } from "lucide-react";
import { useRef, useEffect } from "react";

type ColumnDefinition = {
  key: string;
};

type ShowColumnsProps = {
  viewMode?: string;

  columnDefinitions: ColumnDefinition[];
  columnVisibility: any;

  showColumnSettings: boolean;
  setShowColumnSettings: (value: boolean) => void;

  setColumnVisibility: any;

  resetToDefault: () => void;

  t: (key: string) => string;
};

const ShowColumns = ({
  viewMode = "list",
  columnDefinitions,
  columnVisibility,

  showColumnSettings,
  setShowColumnSettings,
  setColumnVisibility,
  resetToDefault,
  t,
}: ShowColumnsProps) => {
  const { isDark, isRTL, textSecondary } = useThemeClasses();
  const columnSettingsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        columnSettingsRef.current &&
        !columnSettingsRef.current.contains(e.target as Node)
      ) {
        setShowColumnSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowColumnSettings]);

  if (viewMode !== "list") return null;

  return (
    <div className="relative" ref={columnSettingsRef}>
      <button
        onClick={() => setShowColumnSettings(!showColumnSettings)}
        className={`px-3 py-2 rounded-lg border flex items-center gap-1.5 transition-colors text-sm ${
          isDark
            ? "border-gray-700 hover:bg-gray-800 text-gray-300"
            : "border-gray-300 hover:bg-gray-100 text-gray-700"
        }`}
      >
        <Columns className="w-4 h-4 shrink-0" />

        <span className="hidden sm:inline">{t("show_columns")}</span>

        {showColumnSettings ? (
          <ChevronUp className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 shrink-0" />
        )}
      </button>

      {showColumnSettings && (
        <div
          className={`absolute ${
            isRTL ? "right-0" : "left-0"
          } mt-2 w-60 rounded-lg shadow-lg max-h-80 overflow-y-auto border z-50 ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div
            className={`p-3 border-b ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <h3
                className={`text-sm ${
                  isDark ? "text-gray-200" : "text-gray-900"
                }`}
              >
                {t("column_settings")}
              </h3>

              <button
                onClick={resetToDefault}
                className="text-xs text-teal-600 hover:text-teal-700"
              >
                {t("reset_to_default")}
              </button>
            </div>

            <p
              className={`text-xs ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {t("select_columns_to_display")}
            </p>
          </div>

          <div className="p-2 space-y-0.5">
            {columnDefinitions.map(({ key }) => (
              <label
                key={key}
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer ${
                  isRTL ? "flex-row-reverse" : ""
                } ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <input
                  type="checkbox"
                  checked={columnVisibility[key]}
                  onChange={(e) =>
                    setColumnVisibility((prev: any) => ({
                      ...prev,
                      [key]: e.target.checked,
                    }))
                  }
                  className="rounded"
                />

                <span className={`text-sm ${textSecondary}`}>{t(key)}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowColumns;
