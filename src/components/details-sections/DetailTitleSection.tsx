import clsx from "clsx";
import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { getLngWiseStr } from "@/helpers";
import { formatDateTime } from "@/helpers/formatter";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ImageWithFallback } from "@/components/shared";

interface DetailTitleSectionProps {
  name: string;
  nameHe: string;
  nameAr: string;
  impact: number;
  images: {
    image: string;
  }[];
  createdAt: string;
  updatedAt: string;
  completionPercent: number;
}

const DetailTitleSection = ({
  name,
  nameAr,
  nameHe,
  impact,
  images,
  createdAt,
  updatedAt,
  completionPercent,
}: DetailTitleSectionProps) => {
  const { t } = useTranslation("common");
  const { isDark, textTertiary, language } = useThemeClasses();

  return (
    <div className="flex gap-2">
      <ImageWithFallback
        src={images?.[0]?.image}
        alt={name || nameHe || nameAr}
        className={clsx(
          "w-24 h-22 rounded-xl object-cover border-2",
          isDark ? "border-gray-600" : "border-gray-300",
        )}
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
        <div>
          <h1
            className={`text-3xl mb-2 ${
              isDark ? "text-gray-100" : "text-gray-900"
            }`}
          >
            {getLngWiseStr(language, name, nameHe, nameAr)}
          </h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                {t("impact_score")}: {impact?.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {createdAt && (
                <div className="flex items-center gap-1.5">
                  <svg
                    className={clsx("w-3.5 h-3.5 shrink-0", textTertiary)}
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="2" y="3" width="12" height="11" rx="1.5" />
                    <path d="M5 1.5v3M11 1.5v3M2 7h12" />
                  </svg>
                  <span className={clsx(" font-medium", textTertiary)}>
                    {t("created")}
                  </span>
                  <span className={clsx("", textTertiary)}>
                    {formatDateTime(createdAt, language)}
                  </span>
                </div>
              )}

              <div
                className={clsx(
                  "w-px h-3 shrink-0",
                  textTertiary,
                  "opacity-30",
                )}
                style={{ background: "currentColor" }}
              />

              {updatedAt && (
                <div className="flex items-center gap-1.5">
                  <svg
                    className={clsx("w-3.5 h-3.5 shrink-0", textTertiary)}
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      d="M13.5 8A5.5 5.5 0 1 1 8 2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10.5 1.5l3 1-1 3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 5v3.5l2 1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className={clsx(" font-medium", textTertiary)}>
                    {t("updated")}
                  </span>
                  <span className={clsx("", textTertiary)}>
                    {formatDateTime(updatedAt, language)}
                  </span>
                </div>
              )}
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
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <span
              className={`text-sm ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {completionPercent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailTitleSection;
