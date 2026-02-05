import { useSearchParams } from "react-router-dom";
import { TrendingUp, Users, Eye, Timer, Activity } from "lucide-react";

import { useGetIndividualBusinessStatsQuery } from "@/store/api/businessQueryApi";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface BusinessTitleSectionProps {
  business: Business;
  t: (key: string) => string;
}

const BusinessTitleSection = ({ business, t }: BusinessTitleSectionProps) => {
  const { isDark } = useThemeClasses();

  const [searchParams] = useSearchParams();
  const businessId = searchParams.get("businessId");

  const { data: businessStatIndividual } = useGetIndividualBusinessStatsQuery(
    { businessId },
    { skip: !businessId },
  );

  const businessStatsConfig = [
    {
      key: "pageViews",
      title: t("page_views"),
      icon: Eye,
    },
    {
      key: "activeUsers",
      title: t("active_users"),
      icon: Users,
    },
    {
      key: "viewsPerUser",
      title: t("views_per_user"),
      icon: Eye,
    },
    {
      key: "averageEngagementTime",
      title: t("avg_engagement_time"),
      icon: Timer,
    },
    {
      key: "eventCount",
      title: t("events"),
      icon: Activity,
    },
  ] as const;

  const StatusBadge = ({ status }: { status: Business["status"] }) => {
    const statusConfig = {
      DRAFT: { color: "bg-gray-500", label: t("draft") },
      PENDING: { color: "bg-yellow-500", label: t("pending") },
      APPROVED: { color: "bg-green-500", label: t("approved") },
      REJECTED: { color: "bg-red-500", label: t("rejected") },
      ARCHIVED: { color: "bg-gray-400", label: t("archived") },
    };

    const config =
      statusConfig[status?.toUpperCase() as keyof typeof statusConfig];

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm text-white ${config?.color}`}
      >
        {config?.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1
            className={`text-3xl mb-2 ${
              isDark ? "text-gray-100" : "text-gray-900"
            }`}
          >
            {business?.name}
          </h1>

          <div className="flex items-center gap-4">
            <StatusBadge status={business?.status} />
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                {t("impact_score")}: {business?.impact?.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Completion Percentage */}
        <div className="flex flex-col items-end">
          <span
            className={`text-sm mb-1 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {t("completion_percentage")}
          </span>

          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-600 transition-all duration-300"
                style={{ width: `${business?.completionPercent}%` }}
              />
            </div>
            <span
              className={`text-sm ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {business?.completionPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        {businessStatsConfig.map((item) => {
          const Icon = item.icon;
          const value = businessStatIndividual?.[item.key] ?? "-";

          return (
            <div
              key={item.key}
              className={`p-4 rounded-xl border ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-gray-100 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-5 h-5 text-teal-600" />
                <p
                  className={`text-md ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {item.title}
                </p>
              </div>

              <p
                className={`text-2xl font-semibold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BusinessTitleSection;
