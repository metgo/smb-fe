import { ChevronDown, ChevronRight, BarChart3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CopyableId } from "./CopyableId";

interface StatData {
  id?: string;
  name: string;
  total: number;
  prevTotal?: number;
  logo?: string;
  authorities?: Array<{
    id?: string;
    authority: string;
    total: number;
    prevTotal?: number;
    logo?: string;
  }>;
  status?: Array<{ name: string; total: number; prevTotal?: number }>;
}

interface DataSectionProps {
  title: string;
  data: StatData[];
  sectionId: string;
  isExpanded: boolean;
  isDark: boolean;
  total: number;
  icon?: LucideIcon;
  renderSubItems?: (item: StatData) => React.ReactNode;
  onToggle: (sectionId: string) => void;
}

export const DataSection = ({
  title,
  data,
  sectionId,
  isExpanded,
  isDark,
  total,
  icon: Icon,
  renderSubItems,
  onToggle,
}: DataSectionProps) => {
  if (!data || data.length === 0) return null;

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
        isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <button
        onClick={() => onToggle(sectionId)}
        className={`w-full p-5 flex items-center justify-between transition-colors ${
          isDark ? "hover:bg-gray-700/30" : "hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`p-2.5 rounded-xl ${isDark ? "bg-gray-700" : "bg-gray-100"}`}
          >
            {Icon ? (
              <Icon
                className={`w-5 h-5 ${isDark ? "text-gray-300" : "text-gray-600"}`}
              />
            ) : (
              <BarChart3
                className={`w-5 h-5 ${isDark ? "text-gray-300" : "text-gray-600"}`}
              />
            )}
          </div>
          <div className="text-left">
            <h3
              className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {title}
            </h3>
            <p
              className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {data.length} categories
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
              isDark
                ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                : "bg-teal-50 text-teal-700 border border-teal-200"
            }`}
          >
            {total.toLocaleString()}
          </span>
          {isExpanded ? (
            <ChevronDown
              className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            />
          ) : (
            <ChevronRight
              className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            />
          )}
        </div>
      </button>

      {isExpanded && (
        <div
          className={`p-5 pt-0 border-t ${isDark ? "border-gray-700" : "border-gray-100"}`}
        >
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {data.map((item: StatData, index: number) => {
              const percentage =
                total > 0 ? ((item.total / total) * 100).toFixed(1) : 0;

              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl border ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {item.logo && (
                      <img
                        src={item.logo}
                        alt={item.name}
                        className="w-10 h-10 rounded object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`font-semibold text-sm truncate ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          {item.name === "null" ? "Unassigned" : item.name}
                        </h4>
                        {item.id && <CopyableId id={item.id} />}
                      </div>
                      <p
                        className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {percentage}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <div
                      className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      {item.total.toLocaleString()}
                    </div>
                    {item.prevTotal != null &&
                      item.prevTotal !== item.total && (
                        <span
                          className={`text-xs font-medium ${
                            item.total > item.prevTotal
                              ? isDark
                                ? "text-emerald-400"
                                : "text-emerald-600"
                              : isDark
                                ? "text-red-400"
                                : "text-red-600"
                          }`}
                        >
                          {item.total > item.prevTotal ? "↑" : "↓"}{" "}
                          {item.prevTotal.toLocaleString()}
                        </span>
                      )}
                  </div>

                  {/* Sub Items */}
                  {renderSubItems && (
                    <div className="mt-3 space-y-2">{renderSubItems(item)}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
