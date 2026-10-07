import clsx from "clsx";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Gauge, Play, RotateCcw, Save, ScanEye } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  SCORE_FACTOR_KEYS,
  SCORE_PARAM_KEYS,
  SCORE_SIGNAL_KEYS,
  UNAVAILABLE_SIGNALS,
} from "@/components/score/scoreMeta";
import {
  useGetScoreConfigQuery,
  useRecalculateScoresMutation,
  useUpdateScoreConfigMutation,
  type IScoreConfig,
  type IScoreRunSummary,
} from "@/store/api/businessScoreApi";

const errorMessage = (error: unknown, fallback: string) =>
  (
    error as { data?: { message?: string | string[] } }
  )?.data?.message?.toString() || fallback;

const ScoreSettingsPage = () => {
  const { t } = useTranslation("score");
  const {
    isDark,
    cardClasses,
    inputClasses,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
  } = useThemeClasses();

  const { data: config, isLoading } = useGetScoreConfigQuery();
  const [updateConfig, { isLoading: isSaving }] =
    useUpdateScoreConfigMutation();
  const [recalculate, { isLoading: isRunning }] =
    useRecalculateScoresMutation();

  const [draft, setDraft] = useState<IScoreConfig | null>(null);
  const [lastRun, setLastRun] = useState<IScoreRunSummary | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (config) setDraft(structuredClone(config));
  }, [config]);

  const isDirty = useMemo(
    () =>
      !!config && !!draft && JSON.stringify(config) !== JSON.stringify(draft),
    [config, draft],
  );

  // weights are relative - show each live signal's share of the total
  const effective = useMemo(() => {
    if (!draft) return {} as Record<string, number>;
    const live = SCORE_SIGNAL_KEYS.filter(
      (key) =>
        !UNAVAILABLE_SIGNALS.includes(key) &&
        draft.signals[key]?.enabled &&
        draft.signals[key]?.weight > 0,
    );
    const sum = live.reduce((acc, key) => acc + draft.signals[key].weight, 0);
    return Object.fromEntries(
      live.map((key) => [key, sum ? draft.signals[key].weight / sum : 0]),
    );
  }, [draft]);
  const hasLiveSignal = Object.keys(effective).length > 0;

  if (isLoading || !draft) {
    return <div className={clsx("p-6", textTertiary)}>…</div>;
  }

  const setSignal = (
    key: string,
    patch: { enabled?: boolean; weight?: number },
  ) =>
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            signals: {
              ...prev.signals,
              [key]: {
                ...prev.signals[key as keyof typeof prev.signals],
                ...patch,
              },
            },
          }
        : prev,
    );

  const handleSave = async () => {
    if (!hasLiveSignal) {
      toast.error(t("weights_must_be_positive"));
      return;
    }
    try {
      await updateConfig({
        enabled: draft.enabled,
        signals: draft.signals,
        factors: draft.factors,
        params: Object.fromEntries(
          SCORE_PARAM_KEYS.map((key) => [key, Number(draft.params[key])]),
        ),
      }).unwrap();
      toast.success(t("saved"));
    } catch (error) {
      toast.error(errorMessage(error, t("save_failed")));
    }
  };

  const handleRun = async (dryRun: boolean) => {
    setConfirmOpen(false);
    try {
      const summary = await recalculate({ dryRun }).unwrap();
      setLastRun(summary);
      if (summary.skipped)
        toast.warning(`${t("run_skipped")}: ${summary.skipped}`);
      else if (!dryRun) toast.success(t("recalculated"));
    } catch (error) {
      toast.error(errorMessage(error, t("run_failed")));
    }
  };

  const sectionTitle = clsx("text-lg font-semibold", textPrimary);
  const rowClass = clsx(
    "flex flex-wrap items-center gap-3 py-3 border-b last:border-b-0",
    borderColor,
  );

  return (
    <div className="flex flex-col gap-5 pb-10 max-w-5xl">
      {/* header */}
      <div className="flex flex-wrap items-start gap-3 justify-between">
        <div className="flex items-start gap-3">
          <Gauge
            className={clsx(
              "w-7 h-7 mt-1",
              isDark ? "text-emerald-400" : "text-emerald-600",
            )}
          />
          <div>
            <h1 className={clsx("text-2xl font-bold", textPrimary)}>
              {t("score_settings")}
            </h1>
            <p className={clsx("text-sm max-w-2xl", textTertiary)}>
              {t("score_settings_desc")}
            </p>
            <p className={clsx("text-xs mt-1", textTertiary)}>
              {t("version")}: {config?.version}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleRun(true)}
            disabled={isRunning || isDirty}
            title={isDirty ? t("unsaved_changes") : undefined}
            className={clsx(
              "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
              borderColor,
              textSecondary,
            )}
          >
            <ScanEye className="w-4 h-4" />
            {t("preview")}
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={isRunning || isDirty}
            title={isDirty ? t("unsaved_changes") : undefined}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            {t("recalculate")}
          </button>
        </div>
      </div>

      {/* master switch */}
      <div
        className={clsx("rounded-xl p-5 flex items-center gap-4", cardClasses)}
      >
        <div className="flex-1">
          <div className={clsx("font-semibold", textPrimary)}>
            {t("master_switch")}
          </div>
          <div className={clsx("text-sm", textTertiary)}>
            {t("master_switch_desc")}
          </div>
        </div>
        <Switch
          checked={draft.enabled}
          onCheckedChange={(enabled) => setDraft({ ...draft, enabled })}
          aria-label={t("master_switch")}
        />
      </div>

      {/* signals */}
      <div className={clsx("rounded-xl p-5", cardClasses)}>
        <h2 className={sectionTitle}>{t("signals")}</h2>
        <p className={clsx("text-sm mb-2", textTertiary)}>
          {t("signals_desc")}
        </p>
        {SCORE_SIGNAL_KEYS.map((key) => {
          const setting = draft.signals[key];
          const unavailable = UNAVAILABLE_SIGNALS.includes(key);
          return (
            <div key={key} className={rowClass}>
              <Switch
                checked={setting.enabled}
                onCheckedChange={(enabled) => setSignal(key, { enabled })}
                aria-label={t(`signal_${key}`)}
              />
              <div className="flex-1 min-w-[12rem]">
                <div
                  className={clsx(
                    "font-medium",
                    textPrimary,
                    !setting.enabled && "opacity-60",
                  )}
                >
                  {t(`signal_${key}`)}
                </div>
                <div className={clsx("text-xs", textTertiary)}>
                  {t(`signal_${key}_desc`)}
                </div>
              </div>
              <label
                className={clsx(
                  "flex items-center gap-2 text-sm",
                  textSecondary,
                )}
              >
                {t("weight")}
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(setting.weight * 100)}
                  disabled={!setting.enabled}
                  onChange={(e) =>
                    setSignal(key, {
                      weight:
                        Math.min(
                          100,
                          Math.max(0, Number(e.target.value) || 0),
                        ) / 100,
                    })
                  }
                  className={clsx(
                    "w-20 px-2 py-1 rounded-md text-end tabular-nums",
                    inputClasses,
                  )}
                />
                %
              </label>
              <span
                className={clsx(
                  "w-24 text-end text-sm tabular-nums",
                  textTertiary,
                )}
              >
                {unavailable
                  ? t("reason_not available yet")
                  : effective[key] !== undefined
                    ? `${t("effective_weight")} ${Math.round(effective[key] * 100)}%`
                    : "–"}
              </span>
            </div>
          );
        })}
      </div>

      {/* factors */}
      <div className={clsx("rounded-xl p-5", cardClasses)}>
        <h2 className={sectionTitle}>{t("factors")}</h2>
        <p className={clsx("text-sm mb-2", textTertiary)}>
          {t("factors_desc")}
        </p>
        <div className="grid sm:grid-cols-2 gap-x-6">
          {SCORE_FACTOR_KEYS.map((key) => (
            <div key={key} className={rowClass}>
              <Switch
                checked={draft.factors[key]}
                onCheckedChange={(on) =>
                  setDraft({
                    ...draft,
                    factors: { ...draft.factors, [key]: on },
                  })
                }
                aria-label={t(`factor_${key}`)}
              />
              <div className="flex-1">
                <div className={clsx("font-medium text-sm", textPrimary)}>
                  {t(`factor_${key}`)}
                </div>
                <div className={clsx("text-xs", textTertiary)}>
                  {t(`factor_${key}_desc`)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* parameters */}
      <div className={clsx("rounded-xl p-5", cardClasses)}>
        <h2 className={clsx(sectionTitle, "mb-3")}>{t("parameters")}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {SCORE_PARAM_KEYS.map((key) => (
            <label
              key={key}
              className={clsx("flex flex-col gap-1 text-sm", textSecondary)}
            >
              {t(`param_${key}`)}
              <input
                type="number"
                min={0}
                step={key === "newBusinessBoost" ? 0.01 : 1}
                value={draft.params[key] ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    params: {
                      ...draft.params,
                      [key]: e.target.value === "" ? 0 : Number(e.target.value),
                    },
                  })
                }
                className={clsx(
                  "px-3 py-2 rounded-lg tabular-nums",
                  inputClasses,
                )}
              />
            </label>
          ))}
        </div>
      </div>

      {/* save bar */}
      <div className="flex flex-wrap gap-2 justify-end items-center">
        {isDirty && (
          <span className={clsx("text-sm me-auto", textTertiary)}>
            {t("unsaved_changes")}
          </span>
        )}
        <button
          type="button"
          onClick={() => config && setDraft(structuredClone(config))}
          disabled={!isDirty || isSaving}
          className={clsx(
            "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
            borderColor,
            textSecondary,
          )}
        >
          <RotateCcw className="w-4 h-4" />
          {t("reset")}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-white bg-primary hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving ? t("saving") : t("save")}
        </button>
      </div>

      {/* last run */}
      {lastRun && !lastRun.skipped && (
        <div
          className={clsx("rounded-xl p-5 flex flex-col gap-4", cardClasses)}
        >
          <h2 className={sectionTitle}>
            {t("last_run")} {lastRun.dryRun ? `· ${t("preview")}` : ""}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              [t("scored"), lastRun.scored],
              [t("reset_count"), lastRun.dryRun ? "–" : lastRun.reset],
              [t("min"), lastRun.distribution?.min ?? "–"],
              [t("median"), lastRun.distribution?.median ?? "–"],
              [t("average"), lastRun.distribution?.average ?? "–"],
              [t("max"), lastRun.distribution?.max ?? "–"],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className={clsx("rounded-lg border p-3", borderColor)}
              >
                <div className={clsx("text-xs", textTertiary)}>{label}</div>
                <div
                  className={clsx(
                    "text-xl font-semibold tabular-nums",
                    textPrimary,
                  )}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
          <div className={clsx("text-sm", textSecondary)}>
            <span className="font-medium">{t("live_signals")}: </span>
            {lastRun.liveSignals
              .map(
                (key) =>
                  `${t(`signal_${key}`)} ${Math.round((lastRun.effectiveWeights[key] ?? 0) * 100)}%`,
              )
              .join(" · ") || "–"}
          </div>
          {lastRun.skippedSignals.length > 0 && (
            <div className={clsx("text-sm", textTertiary)}>
              <span className="font-medium">{t("skipped_signals")}: </span>
              {lastRun.skippedSignals
                .map(
                  (s) => `${t(`signal_${s.key}`)} (${t(`reason_${s.reason}`)})`,
                )
                .join(" · ")}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={t("recalculate")}
        message={t("recalculate_confirm")}
        variant="warning"
        confirmText={t("recalculate")}
        loading={isRunning}
        onConfirm={() => handleRun(false)}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default ScoreSettingsPage;
