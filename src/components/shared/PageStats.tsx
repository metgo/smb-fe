import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface PageStatsProps {
  stats: PageStats[];
  /** Grid column + gap classes applied on sm+. Mobile layout is always a horizontal flex scroll. */
  className?: string;
  /** Outer scroll-wrapper classes: margins, padding, visibility (e.g. "hidden md:block"). */
  wrapperClassName?: string;
  isLoading?: boolean;
}

export default function PageStats({
  stats,
  isLoading = false,
  className = "sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3",
  wrapperClassName = "mb-6",
}: PageStatsProps) {
  const { bgSecondary, textPrimary, textTertiary, isDark } = useThemeClasses();

  const borderClass = isDark ? "border-gray-600/50" : "border-gray-200";

  return (
    <div
      className={clsx(
        "overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden",
        wrapperClassName,
      )}
    >
      <div className={clsx("flex sm:grid min-w-max sm:min-w-0", className)}>
        {isLoading
          ? Array.from({ length: stats?.length || 4 }).map((_, i) => (
              <div
                key={i}
                className={`shrink-0 w-40 sm:w-auto ${bgSecondary} rounded-lg px-3 py-2.5 border ${borderClass} shadow-sm animate-pulse flex items-center gap-3`}
              >
                <div className="w-8 h-8 bg-gray-300 rounded-lg shrink-0" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="h-3 w-16 bg-gray-300 rounded" />
                  <div className="h-4 w-12 bg-gray-200 rounded" />
                </div>
              </div>
            ))
          : stats?.map((item, index) => (
              <div
                key={index}
                className={`shrink-0 w-40 sm:w-auto ${bgSecondary} rounded-lg px-3 py-2.5 border ${borderClass} shadow-sm flex items-center gap-3 overflow-hidden`}
              >
                <div
                  className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                    isDark ? "bg-white/5" : "bg-black/5"
                  }`}
                >
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[11px] leading-tight truncate ${textTertiary}`}
                  >
                    {item.title}
                  </p>
                  <div className="flex flex-col md:flex-row items-start gap-1.5 ">
                    <span
                      className={`text-base font-semibold leading-tight ${textPrimary}`}
                    >
                      {item.value}
                    </span>
                    {item.label && (
                      <span
                        className={`text-[10px] leading-tight ${
                          item.labelClass ? item.labelClass : textTertiary
                        }`}
                      >
                        {item.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
