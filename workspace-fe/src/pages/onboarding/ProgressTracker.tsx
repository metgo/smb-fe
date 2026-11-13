import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, PartyPopper, type LucideIcon } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";

export interface Milestone {
  key: string;
  /** First and last wizard step of this milestone. */
  from: number;
  to: number;
  icon: LucideIcon;
}

const cheerKey = (pct: number, isLast: boolean) =>
  isLast
    ? "cheer_last"
    : pct < 20
      ? "cheer_start"
      : pct < 45
        ? "cheer_good"
        : pct < 70
          ? "cheer_half"
          : "cheer_almost";

/**
 * The wizard's progress: a thick bar with the percentage, a short cheer that
 * changes as the vendor advances, the milestones as badges, and a small
 * "well done" note each time a milestone is completed.
 */
export function ProgressTracker({
  step,
  lastStep,
  milestones,
}: {
  step: number;
  lastStep: number;
  milestones: Milestone[];
}) {
  const { t } = useTranslation("onboarding");
  const { textPrimary, textTertiary, isDark } = useThemeClasses();
  const reduceMotion = useReducedMotion();

  const pct = Math.round((Math.min(step, lastStep) / lastStep) * 100);
  const currentIdx = milestones.findIndex(
    (m) => step >= m.from && step <= m.to,
  );
  const stepsLeft = Math.max(lastStep - step + 1, 0);

  // Celebrate a finished milestone when the vendor moves forward past it.
  const [achieved, setAchieved] = useState<string | null>(null);
  const prevStep = useRef(step);
  useEffect(() => {
    const prev = prevStep.current;
    prevStep.current = step;
    if (step <= prev) return;
    const finished = milestones.find((m) => prev <= m.to && step > m.to);
    if (!finished) return;
    setAchieved(finished.key);
  }, [step, milestones]);
  useEffect(() => {
    if (!achieved) return;
    const id = window.setTimeout(() => setAchieved(null), 2600);
    return () => window.clearTimeout(id);
  }, [achieved]);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-3 pt-1">
      <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
        <p className={clsx("font-semibold", textPrimary)}>
          {t(cheerKey(pct, step === lastStep))}
          <span
            className={clsx(
              "ms-2 font-bold tabular-nums",
              isDark ? "text-teal-300" : "text-teal-700",
            )}
          >
            {t("progress_pct", { pct })}
          </span>
        </p>
        <p className={clsx("shrink-0 text-xs tabular-nums", textTertiary)}>
          {t("steps_left", { count: stepsLeft })}
        </p>
      </div>

      <div
        className={clsx(
          "relative h-2.5 overflow-hidden rounded-full",
          isDark ? "bg-gray-800" : "bg-gray-200",
        )}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={t("progress")}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-600 to-emerald-400 transition-[width] duration-500 ease-out motion-reduce:transition-none rtl:bg-gradient-to-l"
          style={{ width: `${Math.max(pct, 3)}%` }}
        />
      </div>

      <ol className="mt-3 flex items-start justify-between gap-1">
        {milestones.map((m, i) => {
          const done = i < currentIdx || step > m.to;
          const active = i === currentIdx;
          const Icon = done ? Check : m.icon;
          return (
            <li
              key={m.key}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
              aria-current={active ? "step" : undefined}
            >
              <motion.span
                initial={false}
                animate={
                  done && !reduceMotion ? { scale: [1, 1.2, 1] } : { scale: 1 }
                }
                transition={{ duration: 0.35 }}
                className={clsx(
                  "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors",
                  done
                    ? "border-teal-600 bg-teal-600 text-white"
                    : active
                      ? isDark
                        ? "border-teal-400 bg-teal-950 text-teal-300"
                        : "border-teal-600 bg-teal-50 text-teal-700"
                      : isDark
                        ? "border-gray-700 bg-gray-900 text-gray-500"
                        : "border-gray-200 bg-white text-gray-400",
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
              </motion.span>
              <span
                className={clsx(
                  "whitespace-nowrap text-[11px] leading-4",
                  active
                    ? clsx("font-semibold", textPrimary)
                    : clsx("hidden sm:block", textTertiary),
                )}
              >
                {t(`ms_${m.key}`)}
                {done && <span className="sr-only"> ✓</span>}
              </span>
            </li>
          );
        })}
      </ol>

      <div aria-live="polite" className="relative h-0">
        <AnimatePresence>
          {achieved && (
            <motion.div
              key={achieved}
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -6, scale: 0.9 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
              className={clsx(
                "absolute inset-x-0 top-2 z-10 mx-auto flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium shadow-lg",
                isDark ? "bg-teal-500 text-gray-950" : "bg-teal-600 text-white",
              )}
            >
              <PartyPopper className="h-4 w-4" aria-hidden />
              {t("milestone_done", { name: t(`ms_${achieved}`) })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
