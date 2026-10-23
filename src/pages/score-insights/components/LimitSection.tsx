import clsx from "clsx";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { chartTheme, MAX, MIN } from "../chartTheme";

interface LimitSectionProps {
  t: (key: string, options?: Record<string, unknown>) => string;
  limit: number;
  setLimit: (limit: number) => void;
  atOrAbove: number;
  below: number;
  pct: (n: number) => number;
}

const LimitSection = ({
  t,
  limit,
  setLimit,
  atOrAbove,
  below,
  pct,
}: LimitSectionProps) => {
  const {
    isDark,
    cardClasses,
    inputClasses,
    textPrimary,
    textSecondary,
    textTertiary,
  } = useThemeClasses();
  const { colors } = chartTheme(isDark);

  const card = clsx("rounded-xl p-5 flex flex-col gap-3 min-w-0", cardClasses);
  const title = clsx("font-semibold", textPrimary);
  const sub = clsx("text-sm", textTertiary);

  return (
    <section className={card} aria-labelledby="limit-title">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[14rem]">
          <h2 id="limit-title" className={title}>
            {t("insights_limit_title")}
          </h2>
          <p className={sub}>{t("insights_limit_desc")}</p>
        </div>
        <label
          htmlFor="score-limit"
          className={clsx("flex items-center gap-2 text-sm", textSecondary)}
        >
          {t("insights_limit")}
          <input
            id="score-limit"
            type="number"
            min={MIN}
            max={MAX}
            step={10}
            value={limit}
            onChange={(e) =>
              setLimit(
                Math.min(MAX, Math.max(MIN, Number(e.target.value) || MIN)),
              )
            }
            className={clsx(
              "w-24 px-2 py-1.5 rounded-md border text-end tabular-nums",
              inputClasses,
            )}
          />
        </label>
      </div>
      <input
        type="range"
        min={MIN}
        max={MAX}
        step={10}
        value={limit}
        onChange={(e) => setLimit(Number(e.target.value))}
        aria-label={t("insights_limit")}
        className="w-full accent-emerald-600"
      />
      <div className="flex flex-wrap gap-x-8 gap-y-1">
        <span className={textPrimary}>
          <b className="text-2xl tabular-nums">{atOrAbove.toLocaleString()}</b>{" "}
          {t("insights_at_or_above", { limit, pct: pct(atOrAbove) })}
        </span>
        <span className={textPrimary}>
          <b className="text-2xl tabular-nums">{below.toLocaleString()}</b>{" "}
          {t("insights_below", { limit, pct: pct(below) })}
        </span>
      </div>
      <div
        className="flex h-3 rounded-full overflow-hidden gap-0.5"
        role="img"
        aria-label={t("insights_limit_bar", { atOrAbove, below })}
      >
        <div style={{ flex: below || 0.0001, background: colors.band.low }} />
        <div
          style={{ flex: atOrAbove || 0.0001, background: colors.band.high }}
        />
      </div>
    </section>
  );
};

export default LimitSection;
