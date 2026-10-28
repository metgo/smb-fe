import clsx from "clsx";

import { useThemeClasses } from "@/hooks/useThemeClasses";

interface DashboardLoadingStateProps {
  /** Number of skeleton rows/cards to render. */
  count?: number;
  variant?: "cards" | "rows";
}

export default function DashboardLoadingState({
  count = 4,
  variant = "cards",
}: DashboardLoadingStateProps) {
  const { isDark } = useThemeClasses();
  const pulseClass = isDark ? "bg-gray-800" : "bg-gray-200";

  if (variant === "rows") {
    return (
      <div className="space-y-2" role="status" aria-label="Loading">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={clsx("h-10 rounded-md animate-pulse", pulseClass)}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            "dm-glass rounded-2xl p-4 h-28 animate-pulse",
            isDark && "dm-glass--dark",
          )}
        >
          <div className={clsx("h-3 w-20 rounded mb-3", pulseClass)} />
          <div className={clsx("h-6 w-16 rounded mb-2", pulseClass)} />
          <div className={clsx("h-2 w-24 rounded", pulseClass)} />
        </div>
      ))}
    </div>
  );
}
