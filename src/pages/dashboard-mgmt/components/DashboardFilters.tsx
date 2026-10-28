import clsx from "clsx";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { Button } from "@/components/ui/button";
import type { TimePeriod } from "../types/dashboard.types";

interface DashboardFiltersProps {
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  onRefresh?: () => void;
  extraControls?: React.ReactNode;
}

const PERIODS: TimePeriod[] = ["daily", "weekly", "monthly", "yearly", "all"];

export default function DashboardFilters({
  period,
  onPeriodChange,
  onRefresh,
  extraControls,
}: DashboardFiltersProps) {
  const { t } = useTranslation("dashboard_mock");
  const { isDark } = useThemeClasses();

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <div
        role="radiogroup"
        aria-label={t("period_filter_label")}
        className={clsx(
          "dm-glass inline-flex rounded-2xl p-0.5",
          isDark && "dm-glass--dark",
        )}
      >
        {PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={period === p}
            onClick={() => onPeriodChange(p)}
            className={clsx(
              "px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer",
              period === p
                ? isDark
                  ? "bg-gray-700 text-white"
                  : "bg-white text-gray-900 shadow-sm"
                : isDark
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900",
            )}
          >
            {t(`period_${p}`)}
          </button>
        ))}
      </div>

      {extraControls}

      {onRefresh && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          {t("refresh_demo_data")}
        </Button>
      )}
    </div>
  );
}
