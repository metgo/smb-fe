import clsx from "clsx";
import { Gauge, Play, ScanEye } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ScoreSettingsHeaderProps {
  t: (key: string, options?: Record<string, unknown>) => string;
  version: number;
  isDirty: boolean;
  isRunning: boolean;
  isSaving: boolean;
  onPreview: () => void;
  onRecalculateClick: () => void;
}

const ScoreSettingsHeader = ({
  t,
  version,
  isDirty,
  isRunning,
  isSaving,
  onPreview,
  onRecalculateClick,
}: ScoreSettingsHeaderProps) => {
  const { isDark, textPrimary, textTertiary, borderColor, textSecondary } =
    useThemeClasses();

  return (
    <div className="flex flex-wrap items-start gap-3 justify-between">
      <div className="flex items-start gap-3 min-w-0">
        <Gauge
          className={clsx(
            "w-7 h-7 mt-1 shrink-0",
            isDark ? "text-emerald-400" : "text-emerald-600",
          )}
        />
        <div className="min-w-0">
          <h1 className={clsx("text-2xl font-bold", textPrimary)}>
            {t("score_settings")}
          </h1>
          <p className={clsx("text-sm max-w-2xl", textTertiary)}>
            {t("score_settings_desc")}
          </p>
          <p className={clsx("text-xs mt-1", textTertiary)}>
            {t("version")}: {version}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onPreview}
          disabled={isRunning}
          className={clsx(
            "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
            borderColor,
            textSecondary,
          )}
        >
          <ScanEye className="w-4 h-4" />
          {isDirty ? t("preview_unsaved") : t("preview")}
        </button>
        <button
          type="button"
          onClick={onRecalculateClick}
          disabled={isRunning || isSaving}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4" />
          {isDirty ? t("save_and_recalculate") : t("recalculate")}
        </button>
      </div>
    </div>
  );
};

export default ScoreSettingsHeader;
