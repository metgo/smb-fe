import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
}: StatCardProps) => {
  const { isDark } = useThemeClasses();
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div
      className={`group relative p-6 rounded-2xl border transition-all duration-200 hover:shadow-lg ${
        isDark
          ? "bg-gray-800/50 border-gray-700 hover:border-gray-600"
          : "bg-white border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {title}
          </p>
          <p
            className={`text-3xl font-bold mt-2 tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {value.toLocaleString()}
          </p>
        </div>
        <div
          className={`p-3 rounded-xl transition-colors ${
            isDark
              ? "bg-gray-700/50 group-hover:bg-gray-700"
              : "bg-gray-100 group-hover:bg-gray-200"
          }`}
        >
          <Icon
            className={`w-6 h-6 ${isDark ? "text-teal-400" : "text-teal-600"}`}
          />
        </div>
      </div>
      {trend !== undefined && (
        <div
          className={`flex items-center mt-4 text-sm font-medium ${
            isPositive
              ? isDark
                ? "text-emerald-400"
                : "text-emerald-600"
              : isDark
                ? "text-red-400"
                : "text-red-600"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 mr-1" />
          )}
          <span>{Math.abs(trend)}%</span>
          <span
            className={`ml-1 font-normal ${isDark ? "text-gray-500" : "text-gray-400"}`}
          >
            {trendLabel || "from yesterday"}
          </span>
        </div>
      )}
    </div>
  );
};
