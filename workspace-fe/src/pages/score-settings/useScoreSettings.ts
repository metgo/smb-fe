import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";

import {
  SCORE_SIGNAL_KEYS,
  SCORE_PARAM_KEYS,
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

export const WEEKDAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export const useScoreSettings = () => {
  const { t, i18n } = useTranslation("score");

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
      timeZone: config?.status.timeZone,
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
    if (!draft) return false;
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
    if (!draft) return;
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
      if (summary.analyticsImport?.failedSites.length)
        toast.warning(
          t("ga_import_failed_sites", {
            sites: summary.analyticsImport.failedSites.join(", "),
          }),
        );
    } catch (error) {
      toast.error(errorMessage(error, t("run_failed")));
    }
  };

  const handleImportAnalytics = async () => {
    if (!draft) return;
    try {
      const results = await importAnalytics({
        days: draft.schedule.analyticsBackfillDays ?? 30,
      }).unwrap();
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
  };

  const runResult = (run: IScoreRun) => {
    if (run.error)
      return { text: t("run_result_failed"), tone: "bad" as const };
    if (run.skipped)
      return { text: t("run_result_skipped"), tone: "warn" as const };
    return { text: t("run_result_ok"), tone: "good" as const };
  };

  const signalStatus = (key: (typeof SCORE_SIGNAL_KEYS)[number]) => {
    if (!draft) return "–";
    if (!draft.signals[key].enabled) return t("not_counted");
    if (UNAVAILABLE_SIGNALS.includes(key)) return t("reason_not available yet");
    if (effective[key] === undefined) return "–";
    return `${t("effective_weight")} ${Math.round(effective[key] * 100)}%`;
  };

  const resetDraft = () => {
    if (config) setDraft(structuredClone(config));
  };

  return {
    t,
    config,
    isLoading,
    runs,
    draft,
    setDraft,
    lastPreview,
    confirmOpen,
    setConfirmOpen,
    isDirty,
    isSaving,
    isRunning,
    isImporting,
    effective,
    hasLiveSignal,
    formatSlot,
    formatDateTime,
    setSchedule,
    setSignal,
    handleSave,
    handlePreview,
    handleRecalculate,
    handleImportAnalytics,
    runResult,
    signalStatus,
    resetDraft,
  };
};
