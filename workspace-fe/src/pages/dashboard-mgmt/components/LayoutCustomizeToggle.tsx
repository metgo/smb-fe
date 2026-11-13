import clsx from "clsx";
import { LayoutGrid, Check, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { Button } from "@/components/ui/button";

interface LayoutCustomizeToggleProps {
  isCustomizing: boolean;
  onToggle: () => void;
  onReset: () => void;
}

export default function LayoutCustomizeToggle({
  isCustomizing,
  onToggle,
  onReset,
}: LayoutCustomizeToggleProps) {
  const { t } = useTranslation("dashboard_mock");
  const { textSecondary } = useThemeClasses();

  return (
    <div className={clsx("flex items-center gap-2", textSecondary)}>
      <Button variant="ghost" size="sm" className="gap-1.5" onClick={onToggle}>
        {isCustomizing ? (
          <Check className="w-3.5 h-3.5" aria-hidden="true" />
        ) : (
          <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
        )}
        {isCustomizing ? t("done_customizing") : t("customize_layout")}
      </Button>

      {isCustomizing && (
        <button
          type="button"
          onClick={onReset}
          className={clsx(
            "inline-flex items-center gap-1 text-xs font-medium cursor-pointer",
          )}
        >
          <RotateCcw className="w-3 h-3" aria-hidden="true" />
          {t("reset_layout")}
        </button>
      )}
    </div>
  );
}
