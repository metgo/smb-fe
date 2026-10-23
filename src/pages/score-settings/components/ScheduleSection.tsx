import clsx from "clsx";
import { BarChart3, CalendarClock } from "lucide-react";

import CollapsibleCard from "@/components/score/CollapsibleCard";
import ScoreToggle from "@/components/score/ScoreToggle";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import type {
  IScoreConfig,
  IScoreSchedule,
} from "@/store/api/businessScoreApi";
import { WEEKDAY_KEYS } from "../useScoreSettings";

interface ScheduleSectionProps {
  t: (key: string, options?: Record<string, unknown>) => string;
  config: IScoreConfig;
  schedule: IScoreSchedule;
  setSchedule: (patch: Partial<IScoreSchedule>) => void;
  isImporting: boolean;
  onImportAnalytics: () => void;
}

const ScheduleSection = ({
  t,
  config,
  schedule,
  setSchedule,
  isImporting,
  onImportAnalytics,
}: ScheduleSectionProps) => {
  const {
    inputClasses,
    textPrimary,
    textTertiary,
    textSecondary,
    borderColor,
  } = useThemeClasses();

  const automatic = schedule.mode === "automatic";
  const fieldLabel = clsx("flex flex-col gap-1 text-sm", textSecondary);
  const fieldInput = clsx("px-3 py-2 rounded-lg border", inputClasses);
  const toggleText = { onText: t("on"), offText: t("off") };
  const sectionIcon = clsx("w-5 h-5 shrink-0", textSecondary);

  let scheduleSummary = t("summary_daily", { time: schedule.time });
  if (!automatic) scheduleSummary = t("mode_manual");
  else if (schedule.frequency === "hourly")
    scheduleSummary = t("summary_hourly", { hours: schedule.everyHours });
  else if (schedule.frequency === "weekly")
    scheduleSummary = t("summary_weekly", {
      day: t(WEEKDAY_KEYS[schedule.dayOfWeek]),
      time: schedule.time,
    });

  return (
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
          <div className="flex-1 min-w-56">
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
              onChange={(e) => setSchedule({ endDate: e.target.value || null })}
              className={fieldInput}
            />
            <span className={clsx("text-xs", textTertiary)}>
              {t("end_date_hint")}
            </span>
          </label>
        </fieldset>

        {/* refresh GA4 inside every full run */}
        <div className="flex flex-wrap items-center gap-4">
          <ScoreToggle
            id="score-import-before-run"
            checked={schedule.importAnalyticsBeforeRun !== false}
            onChange={(on) => setSchedule({ importAnalyticsBeforeRun: on })}
            label={t("import_before_run")}
            {...toggleText}
          />
          <div className="flex-1 min-w-56">
            <div className={clsx("font-medium", textPrimary)}>
              {t("import_before_run")}
            </div>
            <div className={clsx("text-sm", textTertiary)}>
              {t("import_before_run_desc")}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className={fieldLabel} htmlFor="ga-resync-days">
            {t("ga_resync_days")}
            <input
              id="ga-resync-days"
              type="number"
              min={1}
              max={30}
              value={schedule.analyticsResyncDays ?? 3}
              onChange={(e) =>
                setSchedule({
                  analyticsResyncDays: Math.min(
                    30,
                    Math.max(1, Number(e.target.value) || 1),
                  ),
                })
              }
              className={clsx(fieldInput, "tabular-nums")}
            />
            <span className={clsx("text-xs", textTertiary)}>
              {t("ga_resync_days_hint")}
            </span>
          </label>
          <label className={fieldLabel} htmlFor="ga-backfill-days">
            {t("ga_backfill_days")}
            <input
              id="ga-backfill-days"
              type="number"
              min={1}
              max={365}
              value={schedule.analyticsBackfillDays ?? 30}
              onChange={(e) =>
                setSchedule({
                  analyticsBackfillDays: Math.min(
                    365,
                    Math.max(1, Number(e.target.value) || 1),
                  ),
                })
              }
              className={clsx(fieldInput, "tabular-nums")}
            />
            <span className={clsx("text-xs", textTertiary)}>
              {t("ga_backfill_days_hint")}
            </span>
          </label>
        </div>

        {/* GA4 import - runs nightly at 02:30, before the score run */}
        <div
          className={clsx(
            "flex flex-wrap items-center gap-3 pt-4 border-t",
            borderColor,
          )}
        >
          <BarChart3 className={sectionIcon} />
          <div className="flex-1 min-w-56">
            <div className={clsx("font-medium", textPrimary)}>
              {t("ga_import")}
            </div>
            <div className={clsx("text-xs", textTertiary)}>
              {t("ga_last_import", {
                date: config.status.lastAnalyticsImportOn ?? t("never"),
              })}
            </div>
            <div className={clsx("text-sm", textTertiary)}>
              {t("ga_import_desc")}
            </div>
          </div>
          <button
            type="button"
            disabled={isImporting}
            onClick={onImportAnalytics}
            className={clsx(
              "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
              borderColor,
              textSecondary,
            )}
          >
            {isImporting
              ? t("ga_importing")
              : t("ga_import_now", {
                  days: schedule.analyticsBackfillDays ?? 30,
                })}
          </button>
        </div>
      </div>
    </CollapsibleCard>
  );
};

export default ScheduleSection;
