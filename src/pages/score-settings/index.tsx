import { ConfirmDialog } from "@/components/shared";
import { ScoreSettingsSkeleton } from "@/components/skeletons";
import {
  ScoreSettingsHeader,
  ScoreStatusBanner,
  ScheduleSection,
  SignalsSection,
  FactorsSection,
  ParametersSection,
  PreviewResultSection,
  RunsHistorySection,
  SaveBar,
} from "./components";
import { useScoreSettings } from "./useScoreSettings";

const ScoreSettingsPage = () => {
  const {
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
  } = useScoreSettings();

  if (isLoading || !draft || !config) {
    return <ScoreSettingsSkeleton />;
  }

  const countOn = (on: number, total: number) => t("count_on", { on, total });

  return (
    <div className="flex flex-col gap-4 pb-10">
      <ScoreSettingsHeader
        t={t}
        version={config.version}
        isDirty={isDirty}
        isRunning={isRunning}
        isSaving={isSaving}
        onPreview={handlePreview}
        onRecalculateClick={() => setConfirmOpen(true)}
      />

      <ScoreStatusBanner
        t={t}
        status={config.status}
        formatSlot={formatSlot}
        formatDateTime={formatDateTime}
        runResult={runResult}
      />

      <ScheduleSection
        t={t}
        config={config}
        schedule={draft.schedule}
        setSchedule={setSchedule}
        isImporting={isImporting}
        onImportAnalytics={handleImportAnalytics}
      />

      <SignalsSection
        t={t}
        signals={draft.signals}
        setSignal={setSignal}
        signalStatus={signalStatus}
        countOn={countOn}
      />

      <FactorsSection
        t={t}
        factors={draft.factors}
        setFactors={(factors) => setDraft({ ...draft, factors })}
        countOn={countOn}
      />

      <ParametersSection
        t={t}
        params={draft.params}
        paramsEnabled={draft.paramsEnabled}
        setParams={(params) => setDraft({ ...draft, params })}
        setParamsEnabled={(paramsEnabled) =>
          setDraft({ ...draft, paramsEnabled })
        }
        countOn={countOn}
      />

      {lastPreview && !lastPreview.skipped && (
        <PreviewResultSection t={t} preview={lastPreview} />
      )}

      <RunsHistorySection
        t={t}
        runs={runs}
        formatDateTime={formatDateTime}
        runResult={runResult}
      />

      {/* save bar - pinned to the bottom of the screen while there are
          unsaved changes, so it can't be missed on this long page */}
      {isDirty && (
        <SaveBar
          t={t}
          isSaving={isSaving}
          onReset={resetDraft}
          onSave={() => void handleSave()}
        />
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
