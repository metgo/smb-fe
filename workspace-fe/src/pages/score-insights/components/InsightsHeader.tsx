import clsx from "clsx";
import { BarChart3, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { routes } from "@/lib/routes";
import type { IScoreInsights } from "@/store/api/businessScoreApi";

interface InsightsHeaderProps {
  t: (key: string, options?: Record<string, unknown>) => string;
  data: IScoreInsights;
  dmoId: string | null | undefined;
  authorityId: string | null | undefined;
  scopeName: string | null;
  isFetching: boolean;
}

const InsightsHeader = ({
  t,
  data,
  dmoId,
  authorityId,
  scopeName,
  isFetching,
}: InsightsHeaderProps) => {
  const navigate = useNavigate();
  const { isDark, textPrimary, textSecondary, textTertiary, borderColor } =
    useThemeClasses();

  return (
    <div className="flex flex-wrap items-start gap-3 justify-between">
      <div className="flex items-start gap-3 min-w-0">
        <BarChart3
          className={clsx(
            "w-7 h-7 mt-1 shrink-0",
            isDark ? "text-emerald-400" : "text-emerald-600",
          )}
        />
        <div className="min-w-0">
          <h1 className={clsx("text-2xl font-bold", textPrimary)}>
            {t("insights_title")}
          </h1>
          {(dmoId || authorityId) && (
            <p
              className={clsx(
                "inline-flex items-center gap-2 text-sm font-medium px-2.5 py-1 rounded-md mt-1 mb-1",
                isDark
                  ? "bg-sky-500/15 text-sky-300"
                  : "bg-sky-100 text-sky-800",
              )}
            >
              {t("insights_filtered", {
                name:
                  scopeName ??
                  (authorityId
                    ? t("insights_authority")
                    : t("insights_region")),
              })}
              {isFetching && " …"}
            </p>
          )}
          <p className={clsx("text-sm max-w-2xl", textTertiary)}>
            {t("insights_desc", {
              approved: data.approved,
              notApproved: data.notApproved,
            })}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => navigate(routes.scoreSettings)}
        className={clsx(
          "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm cursor-pointer",
          borderColor,
          textSecondary,
        )}
      >
        <Settings2 className="w-4 h-4" />
        {t("score_settings")}
      </button>
    </div>
  );
};

export default InsightsHeader;
