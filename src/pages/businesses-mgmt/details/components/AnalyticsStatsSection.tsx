import {
  Eye,
  Users,
  MousePointer,
  Bookmark,
  Share2,
  Timer,
  TrendingUp,
} from "lucide-react";

interface AnalyticsStatsSectionProps {
  business: Business;
  theme: string;
  t: (key: string) => string;
}

const AnalyticsStatsSection = ({
  business,
  theme,
  t,
}: AnalyticsStatsSectionProps) => {
  const stats = [
    {
      icon: Eye,
      label: t("page_views"),
      value: business?.analytics?.pageViews.toLocaleString(),
    },
    {
      icon: Users,
      label: t("unique_visitors"),
      value: business?.analytics?.uniqueVisitors.toLocaleString(),
    },
    {
      icon: MousePointer,
      label: t("clicks"),
      value: business?.analytics?.clicks.toLocaleString(),
    },
    {
      icon: Bookmark,
      label: t("bookmarks"),
      value: business?.analytics?.bookmarks.toLocaleString(),
    },
    {
      icon: Share2,
      label: t("shares"),
      value: business?.analytics?.shares.toLocaleString(),
    },
    {
      icon: Timer,
      label: t("avg_time_on_page"),
      value: `${business?.analytics?.averageTimeOnPage}s`,
    },
    {
      icon: TrendingUp,
      label: t("conversion_rate"),
      value: `${business?.analytics?.conversionRate}%`,
    },
  ];

  return (
    <div className={`mt-4 ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${theme === "dark" ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3
                  className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                >
                  {stat.label}
                </h3>
              </div>
              <p
                className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyticsStatsSection;
