// components/shared/ListHeaderBar.tsx
import clsx from "clsx";
import { Plus } from "lucide-react";
import StatsMarquee, { type StatItem } from "./StatsMarquee";

interface ListHeaderBarProps {
  title: string;
  /** Tailwind gradient stop classes, e.g. "from-blue-500 via-indigo-600 to-purple-600" */
  titleGradient?: string;
  count?: number;
  /** Tailwind classes for the count badge (bg/text/border), default teal */
  countBadgeClassName?: string;
  addLabel?: string;
  onAdd?: () => void;
  stats?: StatItem[];
  isStatsLoading?: boolean;
  dataTourHeader?: string;
  dataTourStats?: string;
}

export default function ListHeaderBar({
  title,
  titleGradient = "from-blue-500 via-indigo-600 to-purple-600",
  count,
  countBadgeClassName = "bg-teal-500/10 text-teal-400 border-teal-500/20",
  addLabel,
  onAdd,
  stats: statsProp,
  isStatsLoading,
  dataTourHeader,
  dataTourStats,
}: ListHeaderBarProps) {
  const stats = statsProp ?? [];
  return (
    <>
      <div
        className="flex flex-col items-start gap-1 shrink-0"
        data-tour={dataTourHeader}
      >
        <div className="flex items-center w-full justify-between gap-2">
          <div className="flex items-center gap-1">
            <h1
              className={clsx(
                "text-base md:text-lg font-bold bg-clip-text bg-linear-to-r text-transparent whitespace-nowrap",
                titleGradient,
              )}
            >
              {title}
            </h1>
            {!!count && (
              <span
                className={clsx(
                  "px-2 py-0.5 text-xs font-semibold rounded-full border shrink-0",
                  countBadgeClassName,
                )}
              >
                {count}
              </span>
            )}
          </div>

          {/* Mobile: icon-only gradient add button */}
          {onAdd && (
            <div className="flex xl:hidden items-center gap-2 shrink-0">
              <button
                onClick={onAdd}
                title={addLabel}
                className={clsx(
                  "p-2 rounded-xl text-white shadow-sm transition-all cursor-pointer active:scale-95 hover:opacity-90 shrink-0 bg-linear-to-r",
                  titleGradient,
                )}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Desktop: full label+icon add button */}
        {onAdd && (
          <button
            onClick={onAdd}
            className={clsx(
              "hidden xl:flex px-3.5 py-2 text-xs font-semibold text-white rounded-lg transition-all items-center gap-1.5 cursor-pointer shrink-0 shadow-sm whitespace-nowrap hover:opacity-90 active:scale-95 bg-linear-to-r",
              titleGradient,
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{addLabel}</span>
          </button>
        )}
      </div>

      {(isStatsLoading || stats.length > 0) && (
        <div
          data-tour={dataTourStats}
          dir="ltr"
          className="flex-1 min-w-0 flex flex-row items-center gap-2 overflow-x-auto flex-nowrap py-0.5 scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          <StatsMarquee
            data-tour={dataTourStats}
            stats={stats}
            isLoading={isStatsLoading}
            className="flex-1 min-w-0"
          />
        </div>
      )}
    </>
  );
}
