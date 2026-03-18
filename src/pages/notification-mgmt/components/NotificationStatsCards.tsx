import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  AlarmCheck,
  AlertCircle,
  AlertTriangle,
  Bell,
  Info,
  XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const NotificationStatsCards = ({ stats }: { stats: INotificationStats }) => {
  const { t } = useTranslation("notifications");
  const { bgSecondary, textTertiary, borderColor, textPrimary, isDark } =
    useThemeClasses();

  const statItems = [
    {
      label: t("total_notifications"),
      value: stats.total,
      icon: Bell,
      color: "blue",
    },
    {
      label: t("unread"),
      value: stats.unread,
      icon: Info,
      color: "purple",
    },
    {
      label: t("action_required"),
      value: stats.action,
      icon: AlertCircle,
      color: "amber",
    },
    {
      label: t("urgent"),
      value: stats.urgent,
      icon: AlarmCheck,
      color: "orange",
    },
    {
      label: t("info"),
      value: stats.info,
      icon: Info,
      color: "blue",
    },
    {
      label: t("warning"),
      value: stats.warning,
      icon: AlertTriangle,
      color: "yellow",
    },
    {
      label: t("error"),
      value: stats.error,
      icon: XCircle,
      color: "red",
    },
  ];

  const getGradientClass = (color: string) => {
    const gradients = {
      blue: isDark
        ? "bg-gradient-to-br from-blue-500/10 to-blue-600/5"
        : "bg-gradient-to-br from-blue-50 to-blue-100/50",
      purple: isDark
        ? "bg-gradient-to-br from-purple-500/10 to-purple-600/5"
        : "bg-gradient-to-br from-purple-50 to-purple-100/50",
      amber: isDark
        ? "bg-gradient-to-br from-amber-500/10 to-amber-600/5"
        : "bg-gradient-to-br from-amber-50 to-amber-100/50",
      orange: isDark
        ? "bg-gradient-to-br from-orange-500/10 to-orange-600/5"
        : "bg-gradient-to-br from-orange-50 to-orange-100/50",
      yellow: isDark
        ? "bg-gradient-to-br from-yellow-500/10 to-yellow-600/5"
        : "bg-gradient-to-br from-yellow-50 to-yellow-100/50",
      red: isDark
        ? "bg-gradient-to-br from-red-500/10 to-red-600/5"
        : "bg-gradient-to-br from-red-50 to-red-100/50",
    };
    return gradients[color as keyof typeof gradients];
  };

  const getIconColor = (color: string) => {
    const colors = {
      blue: "text-blue-600 dark:text-blue-400",
      purple: "text-purple-600 dark:text-purple-400",
      amber: "text-amber-600 dark:text-amber-400",
      orange: "text-orange-600 dark:text-orange-400",
      yellow: "text-yellow-600 dark:text-yellow-400",
      red: "text-red-600 dark:text-red-400",
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
      {statItems.map((stat) => {
        const IconComponent = stat.icon;
        const hasValue = stat.value > 0;

        return (
          <div
            key={stat.label}
            className={`
              group relative overflow-hidden
              ${bgSecondary} rounded-2xl p-4 
              border ${borderColor}
              transition-all duration-300 ease-out
              hover:scale-[1.02] hover:shadow-lg
              ${hasValue ? "hover:border-opacity-50" : "opacity-80"}
            `}
          >
            {/* Background gradient effect */}
            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${getGradientClass(stat.color)}`}
            />

            {/* Content */}
            <div className="relative">
              {/* Icon with animated background */}
              <div
                className={`
                w-10 h-10 rounded-xl 
                ${getGradientClass(stat.color)} 
                flex items-center justify-center 
                mb-3 transition-transform duration-300 
                group-hover:scale-110 group-hover:rotate-3
              `}
              >
                <IconComponent
                  className={`w-5 h-5 ${getIconColor(stat.color)}`}
                />
              </div>

              {/* Value with special styling when zero */}
              <div className="space-y-1">
                <p
                  className={`
                  text-2xl font-semibold tracking-tight
                  transition-colors duration-200
                  ${hasValue ? textPrimary : textTertiary}
                  ${hasValue && `group-hover:text-${stat.color}-600 dark:group-hover:text-${stat.color}-400`}
                `}
                >
                  {stat.value.toLocaleString()}
                </p>

                {/* Label with better readability */}
                <p
                  className={`
                  text-xs font-medium uppercase tracking-wider
                  ${textTertiary}
                  group-hover:text-opacity-100
                `}
                >
                  {stat.label}
                </p>
              </div>

              {/* Mini trend indicator (optional - can be removed if not needed) */}
              {hasValue && (
                <div
                  className={`
                  absolute top-2 right-2 w-1.5 h-1.5 rounded-full
                  bg-${stat.color}-500 dark:bg-${stat.color}-400
                  animate-pulse
                `}
                />
              )}
            </div>

            {/* Decorative corner accent */}
            <div
              className={`
              absolute bottom-0 right-0 w-12 h-12 
              bg-linear-to-tl 
              opacity-0 group-hover:opacity-100 
              transition-opacity duration-500 rounded-tl-3xl
            `}
            />
          </div>
        );
      })}
    </div>
  );
};

export default NotificationStatsCards;
