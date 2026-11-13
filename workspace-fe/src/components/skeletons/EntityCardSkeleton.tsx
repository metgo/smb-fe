import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";

const EntityCardSkeleton = () => {
  const { cardClasses, isDark } = useThemeClasses();

  return (
    <div
      className={clsx(
        "rounded-xl overflow-hidden relative animate-pulse",
        cardClasses,
      )}
    >
      {/* Status badge */}
      <div
        className={clsx(
          "absolute top-2 left-0 z-10 h-6 w-20 rounded-r-full",
          isDark ? "bg-gray-700" : "bg-gray-200",
        )}
      />

      {/* Action buttons */}
      <div className="absolute right-3 top-3 flex flex-col gap-2 z-10">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={clsx(
              "h-8 w-8 rounded-md",
              isDark ? "bg-gray-700" : "bg-gray-200",
            )}
          />
        ))}
      </div>

      {/* Logo area */}
      <div
        className={clsx(
          "h-20 sm:h-28 flex items-center justify-center",
          isDark ? "bg-gray-700/50" : "bg-gray-100",
        )}
      >
        <div
          className={clsx(
            "h-10 w-10 sm:h-16 sm:w-16 rounded-xl",
            isDark ? "bg-gray-600" : "bg-gray-200",
          )}
        />
      </div>

      {/* Body */}
      <div className="p-2 sm:p-4 space-y-2">
        {/* Name */}
        <div
          className={clsx(
            "h-5 w-3/4 rounded-md",
            isDark ? "bg-gray-700" : "bg-gray-200",
          )}
        />
        {/* Children slot (e.g. dmo badge row) */}
        <div
          className={clsx(
            "h-4 w-1/2 rounded-md",
            isDark ? "bg-gray-700" : "bg-gray-200",
          )}
        />
      </div>
    </div>
  );
};

const EntityCardsSkeleton = ({ count = 7 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 p-1">
      {[...Array(count)].map((_, i) => (
        <EntityCardSkeleton key={i} />
      ))}
    </div>
  );
};
export default EntityCardsSkeleton;
