import { ChevronRight, Sparkles } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface Insights {
  totalChange: number;
  totalChangePercent: number;
  newBusinesses: number;
  statusChanges: any[];
  topGrowthDMO: string | null;
  topGrowthWebsite: string | null;
}

interface KeyInsightsProps {
  selectedItemType: string;
  grandTotal: number;
  insights?: Insights;
}

export const KeyInsights = ({
  selectedItemType,
  grandTotal,
  insights,
}: KeyInsightsProps) => {
  const { isDark } = useThemeClasses();

  const insightItems = [
    `Total ${selectedItemType} volume stands at ${grandTotal.toLocaleString()} across all tracked segments.`,
    insights?.totalChangePercent
      ? `Total change: ${insights.totalChangePercent}%`
      : "No change data available",
    insights?.newBusinesses
      ? `New businesses: ${insights.newBusinesses.toLocaleString()}`
      : "No new business data",
    insights?.topGrowthDMO
      ? `Top growing DMO: ${insights.topGrowthDMO}`
      : "No top DMO data",
    insights?.topGrowthWebsite
      ? `Top growing website: ${insights.topGrowthWebsite}`
      : "No top website data",
  ].filter(Boolean);

  return (
    <div
      className={`p-5 rounded-2xl border ${isDark ? "bg-indigo-900/10 border-indigo-500/20" : "bg-indigo-50 border-indigo-100"}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles
          className={`w-5 h-5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`}
        />
        <h3
          className={`font-semibold ${isDark ? "text-indigo-300" : "text-indigo-900"}`}
        >
          Key Insights
        </h3>
      </div>
      <ul className="space-y-2.5">
        {insightItems.map((insight: string, idx: number) => (
          <li key={idx} className="flex items-start gap-2.5">
            <ChevronRight
              className={`w-4 h-4 mt-0.5 shrink-0 ${isDark ? "text-indigo-400" : "text-indigo-500"}`}
            />
            <span
              className={`text-sm leading-relaxed ${isDark ? "text-indigo-200" : "text-indigo-800"}`}
            >
              {insight}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
