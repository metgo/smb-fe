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
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { InfoTooltip, Spinner } from "@/components/shared";
import { itemStatuses } from "@/lib/utils";

const getColors = (isDark: boolean) => ({
  sleep: {
    base: "#3b82f6",
    gradient: "from-blue-400 via-blue-500 to-blue-600",
    shadow: "shadow-blue-500/30",
    glow: "hover:shadow-blue-500/50",
    bgGradient: isDark
      ? "from-blue-900/40 via-blue-800/50 to-blue-700/60"
      : "from-blue-100 via-blue-200 to-blue-300",
    topGradient: isDark
      ? "from-blue-600 to-blue-700"
      : "from-blue-300 to-blue-400",
    sideGradient: isDark
      ? "from-blue-700/80 to-blue-800/80"
      : "from-blue-400/80 to-blue-500/80",
  },
  attraction: {
    base: "#f59e0b",
    gradient: "from-amber-400 via-amber-500 to-amber-600",
    shadow: "shadow-amber-500/30",
    glow: "hover:shadow-amber-500/50",
    bgGradient: isDark
      ? "from-amber-900/40 via-amber-800/50 to-amber-700/60"
      : "from-amber-100 via-amber-200 to-amber-300",
    topGradient: isDark
      ? "from-amber-600 to-amber-700"
      : "from-amber-300 to-amber-400",
    sideGradient: isDark
      ? "from-amber-700/80 to-amber-800/80"
      : "from-amber-400/80 to-amber-500/80",
  },
  local: {
    base: "#10b981",
    gradient: "from-emerald-400 via-emerald-500 to-emerald-600",
    shadow: "shadow-emerald-500/30",
    glow: "hover:shadow-emerald-500/50",
    bgGradient: isDark
      ? "from-emerald-900/40 via-emerald-800/50 to-emerald-700/60"
      : "from-emerald-100 via-emerald-200 to-emerald-300",
    topGradient: isDark
      ? "from-emerald-600 to-emerald-700"
      : "from-emerald-300 to-emerald-400",
    sideGradient: isDark
      ? "from-emerald-700/80 to-emerald-800/80"
      : "from-emerald-400/80 to-emerald-500/80",
  },
  eat: {
    base: "#ef4444",
    gradient: "from-red-400 via-red-500 to-red-600",
    shadow: "shadow-red-500/30",
    glow: "hover:shadow-red-500/50",
    bgGradient: isDark
      ? "from-red-900/40 via-red-800/50 to-red-700/60"
      : "from-red-100 via-red-200 to-red-300",
    topGradient: isDark ? "from-red-600 to-red-700" : "from-red-300 to-red-400",
    sideGradient: isDark
      ? "from-red-700/80 to-red-800/80"
      : "from-red-400/80 to-red-500/80",
  },
  travel: {
    base: "#8b5cf6",
    gradient: "from-purple-400 via-purple-500 to-purple-600",
    shadow: "shadow-purple-500/30",
    glow: "hover:shadow-purple-500/50",
    bgGradient: isDark
      ? "from-purple-900/40 via-purple-800/50 to-purple-700/60"
      : "from-purple-100 via-purple-200 to-purple-300",
    topGradient: isDark
      ? "from-purple-600 to-purple-700"
      : "from-purple-300 to-purple-400",
    sideGradient: isDark
      ? "from-purple-700/80 to-purple-800/80"
      : "from-purple-400/80 to-purple-500/80",
  },
  culture: {
    base: "#ec4899",
    gradient: "from-pink-400 via-pink-500 to-pink-600",
    shadow: "shadow-pink-500/30",
    glow: "hover:shadow-pink-500/50",
    bgGradient: isDark
      ? "from-pink-900/40 via-pink-800/50 to-pink-700/60"
      : "from-pink-100 via-pink-200 to-pink-300",
    topGradient: isDark
      ? "from-pink-600 to-pink-700"
      : "from-pink-300 to-pink-400",
    sideGradient: isDark
      ? "from-pink-700/80 to-pink-800/80"
      : "from-pink-400/80 to-pink-500/80",
  },
});

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
  status: string;
  setStatus: (v: string) => void;
  isLoading: boolean;
  data: {
    _id?: string;
    name: string;
    count?: number;
    value: number;
    percentage: number;
  }[];
}

export function DistributionCard({
  title,
  icon,
  total,
  data,
  status,
  setStatus,
  isLoading,
}: DistributionCardProps) {
  const { t } = useTranslation("dashboard");
  const { t: tc } = useTranslation("common");

  const { isDark } = useThemeClasses();
  const COLORS = getColors(isDark);

  const [isAnimated, setIsAnimated] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Calculate the highest percentage to normalize bar heights
  const maxPercentage = Math.max(
    ...(data?.map((item) => item?.percentage) || [0]),
  );

  // Function to calculate normalized height (scaled to 100% based on max)
  const getNormalizedHeight = (percentage: number) => {
    if (maxPercentage === 0) return 0;
    return (percentage / maxPercentage) * 100;
  };

  // If data is undefined or empty, show empty state
  if (!data || data.length === 0) {
    return (
      <div
        className={clsx(
          "rounded-xl border p-3",
          isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
        )}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-linear-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg">
              {icon}
            </div>
            <div>
              <h3 className={isDark ? "text-white" : "text-gray-900"}>
                {title}
              </h3>
              <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                {tc("total")} 0
              </p>
            </div>
          </div>
        </div>
        <div className="h-80 flex items-center justify-center">
          <p className={isDark ? "text-gray-400" : "text-gray-500"}>
            {tc("no_data_available")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "rounded-xl border p-3 hover:shadow-lg transition-shadow relative",
        isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
      )}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-50">
          <Spinner isLoading={isLoading} />
        </div>
      )}

      {/* ===== Header ===== */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-linear-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg">
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
              {tc("total")} {total?.toLocaleString() || 0}
            </p>
          </div>
        </div>

        {/* ===== Status Select ===== */}
        <div className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={clsx(
              "appearance-none rounded-lg px-3 py-1.5 pr-8 text-sm border focus:outline-none",
              isDark
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-gray-50 border-gray-300 text-gray-900",
            )}
          >
            {itemStatuses?.map((s) => (
              <option key={s.value} value={s.value}>
                {tc(s.label)}
              </option>
            ))}
          </select>

          <ChevronDown
            className={clsx(
              "absolute top-1/2 right-2 -translate-y-1/2 w-3 h-3 pointer-events-none",
              isDark ? "text-gray-400" : "text-gray-500",
            )}
          />
        </div>
      </div>

      {/* ===== Chart ===== */}
      <div className="h-80 relative flex items-end justify-around gap-2 px-2 pb-12 pt-16">
        {/* Background */}
        <div
          className={clsx(
            "absolute inset-0 rounded-xl",
            isDark
              ? "bg-linear-to-br from-yellow-900/10 via-orange-900/10 to-pink-900/10"
              : "bg-linear-to-br from-yellow-50 via-orange-50 to-pink-50",
          )}
        />

        {/* Grid */}
        <div className="absolute inset-0 flex flex-col justify-between pb-12 pt-16 pointer-events-none">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={clsx(
                "border-t opacity-30",
                isDark ? "border-gray-700" : "border-gray-200",
              )}
            />
          ))}
        </div>

        {data?.map((item, index) => {
          const IconComponent =
            CATEGORY_ICONS[
              item?.name?.toLowerCase() as keyof typeof CATEGORY_ICONS
            ];

          // Skip if icon is not found
          if (!IconComponent) return null;

          const colorConfig =
            COLORS[item?.name?.toLowerCase() as keyof typeof COLORS];

          const isActive = activeIndex === index;

          // Get normalized height for visual display
          const normalizedHeight = getNormalizedHeight(item.percentage);

          return (
            <div
              key={index}
              className="relative flex-1 flex flex-col items-center justify-end cursor-pointer"
              style={{ height: "100%", minWidth: 40, maxWidth: 80 }}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {/* ===== BAR ===== */}
              <div
                className="absolute bottom-0 w-full"
                style={{
                  height: isAnimated ? `${normalizedHeight}%` : "0%",
                  transform: isActive
                    ? "translateY(-8px) scale(1.05)"
                    : "translateY(0) scale(1)",
                  transition: isAnimated
                    ? `height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${
                        index * 0.1
                      }s, transform 0.3s ease`
                    : "all 0.3s ease",
                }}
              >
                {/* Shadow */}
                <div className="absolute inset-0 bg-black/20 rounded-t-lg blur-sm translate-y-1" />

                {/* Side */}
                {colorConfig && (
                  <>
                    <div
                      className={clsx(
                        "absolute top-0 -right-1 w-3 h-full rounded-tr-lg bg-linear-to-b",
                        colorConfig?.sideGradient,
                      )}
                      style={{ transform: "skewY(-3deg)" }}
                    />

                    {/* Front */}
                    <div
                      className={clsx(
                        "absolute inset-0 border-2 border-b-0 rounded-t-xl backdrop-blur-sm bg-linear-to-b transition-all duration-300",
                        colorConfig?.bgGradient,
                        isActive
                          ? `${colorConfig?.shadow} shadow-2xl`
                          : colorConfig?.shadow,
                      )}
                    />

                    {/* Top cap */}
                    <div
                      className={clsx(
                        "absolute -top-1 left-0 right-1 h-3 rounded-t-lg border-2 bg-linear-to-r",
                        colorConfig?.topGradient,
                        isActive ? "shadow-xl" : "shadow-lg",
                      )}
                      style={{
                        transform: "perspective(100px) rotateX(45deg)",
                        transformOrigin: "bottom",
                      }}
                    />
                  </>
                )}

                {/* Value tooltip - shows actual count */}
                <div
                  className={clsx(
                    "absolute -top-20 left-1/2 -translate-x-1/2 transition-all",
                    isActive ? "opacity-100" : "opacity-0",
                  )}
                >
                  <div
                    className={clsx(
                      "px-2 py-1 rounded-lg text-white text-xs font-bold bg-linear-to-br",
                      colorConfig?.gradient,
                    )}
                  >
                    {item?.count || item?.value || 0}
                  </div>
                </div>

                {/* Icon */}
                <div
                  className={clsx(
                    "absolute -top-10 left-1/2 -translate-x-1/2 transition-all duration-300 z-10",
                    isActive ? "scale-125" : "scale-100",
                  )}
                >
                  <div
                    className={clsx(
                      "w-8 h-8 rounded-lg shadow-lg flex items-center justify-center bg-linear-to-br",
                      colorConfig?.gradient,
                      colorConfig?.shadow,
                    )}
                  >
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Percentage - shows actual percentage */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
                  <span
                    className={clsx(
                      "px-2 py-0.5 rounded-full text-xs font-bold shadow-md transition-all",
                      isDark
                        ? "bg-gray-900 text-white"
                        : "bg-white text-gray-900",
                      isActive ? "scale-110" : "scale-100",
                    )}
                  >
                    {item?.percentage}%
                  </span>
                </div>
              </div>

              {/* Label */}
              <div className="absolute -bottom-8 text-center z-30 overflow-clip w-16">
                <span
                  className={clsx(
                    "text-xs font-bold line-clamp-2",
                    isDark ? "text-gray-300" : "text-gray-700",
                  )}
                >
                  {t(item?.name?.toLocaleLowerCase())}
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
   Component
---------------------------------------- */
export default function DistributionCards() {
  const { t } = useTranslation("dashboard");
  const { isDark } = useThemeClasses();
  const { startDate, endDate, dmoId, authorityId } = useAppSelector(
    (state) => state.auth,
  );
  const [bzStatus, setBzStatus] = useState("APPROVED");
  const [productStatus, setProductStatus] = useState("active");
  const [poiStatus, setPoiStatus] = useState("APPROVED");

  /* ---------------- API Calls --------------- */
  const { data: businessData, isFetching: isBzStatsLoading } =
    useGetBusinessStatsQuery({
      startDate,
      endDate,
      dmoId,
      authorityId,
      status: bzStatus,
    });

  const { data: poiData, isFetching: isPoiStatsLoading } = useGetPOIStatsQuery({
    startDate,
    endDate,
    dmoId,
    authorityId,
    status: poiStatus,
  });

  const { data: productData, isFetching: isProductStatsLoading } =
    useGetProductStatsQuery({
      startDate,
      endDate,
      dmoId,
      authorityId,
      status: productStatus,
    });

  return (
    <section>
      <div className="flex items-start gap-2 mb-6">
        <h2
          className={clsx(
            "flex-1 text-xl font-semibold",
            isDark ? "text-white" : "text-gray-900",
          )}
        >
          {t("distribution_overview")}
        </h2>
        <InfoTooltip
          content={t("distribution_overview_desc")}
          title={t("distribution_overview")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <DistributionCard
          status={bzStatus}
          setStatus={setBzStatus}
          title={t("businesses")}
          icon={<Building2 className="w-5 h-5 text-white" />}
          total={businessData?.total}
          data={businessData?.byCategory}
          isLoading={isBzStatsLoading}
        />

        <DistributionCard
          status={productStatus}
          setStatus={setProductStatus}
          title={t("products")}
          icon={<Package className="w-5 h-5 text-white" />}
          total={productData?.total}
          data={productData?.byCategory}
          isLoading={isProductStatsLoading}
        />

        <DistributionCard
          status={poiStatus}
          setStatus={setPoiStatus}
          title={t("pois")}
          icon={<MapPin className="w-5 h-5 text-white" />}
          total={poiData?.total}
          data={poiData?.byCategory}
          isLoading={isPoiStatsLoading}
        />
      </div>
    </section>
  );
}
