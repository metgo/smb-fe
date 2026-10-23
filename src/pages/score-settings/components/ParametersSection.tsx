import clsx from "clsx";
import { SlidersHorizontal } from "lucide-react";

import CollapsibleCard from "@/components/score/CollapsibleCard";
import ScoreToggle from "@/components/score/ScoreToggle";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { SCORE_PARAM_KEYS } from "@/components/score/scoreMeta";
import type { IScoreConfig } from "@/store/api/businessScoreApi";

interface ParametersSectionProps {
  t: (key: string, options?: Record<string, unknown>) => string;
  params: IScoreConfig["params"];
  paramsEnabled: IScoreConfig["paramsEnabled"];
  setParams: (params: IScoreConfig["params"]) => void;
  setParamsEnabled: (paramsEnabled: IScoreConfig["paramsEnabled"]) => void;
  countOn: (on: number, total: number) => string;
}

const ParametersSection = ({
  t,
  params,
  paramsEnabled,
  setParams,
  setParamsEnabled,
  countOn,
}: ParametersSectionProps) => {
  const {
    inputClasses,
    textPrimary,
    textTertiary,
    textSecondary,
    borderColor,
  } = useThemeClasses();

  const rowClass = clsx(
    "flex flex-wrap items-center gap-3 py-3 border-b last:border-b-0",
    borderColor,
  );
  const toggleText = { onText: t("on"), offText: t("off") };
  const sectionIcon = clsx("w-5 h-5 shrink-0", textSecondary);
  const paramsOn = SCORE_PARAM_KEYS.filter(
    (key) => paramsEnabled[key] !== false,
  ).length;

  return (
    <CollapsibleCard
      id="parameters"
      title={t("parameters")}
      description={t("parameters_desc")}
      icon={<SlidersHorizontal className={sectionIcon} />}
      summary={countOn(paramsOn, SCORE_PARAM_KEYS.length)}
    >
      {SCORE_PARAM_KEYS.map((key) => {
        const on = paramsEnabled[key] !== false;
        return (
          <div key={key} className={rowClass}>
            <ScoreToggle
              id={`param-toggle-${key}`}
              checked={on}
              onChange={(value) =>
                setParamsEnabled({ ...paramsEnabled, [key]: value })
              }
              label={t(`param_${key}`)}
              {...toggleText}
            />
            <div className="flex-1 min-w-48">
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
              value={params[key] ?? ""}
              onChange={(e) =>
                setParams({
                  ...params,
                  [key]: e.target.value === "" ? 0 : Number(e.target.value),
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
  );
};

export default ParametersSection;
