interface SkeletonSectionProps {
  isDark: boolean;
}

export const SkeletonSection = ({ isDark }: SkeletonSectionProps) => (
  <div
    className={`p-5 rounded-2xl border animate-pulse ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"}`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-xl ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
        />
        <div className="space-y-2">
          <div
            className={`h-5 w-32 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
          />
          <div
            className={`h-3 w-20 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
          />
        </div>
      </div>
      <div
        className={`h-8 w-20 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
      />
    </div>
  </div>
);
