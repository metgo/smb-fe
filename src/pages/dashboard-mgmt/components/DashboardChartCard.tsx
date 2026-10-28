import clsx from "clsx";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import DashboardEmptyState from "./DashboardEmptyState";

interface DashboardChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
  /** Plain-text summary for screen readers, since recharts SVGs aren't inherently accessible. */
  accessibleSummary?: string;
}

export default function DashboardChartCard({
  title,
  subtitle,
  action,
  isEmpty,
  emptyMessage,
  children,
  accessibleSummary,
}: DashboardChartCardProps) {
  const { isDark } = useThemeClasses();

  return (
    <section
      className={clsx(
        "rounded-xl border p-5",
        isDark ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200",
      )}
    >
      <div className="flex items-start gap-2 mb-4">
        <div className="flex-1 min-w-0">
          <h3
            className={clsx(
              "text-sm font-semibold",
              isDark ? "text-white" : "text-gray-900",
            )}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              className={clsx(
                "text-xs",
                isDark ? "text-gray-400" : "text-gray-500",
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>

      {isEmpty ? (
        <DashboardEmptyState message={emptyMessage ?? ""} />
      ) : (
        <>
          <div className="h-64">{children}</div>
          {accessibleSummary && <p className="sr-only">{accessibleSummary}</p>}
        </>
      )}
    </section>
  );
}
