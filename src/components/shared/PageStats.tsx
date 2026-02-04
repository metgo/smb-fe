import { useThemeClasses } from "@/hooks/useThemeClasses";

interface PageStatsProps {
  stats: PageStats[];
  className?: string;
}

export default function PageStats({
  stats,
  className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6",
}: PageStatsProps) {
  const { bgSecondary, theme, textPrimary, textTertiary } = useThemeClasses();

  return (
    <div className={className}>
      {stats?.map((item) => (
        <div
          key={item.id}
          className={`${bgSecondary} rounded-xl px-4 py-2 border shadow-sm ${theme === "dark" ? "border-gray-500" : "border-gray-200"}`}
        >
          <div className="flex items-center gap-2 mb-3">
            {item.icon}
            <span className={`text-sm ${textPrimary}`}>{item.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <p className={`text-2xl ${textPrimary}`}>{item.value}</p>
            {item.label && (
              <p
                className={`text-xs ${item.labelClass ? item.labelClass : textTertiary}`}
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
