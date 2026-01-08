import { useThemeClasses } from "@/hooks/useThemeClasses"

interface PageStatsProps {
  stats: PageStats[]
  className?: string;
}


export function PageStats({
  stats,
  className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6"
}: PageStatsProps) {
  const { bgPrimary, borderColor, textPrimary, textTertiary } = useThemeClasses()

  return (
    <div className={className}>
      {stats?.map(item => (
        <div
          key={item.id}
          className={`${bgPrimary} rounded-xl p-4 border ${borderColor} shadow-sm`}
        >
          <div className="flex items-center gap-2 mb-3">
            {item.icon}
            <span className={`text-sm ${textPrimary}`}>{item.title}</span>
          </div>
          <p className={`text-2xl ${textPrimary} mb-1`}>{item.value}</p>
          {item.label && (
            <p className={`text-xs ${item.labelClass ? item.labelClass : textTertiary}`}>{item.label}</p>
          )}
        </div>
      ))}
    </div>
  )
}
