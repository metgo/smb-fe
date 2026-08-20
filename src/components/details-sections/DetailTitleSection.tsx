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
  createdAt: string;
  updatedAt: string;
  completionPercent: number;
  imageSrc?: string;
  actions?: React.ReactNode;
}

const DetailTitleSection = ({
  name,
  nameAr,
  nameHe,
  impact,
  createdAt,
  updatedAt,
  completionPercent,
  imageSrc,
  actions,
}: DetailTitleSectionProps) => {
  const { t } = useTranslation("common");
  const { isDark, textTertiary, language } = useThemeClasses();

  const divider = (
    <div
      className={clsx("w-px h-3 shrink-0 opacity-30", textTertiary)}
      style={{ background: "currentColor" }}
    />
  );

  return (
    <div className="flex items-center gap-3">
      <ImageWithFallback
        src={imageSrc}
        alt={name || nameHe || nameAr}
        className={clsx(
          "w-10 h-10 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0 border",
          isDark ? "border-gray-600" : "border-gray-200",
        )}
      />

      <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 min-w-0">
        <div className="min-w-0">
          <h1
            className={`text-base sm:text-lg font-semibold leading-tight truncate ${
              isDark ? "text-gray-100" : "text-gray-900"
            }`}
          >
            {getLngWiseStr(language, name, nameHe, nameAr)}
          </h1>

          <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" />
              {impact?.toFixed(1)}
            </span>

            {createdAt && (
              <>
                {divider}
                <span
                  className={clsx(
                    "inline-flex items-center gap-1 text-xs",
                    textTertiary,
                  )}
                >
                  <svg
                    className="w-3 h-3 shrink-0"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="2" y="3" width="12" height="11" rx="1.5" />
                    <path d="M5 1.5v3M11 1.5v3M2 7h12" />
                  </svg>
                  {formatDateTime(createdAt, language)}
                </span>
              </>
            )}

            {updatedAt && (
              <>
                {divider}
                <span
                  className={clsx(
                    "inline-flex items-center gap-1 text-xs",
                    textTertiary,
                  )}
                >
                  <svg
                    className="w-3 h-3 shrink-0"
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
                  {formatDateTime(updatedAt, language)}
                </span>
              </>
            )}

            {/* Completion percentage inline with metadata */}
            {divider}
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 transition-all duration-300"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <span
                className={clsx("text-xs font-medium", textTertiary)}
              >
                {completionPercent}%
              </span>
            </div>
          </div>
        </div>

        {actions && (
          <div className="shrink-0 flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailTitleSection;
