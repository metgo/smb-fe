interface SkeletonCardProps {
  isDark: boolean;
}

export const SkeletonCard = ({ isDark }: SkeletonCardProps) => (
  <div
    className={`p-6 rounded-2xl border animate-pulse ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"}`}
  >
    <div
      className={`h-4 w-24 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
    />
    <div
      className={`h-8 w-32 rounded-lg mt-3 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
    />
    <div
      className={`h-4 w-40 rounded-lg mt-4 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
    />
  </div>
);
