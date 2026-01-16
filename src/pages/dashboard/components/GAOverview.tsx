import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Users, Activity, Eye, Clock, Target, ChevronDown } from 'lucide-react';

import { useCommon } from '@/hooks/useCommon';
import { InfoTooltip } from '@/components/shared';
import { normalizeTime } from '@/helpers/formatter';
import { useGetGoogleAnalyticsViewsQuery } from '@/store/api/analyticsApi';

const COLORS = {
  blue: {
    gradient: 'from-blue-400 via-blue-500 to-blue-600',
    shadow: 'shadow-blue-500/50 hover:shadow-blue-500/70',
    bgGradient: 'from-blue-100 via-blue-200 to-blue-300 dark:from-blue-900/40 dark:via-blue-800/50 dark:to-blue-700/60',
    stroke: '#3b82f6'
  },
  purple: {
    gradient: 'from-purple-400 via-purple-500 to-purple-600',
    shadow: 'shadow-purple-500/50 hover:shadow-purple-500/70',
    bgGradient: 'from-purple-100 via-purple-200 to-purple-300 dark:from-purple-900/40 dark:via-purple-800/50 dark:to-purple-700/60',
    stroke: '#8b5cf6'
  },
  amber: {
    gradient: 'from-amber-400 via-amber-500 to-amber-600',
    shadow: 'shadow-amber-500/50 hover:shadow-amber-500/70',
    bgGradient: 'from-amber-100 via-amber-200 to-amber-300 dark:from-amber-900/40 dark:via-amber-800/50 dark:to-amber-700/60',
    stroke: '#f59e0b'
  },
  red: {
    gradient: 'from-red-400 via-red-500 to-red-600',
    shadow: 'shadow-red-500/50 hover:shadow-red-500/70',
    bgGradient: 'from-red-100 via-red-200 to-red-300 dark:from-red-900/40 dark:via-red-800/50 dark:to-red-700/60',
    stroke: '#ef4444'
  },
  emerald: {
    gradient: 'from-emerald-400 via-emerald-500 to-emerald-600',
    shadow: 'shadow-emerald-500/50 hover:shadow-emerald-500/70',
    bgGradient: 'from-emerald-100 via-emerald-200 to-emerald-300 dark:from-emerald-900/40 dark:via-emerald-800/50 dark:to-emerald-700/60',
    stroke: '#10b981'
  },
  pink: {
    gradient: 'from-pink-400 via-pink-500 to-pink-600',
    shadow: 'shadow-pink-500/50 hover:shadow-pink-500/70',
    bgGradient: 'from-pink-100 via-pink-200 to-pink-300 dark:from-pink-900/40 dark:via-pink-800/50 dark:to-pink-700/60',
    stroke: '#ec4899'
  }
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
        Number(curr.averageSessionDuration.toFixed(2))
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
        sparklineData: [] as number[]
      }
    }
  );
};


interface KPICardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  sparklineData: number[];
  color: keyof typeof COLORS;
}

function KPICard({ title, value, icon, sparklineData, color }: KPICardProps) {
  const chartData = sparklineData?.map((value, index) => ({ value, index }));
  const colorConfig = COLORS[color];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-800 p-6 hover:shadow-2xl transition-all relative overflow-hidden group">
      {/* 3D Background gradient - matching Distribution Overview */}
      <div className={`absolute inset-0 bg-linear-to-b ${colorConfig.bgGradient} opacity-20 dark:opacity-30 pointer-events-none`}></div>

      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-white/10 to-transparent dark:from-white/5 pointer-events-none"></div>

      {/* 3D bottom shadow */}
      <div className="absolute -bottom-1 left-0 right-0 h-2 bg-black/10 dark:bg-black/30 blur-sm rounded-b-xl"></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          {/* 3D Icon with Olympic-style gradient */}
          <div className={`p-2.5 bg-linear-to-br ${colorConfig.gradient} rounded-lg shadow-lg ${colorConfig.shadow} transition-all transform hover:scale-110 border-2 border-white/20 text-white [&>svg]:drop-shadow-lg`}>
            {icon}
          </div>
          {/* 3D Trend badge with gradient */}

        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">{title}</p>
        <p className="text-gray-900 dark:text-white mb-4">{value}</p>
        <div className="h-12 min-h-12">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={colorConfig.stroke}
                strokeWidth={3}
                dot={false}
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default function GAOverview() {
  const { t } = useTranslation('dashboard');
  const { t: ct } = useTranslation('common');

  const { dateRanges: timeframes, websites } = useCommon()
  const [timeframe, setTimeframe] = useState('last30days');
  const [selectedWebsite, setSelectedWebsite] = useState('all');

  const { data } = useGetGoogleAnalyticsViewsQuery({
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    dmoId: '',
    authorityId: '',
    externalApiId: '',
  });
  const result = transformAnalyticsData(data);

  const kpis: KPICardProps[] = [
    {
      title: t('users'),
      value: result?.activeUsers?.total?.toString(),
      change: 12.5,
      icon: <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
      sparklineData: result?.activeUsers?.sparklineData,
      color: 'blue'
    },
    {
      title: t('sessions'),
      value: result?.sessions.total.toString(),
      change: 8.3,
      icon: <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
      sparklineData: result?.sessions.sparklineData,
      color: 'purple'
    },
    {
      title: t('page_views'),
      value: result?.pageviews?.total?.toString(),
      change: 15.2,
      icon: <Eye className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
      sparklineData: result?.pageviews?.sparklineData,
      color: 'amber'
    },
    {
      title: t('avg_duration'),
      value: normalizeTime(result?.averageSessionDuration?.total / data?.length),
      change: 5.7,
      icon: <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
      sparklineData:result?.averageSessionDuration?.sparklineData,
      color: 'red'
    },
    {
      title: ct('conversions'),
      value: result?.conversions?.total?.toString(),
      change: 18.9,
      icon: <Target className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
      sparklineData: result?.conversions?.sparklineData,
      color: 'emerald'
    },
  ];

  return (
    <section>
      <div className="bg-linear-to-br from-teal-50 to-blue-50 dark:from-teal-950/30 dark:to-blue-950/30 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <h2 className="text-gray-900 dark:text-white mb-1">{t('google_analytics_overview')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Key performance metrics and trends</p>
            </div>
            <InfoTooltip
              content={t('google_analytics_overview_desc')}
              title={t('google_analytics_overview')}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                value={selectedWebsite}
                onChange={(e) => setSelectedWebsite(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 pr-10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {websites?.map((site) => (
                  <option key={site.value} value={site.value}>
                    {site.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute top-1/2 ltr:right-3 rtl:left-3 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 pr-10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {timeframes.map((tf) => (
                  <option key={tf.value} value={tf.value}>
                    {tf.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute top-1/2 ltr:right-3 rtl:left-3 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
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