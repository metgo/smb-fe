import clsx from "clsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Gauge, Info, RefreshCw, Sparkles } from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import ScorePill from "@/components/pills/ScorePill";
import ScoreInputsPanel from "./ScoreInputsPanel";
import ScoreSuggestions from "./ScoreSuggestions";
import { useUserRoles } from "@/hooks/useUserRoles";
import {
  useGetBusinessScoreHistoryQuery,
  useGetBusinessScoreQuery,
  useRecalculateBusinessScoreMutation,
} from "@/store/api/businessScoreApi";
import {
  SCORE_METRIC_KEYS,
  SCORE_SIGNAL_KEYS,
  SIGNAL_BAR_COLOR,
} from "@/components/score/scoreMeta";
import { BusinessScoreDetailsSkeleton } from "@/components/skeletons";

interface Props {
  businessId: string;
}

const formatDate = (value: string, language: string) =>
  new Date(value).toLocaleDateString(language, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatMetric = (key: string, value: number | null | undefined) => {
  if (value === null || value === undefined) return "–";
  if (
    [
      "cancelRate",
      "inStockShare",
      "eventFillRate",
      "listClickThrough",
      "viewConversion",
    ].includes(key)
  )
    return `${(value * 100).toFixed(1)}%`;
  if (key === "googleRating") return `${value.toFixed(1)} ★`;
  return value.toLocaleString();
};

const BusinessScoreDetails = ({ businessId }: Props) => {
  const { t } = useTranslation("score");
  const {
    isDark,
    cardClasses,
    textPrimary,
    textSecondary,
    textTertiary,
    language,
  } = useThemeClasses();

  const { data: score, isLoading } = useGetBusinessScoreQuery(
    { businessId },
    { skip: !businessId },
  );
  const { data: history = [] } = useGetBusinessScoreHistoryQuery(
    { businessId, limit: 90 },
    { skip: !businessId },
  );

  const { isTraveller } = useUserRoles();
  const [recalculate, { isLoading: isRecalculating }] =
    useRecalculateBusinessScoreMutation();

  if (isLoading) {
    return <BusinessScoreDetailsSkeleton />;
  }

  // admins only - the server refuses vendors
  const canRecalculate = !isTraveller && score?.status === "APPROVED";
  const recalculateButton = canRecalculate && (
    <button
      type="button"
      disabled={isRecalculating}
      onClick={async () => {
        try {
          await recalculate({ businessId }).unwrap();
          toast.success(t("recalculated_business"));
        } catch (error) {
          toast.error(
            (error as { data?: { message?: string } })?.data?.message ||
              t("run_failed"),
          );
        }
      }}
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm cursor-pointer disabled:opacity-50",
        isDark
          ? "border-gray-600 text-gray-200 hover:bg-gray-800"
          : "border-gray-300 text-gray-700 hover:bg-gray-50",
      )}
    >
      <RefreshCw
        className={clsx("w-4 h-4", isRecalculating && "animate-spin")}
      />
      {t("recalculate_business")}
    </button>
  );

  const breakdown = score?.breakdown;
  const inputs = {
    policyFlags: score?.policyFlags ?? [],
    localSourcing: score?.localSourcing ?? null,
  };
  if (!breakdown) {
    return (
      <div className="flex flex-col gap-4">
        <div
          className={clsx("rounded-xl p-6 flex gap-3 items-start", cardClasses)}
        >
          <Info className={clsx("w-5 h-5 mt-0.5 shrink-0", textTertiary)} />
          <p className={clsx("flex-1", textSecondary)}>
            {score && score.status !== "APPROVED"
              ? t("not_approved")
              : t("not_scored_yet")}
          </p>
          {recalculateButton}
        </div>
        <ScoreInputsPanel businessId={businessId} inputs={inputs} />
      </div>
    );
  }

  const chartData = [...history].reverse().map((point) => ({
    date: formatDate(point.computedAt, language),
    impact: point.impact,
  }));

  const metricEntries = SCORE_METRIC_KEYS.filter(
    (key) => breakdown.metrics?.[key] != null,
  );

  return (
    <div className="flex flex-col gap-4">
      {/* headline */}
      <div
        className={clsx(
          "rounded-xl p-5 flex flex-wrap items-center gap-5",
          cardClasses,
        )}
      >
        <div className="flex items-center gap-3">
          <Gauge
            className={clsx(
              "w-8 h-8",
              isDark ? "text-emerald-400" : "text-emerald-600",
            )}
          />
          <div>
            <div className={clsx("text-sm", textTertiary)}>
              {t("business_score")}
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={clsx("text-3xl font-bold tabular-nums", textPrimary)}
              >
                {score?.impact}
              </span>
              <span className={clsx("text-sm", textTertiary)}>
                {t("score_out_of")}
              </span>
            </div>
          </div>
        </div>
        <ScorePill score={score?.impact ?? 200} />
        {breakdown.boost > 0 && (
          <span
            className={clsx(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium",
              isDark ? "bg-sky-500/20 text-sky-300" : "bg-sky-100 text-sky-700",
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t("boost")} +{breakdown.boost}
          </span>
        )}
        <div className={clsx("text-sm ms-auto", textTertiary)}>
          {t("computed_at")}: {formatDate(breakdown.computedAt, language)}
        </div>
        {recalculateButton}
      </div>

      {/* what the owner can do next, biggest gain first */}
      {breakdown.suggestions && (
        <ScoreSuggestions suggestions={breakdown.suggestions} />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* per-signal breakdown */}
        <div
          className={clsx("rounded-xl p-5 flex flex-col gap-3", cardClasses)}
        >
          <h3 className={clsx("font-semibold", textPrimary)}>{t("signals")}</h3>
          {SCORE_SIGNAL_KEYS.filter(
            (key) => breakdown.signals[key] !== undefined,
          ).map((key) => {
            const value = breakdown.signals[key] ?? 0;
            const weight = breakdown.weights?.[key] ?? 0;
            return (
              <div key={key} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm gap-2">
                  <span
                    className={textSecondary}
                    title={t(`signal_${key}_desc`)}
                  >
                    {t(`signal_${key}`)}
                  </span>
                  <span className={clsx("tabular-nums", textTertiary)}>
                    {Math.round(value)}/100 · {Math.round(weight * 100)}%
                  </span>
                </div>
                <div
                  className={clsx(
                    "h-2 rounded-full overflow-hidden",
                    isDark ? "bg-gray-700" : "bg-gray-100",
                  )}
                  role="meter"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(value)}
                  aria-label={t(`signal_${key}`)}
                >
                  <div
                    className={clsx(
                      "h-full rounded-full",
                      SIGNAL_BAR_COLOR[key],
                    )}
                    style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
                  />
                </div>
              </div>
            );
          })}
          {breakdown.flags?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {breakdown.flags.map((flag) => (
                <span
                  key={flag}
                  className={clsx(
                    "px-2 py-0.5 rounded-md text-xs",
                    isDark
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-100 text-gray-600",
                  )}
                >
                  {t(`flag_${flag}`)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* history + key numbers */}
        <div className="flex flex-col gap-4">
          <div className={clsx("rounded-xl p-5", cardClasses)}>
            <h3 className={clsx("font-semibold mb-3", textPrimary)}>
              {t("history")}
            </h3>
            {chartData.length > 1 ? (
              <div className="h-40" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" hide />
                    <YAxis
                      domain={[200, 800]}
                      width={32}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="impact"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className={clsx("text-sm", textTertiary)}>{t("no_history")}</p>
            )}
          </div>

          {metricEntries.length > 0 && (
            <div className={clsx("rounded-xl p-5", cardClasses)}>
              <h3 className={clsx("font-semibold mb-3", textPrimary)}>
                {t("key_metrics")}
              </h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {metricEntries.map((key) => (
                  <div key={key} className="flex justify-between gap-2">
                    <dt className={textTertiary}>{t(`metric_${key}`)}</dt>
                    <dd
                      className={clsx(
                        "tabular-nums font-medium",
                        textSecondary,
                      )}
                    >
                      {formatMetric(key, breakdown.metrics[key])}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
      <ScoreInputsPanel businessId={businessId} inputs={inputs} />
    </div>
  );
};

export default BusinessScoreDetails;
