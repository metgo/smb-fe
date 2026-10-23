import clsx from "clsx";
import { ToggleRight } from "lucide-react";

import CollapsibleCard from "@/components/score/CollapsibleCard";
import ScoreToggle from "@/components/score/ScoreToggle";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  SCORE_FACTOR_GROUPS,
  SCORE_FACTOR_KEYS,
} from "@/components/score/scoreMeta";
import type { IScoreConfig } from "@/store/api/businessScoreApi";

interface FactorsSectionProps {
  t: (key: string, options?: Record<string, unknown>) => string;
  factors: IScoreConfig["factors"];
  setFactors: (factors: IScoreConfig["factors"]) => void;
  countOn: (on: number, total: number) => string;
}

const FactorsSection = ({
  t,
  factors,
  setFactors,
  countOn,
}: FactorsSectionProps) => {
  const { textPrimary, textTertiary, textSecondary, borderColor } =
    useThemeClasses();

  const rowClass = clsx(
    "flex flex-wrap items-center gap-3 py-3 border-b last:border-b-0",
    borderColor,
  );
  const toggleText = { onText: t("on"), offText: t("off") };
  const sectionIcon = clsx("w-5 h-5 shrink-0", textSecondary);
  const factorsOn = SCORE_FACTOR_KEYS.filter(
    (key) => factors[key] !== false,
  ).length;

  return (
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
                    checked={factors[key] !== false}
                    onChange={(on) => setFactors({ ...factors, [key]: on })}
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
  );
};

export default FactorsSection;
