import { useTranslation } from "react-i18next";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Users, Activity, Eye, Clock, Target } from "lucide-react";
import clsx from "clsx";

import { InfoTooltip } from "@/components/shared";
import { normalizeTime } from "@/helpers/formatter";
import { useGetGoogleAnalyticsViewsQuery } from "@/store/api/analyticsApi";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useAppSelector } from "@/hooks/hooks";

const COLORS = {
  blue: {
    gradient: "from-blue-400 via-blue-500 to-blue-600",
    shadow: "shadow-blue-500/50 hover:shadow-blue-500/70",
    bgGradient:
      "from-blue-100 via-blue-200 to-blue-300 dark:from-blue-900/40 dark:via-blue-800/50 dark:to-blue-700/60",
    stroke: "#3b82f6",
  },
  purple: {
    gradient: "from-purple-400 via-purple-500 to-purple-600",
    shadow: "shadow-purple-500/50 hover:shadow-purple-500/70",
    bgGradient:
      "from-purple-100 via-purple-200 to-purple-300 dark:from-purple-900/40 dark:via-purple-800/50 dark:to-purple-700/60",
    stroke: "#8b5cf6",
  },
  amber: {
    gradient: "from-amber-400 via-amber-500 to-amber-600",
    shadow: "shadow-amber-500/50 hover:shadow-amber-500/70",
    bgGradient:
      "from-amber-100 via-amber-200 to-amber-300 dark:from-amber-900/40 dark:via-amber-800/50 dark:to-amber-700/60",
    stroke: "#f59e0b",
  },
  red: {
    gradient: "from-red-400 via-red-500 to-red-600",
    shadow: "shadow-red-500/50 hover:shadow-red-500/70",
    bgGradient:
      "from-red-100 via-red-200 to-red-300 dark:from-red-900/40 dark:via-red-800/50 dark:to-red-700/60",
    stroke: "#ef4444",
  },
  emerald: {
    gradient: "from-emerald-400 via-emerald-500 to-emerald-600",
    shadow: "shadow-emerald-500/50 hover:shadow-emerald-500/70",
    bgGradient:
      "from-emerald-100 via-emerald-200 to-emerald-300 dark:from-emerald-900/40 dark:via-emerald-800/50 dark:to-emerald-700/60",
    stroke: "#10b981",
  },
  pink: {
    gradient: "from-pink-400 via-pink-500 to-pink-600",
    shadow: "shadow-pink-500/50 hover:shadow-pink-500/70",
    bgGradient:
      "from-pink-100 via-pink-200 to-pink-300 dark:from-pink-900/40 dark:via-pink-800/50 dark:to-pink-700/60",
    stroke: "#ec4899",
  },
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
      averageSessionDuration: {
        total: 0,
        sparklineData: [] as number[],
      },
    },
  );
};

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  sparklineData: number[];
  color: keyof typeof COLORS;
}

function KPICard({ title, value, icon, sparklineData, color }: KPICardProps) {
  const { isDark } = useThemeClasses();
  const chartData = sparklineData?.map((value, index) => ({ value, index }));
  const colorConfig = COLORS[color];

  return (
    <div
      className={clsx(
        "rounded-xl border-2 p-6 hover:shadow-2xl transition-all relative overflow-hidden group",
        isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
      )}
    >
      {/* Background gradient */}
      <div
        className={clsx(
          "absolute inset-0 pointer-events-none opacity-20",
          isDark
            ? colorConfig.bgGradient.replace("dark:", "")
            : colorConfig.bgGradient.split(" dark:")[0],
        )}
      />
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-white/10 to-transparent pointer-events-none"></div>
      <div
        className="absolute -bottom-1 left-0 right-0 h-2 rounded-b-xl"
        style={{
          backgroundColor: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)",
        }}
      ></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className={clsx(
              "p-2.5 rounded-lg transition-all transform hover:scale-110 border-2 text-white [&>svg]:drop-shadow-lg",
              colorConfig.gradient,
              colorConfig.shadow,
            )}
          >
            {icon}
          </div>
        </div>
        <p
          className={clsx(
            "mb-2 font-medium text-sm",
            isDark ? "text-gray-400" : "text-gray-600",
          )}
        >
          {title}
        </p>
        <p
          className={clsx(
            "mb-4 font-semibold text-lg",
            isDark ? "text-white" : "text-gray-900",
          )}
        >
          {value}
        </p>

        <div className="h-12 min-h-12">
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
                strokeWidth={3}
                dot={false}
                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default function GAOverview() {
  const { t } = useTranslation("dashboard");
  const { isDark } = useThemeClasses();

  const { dmoId, authorityId, websiteId, startDate, endDate } = useAppSelector(
    (state) => state.auth,
  );

  // API call with dynamic dates
  const { data } = useGetGoogleAnalyticsViewsQuery({
    startDate,
    endDate,
    dmoId,
    authorityId,
    externalApiId: websiteId,
  });

  const result = transformAnalyticsData(data);

  const kpis: KPICardProps[] = [
    {
      title: t("users"),
      value: result?.activeUsers?.total?.toString(),
      icon: (
        <Users
          className={clsx(
            "w-5 h-5",
            isDark ? "text-teal-400" : "text-teal-600",
          )}
        />
      ),
      sparklineData: result?.activeUsers?.sparklineData,
      color: "blue",
    },
    {
      title: t("sessions"),
      value: result?.sessions.total.toString(),
      icon: (
        <Activity
          className={clsx(
            "w-5 h-5",
            isDark ? "text-teal-400" : "text-teal-600",
          )}
        />
      ),
      sparklineData: result?.sessions.sparklineData,
      color: "purple",
    },
    {
      title: t("page_views"),
      value: result?.pageviews?.total?.toString(),
      icon: (
        <Eye
          className={clsx(
            "w-5 h-5",
            isDark ? "text-teal-400" : "text-teal-600",
          )}
        />
      ),
      sparklineData: result?.pageviews?.sparklineData,
      color: "amber",
    },
    {
      title: t("avg_duration"),
      value: normalizeTime(
        result?.averageSessionDuration?.total / data?.length,
      ),
      icon: (
        <Clock
          className={clsx(
            "w-5 h-5",
            isDark ? "text-teal-400" : "text-teal-600",
          )}
        />
      ),
      sparklineData: result?.averageSessionDuration?.sparklineData,
      color: "red",
    },
    {
      title: t("conversions"),
      value: result?.conversions?.total?.toString(),
      icon: (
        <Target
          className={clsx(
            "w-5 h-5",
            isDark ? "text-teal-400" : "text-teal-600",
          )}
        />
      ),
      sparklineData: result?.conversions?.sparklineData,
      color: "emerald",
    },
  ];

  return (
    <section>
      <div
        className={clsx(
          "rounded-2xl border p-6 sm:p-8",
          isDark
            ? "bg-teal-950/30 to-blue-950/30 border-gray-800"
            : "bg-linear-to-br from-teal-50 to-blue-50 border-gray-200",
        )}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <h2
                className={clsx(
                  "mb-1 font-semibold",
                  isDark ? "text-white" : "text-gray-900",
                )}
              >
                {t("google_analytics_overview")}
              </h2>
              <p
                className={clsx(
                  "text-sm",
                  isDark ? "text-gray-400" : "text-gray-600",
                )}
              >
                Key performance metrics and trends
              </p>
            </div>
            <InfoTooltip
              content={t("google_analytics_overview_desc")}
              title={t("google_analytics_overview")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {kpis.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>
      </div>
    </section>
  );
}
