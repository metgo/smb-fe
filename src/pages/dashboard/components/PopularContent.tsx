import clsx from "clsx";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { InfoTooltip } from "@/components/shared";
import {
  useGetPopularBusinessStatsQuery,
  useGetPopularPoiStatsQuery,
  useGetPopularProductStatsQuery,
} from "@/store/api/itemStatsApi";
import {
  ArrowRight,
  Building2,
  Package,
  Monitor,
  Trophy,
  Award,
  Medal,
  ArrowLeft,
} from "lucide-react";
import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface PodiumItemProps {
  isDark: boolean;
  rank: number;
  name: string;
  metric: string;
  height: string;
}

function PodiumItem({ isDark, rank, name, metric, height }: PodiumItemProps) {
  const getTrophyIcon = () => {
    if (rank === 1) return <Trophy className="w-10 h-10" />;
    if (rank === 2) return <Award className="w-8 h-8" />;
    return <Medal className="w-7 h-7" />;
  };

  const getTrophyColor = () => {
    if (rank === 1) return isDark ? "text-yellow-400" : "text-yellow-500";
    if (rank === 2) return isDark ? "text-gray-300" : "text-gray-400";
    return isDark ? "text-amber-600" : "text-amber-700";
  };

  const getPodiumColor = () => {
    if (rank === 1)
      return clsx(
        "from-yellow-100 via-yellow-200 to-yellow-300 border-yellow-400",
        isDark &&
          "from-yellow-900/30 via-yellow-800/40 to-yellow-700/50 border-yellow-600",
      );

    if (rank === 2)
      return clsx(
        "from-gray-100 via-gray-200 to-gray-300 border-gray-400",
        isDark &&
          "from-gray-800/30 via-gray-700/40 to-gray-600/50 border-gray-500",
      );

    return clsx(
      "from-orange-100 via-orange-200 to-orange-300 border-orange-400",
      isDark &&
        "from-orange-900/30 via-orange-800/40 to-orange-700/50 border-orange-600",
    );
  };

  const getRankBadgeColor = () => {
    if (rank === 1)
      return "bg-linear-to-br from-yellow-400 to-yellow-600 shadow-yellow-500/50";
    if (rank === 2)
      return "bg-linear-to-br from-gray-300 to-gray-500 shadow-gray-500/50";
    return "bg-linear-to-br from-orange-400 to-orange-600 shadow-orange-500/50";
  };

  return (
    <div className="flex flex-col items-center">
      {/* Trophy */}
      <div
        className={clsx(
          "transform transition-transform hover:scale-110 mb-3",
          getTrophyColor(),
        )}
      >
        {getTrophyIcon()}
      </div>

      {/* Name */}
      <div className="w-full mb-2 min-h-12 flex items-center justify-center px-1">
        <h4
          className={clsx(
            "font-medium text-center leading-tight line-clamp-2",
            isDark ? "text-white" : "text-gray-900",
            rank === 1 ? "text-base" : "text-sm",
          )}
        >
          {name}
        </h4>
      </div>

      {/* Podium */}
      <div
        className={clsx(
          "w-full rounded-t-2xl bg-linear-to-b border-2 border-b-0 backdrop-blur-sm",
          "flex flex-col items-center justify-start pt-4 px-2 relative overflow-hidden transition-all",
          "hover:shadow-2xl hover:-translate-y-1",
          getPodiumColor(),
          "shadow-[0_-8px_16px_rgba(0,0,0,0.15),0_-4px_8px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_8px_rgba(0,0,0,0.2)]",
          "hover:shadow-[0_-12px_24px_rgba(0,0,0,0.2),0_-6px_12px_rgba(0,0,0,0.15),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-2px_8px_rgba(0,0,0,0.25)]",
        )}
        style={{ height }}
      >
        {/* Shimmer */}
        <div className="absolute inset-0 bg-linear-to-t from-white/10 to-transparent pointer-events-none" />

        {/* Edge highlights */}
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-b from-white/40 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-1 bg-linear-to-r from-white/30 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-1 bg-linear-to-l from-white/30 to-transparent pointer-events-none" />

        {/* Rank Badge */}
        <div
          className={clsx(
            "w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg relative z-10",
            getRankBadgeColor(),
          )}
        >
          {rank}
        </div>

        {/* Metric */}
        <div className="text-center mt-3 relative z-10">
          <p
            className={clsx(
              "font-bold",
              isDark ? "text-white" : "text-gray-900",
              rank === 1 ? "text-xl" : rank === 2 ? "text-lg" : "text-base",
            )}
          >
            {metric}
          </p>
        </div>
      </div>

      {/* Base line */}
      <div
        className={clsx(
          "w-full h-1 bg-linear-to-r",
          rank === 1
            ? "from-yellow-400 via-yellow-500 to-yellow-400"
            : rank === 2
              ? "from-gray-400 via-gray-500 to-gray-400"
              : "from-orange-400 via-orange-500 to-orange-400",
        )}
      />
    </div>
  );
}

interface PopularCardProps {
  title: string;
  icon: React.ReactNode;
  items: { rank: number; name: string; metric: string }[];
  metricLabel: string;
  navPath: string;
}

function PopularCard({
  title,
  icon,
  items,
  metricLabel,
  navPath,
}: PopularCardProps) {
  const { t } = useTranslation("dashboard");
  const { isDark, isRTL } = useThemeClasses();

  // Top 3 for podium
  const topThree = items?.slice(0, 3);

  // Reorder for podium display: 2nd, 1st, 3rd
  const podiumOrder = [topThree[1], topThree[0], topThree[2]];
  const podiumHeights = ["200px", "240px", "160px"]; // 2nd, 1st, 3rd

  return (
    <div
      className={clsx(
        "rounded-xl border p-6 hover:shadow-lg transition-shadow",
        isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-linear-to-br from-purple-500 to-pink-600 rounded-lg">
            {icon}
          </div>

          <div>
            <h3
              className={clsx(
                "font-semibold",
                isDark ? "text-white" : "text-gray-900",
              )}
            >
              {title}
            </h3>

            <p
              className={clsx(
                "text-sm",
                isDark ? "text-gray-400" : "text-gray-500",
              )}
            >
              {metricLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Podium */}
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-2 items-end">
          {podiumOrder.map(
            (item, index) =>
              item && (
                <PodiumItem
                  key={item.rank}
                  {...item}
                  height={podiumHeights[index]}
                  isDark={isDark}
                />
              ),
          )}
        </div>
      </div>

      {/* View all */}
      <Link
        to={navPath}
        className={clsx(
          "w-full mt-4 py-2 text-sm flex items-center justify-center gap-1 rounded-lg transition-colors",
          isDark
            ? "text-teal-400 hover:text-teal-300 hover:bg-gray-800/50"
            : "text-teal-600 hover:text-teal-700 hover:bg-gray-50",
        )}
      >
        {t("view_all")}
        {isRTL ? (
          <ArrowLeft className="w-4 h-4" />
        ) : (
          <ArrowRight className="w-4 h-4" />
        )}
      </Link>
    </div>
  );
}

export default function PopularContent() {
  const { t } = useTranslation("dashboard");
  const { isDark } = useThemeClasses();
  const { dmoId, authorityId } = useAppSelector((state) => state.auth);

  const { data: popularBusinessStats } = useGetPopularBusinessStatsQuery({
    dmoId,
    authorityId,
  });
  const { data: popularProductStats } = useGetPopularProductStatsQuery({
    dmoId,
    authorityId,
  });
  const { data: popularPoiStats } = useGetPopularPoiStatsQuery({
    dmoId,
    authorityId,
  });

  const popularBusinesses = [
    {
      rank: 1,
      name: popularBusinessStats?.[0]?.name,
      metric: popularBusinessStats?.[0]?.impact,
    },
    {
      rank: 2,
      name: popularBusinessStats?.[1]?.name,
      metric: popularBusinessStats?.[1]?.impact,
    },
    {
      rank: 3,
      name: popularBusinessStats?.[2]?.name,
      metric: popularBusinessStats?.[2]?.impact,
    },
  ];

  const popularProducts = [
    {
      rank: 1,
      name: popularProductStats?.[0]?.name,
      metric: popularProductStats?.[0]?.impact,
    },
    {
      rank: 2,
      name: popularProductStats?.[1]?.name,
      metric: popularProductStats?.[1]?.impact,
    },
    {
      rank: 3,
      name: popularProductStats?.[2]?.name,
      metric: popularProductStats?.[2]?.impact,
    },
  ];

  const popularPois = [
    {
      rank: 1,
      name: popularPoiStats?.[0]?.name,
      metric: popularPoiStats?.[0]?.impact,
    },
    {
      rank: 2,
      name: popularPoiStats?.[1]?.name,
      metric: popularPoiStats?.[1]?.impact,
    },
    {
      rank: 3,
      name: popularPoiStats?.[2]?.name,
      metric: popularPoiStats?.[2]?.impact,
    },
  ];

  return (
    <section>
      <div className="flex items-start gap-2 mb-6">
        <h2
          className={clsx(" flex-1", isDark ? "text-white" : "text-gray-900")}
        >
          {t("popular_content")}
        </h2>
        <InfoTooltip
          content={t("popular_content_desc")}
          title={t("popular_content")}
        />
      </div>
      <div className="overflow-x-auto pb-2 lg:overflow-x-visible lg:pb-0">
        <div className="grid grid-flow-col auto-cols-[280px] gap-6 lg:grid-flow-row lg:grid-cols-3 lg:auto-cols-auto">
          <PopularCard
            title={t("popular_businesses")}
            icon={<Building2 className="w-5 h-5 text-white" />}
            items={popularBusinesses}
            metricLabel={t("total_views")}
            navPath="/businesses-management"
          />
          <PopularCard
            title={t("popular_products")}
            icon={<Package className="w-5 h-5 text-white" />}
            items={popularProducts}
            metricLabel={t("total_purchases")}
            navPath="/products-management"
          />
          <PopularCard
            title={t("popular_pois")}
            icon={<Monitor className="w-5 h-5 text-white" />}
            items={popularPois}
            metricLabel={t("page_views")}
            navPath="/pois-management"
          />
        </div>
      </div>
    </section>
  );
}
