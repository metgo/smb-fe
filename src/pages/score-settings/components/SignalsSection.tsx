import clsx from "clsx";
import { Layers } from "lucide-react";

import CollapsibleCard from "@/components/score/CollapsibleCard";
import ScoreToggle from "@/components/score/ScoreToggle";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { SCORE_SIGNAL_KEYS } from "@/components/score/scoreMeta";
import type { IScoreConfig } from "@/store/api/businessScoreApi";

interface SignalsSectionProps {
  t: (key: string, options?: Record<string, unknown>) => string;
  signals: IScoreConfig["signals"];
  setSignal: (
    key: string,
    patch: { enabled?: boolean; weight?: number },
  ) => void;
  signalStatus: (key: (typeof SCORE_SIGNAL_KEYS)[number]) => string;
  countOn: (on: number, total: number) => string;
}

const SignalsSection = ({
  t,
  signals,
  setSignal,
  signalStatus,
  countOn,
}: SignalsSectionProps) => {
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
  const signalsOn = SCORE_SIGNAL_KEYS.filter(
    (key) => signals[key]?.enabled,
  ).length;

  return (
    <CollapsibleCard
      id="signals"
      title={t("signals")}
      description={t("signals_desc")}
      icon={<Layers className={sectionIcon} />}
      summary={countOn(signalsOn, SCORE_SIGNAL_KEYS.length)}
    >
      {SCORE_SIGNAL_KEYS.map((key) => {
        const setting = signals[key];
        return (
          <div key={key} className={rowClass}>
            <ScoreToggle
              id={`signal-${key}`}
              checked={setting.enabled}
              onChange={(enabled) => setSignal(key, { enabled })}
              label={t(`signal_${key}`)}
              {...toggleText}
            />
            <div className="flex-1 min-w-48">
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
              className={clsx("flex items-center gap-2 text-sm", textSecondary)}
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
                      Math.min(100, Math.max(0, Number(e.target.value) || 0)) /
                      100,
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
  );
};

export default SignalsSection;
