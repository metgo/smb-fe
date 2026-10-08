import clsx from "clsx";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  CalendarClock,
  Gauge,
  History,
  Layers,
  Play,
  RotateCcw,
  Save,
  ScanEye,
  SlidersHorizontal,
  ToggleRight,
} from "lucide-react";

import { ConfirmDialog } from "@/components/shared";
import CollapsibleCard from "@/components/score/CollapsibleCard";
import ScoreToggle from "@/components/score/ScoreToggle";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  SCORE_FACTOR_GROUPS,
  SCORE_FACTOR_KEYS,
  SCORE_PARAM_KEYS,
  SCORE_SIGNAL_KEYS,
  UNAVAILABLE_SIGNALS,
} from "@/components/score/scoreMeta";
import {
  useGetScoreConfigQuery,
  useGetScoreRunsQuery,
  useImportAnalyticsMutation,
  useRecalculateScoresMutation,
  useUpdateScoreConfigMutation,
  type IScoreConfig,
  type IScoreRun,
  type IScoreRunSummary,
  type IScoreSchedule,
  type ScheduleState,
} from "@/store/api/businessScoreApi";

const errorMessage = (error: unknown, fallback: string) =>
  (
    error as { data?: { message?: string | string[] } }
  )?.data?.message?.toString() || fallback;

// settings fields the server stores - the status block is read-only
const editable = (config: IScoreConfig) => ({
  schedule: config.schedule,
  signals: config.signals,
  factors: config.factors,
  params: Object.fromEntries(
    SCORE_PARAM_KEYS.map((key) => [key, Number(config.params[key])]),
  ),
  paramsEnabled: config.paramsEnabled,
});

const WEEKDAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const STATE_STYLE: Record<ScheduleState, { light: string; dark: string }> = {
  active: {
    light: "bg-emerald-100 text-emerald-800 border-emerald-300",
    dark: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  },
  manual: {
    light: "bg-gray-100 text-gray-700 border-gray-300",
    dark: "bg-gray-700/60 text-gray-200 border-gray-500",
  },
  notStarted: {
    light: "bg-sky-100 text-sky-800 border-sky-300",
    dark: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  },
  ended: {
    light: "bg-amber-100 text-amber-800 border-amber-300",
    dark: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  },
};

const ScoreSettingsPage = () => {
  const { t, i18n } = useTranslation("score");
  const {
    isDark,
    inputClasses,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
  } = useThemeClasses();

  const { data: config, isLoading } = useGetScoreConfigQuery();
  const { data: runs = [] } = useGetScoreRunsQuery({ limit: 10 });
  const [updateConfig, { isLoading: isSaving }] =
    useUpdateScoreConfigMutation();
  const [recalculate, { isLoading: isRunning }] =
    useRecalculateScoresMutation();
  const [importAnalytics, { isLoading: isImporting }] =
    useImportAnalyticsMutation();

  const [draft, setDraft] = useState<IScoreConfig | null>(null);
  const [lastPreview, setLastPreview] = useState<IScoreRunSummary | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (config) setDraft(structuredClone(config));
  }, [config]);

  const isDirty = useMemo(
    () =>
      !!config &&
      !!draft &&
      JSON.stringify(editable(config)) !== JSON.stringify(editable(draft)),
    [config, draft],
  );

  // the browser asks before closing or reloading with unsaved changes
  useEffect(() => {
    if (!isDirty) return undefined;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

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

  if (isLoading || !draft || !config) {
    return <div className={clsx("p-6", textTertiary)}>…</div>;
  }

  const formatSlot = (slot: string | null) => {
    if (!slot) return "–";
    // slot is Israel wall-clock time; format it without shifting zones
    const date = new Date(`${slot}:00Z`);
    return date.toLocaleString(i18n.language, {
      timeZone: "UTC",
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const formatDateTime = (value: string) =>
    new Date(value).toLocaleString(i18n.language, {
      timeZone: config.status.timeZone,
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const setSchedule = (patch: Partial<IScoreSchedule>) =>
    setDraft((prev) =>
      prev ? { ...prev, schedule: { ...prev.schedule, ...patch } } : prev,
    );
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

  // returns false when the save failed, so a run that needs it can stop
  const handleSave = async (): Promise<boolean> => {
    if (!hasLiveSignal) {
      toast.error(t("weights_must_be_positive"));
      return false;
    }
    try {
      await updateConfig(editable(draft)).unwrap();
      toast.success(t("saved"));
      return true;
    } catch (error) {
      toast.error(errorMessage(error, t("save_failed")));
      return false;
    }
  };

  const handlePreview = async () => {
    try {
      const summary = await recalculate({
        dryRun: true,
        config: isDirty ? editable(draft) : undefined,
      }).unwrap();
      setLastPreview(summary);
    } catch (error) {
      toast.error(errorMessage(error, t("run_failed")));
    }
  };

  const handleRecalculate = async () => {
    setConfirmOpen(false);
    // unsaved changes are saved first, so the run uses what's on screen
    if (isDirty && !(await handleSave())) return;
    try {
      const summary = await recalculate({ dryRun: false }).unwrap();
      if (summary.skipped)
        toast.warning(`${t("run_skipped")}: ${summary.skipped}`);
      else toast.success(t("recalculated"));
    } catch (error) {
      toast.error(errorMessage(error, t("run_failed")));
    }
  };

  const { status } = config;
  const stateStyle = STATE_STYLE[status.state];
  const { schedule } = draft;
  const automatic = schedule.mode === "automatic";

  const rowClass = clsx(
    "flex flex-wrap items-center gap-3 py-3 border-b last:border-b-0",
    borderColor,
  );
  const fieldLabel = clsx("flex flex-col gap-1 text-sm", textSecondary);
  const fieldInput = clsx("px-3 py-2 rounded-lg border", inputClasses);
  const toggleText = { onText: t("on"), offText: t("off") };
  const sectionIcon = clsx("w-5 h-5 shrink-0", textSecondary);

  const signalsOn = SCORE_SIGNAL_KEYS.filter(
    (key) => draft.signals[key]?.enabled,
  ).length;
  const factorsOn = SCORE_FACTOR_KEYS.filter(
    (key) => draft.factors[key] !== false,
  ).length;
  const paramsOn = SCORE_PARAM_KEYS.filter(
    (key) => draft.paramsEnabled[key] !== false,
  ).length;
  const countOn = (on: number, total: number) => t("count_on", { on, total });

  let scheduleSummary = t("summary_daily", { time: schedule.time });
  if (!automatic) scheduleSummary = t("mode_manual");
  else if (schedule.frequency === "hourly")
    scheduleSummary = t("summary_hourly", { hours: schedule.everyHours });
  else if (schedule.frequency === "weekly")
    scheduleSummary = t("summary_weekly", {
      day: t(WEEKDAY_KEYS[schedule.dayOfWeek]),
      time: schedule.time,
    });

  const runResult = (run: IScoreRun) => {
    if (run.error) return { text: t("run_result_failed"), tone: "bad" };
    if (run.skipped) return { text: t("run_result_skipped"), tone: "warn" };
    return { text: t("run_result_ok"), tone: "good" };
  };

  const signalStatus = (key: (typeof SCORE_SIGNAL_KEYS)[number]) => {
    if (!draft.signals[key].enabled) return t("not_counted");
    if (UNAVAILABLE_SIGNALS.includes(key)) return t("reason_not available yet");
    if (effective[key] === undefined) return "–";
    return `${t("effective_weight")} ${Math.round(effective[key] * 100)}%`;
  };

  return (
    <div className="flex flex-col gap-4 pb-10 max-w-5xl">
      {/* header */}
      <div className="flex flex-wrap items-start gap-3 justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <Gauge
            className={clsx(
              "w-7 h-7 mt-1 shrink-0",
              isDark ? "text-emerald-400" : "text-emerald-600",
            )}
          />
          <div className="min-w-0">
            <h1 className={clsx("text-2xl font-bold", textPrimary)}>
              {t("score_settings")}
            </h1>
            <p className={clsx("text-sm max-w-2xl", textTertiary)}>
              {t("score_settings_desc")}
            </p>
            <p className={clsx("text-xs mt-1", textTertiary)}>
              {t("version")}: {config.version}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePreview}
            disabled={isRunning}
            className={clsx(
              "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
              borderColor,
              textSecondary,
            )}
          >
            <ScanEye className="w-4 h-4" />
            {isDirty ? t("preview_unsaved") : t("preview")}
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={isRunning || isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            {isDirty ? t("save_and_recalculate") : t("recalculate")}
          </button>
        </div>
      </div>

      {/* status */}
      <div
        className={clsx(
          "rounded-xl border p-4 flex flex-wrap items-center gap-x-6 gap-y-2",
          isDark ? stateStyle.dark : stateStyle.light,
        )}
        role="status"
      >
        <div className="flex items-center gap-2 font-semibold">
          <span
            className={clsx(
              "inline-block w-2.5 h-2.5 rounded-full",
              status.state === "active" ? "bg-emerald-500" : "bg-current",
            )}
          />
          {t(`state_${status.state}`)}
        </div>
        <div className="text-sm">
          {t("next_run")}: <b>{formatSlot(status.nextRun)}</b>
        </div>
        <div className="text-sm">
          {t("last_run")}:{" "}
          <b>
            {status.lastRun
              ? `${formatDateTime(status.lastRun.startedAt)} · ${runResult(status.lastRun).text}`
              : t("never")}
          </b>
        </div>
        <div className="text-xs opacity-80 ms-auto">{t("times_in_israel")}</div>
      </div>

      {/* run & schedule */}
      <CollapsibleCard
        id="schedule"
        title={t("run_schedule")}
        icon={<CalendarClock className={sectionIcon} />}
        summary={scheduleSummary}
        defaultOpen
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <ScoreToggle
              id="score-mode"
              checked={automatic}
              onChange={(on) =>
                setSchedule({ mode: on ? "automatic" : "manual" })
              }
              label={t("automatic_runs")}
              {...toggleText}
            />
            <div className="flex-1 min-w-[14rem]">
              <div className={clsx("font-medium", textPrimary)}>
                {automatic ? t("mode_automatic") : t("mode_manual")}
              </div>
              <div className={clsx("text-sm", textTertiary)}>
                {automatic ? t("mode_automatic_desc") : t("mode_manual_desc")}
              </div>
            </div>
          </div>

          <fieldset
            disabled={!automatic}
            className={clsx(
              "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
              !automatic && "opacity-50",
            )}
          >
            <label className={fieldLabel} htmlFor="score-frequency">
              {t("frequency")}
              <select
                id="score-frequency"
                value={schedule.frequency}
                onChange={(e) =>
                  setSchedule({
                    frequency: e.target.value as IScoreSchedule["frequency"],
                  })
                }
                className={fieldInput}
              >
                <option value="hourly">{t("frequency_hourly")}</option>
                <option value="daily">{t("frequency_daily")}</option>
                <option value="weekly">{t("frequency_weekly")}</option>
              </select>
            </label>

            {schedule.frequency === "hourly" && (
              <label className={fieldLabel} htmlFor="score-every-hours">
                {t("every_hours")}
                <input
                  id="score-every-hours"
                  type="number"
                  min={1}
                  max={24}
                  value={schedule.everyHours}
                  onChange={(e) =>
                    setSchedule({
                      everyHours: Math.min(
                        24,
                        Math.max(1, Number(e.target.value) || 1),
                      ),
                    })
                  }
                  className={clsx(fieldInput, "tabular-nums")}
                />
              </label>
            )}

            {schedule.frequency === "weekly" && (
              <label className={fieldLabel} htmlFor="score-day">
                {t("day_of_week")}
                <select
                  id="score-day"
                  value={schedule.dayOfWeek}
                  onChange={(e) =>
                    setSchedule({ dayOfWeek: Number(e.target.value) })
                  }
                  className={fieldInput}
                >
                  {WEEKDAY_KEYS.map((day, index) => (
                    <option key={day} value={index}>
                      {t(day)}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className={fieldLabel} htmlFor="score-time">
              {schedule.frequency === "hourly"
                ? t("minute_past_hour")
                : t("run_time")}
              <input
                id="score-time"
                type="time"
                value={schedule.time}
                onChange={(e) => setSchedule({ time: e.target.value })}
                className={clsx(fieldInput, "tabular-nums")}
              />
            </label>

            <label className={fieldLabel} htmlFor="score-start">
              {t("start_date")}
              <input
                id="score-start"
                type="date"
                value={schedule.startDate ?? ""}
                onChange={(e) =>
                  setSchedule({ startDate: e.target.value || null })
                }
                className={fieldInput}
              />
              <span className={clsx("text-xs", textTertiary)}>
                {t("start_date_hint")}
              </span>
            </label>

            <label className={fieldLabel} htmlFor="score-end">
              {t("end_date")}
              <input
                id="score-end"
                type="date"
                min={schedule.startDate ?? undefined}
                value={schedule.endDate ?? ""}
                onChange={(e) =>
                  setSchedule({ endDate: e.target.value || null })
                }
                className={fieldInput}
              />
              <span className={clsx("text-xs", textTertiary)}>
                {t("end_date_hint")}
              </span>
            </label>
          </fieldset>

          {/* GA4 import - runs nightly at 02:30, before the score run */}
          <div
            className={clsx(
              "flex flex-wrap items-center gap-3 pt-4 border-t",
              borderColor,
            )}
          >
            <BarChart3 className={sectionIcon} />
            <div className="flex-1 min-w-[14rem]">
              <div className={clsx("font-medium", textPrimary)}>
                {t("ga_import")}
              </div>
              <div className={clsx("text-sm", textTertiary)}>
                {t("ga_import_desc")}
              </div>
            </div>
            <button
              type="button"
              disabled={isImporting}
              onClick={async () => {
                try {
                  const results = await importAnalytics({ days: 30 }).unwrap();
                  const imported = results.filter((r) => r.rows > 0);
                  const failed = results.filter((r) => r.error);
                  const missing = results.filter((r) => !r.propertyId);
                  toast.success(
                    t("ga_import_done", {
                      sites: imported.length,
                      rows: imported.reduce((acc, r) => acc + r.rows, 0),
                    }),
                  );
                  if (failed.length)
                    toast.error(
                      t("ga_import_failed_sites", {
                        sites: failed.map((r) => r.site).join(", "),
                      }),
                    );
                  if (missing.length)
                    toast.warning(
                      t("ga_import_missing_sites", {
                        sites: missing.map((r) => r.site).join(", "),
                      }),
                    );
                } catch (error) {
                  toast.error(errorMessage(error, t("ga_import_failed")));
                }
              }}
              className={clsx(
                "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                borderColor,
                textSecondary,
              )}
            >
              {isImporting ? t("ga_importing") : t("ga_import_now")}
            </button>
          </div>
        </div>
      </CollapsibleCard>

      {/* signals */}
      <CollapsibleCard
        id="signals"
        title={t("signals")}
        description={t("signals_desc")}
        icon={<Layers className={sectionIcon} />}
        summary={countOn(signalsOn, SCORE_SIGNAL_KEYS.length)}
      >
        {SCORE_SIGNAL_KEYS.map((key) => {
          const setting = draft.signals[key];
          return (
            <div key={key} className={rowClass}>
              <ScoreToggle
                id={`signal-${key}`}
                checked={setting.enabled}
                onChange={(enabled) => setSignal(key, { enabled })}
                label={t(`signal_${key}`)}
                {...toggleText}
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
                htmlFor={`weight-${key}`}
              >
                {t("weight")}
                <input
                  id={`weight-${key}`}
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
                    "w-20 px-2 py-1 rounded-md border text-end tabular-nums disabled:opacity-50",
                    inputClasses,
                  )}
                />
                %
              </label>
              <span
                className={clsx(
                  "w-28 text-end text-sm tabular-nums",
                  textTertiary,
                )}
              >
                {signalStatus(key)}
              </span>
            </div>
          );
        })}
      </CollapsibleCard>

      {/* factors, grouped by the signal they belong to */}
      <CollapsibleCard
        id="factors"
        title={t("factors")}
        description={t("factors_desc")}
        icon={<ToggleRight className={sectionIcon} />}
        summary={countOn(factorsOn, SCORE_FACTOR_KEYS.length)}
      >
        <div className="flex flex-col gap-4">
          {SCORE_FACTOR_GROUPS.map((group) => (
            <div key={group.signal}>
              <h3
                className={clsx(
                  "text-xs font-semibold uppercase tracking-wide pt-2",
                  textTertiary,
                )}
              >
                {t(`signal_${group.signal}`)}
              </h3>
              <div className="grid sm:grid-cols-2 gap-x-6">
                {group.factors.map((key) => (
                  <div key={key} className={rowClass}>
                    <ScoreToggle
                      id={`factor-${key}`}
                      checked={draft.factors[key] !== false}
                      onChange={(on) =>
                        setDraft({
                          ...draft,
                          factors: { ...draft.factors, [key]: on },
                        })
                      }
                      label={t(`factor_${key}`)}
                      {...toggleText}
                    />
                    <div className="flex-1 min-w-0">
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
          ))}
        </div>
      </CollapsibleCard>

      {/* parameters */}
      <CollapsibleCard
        id="parameters"
        title={t("parameters")}
        description={t("parameters_desc")}
        icon={<SlidersHorizontal className={sectionIcon} />}
        summary={countOn(paramsOn, SCORE_PARAM_KEYS.length)}
      >
        {SCORE_PARAM_KEYS.map((key) => {
          const on = draft.paramsEnabled[key] !== false;
          return (
            <div key={key} className={rowClass}>
              <ScoreToggle
                id={`param-toggle-${key}`}
                checked={on}
                onChange={(value) =>
                  setDraft({
                    ...draft,
                    paramsEnabled: { ...draft.paramsEnabled, [key]: value },
                  })
                }
                label={t(`param_${key}`)}
                {...toggleText}
              />
              <div className="flex-1 min-w-[12rem]">
                <label
                  htmlFor={`param-${key}`}
                  className={clsx(
                    "font-medium text-sm",
                    textPrimary,
                    !on && "opacity-60",
                  )}
                >
                  {t(`param_${key}`)}
                </label>
                <div className={clsx("text-xs", textTertiary)}>
                  {on ? t(`param_${key}_desc`) : t(`param_${key}_off`)}
                </div>
              </div>
              <input
                id={`param-${key}`}
                type="number"
                min={0}
                step={key === "newBusinessBoost" ? 0.01 : 1}
                disabled={!on}
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
                  "w-28 px-3 py-1.5 rounded-md border text-end tabular-nums disabled:opacity-50",
                  inputClasses,
                )}
              />
            </div>
          );
        })}
      </CollapsibleCard>

      {/* preview result */}
      {lastPreview && !lastPreview.skipped && (
        <CollapsibleCard
          id="preview"
          title={t("preview_result")}
          icon={<ScanEye className={sectionIcon} />}
          summary={`${t("median")} ${lastPreview.distribution?.median ?? "–"}`}
          defaultOpen
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                [t("scored"), lastPreview.scored],
                [t("min"), lastPreview.distribution?.min ?? "–"],
                [t("median"), lastPreview.distribution?.median ?? "–"],
                [t("average"), lastPreview.distribution?.average ?? "–"],
                [t("max"), lastPreview.distribution?.max ?? "–"],
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
              {lastPreview.liveSignals
                .map(
                  (key) =>
                    `${t(`signal_${key}`)} ${Math.round((lastPreview.effectiveWeights[key] ?? 0) * 100)}%`,
                )
                .join(" · ") || "–"}
            </div>
            {lastPreview.skippedSignals.length > 0 && (
              <div className={clsx("text-sm", textTertiary)}>
                <span className="font-medium">{t("skipped_signals")}: </span>
                {lastPreview.skippedSignals
                  .map(
                    (s) =>
                      `${t(`signal_${s.key}`)} (${t(`reason_${s.reason}`)})`,
                  )
                  .join(" · ")}
              </div>
            )}
          </div>
        </CollapsibleCard>
      )}

      {/* run log */}
      <CollapsibleCard
        id="runs"
        title={t("recent_runs")}
        icon={<History className={sectionIcon} />}
        summary={
          runs[0]
            ? `${formatDateTime(runs[0].startedAt)} · ${runResult(runs[0]).text}`
            : t("no_runs")
        }
      >
        {runs.length === 0 ? (
          <p className={clsx("text-sm", textTertiary)}>{t("no_runs")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={textTertiary}>
                  <th className="py-2 pe-4 text-start font-medium">
                    {t("run_when")}
                  </th>
                  <th className="py-2 pe-4 text-start font-medium">
                    {t("run_trigger")}
                  </th>
                  <th className="py-2 pe-4 text-end font-medium">
                    {t("scored")}
                  </th>
                  <th className="py-2 pe-4 text-end font-medium">
                    {t("run_duration")}
                  </th>
                  <th className="py-2 text-start font-medium">
                    {t("run_result")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => {
                  const result = runResult(run);
                  return (
                    <tr
                      key={run.runId}
                      className={clsx("border-t", borderColor, textSecondary)}
                    >
                      <td className="py-2 pe-4 whitespace-nowrap">
                        {formatDateTime(run.startedAt)}
                      </td>
                      <td className="py-2 pe-4">
                        {t(`trigger_${run.trigger}`)}
                      </td>
                      <td className="py-2 pe-4 text-end tabular-nums">
                        {run.scored}
                      </td>
                      <td className="py-2 pe-4 text-end tabular-nums">
                        {(run.durationMs / 1000).toFixed(1)} s
                      </td>
                      <td
                        className="py-2"
                        title={run.error ?? run.skipped ?? undefined}
                      >
                        <span
                          className={clsx(
                            "px-2 py-0.5 rounded-md text-xs font-medium",
                            result.tone === "good" &&
                              (isDark
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-emerald-100 text-emerald-800"),
                            result.tone === "warn" &&
                              (isDark
                                ? "bg-amber-500/15 text-amber-300"
                                : "bg-amber-100 text-amber-800"),
                            result.tone === "bad" &&
                              (isDark
                                ? "bg-red-500/15 text-red-300"
                                : "bg-red-100 text-red-800"),
                          )}
                        >
                          {result.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CollapsibleCard>

      {/* save bar - pinned to the bottom of the screen while there are
          unsaved changes, so it can't be missed on this long page */}
      {isDirty && (
        <div
          className={clsx(
            "sticky bottom-0 z-20 flex flex-wrap gap-2 justify-end items-center px-4 py-3 rounded-xl border shadow-lg",
            isDark
              ? "bg-gray-900/95 border-amber-500/50"
              : "bg-white/95 border-amber-400",
          )}
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <span
            className={clsx(
              "text-sm font-medium me-auto",
              isDark ? "text-amber-300" : "text-amber-700",
            )}
          >
            {t("unsaved_changes_hint")}
          </span>
          <button
            type="button"
            onClick={() => setDraft(structuredClone(config))}
            disabled={isSaving}
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
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSaving ? t("saving") : t("save")}
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={t("recalculate")}
        message={
          isDirty ? t("save_and_recalculate_confirm") : t("recalculate_confirm")
        }
        variant="warning"
        confirmText={isDirty ? t("save_and_recalculate") : t("recalculate")}
        loading={isRunning || isSaving}
        onConfirm={handleRecalculate}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default ScoreSettingsPage;
