import { useTranslation } from "react-i18next";
import { X, Eye, EyeOff, RotateCcw } from "lucide-react";

import type { WidgetConfig } from "@/hooks/useWidgetPreferences";
import { Button } from "@/components/ui/button";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface WidgetSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: WidgetConfig[];
  onToggleWidget: (widgetId: string) => void;
  onReset: () => void;
  viewName: string;
}

export default function WidgetSettingsPanel({
  isOpen,
  onClose,
  widgets,
  onToggleWidget,
  onReset,
  viewName,
}: WidgetSettingsPanelProps) {
  const { t } = useTranslation("dashboard");
  const { isDark } = useThemeClasses();

  if (!isOpen) return null;

  return (
    <div
      className={`fixed right-0 top-0 bottom-0 w-96 z-50 shadow-2xl border-l ${
        isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDark ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <div>
            <h2
              className={`text-lg ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {t("widget_settings")}
            </h2>
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {viewName}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close settings"
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
            }`}
          >
            <X
              className={`w-5 h-5 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            />
          </button>
        </div>

        {/* Widget List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {widgets
              .sort((a, b) => a.order - b.order)
              .map((widget) => {
                const containerClass = widget.visible
                  ? isDark
                    ? "bg-teal-950/20 border-teal-800"
                    : "bg-teal-50 border-teal-200"
                  : isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-gray-50 border-gray-200";

                const textClass = widget.visible
                  ? isDark
                    ? "text-white"
                    : "text-gray-900"
                  : "text-gray-500";

                return (
                  <div
                    key={widget.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${containerClass}`}
                  >
                    <div className="flex items-center gap-3">
                      {widget.visible ? (
                        <Eye
                          className={`w-5 h-5 ${
                            isDark ? "text-teal-400" : "text-teal-600"
                          }`}
                        />
                      ) : (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      )}

                      <span className={`text-sm ${textClass}`}>
                        {widget.name}
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleWidget(widget.id)}
                      className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                        widget.visible
                          ? isDark
                            ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                          : "bg-teal-600 hover:bg-teal-700 text-white"
                      }`}
                    >
                      {widget.visible ? "Hide" : "Show"}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-6 border-t ${
            isDark ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <Button
            onClick={onReset}
            className={`w-full flex items-center justify-center gap-2 px-4 py-6 rounded-lg transition-colors ${
              isDark
                ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}
