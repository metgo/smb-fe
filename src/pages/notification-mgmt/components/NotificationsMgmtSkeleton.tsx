import clsx from "clsx";

const Pulse = ({ className }: { className?: string }) => (
  <div
    className={clsx(
      "animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md",
      className,
    )}
  />
);

// Mirrors one stat card from NotificationStatsCards
const StatCardSkeleton = () => (
  <div className="rounded-2xl p-4 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 space-y-3">
    <Pulse className="w-10 h-10 rounded-xl" />
    <Pulse className="h-6 w-10" />
    <Pulse className="h-3 w-16" />
  </div>
);

// Mirrors one notification row
const NotificationRowSkeleton = () => (
  <div className="flex items-start gap-3 px-4 py-8 border-l-2 border-gray-200 dark:border-gray-700">
    {/* Icon */}
    <Pulse className="shrink-0 mt-0.5 w-5 h-5 rounded-full" />

    <div className="flex flex-col gap-2 flex-1">
      {/* Title */}
      <Pulse className="h-4 w-1/3" />
      {/* Message */}
      <Pulse className="h-3 w-2/3" />
      {/* Timestamp */}
      <Pulse className="h-3 w-20" />
    </div>
  </div>
);

const NotificationsMgmtSkeleton = () => {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="shrink-0 p-6 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-400 mx-auto space-y-2">
          <Pulse className="h-8 w-52" />
          <Pulse className="h-4 w-72" />
        </div>
      </div>

      {/* Stats & Toolbar */}
      <div className="shrink-0 p-6 pb-0">
        <div className="max-w-400 mx-auto">
          {/* Stats Cards — 7 columns mirrors NotificationStatsCards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
            {Array.from({ length: 7 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-4 mb-6">
            <Pulse className="flex-1 h-10 rounded-lg" />
            <Pulse className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-hidden px-6 pb-6">
        <div className="max-w-400 mx-auto">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 overflow-hidden divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: 8 }).map((_, i) => (
              <NotificationRowSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsMgmtSkeleton;
