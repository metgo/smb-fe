import clsx from "clsx";
import { RotateCcw, Save } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";

interface SaveBarProps {
  t: (key: string, options?: Record<string, unknown>) => string;
  isSaving: boolean;
  onReset: () => void;
  onSave: () => void;
}

const SaveBar = ({ t, isSaving, onReset, onSave }: SaveBarProps) => {
  const { isDark, textSecondary, borderColor } = useThemeClasses();

  return (
    <div
      className={clsx(
        "sticky bottom-0 z-20 flex flex-wrap gap-2 justify-end items-center px-4 py-3 rounded-xl border shadow-lg",
        isDark
          ? "bg-gray-900/95 border-amber-500/50"
          : "bg-white/95 border-amber-400",
      )}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <span
        className={clsx(
          "text-sm font-medium me-auto",
          isDark ? "text-amber-300" : "text-amber-700",
        )}
      >
        {t("unsaved_changes_hint")}
      </span>
      <button
        type="button"
        onClick={onReset}
        disabled={isSaving}
        className={clsx(
          "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          borderColor,
          textSecondary,
        )}
      >
        <RotateCcw className="w-4 h-4" />
        {t("reset")}
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save className="w-4 h-4" />
        {isSaving ? t("saving") : t("save")}
      </button>
    </div>
  );
};

export default SaveBar;
