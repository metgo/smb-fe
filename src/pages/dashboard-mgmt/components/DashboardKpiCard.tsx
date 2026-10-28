import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTilt3D } from "../hooks/useTilt3D";
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
  const tilt = useTilt3D<HTMLDivElement>();

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

  return (
    <div
      ref={tilt.ref}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className={clsx(
        "dm-glass dm-tilt rounded-2xl p-4 text-left w-full",
        isDark && "dm-glass--dark",
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
    </div>
  );
}
