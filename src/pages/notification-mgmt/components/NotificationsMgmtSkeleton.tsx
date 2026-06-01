import { useThemeClasses } from "@/hooks/useThemeClasses";
import clsx from "clsx";

const Pulse = ({
  className,
  isDark,
}: {
  className?: string;
  isDark: boolean;
}) => (
  <div
    className={clsx(
      "animate-pulse rounded-md",
      isDark ? "bg-gray-700" : "bg-gray-200",
      className,
    )}
  />
);

// Mirrors compact horizontal stat card from NotificationStatsCards
const StatCardSkeleton = ({ isDark }: { isDark: boolean }) => (
  <div
    className={clsx(
      "shrink-0 flex items-center gap-2 px-2.5 py-2 rounded-xl border",
      isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-gray-50",
    )}
  >
    <Pulse isDark={isDark} className="w-7 h-7 rounded-lg shrink-0" />
    <div className="space-y-1.5 min-w-0">
      <Pulse isDark={isDark} className="h-3.5 w-8" />
      <Pulse isDark={isDark} className="h-2.5 w-16" />
    </div>
  </div>
);

// Mirrors one notification row
const NotificationRowSkeleton = ({ isDark }: { isDark: boolean }) => (
  <div
    className={clsx(
      "flex items-start gap-3 px-4 py-8 border-l-2",
      isDark ? "border-gray-700" : "border-gray-200",
    )}
  >
    <div className="flex gap-3 flex-1">
      <Pulse isDark={isDark} className="shrink-0 mt-0.5 w-5 h-5 rounded-full" />
      <div className="flex flex-col gap-2 flex-1">
        <Pulse isDark={isDark} className="h-4 w-1/3" />
        <Pulse isDark={isDark} className="h-3 w-2/3" />
        <Pulse isDark={isDark} className="h-3 w-20" />
      </div>
    </div>
  </div>
);

const NotificationsMgmtSkeleton = () => {
  const { isDark } = useThemeClasses();
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div
        className={clsx(
          "shrink-0 p-4 sm:p-6 pb-4 border-b",
          isDark ? "border-gray-800" : "border-gray-200",
        )}
      >
        <div className="max-w-400 mx-auto space-y-2">
          <Pulse isDark={isDark} className="h-8 w-52" />
          <Pulse isDark={isDark} className="h-4 w-72" />
        </div>
      </div>

      {/* Stats & Toolbar */}
      <div className="shrink-0 p-4 sm:p-6 pb-0">
        <div className="max-w-400 mx-auto">
          {/* Stats Cards — mirrors NotificationStatsCards scroll+grid wrapper */}
          <div className="mb-4 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-2 sm:grid sm:grid-cols-4 lg:grid-cols-7 sm:overflow-visible min-w-max sm:min-w-0">
              {Array.from({ length: 7 }).map((_, i) => (
                <StatCardSkeleton key={i} isDark={isDark} />
              ))}
            </div>
          </div>

          {/* Toolbar: search + filter button */}
          <div className="flex items-center gap-4 mb-6">
            <Pulse isDark={isDark} className="flex-1 h-10 rounded-lg" />
            <Pulse isDark={isDark} className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-hidden px-4 sm:px-6 pb-6">
        <div className="max-w-400 mx-auto">
          <div
            className={clsx(
              "rounded-xl border overflow-hidden divide-y",
              isDark
                ? "border-gray-800 bg-gray-900 divide-gray-700"
                : "border-gray-200 bg-gray-50 divide-gray-200",
            )}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <NotificationRowSkeleton key={i} isDark={isDark} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsMgmtSkeleton;
