import clsx from "clsx";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Lightbulb } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { SIGNAL_BAR_COLOR } from "@/components/score/scoreMeta";
import type { IScoreSuggestion } from "@/store/api/businessScoreApi";

const VISIBLE = 6;

// the owner's personal to-do list, worked out from their own breakdown on
// each score run, biggest estimated gain first
const ScoreSuggestions = ({
  suggestions,
}: {
  suggestions: IScoreSuggestion[];
}) => {
  const { t } = useTranslation("score");
  const { isDark, cardClasses, textPrimary, textSecondary, textTertiary } =
    useThemeClasses();
  const [showAll, setShowAll] = useState(false);
  const list = showAll ? suggestions : suggestions.slice(0, VISIBLE);
  const total = suggestions.reduce((sum, s) => sum + s.points, 0);

  return (
    <section
      className={clsx("rounded-xl p-5 flex flex-col gap-3", cardClasses)}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Lightbulb
          className={clsx(
            "w-5 h-5",
            isDark ? "text-amber-300" : "text-amber-600",
          )}
        />
        <h3 className={clsx("font-semibold flex-1", textPrimary)}>
          {t("raise_title")}
        </h3>
        {total > 0 && (
          <span className={clsx("text-sm", textTertiary)}>
            {t("raise_total", { points: Math.min(total, 600) })}
          </span>
        )}
      </div>
      <p className={clsx("text-sm", textTertiary)}>{t("raise_desc")}</p>

      {suggestions.length === 0 ? (
        <p className={clsx("text-sm", textSecondary)}>{t("raise_none")}</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {list.map((s) => (
            <li
              key={s.key}
              className={clsx(
                "flex items-start gap-3 rounded-lg border p-3",
                isDark ? "border-gray-700" : "border-gray-200",
              )}
            >
              <span
                className={clsx(
                  "mt-1.5 inline-block w-2.5 h-2.5 rounded-full shrink-0",
                  SIGNAL_BAR_COLOR[s.signal],
                )}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <div className={clsx("text-sm font-medium", textPrimary)}>
                  {t(`tip_${s.key}`, s.params ?? {})}
                </div>
                <div className={clsx("text-xs", textTertiary)}>
                  {t(`signal_${s.signal}`)}
                </div>
              </div>
              <span
                className={clsx(
                  "shrink-0 px-2 py-0.5 rounded-md text-xs font-semibold tabular-nums",
                  isDark
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-emerald-100 text-emerald-800",
                )}
              >
                {t("raise_points", { points: s.points })}
              </span>
            </li>
          ))}
        </ol>
      )}
      {suggestions.length > VISIBLE && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className={clsx(
            "self-start text-sm underline cursor-pointer",
            textSecondary,
          )}
        >
          {showAll
            ? t("raise_show_less")
            : t("raise_show_all", { count: suggestions.length })}
        </button>
      )}
      <p className={clsx("text-xs", textTertiary)}>{t("raise_note")}</p>
    </section>
  );
};

export default ScoreSuggestions;
