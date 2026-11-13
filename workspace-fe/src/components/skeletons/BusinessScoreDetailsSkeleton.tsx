import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";

const BusinessScoreDetailsSkeleton = () => {
  const { isDark, cardClasses } = useThemeClasses();
  const bar = isDark ? "bg-gray-700" : "bg-gray-200";

  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {/* headline */}
      <div
        className={clsx(
          "rounded-xl p-5 flex flex-wrap items-center gap-5",
          cardClasses,
        )}
      >
        <div className="flex items-center gap-3">
          <div className={clsx("w-8 h-8 rounded-lg", bar)} />
          <div className="space-y-2">
            <div className={clsx("h-3 w-24 rounded-md", bar)} />
            <div className={clsx("h-7 w-16 rounded-md", bar)} />
          </div>
        </div>
        <div className={clsx("h-6 w-16 rounded-full", bar)} />
        <div className={clsx("h-4 w-28 rounded-md ms-auto", bar)} />
        <div className={clsx("h-8 w-32 rounded-lg", bar)} />
      </div>

      {/* suggestions */}
      <div className={clsx("rounded-xl p-5 space-y-3", cardClasses)}>
        <div className={clsx("h-4 w-32 rounded-md", bar)} />
        {[...Array(2)].map((_, i) => (
          <div key={i} className={clsx("h-4 w-full rounded-md", bar)} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* signals */}
        <div
          className={clsx("rounded-xl p-5 flex flex-col gap-3", cardClasses)}
        >
          <div className={clsx("h-4 w-20 rounded-md", bar)} />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex justify-between gap-2">
                <div className={clsx("h-3 w-28 rounded-md", bar)} />
                <div className={clsx("h-3 w-16 rounded-md", bar)} />
              </div>
              <div className={clsx("h-2 w-full rounded-full", bar)} />
            </div>
          ))}
        </div>

        {/* history + metrics */}
        <div className="flex flex-col gap-4">
          <div className={clsx("rounded-xl p-5", cardClasses)}>
            <div className={clsx("h-4 w-20 rounded-md mb-3", bar)} />
            <div className={clsx("h-40 w-full rounded-lg", bar)} />
          </div>
          <div className={clsx("rounded-xl p-5", cardClasses)}>
            <div className={clsx("h-4 w-24 rounded-md mb-3", bar)} />
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex justify-between gap-2">
                  <div className={clsx("h-3 w-20 rounded-md", bar)} />
                  <div className={clsx("h-3 w-10 rounded-md", bar)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessScoreDetailsSkeleton;
