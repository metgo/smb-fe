import clsx from "clsx";
import { X, Clock, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";

type TPlacementConfig = {
  rotationType: "automatic" | "manual";
  timeInterval: number;
};

interface PlacementSettingsDrawerProps {
  selectedPlacement: string | null;
  settingsOpen: boolean;
  setSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  placementSettings: Record<string, TPlacementConfig>;
  setPlacementSettings: React.Dispatch<
    React.SetStateAction<Record<string, TPlacementConfig>>
  >;
  defaultPlacementConfig: () => TPlacementConfig;
}

export default function PlacementSettingsDrawer({
  selectedPlacement,
  settingsOpen,
  setSettingsOpen,
  placementSettings,
  setPlacementSettings,
  defaultPlacementConfig,
}: PlacementSettingsDrawerProps) {
  const { t } = useTranslation("promotions");
  const { isDark, bgPrimary, borderColor, textPrimary } = useThemeClasses();

  if (!selectedPlacement) return null;

  const cfg = placementSettings[selectedPlacement] ?? defaultPlacementConfig();

  return (
    <div
      className={clsx(
        "fixed bottom-20 right-2 z-80 w-72 transition-transform duration-300 ease-in-out",
        settingsOpen ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div
        className={clsx(
          "rounded-2xl border shadow-2xl px-5 pt-4 pb-6",
          bgPrimary,
          borderColor,
        )}
      >
        {/* Handle */}
        <div className="flex justify-center mb-3">
          <div
            className={clsx(
              "w-8 h-1 rounded-full",
              isDark ? "bg-gray-600" : "bg-gray-300",
            )}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal
              className={clsx(
                "w-4 h-4",
                isDark ? "text-green-400" : "text-green-600",
              )}
            />
            <span className={`text-sm font-semibold ${textPrimary}`}>
              {t(selectedPlacement)}
            </span>
          </div>
          <button
            onClick={() => setSettingsOpen(false)}
            className={clsx(
              "p-1 rounded-lg transition-colors",
              isDark
                ? "hover:bg-gray-800 text-gray-400"
                : "hover:bg-gray-100 text-gray-500",
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label
              className={`block text-xs font-medium ${textPrimary} mb-1.5`}
            >
              {t("rotation_type")}
            </label>
            <select
              value={cfg.rotationType}
              onChange={(e) =>
                setPlacementSettings((prev) => ({
                  ...prev,
                  [selectedPlacement]: {
                    ...cfg,
                    rotationType: e.target.value as "automatic" | "manual",
                  },
                }))
              }
              className={`w-full px-3 py-2 text-sm rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:ring-2 focus:ring-green-500`}
            >
              <option value="automatic">{t("automatic")}</option>
              <option value="manual">{t("manual")}</option>
            </select>
          </div>

          <div>
            <label
              className={`flex items-center gap-1.5 text-xs font-medium ${textPrimary} mb-1.5`}
            >
              <Clock className="w-3.5 h-3.5" />
              {t("time_interval_seconds")}
            </label>
            <input
              type="number"
              value={cfg.timeInterval}
              onChange={(e) =>
                setPlacementSettings((prev) => ({
                  ...prev,
                  [selectedPlacement]: {
                    ...cfg,
                    timeInterval: parseInt(e.target.value),
                  },
                }))
              }
              min="1"
              max="60"
              className={`w-full px-3 py-2 text-sm rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:ring-2 focus:ring-green-500`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
