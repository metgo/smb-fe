const UserCardSkeleton = ({ isDark }: { isDark: boolean }) => {
  const base = isDark ? "bg-gray-700/50" : "bg-gray-200/70";
  const card = isDark
    ? "bg-gray-800/50 border border-gray-700"
    : "bg-white border border-gray-200 shadow-sm";
  return (
    <div className={`rounded-xl p-5 animate-pulse ${card}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-11 h-11 rounded-full ${base}`} />
        <div className="space-y-2 flex-1">
          <div className={`h-4 w-2/3 rounded ${base}`} />
          <div className={`h-3 w-1/3 rounded-full ${base}`} />
        </div>
      </div>
      <div className="space-y-2">
        <div className={`h-3 w-full rounded ${base}`} />
        <div className={`h-3 w-3/4 rounded ${base}`} />
      </div>

      <div className="w-full h-1" />
      <div className="space-y-2">
        <div className={`h-3 w-full rounded ${base}`} />
        <div className={`h-3 w-3/4 rounded ${base}`} />
      </div>
    </div>
  );
};

export default UserCardSkeleton;
