import clsx from "clsx";
import { ArrowDown, TrendingDown } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { Button } from "@/components/ui/button";
import { useTilt3D } from "../hooks/useTilt3D";
import type { PerformanceAlert } from "../types/dashboard.types";

interface DashboardAlertCardProps {
  alert: PerformanceAlert;
  onInspect?: (alert: PerformanceAlert) => void;
}

export default function DashboardAlertCard({
  alert,
  onInspect,
}: DashboardAlertCardProps) {
  const { t } = useTranslation("dashboard_mock");
  const { isDark } = useThemeClasses();
  const tilt = useTilt3D<HTMLDivElement>();
  const change = alert.currentScore - alert.previousScore;

  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className={clsx(
        "dm-glass dm-tilt rounded-2xl p-4",
        isDark && "dm-glass--dark",
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <TrendingDown
            className={clsx(
              "w-4 h-4 shrink-0",
              isDark ? "text-red-400" : "text-red-500",
            )}
            aria-hidden="true"
          />
          <p
            className={clsx(
              "text-sm font-medium truncate",
              isDark ? "text-white" : "text-gray-900",
            )}
          >
            {alert.businessName}
          </p>
        </div>
        <span
          className={clsx(
            "text-xs font-medium shrink-0 flex items-center gap-0.5",
            isDark ? "text-red-400" : "text-red-600",
          )}
        >
          <ArrowDown className="w-3 h-3" aria-hidden="true" />
          {alert.previousScore} → {alert.currentScore} ({change})
        </span>
      </div>

      <ul
        className={clsx(
          "text-xs space-y-0.5 mb-2 pl-1",
          isDark ? "text-gray-400" : "text-gray-500",
        )}
      >
        {alert.factors.map((factor, index) => (
          <li key={index}>• {factor}</li>
        ))}
      </ul>

      <p
        className={clsx(
          "text-xs mb-3",
          isDark ? "text-gray-300" : "text-gray-600",
        )}
      >
        {t("suggested_action")}: {alert.suggestedAction}
      </p>

      <p
        className={clsx(
          "text-[11px] italic mb-2",
          isDark ? "text-gray-500" : "text-gray-400",
        )}
      >
        {t("simulated_data_notice")}
      </p>

      {onInspect && (
        <Button variant="outline" size="sm" onClick={() => onInspect(alert)}>
          {t("inspect_alert")}
        </Button>
      )}
    </div>
  );
}
