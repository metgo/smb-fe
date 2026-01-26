import { useTranslation } from "react-i18next";
import { X, Eye, EyeOff, RotateCcw } from "lucide-react";

import type { WidgetConfig } from "@/hooks/useWidgetPreferences";
import { Button } from "@/components/ui/button";

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

  if (!isOpen) return null;

  return (
    <>
      {/* Panel - No backdrop, allow interaction with widgets */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-50 shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 className="text-lg text-gray-900 dark:text-white">
                {t("widget_settings")}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {viewName}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close settings"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Widget List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3">
              {widgets
                .sort((a, b) => a.order - b.order)
                .map((widget) => (
                  <div
                    key={widget.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      widget.visible
                        ? "bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800"
                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {widget.visible ? (
                        <Eye className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      )}
                      <span
                        className={`text-sm ${
                          widget.visible
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-500 dark:text-gray-500"
                        }`}
                      >
                        {widget.name}
                      </span>
                    </div>
                    <button
                      onClick={() => onToggleWidget(widget.id)}
                      className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                        widget.visible
                          ? "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                          : "bg-teal-600 hover:bg-teal-700 text-white"
                      }`}
                    >
                      {widget.visible ? "Hide" : "Show"}
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <Button
              onClick={onReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-6 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
