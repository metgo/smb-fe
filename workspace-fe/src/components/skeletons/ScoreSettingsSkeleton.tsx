import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";

const CardSkeleton = ({
  bar,
  cardClasses,
}: {
  bar: string;
  cardClasses: string;
}) => (
  <div className={clsx("rounded-xl p-5 flex flex-col gap-3", cardClasses)}>
    <div className="flex items-center gap-3">
      <div className={clsx("w-5 h-5 rounded-md", bar)} />
      <div className={clsx("h-4 w-40 rounded-md", bar)} />
    </div>
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex flex-wrap items-center gap-3 py-1">
        <div className={clsx("h-6 w-11 rounded-full", bar)} />
        <div className="flex-1 min-w-[10rem] space-y-1.5">
          <div className={clsx("h-3.5 w-32 rounded-md", bar)} />
          <div className={clsx("h-3 w-48 rounded-md", bar)} />
        </div>
        <div className={clsx("h-8 w-20 rounded-md", bar)} />
      </div>
    ))}
  </div>
);

const ScoreSettingsSkeleton = () => {
  const { isDark, cardClasses, borderColor } = useThemeClasses();
  const bar = isDark ? "bg-gray-700" : "bg-gray-200";

  return (
    <div className="flex flex-col gap-4 pb-10 max-w-5xl animate-pulse">
      {/* header */}
      <div className="flex flex-wrap items-start gap-3 justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className={clsx("w-7 h-7 mt-1 rounded-lg", bar)} />
          <div className="space-y-2">
            <div className={clsx("h-6 w-48 rounded-md", bar)} />
            <div className={clsx("h-4 w-64 rounded-md", bar)} />
            <div className={clsx("h-3 w-20 rounded-md", bar)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className={clsx("h-9 w-28 rounded-lg", bar)} />
          <div className={clsx("h-9 w-32 rounded-lg", bar)} />
        </div>
      </div>

      {/* status */}
      <div
        className={clsx(
          "rounded-xl border p-4 flex flex-wrap items-center gap-x-6 gap-y-2",
          borderColor,
        )}
      >
        <div className={clsx("h-4 w-24 rounded-md", bar)} />
        <div className={clsx("h-4 w-40 rounded-md", bar)} />
        <div className={clsx("h-4 w-48 rounded-md", bar)} />
        <div className={clsx("h-4 w-28 rounded-md ms-auto", bar)} />
      </div>

      {/* collapsible sections */}
      <CardSkeleton bar={bar} cardClasses={cardClasses} />
      <CardSkeleton bar={bar} cardClasses={cardClasses} />
      <CardSkeleton bar={bar} cardClasses={cardClasses} />

      {/* run log */}
      <div className={clsx("rounded-xl p-5 flex flex-col gap-3", cardClasses)}>
        <div className="flex items-center gap-3">
          <div className={clsx("w-5 h-5 rounded-md", bar)} />
          <div className={clsx("h-4 w-32 rounded-md", bar)} />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className={clsx("h-4 w-full rounded-md", bar)} />
        ))}
      </div>
    </div>
  );
};

export default ScoreSettingsSkeleton;
