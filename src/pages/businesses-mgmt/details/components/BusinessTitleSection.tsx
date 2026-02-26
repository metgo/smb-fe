import { TrendingUp } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
interface BusinessTitleSectionProps {
  business: Business;
  t: (key: string) => string;
}

const BusinessTitleSection = ({ business, t }: BusinessTitleSectionProps) => {
  const { isDark } = useThemeClasses();

  return (
    <div className="flex flex-col gap-6">
      {/* Title Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1
            className={`text-3xl mb-2 ${
              isDark ? "text-gray-100" : "text-gray-900"
            }`}
          >
            {business?.nameHe || business?.name || business?.nameAr}
          </h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                {t("impact_score")}: {business?.impact?.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Completion Percentage */}
        <div className="flex flex-col items-end">
          <span
            className={`text-sm mb-1 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {t("completion_percentage")}
          </span>

          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-600 transition-all duration-300"
                style={{ width: `${business?.completionPercent}%` }}
              />
            </div>
            <span
              className={`text-sm ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {business?.completionPercent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessTitleSection;
