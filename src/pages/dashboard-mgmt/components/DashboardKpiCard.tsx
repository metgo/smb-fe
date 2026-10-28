import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import type { Trend } from "../types/dashboard.types";

interface DashboardKpiCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  trend?: Trend;
  description?: string;
  onClick?: () => void;
}

export default function DashboardKpiCard({
  label,
  value,
  icon: Icon,
  trend,
  description,
  onClick,
}: DashboardKpiCardProps) {
  const { t } = useTranslation("dashboard_mock");
  const { isDark } = useThemeClasses();

  const isClickable = typeof onClick === "function";

  const trendGood =
    trend &&
    trend.direction !== "flat" &&
    ((trend.polarity ?? "positive") === "positive"
      ? trend.direction === "up"
      : trend.direction === "down");

  const TrendIcon =
    trend?.direction === "up"
      ? ArrowUp
      : trend?.direction === "down"
        ? ArrowDown
        : ArrowRight;

  const Wrapper = isClickable ? "button" : "div";

  return (
    <Wrapper
      type={isClickable ? "button" : undefined}
      onClick={onClick}
      className={clsx(
        "rounded-lg border p-4 text-left w-full transition-shadow",
        isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
        isClickable && "hover:shadow-md cursor-pointer",
      )}
      aria-label={isClickable ? `${label}: ${value}` : undefined}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p
          className={clsx(
            "text-xs font-medium",
            isDark ? "text-gray-400" : "text-gray-500",
          )}
        >
          {label}
        </p>
        {Icon && (
          <Icon
            className={clsx(
              "w-4 h-4 shrink-0",
              isDark ? "text-gray-500" : "text-gray-400",
            )}
            aria-hidden="true"
          />
        )}
      </div>

      <p
        className={clsx(
          "text-xl font-bold mb-1",
          isDark ? "text-white" : "text-gray-900",
        )}
      >
        {value}
      </p>

      {trend && (
        <p
          className={clsx(
            "text-xs flex items-center gap-1",
            trend.direction === "flat"
              ? isDark
                ? "text-gray-500"
                : "text-gray-400"
              : trendGood
                ? isDark
                  ? "text-emerald-400"
                  : "text-emerald-600"
                : isDark
                  ? "text-red-400"
                  : "text-red-600",
          )}
        >
          <TrendIcon className="w-3 h-3" aria-hidden="true" />
          <span>
            {trend.changePercent === null
              ? t(trend.comparisonLabel)
              : `${trend.changePercent > 0 ? "+" : ""}${trend.changePercent}% ${t(
                  trend.comparisonLabel,
                )}`}
          </span>
        </p>
      )}

      {description && (
        <p
          className={clsx(
            "text-xs mt-1",
            isDark ? "text-gray-500" : "text-gray-400",
          )}
        >
          {description}
        </p>
      )}
    </Wrapper>
  );
}
