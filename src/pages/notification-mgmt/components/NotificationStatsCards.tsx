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
    <div className="mb-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-2 sm:grid sm:grid-cols-4 lg:grid-cols-7 sm:overflow-visible min-w-max sm:min-w-0">
        {statItems.map((stat) => {
          const IconComponent = stat.icon;
          const hasValue = stat.value > 0;

          return (
            <div
              key={stat.label}
              className={`shrink-0 flex items-center gap-2 px-2.5 py-2 rounded-xl border ${borderColor} ${bgSecondary} transition-all duration-200 hover:shadow-sm ${!hasValue && "opacity-50"}`}
            >
              <div
                className={`w-7 h-7 rounded-lg ${getGradientClass(stat.color)} flex items-center justify-center shrink-0`}
              >
                <IconComponent
                  className={`w-3.5 h-3.5 ${getIconColor(stat.color)}`}
                />
              </div>
              <div className="min-w-0">
                <p
                  className={`text-sm font-bold leading-none ${hasValue ? textPrimary : textTertiary}`}
                >
                  {stat.value.toLocaleString()}
                </p>
                <p
                  className={`text-[10px] font-medium mt-0.5 truncate ${textTertiary}`}
                >
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationStatsCards;
