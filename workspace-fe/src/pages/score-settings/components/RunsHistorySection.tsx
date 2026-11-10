import clsx from "clsx";
import { History } from "lucide-react";

import CollapsibleCard from "@/components/score/CollapsibleCard";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import type { IScoreRun } from "@/store/api/businessScoreApi";

interface RunsHistorySectionProps {
  t: (key: string, options?: Record<string, unknown>) => string;
  runs: IScoreRun[];
  formatDateTime: (value: string) => string;
  runResult: (run: IScoreRun) => {
    text: string;
    tone: "good" | "warn" | "bad";
  };
}

const RunsHistorySection = ({
  t,
  runs,
  formatDateTime,
  runResult,
}: RunsHistorySectionProps) => {
  const { isDark, textTertiary, textSecondary, borderColor } =
    useThemeClasses();
  const sectionIcon = clsx("w-5 h-5 shrink-0", textSecondary);

  return (
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
                    <td className="py-2 pe-4">{t(`trigger_${run.trigger}`)}</td>
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
  );
};

export default RunsHistorySection;
