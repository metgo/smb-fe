import { useThemeClasses } from "@/hooks/useThemeClasses";

interface UserStatsCardsProps {
  stats: PageStats[];
  isLoading?: boolean;
}

export default function UserStatsCards({
  stats,
  isLoading = false,
}: UserStatsCardsProps) {
  const { bgSecondary, textPrimary, textTertiary, isDark } = useThemeClasses();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {isLoading
        ? Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`${bgSecondary} rounded-xl p-6 border shadow-sm animate-pulse ${
                isDark ? "border-gray-500" : "border-gray-200"
              }`}
            >
              <div className="h-6 w-6 bg-gray-300 rounded mb-3" />
              <div className="h-5 w-32 bg-gray-300 rounded mb-2" />
              <div className="h-8 w-20 bg-gray-300 rounded" />
            </div>
          ))
        : stats?.map((item, index) => (
            <div
              key={index}
              className={`${bgSecondary} rounded-xl p-6 border shadow-sm hover:shadow-md transition ${
                isDark ? "border-gray-500" : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-teal-500">{item.icon}</div>
                <span className={`text-sm font-medium ${textTertiary}`}>
                  {item.title}
                </span>
              </div>

              <p className={`text-3xl font-semibold ${textPrimary}`}>
                {item.value}
              </p>

              {item.label && (
                <p
                  className={`text-xs mt-1 ${
                    item.labelClass ? item.labelClass : textTertiary
                  }`}
                >
                  {item.label}
                </p>
              )}
            </div>
          ))}
    </div>
  );
}
