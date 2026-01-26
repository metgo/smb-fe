import { InfoTooltip } from "@/components/shared";
import {
  ArrowRight,
  TrendingUp,
  Building2,
  Package,
  Monitor,
  Trophy,
  Award,
  Medal,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface ContentItemProps {
  rank: number;
  name: string;
  metric: string;
  change: number;
}

function ContentItem({ rank, name, metric, change }: ContentItemProps) {
  const isPositive = change >= 0;

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors px-2 -mx-2 rounded">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 dark:text-gray-400 min-w-[20px]">
          #{rank}
        </span>
        <span className="text-sm text-gray-900 dark:text-white">{name}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {metric}
        </span>
        <span
          className={`text-xs flex items-center gap-0.5 min-w-[50px] justify-end ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
        >
          <TrendingUp className={`w-3 h-3 ${!isPositive && "rotate-180"}`} />
          {Math.abs(change)}%
        </span>
      </div>
    </div>
  );
}

interface PodiumItemProps {
  rank: number;
  name: string;
  metric: string;
  change: number;
  height: string;
}

function PodiumItem({ rank, name, metric, change, height }: PodiumItemProps) {
  const isPositive = change >= 0;

  const getTrophyIcon = () => {
    if (rank === 1) return <Trophy className="w-10 h-10" />;
    if (rank === 2) return <Award className="w-8 h-8" />;
    return <Medal className="w-7 h-7" />;
  };

  const getTrophyColor = () => {
    if (rank === 1) return "text-yellow-500 dark:text-yellow-400";
    if (rank === 2) return "text-gray-400 dark:text-gray-300";
    return "text-amber-700 dark:text-amber-600";
  };

  const getPodiumColor = () => {
    if (rank === 1)
      return "from-yellow-100 via-yellow-200 to-yellow-300 dark:from-yellow-900/30 dark:via-yellow-800/40 dark:to-yellow-700/50 border-yellow-400 dark:border-yellow-600";
    if (rank === 2)
      return "from-gray-100 via-gray-200 to-gray-300 dark:from-gray-800/30 dark:via-gray-700/40 dark:to-gray-600/50 border-gray-400 dark:border-gray-500";
    return "from-orange-100 via-orange-200 to-orange-300 dark:from-orange-900/30 dark:via-orange-800/40 dark:to-orange-700/50 border-orange-400 dark:border-orange-600";
  };

  const getRankBadgeColor = () => {
    if (rank === 1)
      return "bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-yellow-500/50";
    if (rank === 2)
      return "bg-gradient-to-br from-gray-300 to-gray-500 shadow-gray-500/50";
    return "bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-500/50";
  };

  return (
    <div className="flex flex-col items-center">
      {/* Trophy Icon - Above podium */}
      <div
        className={`${getTrophyColor()} transform transition-transform hover:scale-110 mb-3`}
      >
        {getTrophyIcon()}
      </div>

      {/* Name Above Podium */}
      <div className="w-full mb-2 min-h-[48px] flex items-center justify-center px-1">
        <h4
          className={`font-medium text-center text-gray-900 dark:text-white leading-tight line-clamp-2 ${
            rank === 1 ? "text-base" : "text-sm"
          }`}
        >
          {name}
        </h4>
      </div>

      {/* Podium Block */}
      <div
        className={`w-full rounded-t-2xl bg-gradient-to-b ${getPodiumColor()} border-2 border-b-0 backdrop-blur-sm flex flex-col items-center justify-start pt-4 px-2 transition-all hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden shadow-[0_-8px_16px_rgba(0,0,0,0.15),0_-4px_8px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_8px_rgba(0,0,0,0.2)] hover:shadow-[0_-12px_24px_rgba(0,0,0,0.2),0_-6px_12px_rgba(0,0,0,0.15),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-2px_8px_rgba(0,0,0,0.25)]`}
        style={{ height }}
      >
        {/* Decorative shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none"></div>

        {/* 3D edge highlights */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-white/30 to-transparent pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-l from-white/30 to-transparent pointer-events-none"></div>

        {/* Rank Badge */}
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg relative z-10 ${getRankBadgeColor()}`}
        >
          {rank}
        </div>

        {/* Metric */}
        <div className="text-center mt-3 relative z-10">
          <p
            className={`font-bold text-gray-900 dark:text-white ${rank === 1 ? "text-xl" : rank === 2 ? "text-lg" : "text-base"}`}
          >
            {metric}
          </p>
          <span
            className={`text-xs flex items-center gap-0.5 justify-center mt-1 ${
              isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            <TrendingUp className={`w-3 h-3 ${!isPositive && "rotate-180"}`} />
            {Math.abs(change)}%
          </span>
        </div>
      </div>

      {/* Podium Base Line */}
      <div
        className={`w-full h-1 bg-gradient-to-r ${
          rank === 1
            ? "from-yellow-400 via-yellow-500 to-yellow-400"
            : rank === 2
              ? "from-gray-400 via-gray-500 to-gray-400"
              : "from-orange-400 via-orange-500 to-orange-400"
        }`}
      ></div>
    </div>
  );
}

interface PopularCardProps {
  title: string;
  icon: React.ReactNode;
  items: { rank: number; name: string; metric: string; change: number }[];
  metricLabel: string;
}

function PopularCard({ title, icon, items, metricLabel }: PopularCardProps) {
  const { t } = useTranslation("dashboard");

  // Top 3 for podium
  const topThree = items.slice(0, 3);
  // Remaining items
  const remaining = items.slice(3);

  // Reorder for podium display: 2nd, 1st, 3rd
  const podiumOrder = [topThree[1], topThree[0], topThree[2]];
  const podiumHeights = ["200px", "240px", "160px"]; // Heights for 2nd, 1st, 3rd

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {metricLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Podium Display */}
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-2 items-end">
          {podiumOrder.map(
            (item, index) =>
              item && (
                <PodiumItem
                  key={item.rank}
                  {...item}
                  height={podiumHeights[index]}
                />
              ),
          )}
        </div>
      </div>

      {/* Remaining Items */}
      {remaining.length > 0 && (
        <div className="space-y-0 pt-4 border-t border-gray-200 dark:border-gray-800">
          {remaining.map((item) => (
            <ContentItem key={item.rank} {...item} />
          ))}
        </div>
      )}

      <button className="w-full mt-4 py-2 text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center justify-center gap-1 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
        {t("view_all")}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function PopularContent() {
  const { t } = useTranslation("dashboard");

  const popularBusinesses = [
    {
      rank: 1,
      name: "Ramon Crater Visitor Center",
      metric: "48,392",
      change: 15.3,
    },
    { rank: 2, name: "Sderot Sapir College", metric: "42,847", change: 12.7 },
    { rank: 3, name: "Eshkol National Park", metric: "38,234", change: 8.9 },
    {
      rank: 4,
      name: "Be'er Sheva Old City Market",
      metric: "34,567",
      change: 18.2,
    },
    { rank: 5, name: "Halutza Sand Dunes", metric: "32,891", change: 6.4 },
  ];

  const popularProducts = [
    {
      rank: 1,
      name: "Ramon Crater Jeep Tour",
      metric: "127,493",
      change: 22.8,
    },
    {
      rank: 2,
      name: "Negev Desert Stargazing",
      metric: "98,234",
      change: 19.4,
    },
    {
      rank: 3,
      name: "Be'er Sheva Heritage Walking Tour",
      metric: "87,392",
      change: 14.6,
    },
    {
      rank: 4,
      name: "Bedouin Hospitality Experience",
      metric: "76,847",
      change: 11.2,
    },
    {
      rank: 5,
      name: "Sde Boker Desert Winery Tour",
      metric: "68,234",
      change: 16.9,
    },
  ];

  const popularScreens = [
    {
      rank: 1,
      name: "/attractions/ramon-crater",
      metric: "892,394",
      change: 18.7,
    },
    {
      rank: 2,
      name: "/experiences/desert-adventures",
      metric: "734,283",
      change: 15.3,
    },
    {
      rank: 3,
      name: "/accommodations/negev-hospitality",
      metric: "623,847",
      change: 12.4,
    },
    {
      rank: 4,
      name: "/cultural/bedouin-heritage",
      metric: "547,293",
      change: 9.8,
    },
    {
      rank: 5,
      name: "/events/beersheva-festivals",
      metric: "489,234",
      change: 21.5,
    },
  ];

  return (
    <section>
      <div className="flex items-start gap-2 mb-6">
        <h2 className="text-gray-900 dark:text-white flex-1">
          Popular Content
        </h2>
        <InfoTooltip
          content={t("popular_content_desc")}
          title="Popular Content"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PopularCard
          title={t("popular_businesses")}
          icon={<Building2 className="w-5 h-5 text-white" />}
          items={popularBusinesses}
          metricLabel="Total views"
        />
        <PopularCard
          title={t("popular_products")}
          icon={<Package className="w-5 h-5 text-white" />}
          items={popularProducts}
          metricLabel="Total bookings"
        />
        <PopularCard
          title={t("popular_POIs")}
          icon={<Monitor className="w-5 h-5 text-white" />}
          items={popularScreens}
          metricLabel="Page views"
        />
      </div>
    </section>
  );
}
