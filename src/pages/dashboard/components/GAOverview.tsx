import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Users, Activity, Eye, Clock, Target } from "lucide-react";

import { useAppSelector } from "@/hooks/hooks";
import { InfoTooltip } from "@/components/shared";
import { normalizeTime } from "@/helpers/formatter";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetGoogleAnalyticsViewsQuery } from "@/store/api/analyticsApi";

const COLORS = {
  blue: { gradient: "from-blue-500 to-blue-600", stroke: "#3b82f6" },
  purple: { gradient: "from-purple-500 to-purple-600", stroke: "#8b5cf6" },
  amber: { gradient: "from-amber-500 to-amber-600", stroke: "#f59e0b" },
  red: { gradient: "from-red-500 to-red-600", stroke: "#ef4444" },
  emerald: { gradient: "from-emerald-500 to-emerald-600", stroke: "#10b981" },
};

type AnalyticsItem = {
  date: string;
  activeUsers: number;
  sessions: number;
  pageviews: number;
  averageSessionDuration: number;
  conversions: number;
};

const transformAnalyticsData = (data: AnalyticsItem[]) => {
  if (!data || data.length === 0) {
    return {
      activeUsers: { total: 0, sparklineData: [] as number[] },
      pageviews: { total: 0, sparklineData: [] as number[] },
      sessions: { total: 0, sparklineData: [] as number[] },
      conversions: { total: 0, sparklineData: [] as number[] },
      averageSessionDuration: { total: 0, sparklineData: [] as number[] },
    };
  }

  return data?.reduce(
    (acc, curr) => {
      acc.activeUsers.total += curr.activeUsers;
      acc.activeUsers.sparklineData.push(curr.activeUsers);

      acc.pageviews.total += curr.pageviews;
      acc.pageviews.sparklineData.push(curr.pageviews);

      acc.sessions.total += curr.sessions;
      acc.sessions.sparklineData.push(curr.sessions);

      acc.conversions.total += curr.conversions;
      acc.conversions.sparklineData.push(curr.conversions);

      acc.averageSessionDuration.total += curr.averageSessionDuration;
      acc.averageSessionDuration.sparklineData.push(
        Number(curr.averageSessionDuration.toFixed(2)),
      );

      return acc;
    },
    {
      activeUsers: { total: 0, sparklineData: [] as number[] },
      pageviews: { total: 0, sparklineData: [] as number[] },
      sessions: { total: 0, sparklineData: [] as number[] },
      conversions: { total: 0, sparklineData: [] as number[] },
      averageSessionDuration: { total: 0, sparklineData: [] as number[] },
    },
  );
};

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  sparklineData: number[];
  color: keyof typeof COLORS;
  isLoading?: boolean;
}

function KPICard({
  title,
  value,
  icon,
  sparklineData,
  color,
  isLoading = false,
}: KPICardProps) {
  const { isDark } = useThemeClasses();
  const chartData = sparklineData?.map((v, index) => ({ value: v, index }));
  const colorConfig = COLORS[color];

  // Skeleton loader for sparkline
  const SkeletonSparkline = () => (
    <div className="h-10 w-full flex items-center justify-center">
      <div className="flex items-end gap-0.5 h-8 w-full">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={clsx(
              "flex-1 rounded-sm animate-pulse",
              isDark ? "bg-gray-700" : "bg-gray-200",
            )}
            style={{
              height: `${Math.random() * 80 + 20}%`,
              animationDelay: `${i * 0.05}s`,
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div
      className={clsx(
        "rounded-lg border p-4 transition-shadow hover:shadow-md",
        isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
        isLoading && "animate-pulse",
      )}
    >
      <div className="flex items-start gap-4 mb-1">
        <div
          className={clsx(
            "p-2 rounded-md bg-linear-to-br text-white",
            colorConfig.gradient,
            isLoading && "opacity-50",
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={clsx(
              "text-xs font-medium mb-0.5 truncate",
              isDark ? "text-gray-400" : "text-gray-500",
            )}
          >
            {title}
          </p>
          {isLoading ? (
            <div className="h-8 flex items-center">
              <div
                className={clsx(
                  "h-6 w-24 rounded animate-pulse",
                  isDark ? "bg-gray-700" : "bg-gray-200",
                )}
              />
            </div>
          ) : (
            <p
              className={clsx(
                "text-xl font-bold mb-2 truncate",
                isDark ? "text-white" : "text-gray-900",
              )}
            >
              {value || "0"}
            </p>
          )}
        </div>
      </div>

      <div className="h-10">
        {isLoading ? (
          <SkeletonSparkline />
        ) : (
          chartData &&
          chartData.length > 0 && (
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={0}
            >
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={colorConfig.stroke}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )
        )}
      </div>
    </div>
  );
}

// Skeleton version of the entire component
function GAOverviewSkeleton() {
  const { isDark } = useThemeClasses();
  const { t } = useTranslation("dashboard");

  const skeletonKPIs = [
    { color: "blue" as const, icon: <Users className="w-4 h-4" /> },
    { color: "purple" as const, icon: <Activity className="w-4 h-4" /> },
    { color: "amber" as const, icon: <Eye className="w-4 h-4" /> },
    { color: "red" as const, icon: <Clock className="w-4 h-4" /> },
    { color: "emerald" as const, icon: <Target className="w-4 h-4" /> },
  ];

  return (
    <section>
      <div
        className={clsx(
          "rounded-xl border p-5",
          isDark
            ? "bg-gray-900/50 border-gray-800"
            : "bg-white border-gray-200",
        )}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 min-w-0">
            <h2
              className={clsx(
                "text-sm font-semibold",
                isDark ? "text-white" : "text-gray-900",
              )}
            >
              {t("google_analytics_overview")}
            </h2>
            <p
              className={clsx(
                "text-xs",
                isDark ? "text-gray-400" : "text-gray-500",
              )}
            >
              {t("ga_desc")}
            </p>
          </div>
          <InfoTooltip
            content={t("google_analytics_overview_desc")}
            title={t("google_analytics_overview")}
          />
        </div>

        <div className="overflow-x-auto pb-2 lg:overflow-x-visible lg:pb-0">
          <div className="grid grid-flow-col auto-cols-50 gap-3 lg:grid-flow-row lg:grid-cols-5 lg:auto-cols-auto">
            {skeletonKPIs.map((kpi, index) => (
              <KPICard
                key={index}
                title=""
                value=""
                icon={kpi.icon}
                sparklineData={[]}
                color={kpi.color}
                isLoading={true}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function GAOverview() {
  const { t } = useTranslation("dashboard");
  const { isDark } = useThemeClasses();

  const { dmoId, authorityId, websiteId, startDate, endDate } = useAppSelector(
    (state) => state.auth,
  );

  const { data, isLoading, isFetching } = useGetGoogleAnalyticsViewsQuery({
    startDate,
    endDate,
    dmoId,
    authorityId,
    externalApiId: websiteId,
  });

  // Show skeleton while loading
  if (isLoading || isFetching) {
    return <GAOverviewSkeleton />;
  }

  const result = transformAnalyticsData(data);

  const kpis: KPICardProps[] = [
    {
      title: t("users"),
      value: result?.activeUsers?.total?.toString() || "0",
      icon: <Users className="w-4 h-4" />,
      sparklineData: result?.activeUsers?.sparklineData || [],
      color: "blue",
    },
    {
      title: t("sessions"),
      value: result?.sessions?.total?.toString() || "0",
      icon: <Activity className="w-4 h-4" />,
      sparklineData: result?.sessions?.sparklineData || [],
      color: "purple",
    },
    {
      title: t("page_views"),
      value: result?.pageviews?.total?.toString() || "0",
      icon: <Eye className="w-4 h-4" />,
      sparklineData: result?.pageviews?.sparklineData || [],
      color: "amber",
    },
    {
      title: t("avg_duration"),
      value:
        data && data.length > 0
          ? normalizeTime(result?.averageSessionDuration?.total / data?.length)
          : "0:00",
      icon: <Clock className="w-4 h-4" />,
      sparklineData: result?.averageSessionDuration?.sparklineData || [],
      color: "red",
    },
    {
      title: t("conversions"),
      value: result?.conversions?.total?.toString() || "0",
      icon: <Target className="w-4 h-4" />,
      sparklineData: result?.conversions?.sparklineData || [],
      color: "emerald",
    },
  ];

  return (
    <section>
      <div
        className={clsx(
          "rounded-xl border p-5",
          isDark
            ? "bg-gray-900/50 border-gray-800"
            : "bg-white border-gray-200",
        )}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 min-w-0">
            <h2
              className={clsx(
                "text-sm font-semibold",
                isDark ? "text-white" : "text-gray-900",
              )}
            >
              {t("google_analytics_overview")}
            </h2>
            <p
              className={clsx(
                "text-xs",
                isDark ? "text-gray-400" : "text-gray-500",
              )}
            >
              {t("ga_desc")}
            </p>
          </div>
          <InfoTooltip
            content={t("google_analytics_overview_desc")}
            title={t("google_analytics_overview")}
          />
        </div>

        <div className="overflow-x-auto pb-2 lg:overflow-x-visible lg:pb-0">
          <div className="grid grid-flow-col auto-cols-50 gap-3 lg:grid-flow-row lg:grid-cols-5 lg:auto-cols-auto">
            {kpis.map((kpi, index) => (
              <KPICard key={index} {...kpi} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
