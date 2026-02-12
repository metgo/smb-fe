import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetIndividualBusinessStatsQuery } from "@/store/api/businessQueryApi";
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
  t: (key: string) => string;
  borderColor: string;
  businessId: string;
}

const AnalyticsStatsSection = ({
  t,
  borderColor,
  businessId,
}: AnalyticsStatsSectionProps) => {
  const { isDark } = useThemeClasses();
  const { data, isLoading } = useGetIndividualBusinessStatsQuery(
    { businessId },
    { skip: !businessId },
  );
  const stats = [
    {
      icon: Eye,
      label: t("page_views"),
      value: data?.pageViews?.toLocaleString() || 0,
    },
    {
      icon: Users,
      label: t("unique_visitors"),
      value: data?.uniqueVisitors?.toLocaleString() || 0,
    },
    {
      icon: MousePointer,
      label: t("clicks"),
      value: data?.clicks?.toLocaleString() || 0,
    },
    {
      icon: Bookmark,
      label: t("bookmarks"),
      value: data?.bookmarks?.toLocaleString() || 0,
    },
    {
      icon: Share2,
      label: t("shares"),
      value: data?.shares?.toLocaleString() || 0,
    },
    {
      icon: Timer,
      label: t("avg_time_on_page"),
      value: `${data?.averageEngagementTime}`,
    },
    {
      icon: TrendingUp,
      label: t("conversion_rate"),
      value: `${data?.conversionRate || 0}%`,
    },
  ];

  return (
    <div className={`mt-4`}>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {stats?.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`p-4 rounded-lg border ${borderColor}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  {stat.label}
                </h3>
              </div>
              <p
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
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
