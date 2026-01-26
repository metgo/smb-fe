import clsx from "clsx";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Building2,
  ChevronDown,
  Bed,
  Compass,
  ShoppingBag,
  UtensilsCrossed,
  Plane,
  Landmark,
  MapPin,
  Package,
} from "lucide-react";

import { useAppSelector } from "@/hooks/hooks";
import {
  useGetBusinessStatsQuery,
  useGetPOIStatsQuery,
  useGetProductStatsQuery,
} from "@/store/api/itemStatsApi";
import { InfoTooltip } from "@/components/shared";

const COLORS = {
  sleep: {
    base: "#3b82f6",
    gradient: "from-blue-400 via-blue-500 to-blue-600",
    shadow: "shadow-blue-500/30",
    glow: "hover:shadow-blue-500/50",
    bgGradient:
      "from-blue-100 via-blue-200 to-blue-300 dark:from-blue-900/40 dark:via-blue-800/50 dark:to-blue-700/60",
    topGradient:
      "from-blue-300 to-blue-400 dark:from-blue-600 dark:to-blue-700",
    sideGradient:
      "from-blue-400/80 to-blue-500/80 dark:from-blue-700/80 dark:to-blue-800/80",
  },
  attraction: {
    base: "#f59e0b",
    gradient: "from-amber-400 via-amber-500 to-amber-600",
    shadow: "shadow-amber-500/30",
    glow: "hover:shadow-amber-500/50",
    bgGradient:
      "from-amber-100 via-amber-200 to-amber-300 dark:from-amber-900/40 dark:via-amber-800/50 dark:to-amber-700/60",
    topGradient:
      "from-amber-300 to-amber-400 dark:from-amber-600 dark:to-amber-700",
    sideGradient:
      "from-amber-400/80 to-amber-500/80 dark:from-amber-700/80 dark:to-amber-800/80",
  },
  local: {
    base: "#10b981",
    gradient: "from-emerald-400 via-emerald-500 to-emerald-600",
    shadow: "shadow-emerald-500/30",
    glow: "hover:shadow-emerald-500/50",
    bgGradient:
      "from-emerald-100 via-emerald-200 to-emerald-300 dark:from-emerald-900/40 dark:via-emerald-800/50 dark:to-emerald-700/60",
    topGradient:
      "from-emerald-300 to-emerald-400 dark:from-emerald-600 dark:to-emerald-700",
    sideGradient:
      "from-emerald-400/80 to-emerald-500/80 dark:from-emerald-700/80 dark:to-emerald-800/80",
  },
  eat: {
    base: "#ef4444",
    gradient: "from-red-400 via-red-500 to-red-600",
    shadow: "shadow-red-500/30",
    glow: "hover:shadow-red-500/50",
    bgGradient:
      "from-red-100 via-red-200 to-red-300 dark:from-red-900/40 dark:via-red-800/50 dark:to-red-700/60",
    topGradient: "from-red-300 to-red-400 dark:from-red-600 dark:to-red-700",
    sideGradient:
      "from-red-400/80 to-red-500/80 dark:from-red-700/80 dark:to-red-800/80",
  },
  travel: {
    base: "#8b5cf6",
    gradient: "from-purple-400 via-purple-500 to-purple-600",
    shadow: "shadow-purple-500/30",
    glow: "hover:shadow-purple-500/50",
    bgGradient:
      "from-purple-100 via-purple-200 to-purple-300 dark:from-purple-900/40 dark:via-purple-800/50 dark:to-purple-700/60",
    topGradient:
      "from-purple-300 to-purple-400 dark:from-purple-600 dark:to-purple-700",
    sideGradient:
      "from-purple-400/80 to-purple-500/80 dark:from-purple-700/80 dark:to-purple-800/80",
  },
  culture: {
    base: "#ec4899",
    gradient: "from-pink-400 via-pink-500 to-pink-600",
    shadow: "shadow-pink-500/30",
    glow: "hover:shadow-pink-500/50",
    bgGradient:
      "from-pink-100 via-pink-200 to-pink-300 dark:from-pink-900/40 dark:via-pink-800/50 dark:to-pink-700/60",
    topGradient:
      "from-pink-300 to-pink-400 dark:from-pink-600 dark:to-pink-700",
    sideGradient:
      "from-pink-400/80 to-pink-500/80 dark:from-pink-700/80 dark:to-pink-800/80",
  },
};

const CATEGORY_ICONS = {
  sleep: Bed,
  attraction: Compass,
  local: ShoppingBag,
  eat: UtensilsCrossed,
  travel: Plane,
  culture: Landmark,
};

interface DistributionCardProps {
  title: string;
  icon: React.ReactNode;
  total: number;
  data: {
    _id?: string;
    name: string;
    count?: number;
    value: number;
    percentage: number;
  }[];
}

const statuses = [
  { value: "active", label: "Active" },
  { value: "approved", label: "Approved" },
  { value: "draft", label: "Draft" },
];

const getCategoryName = (name: string, t: (v: string) => string) => {
  switch (name) {
    case "sleep":
      return t("sleep");
    case "eat":
      return t("eat");
    case "attraction":
      return t("attraction");
    case "local":
      return t("local");
    case "travel":
      return t("travel");
    case "culture":
      return t("culture");
    default:
      return name;
  }
};

function DistributionCard({ title, icon, total, data }: DistributionCardProps) {
  const { t } = useTranslation("dashboard");
  const [status, setStatus] = useState("active");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isAnimated, setIsAnimated] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-linear-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-shadow">
            {icon}
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total: {total}
            </p>
          </div>
        </div>
        <div className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 pr-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {statuses?.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute top-1/2 ltr:right-2 rtl:left-2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* 3D Column Chart */}
      <div className="h-80 min-h-80 relative flex items-end justify-around gap-2 px-4 pb-12 pt-16">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-linear-to-br from-yellow-50 via-orange-50 to-pink-50 dark:from-yellow-900/10 dark:via-orange-900/10 dark:to-pink-900/10 rounded-xl opacity-50"></div>

        {/* Grid lines for reference */}
        <div className="absolute inset-x-0 bottom-0 h-full flex flex-col justify-between pb-12 pt-16 px-4 pointer-events-none">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="border-t border-gray-200 dark:border-gray-700 opacity-30"
            ></div>
          ))}
        </div>

        {data?.map((item, index) => {
          const Icon =
            CATEGORY_ICONS[
              item?.name?.toLowerCase() as keyof typeof CATEGORY_ICONS
            ];
          const colorConfig = COLORS[item?._id as keyof typeof COLORS];
          const isActive = activeIndex === index;

          return (
            <div
              key={index}
              className="relative flex-1 flex flex-col items-center justify-end group cursor-pointer"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              style={{
                height: "100%",
                minWidth: "40px",
                maxWidth: "80px",
              }}
            >
              {/* Value label above bar */}
              <div
                className={`absolute -top-20 left-1/2 -translate-x-1/2 transition-all duration-300 ${
                  isActive ? "opacity-100 -translate-y-1" : "opacity-0"
                }`}
              >
                <div
                  className={`px-2 py-1 rounded-lg bg-linear-to-br ${colorConfig?.gradient} text-white text-xs font-bold shadow-lg whitespace-nowrap`}
                >
                  {item?.count}
                </div>
              </div>

              {/* 3D Column */}
              <div
                className="relative w-full ease-out"
                style={{
                  height: isAnimated ? item.percentage : "0%",
                  transform: isActive
                    ? "translateY(-8px) scale(1.05)"
                    : "translateY(0) scale(1)",
                  transition: isAnimated
                    ? `all 0.3s ease-out, height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s`
                    : "all 0.3s ease-out",
                }}
              >
                {/* Shadow */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-full bg-black/20 rounded-t-lg blur-sm transform translate-y-1"
                  style={{ zIndex: 0 }}
                ></div>

                {/* Side panel (right) - for 3D effect */}
                <div
                  className={`absolute top-0 -right-1 w-3 h-full bg-linear-to-b ${colorConfig?.sideGradient} rounded-tr-lg`}
                  style={{
                    transform: "skewY(-3deg)",
                    transformOrigin: "top left",
                    zIndex: 1,
                  }}
                />

                {/* Main front face */}
                <div
                  className={`absolute inset-0 bg-linear-to-b ${colorConfig?.bgGradient} border-2 border-b-0 rounded-t-xl backdrop-blur-sm transition-all duration-300 ${
                    isActive
                      ? `${colorConfig?.shadow} shadow-2xl`
                      : colorConfig?.shadow
                  }`}
                  style={{ zIndex: 2 }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-linear-to-t from-white/10 to-transparent rounded-t-xl"></div>
                </div>

                {/* Top cap - 3D lid */}
                <div
                  className={`absolute -top-1 left-0 right-1 h-3 bg-linear-to-r ${colorConfig?.topGradient} rounded-t-lg border-2 ${
                    isActive ? "shadow-xl" : "shadow-lg"
                  }`}
                  style={{
                    transform: "perspective(100px) rotateX(45deg)",
                    transformOrigin: "bottom",
                    zIndex: 3,
                  }}
                />

                {/* Icon on bar */}
                <div
                  className={`absolute -top-10 left-1/2 -translate-x-1/2 transition-all duration-300 z-10 ${
                    isActive ? "scale-125" : "scale-100"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg bg-linear-to-br ${colorConfig?.gradient} shadow-lg ${colorConfig?.shadow} flex items-center justify-center`}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Percentage badge */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md transition-all ${
                      isActive ? "scale-110" : "scale-100"
                    }`}
                  >
                    {item?.percentage}%
                  </span>
                </div>
              </div>

              {/* Category label below */}
              <div className="mt-2 text-center min-h-8 flex items-center justify-center px-1">
                <span
                  className={`text-xs text-gray-700 dark:text-gray-300 leading-tight line-clamp-2 transition-all ${
                    isActive ? "font-bold" : "font-medium"
                  }`}
                >
                  {getCategoryName(item?.name, t)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------------------
   Types
---------------------------------------- */

/* ----------------------------------------
   Component
---------------------------------------- */
export default function DistributionCards() {
  const { t } = useTranslation("dashboard");
  const { theme } = useAppSelector((state) => state.settings);

  /* ----------------------------------------
     API Calls
  ---------------------------------------- */
  const { data: businessData } = useGetBusinessStatsQuery({
    startDate: "2025-01-01",
    endDate: "2025-01-31",
    dmoId: "",
    authorityId: "",
  });

  const { data: poiData } = useGetPOIStatsQuery({
    startDate: "2025-01-01",
    endDate: "2025-01-31",
    dmoId: "",
    authorityId: "",
  });

  const { data: productData } = useGetProductStatsQuery({
    startDate: "2025-01-01",
    endDate: "2025-01-31",
    dmoId: "",
    authorityId: "",
  });

  /* ----------------------------------------
     Effects
  ---------------------------------------- */
  useEffect(() => {
    if (!businessData?.datas) return;
  }, [businessData]);

  useEffect(() => {
    if (!poiData?.datas) return;
  }, [poiData]);

  /* ----------------------------------------
     Render
  ---------------------------------------- */
  return (
    <section>
      <div className="flex items-start gap-2 mb-6">
        <h2
          className={clsx(
            " flex-1",
            theme === "dark" ? "text-white" : "text-gray-900",
          )}
        >
          {t("distribution_overview")}
        </h2>
        <InfoTooltip
          content={t("distribution_overview_desc")}
          title={t("distribution_overview")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DistributionCard
          title={t("businesses")}
          icon={<Building2 className="w-5 h-5 text-white" />}
          total={businessData?.total}
          data={businessData?.byCategory}
        />

        <DistributionCard
          title={t("products")}
          icon={<Package className="w-5 h-5 text-white" />}
          total={productData?.total}
          data={productData?.byCategory}
        />

        <DistributionCard
          title={t("pois")}
          icon={<MapPin className="w-5 h-5 text-white" />}
          total={poiData?.total}
          data={poiData?.byCategory}
        />
      </div>
    </section>
  );
}
