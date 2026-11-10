// ColumnSettingsDropdown.tsx
import { useState, useRef } from "react";
import { Columns, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ColumnDefinition {
  key: string;
  isDefault?: boolean;
}

interface ColumnSettingsDropdownProps {
  columnVisibility: Record<string, boolean>;
  setColumnVisibility: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  columnDefinitions: ColumnDefinition[];
  resetToDefault: () => void;
  isDark?: boolean;
  isRTL?: boolean;
  textSecondary?: string;
}

export default function ColumnSettingsDropdown({
  columnVisibility,
  setColumnVisibility,
  columnDefinitions,
  resetToDefault,
  isDark = false,
  isRTL = false,
  textSecondary = "text-gray-700",
}: ColumnSettingsDropdownProps) {
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const columnSettingsRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation("common");

  return (
    <div className="relative" ref={columnSettingsRef}>
      <button
        onClick={() => setShowColumnSettings(!showColumnSettings)}
        className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${
          isDark
            ? "border-gray-700 hover:bg-gray-800 text-gray-300"
            : "border-gray-300 hover:bg-gray-100 text-gray-700"
        }`}
      >
        <Columns className="w-5 h-5" />
        {t("show_columns")}
        {showColumnSettings ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {showColumnSettings && (
        <div
          className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-64 rounded-lg shadow-lg max-h-[50vh] overflow-y-auto border z-50 ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div
            className={`p-4 border-b ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3
                className={`text-sm ${
                  isDark ? "text-gray-200" : "text-gray-900"
                }`}
              >
                {t("column_settings") || "Column Settings"}
              </h3>
              <button
                onClick={resetToDefault}
                className="text-xs text-teal-600 hover:text-teal-700 transition-colors"
              >
                {t("reset_to_default") || "Reset to Default"}
              </button>
            </div>
            <p
              className={`text-xs ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {t("select_columns_to_display") || "Select columns to display"}
            </p>
          </div>

          <div className="p-3 max-h-96 overflow-y-auto">
            {/* Default Columns */}
            {Object.entries(columnVisibility)
              .filter(
                ([key]) =>
                  columnDefinitions.find((col) => col.key === key)?.isDefault,
              )
              .map(([key, visible]) => (
                <label
                  key={key}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    isRTL ? "flex-row-reverse justify-end" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={(e) =>
                      setColumnVisibility((prev) => ({
                        ...prev,
                        [key]: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <span className={`text-sm ${textSecondary}`}>{t(key)}</span>
                </label>
              ))}

            {/* Divider */}
            {columnDefinitions.some((col) => !col.isDefault) && (
              <div className="my-3 border-t border-gray-200 dark:border-gray-700" />
            )}

            {/* Optional Columns */}
            <p
              className={`text-xs mb-2 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {t("optional_columns")}
            </p>

            {Object.entries(columnVisibility)
              .filter(
                ([key]) =>
                  !columnDefinitions.find((col) => col.key === key)?.isDefault,
              )
              .map(([key, visible]) => (
                <label
                  key={key}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    isRTL ? "flex-row-reverse justify-end" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={(e) =>
                      setColumnVisibility((prev) => ({
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
}
