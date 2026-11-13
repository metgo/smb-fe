import clsx from "clsx";
import { ScanEye } from "lucide-react";

import CollapsibleCard from "@/components/score/CollapsibleCard";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import type { IScoreRunSummary } from "@/store/api/businessScoreApi";

interface PreviewResultSectionProps {
  t: (key: string, options?: Record<string, unknown>) => string;
  preview: IScoreRunSummary;
}

const PreviewResultSection = ({ t, preview }: PreviewResultSectionProps) => {
  const { textPrimary, textTertiary, textSecondary, borderColor } =
    useThemeClasses();
  const sectionIcon = clsx("w-5 h-5 shrink-0", textSecondary);

  return (
    <CollapsibleCard
      id="preview"
      title={t("preview_result")}
      icon={<ScanEye className={sectionIcon} />}
      summary={`${t("median")} ${preview.distribution?.median ?? "–"}`}
      defaultOpen
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            [t("scored"), preview.scored],
            [t("min"), preview.distribution?.min ?? "–"],
            [t("median"), preview.distribution?.median ?? "–"],
            [t("average"), preview.distribution?.average ?? "–"],
            [t("max"), preview.distribution?.max ?? "–"],
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
          {preview.liveSignals
            .map(
              (key) =>
                `${t(`signal_${key}`)} ${Math.round((preview.effectiveWeights[key] ?? 0) * 100)}%`,
            )
            .join(" · ") || "–"}
        </div>
        {preview.skippedSignals.length > 0 && (
          <div className={clsx("text-sm", textTertiary)}>
            <span className="font-medium">{t("skipped_signals")}: </span>
            {preview.skippedSignals
              .map(
                (s) => `${t(`signal_${s.key}`)} (${t(`reason_${s.reason}`)})`,
              )
              .join(" · ")}
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
};

export default PreviewResultSection;
