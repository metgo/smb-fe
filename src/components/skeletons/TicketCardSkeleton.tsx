const TicketCardSkeleton = ({ isDark }: { isDark: boolean }) => {
  const base = isDark ? "bg-gray-700/40" : "bg-gray-200/60";

  return (
    <div
      className={`p-6 rounded-xl border animate-pulse ${
        isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-4">
            <div className={`h-5 w-40 rounded ${base}`} />
            <div className={`h-6 w-16 rounded-full ${base}`} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`h-4 w-24 rounded ${base}`} />
            <div className={`h-4 w-24 rounded ${base}`} />
            <div className={`h-4 w-32 rounded ${base}`} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl ${base}`} />
          <div className={`h-10 w-10 rounded-xl ${base}`} />
        </div>
      </div>
    </div>
  );
};
export default TicketCardSkeleton;
