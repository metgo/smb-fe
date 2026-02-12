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
  className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6",
}: PageStatsProps) {
  const { bgSecondary, textPrimary, textTertiary, isDark } = useThemeClasses();

  return (
    <div className={clsx(className)}>
      {isLoading
        ? Array.from({ length: stats?.length || 4 }).map((_, i) => (
            <div
              key={i}
              className={`${bgSecondary} rounded-xl px-4 py-2 border shadow-sm animate-pulse ${
                isDark ? "border-gray-500" : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 bg-gray-300 rounded" />
                <div className="h-4 w-24 bg-gray-300 rounded" />
              </div>

              <div className="flex items-center gap-2">
                <div className="h-7 w-20 bg-gray-300 rounded" />
                <div className="h-3 w-16 bg-gray-200 rounded" />
              </div>
            </div>
          ))
        : stats?.map((item) => (
            <div
              key={item.id}
              className={`${bgSecondary} rounded-xl px-4 py-2 border shadow-sm ${
                isDark ? "border-gray-500" : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                {item.icon}
                <span className={`text-sm ${textPrimary}`}>{item.title}</span>
              </div>

              <div className="flex items-center gap-2">
                <p className={`text-2xl ${textPrimary}`}>{item.value}</p>
                {item.label && (
                  <p
                    className={`text-xs ${
                      item.labelClass ? item.labelClass : textTertiary
                    }`}
                  >
                    {item.label}
                  </p>
                )}
              </div>
            </div>
          ))}
    </div>
  );
}
