import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface PageStatsProps {
  stats: PageStats[];
  className?: string;
  isLoading?: boolean;
}

export default function PageStats({
  stats,
  isLoading = false,
  className = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-6",
}: PageStatsProps) {
  const { bgSecondary, textPrimary, textTertiary, isDark } = useThemeClasses();

  const borderClass = isDark ? "border-gray-600/50" : "border-gray-200";

  return (
    <div className={clsx(className)}>
      {isLoading
        ? Array.from({ length: stats?.length || 4 }).map((_, i) => (
            <div
              key={i}
              className={`${bgSecondary} rounded-lg px-3 py-2.5 border ${borderClass} shadow-sm animate-pulse flex items-center gap-3`}
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
              className={`${bgSecondary} rounded-lg px-3 py-2.5 border ${borderClass} shadow-sm flex items-center gap-3`}
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
                <div className="flex items-baseline gap-1.5 mt-0.5">
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
  );
}
