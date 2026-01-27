// EventCardSkeleton.tsx
import clsx from "clsx";

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div
    className={clsx(
      "animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md",
      className,
    )}
  />
);

const EventCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden">
      {/* Image */}
      <SkeletonBlock className="h-52 w-full rounded-none" />

      <div className="p-5 space-y-4">
        {/* Title */}
        <SkeletonBlock className="h-5 w-3/4" />

        {/* Date */}
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-4 w-4 rounded-full" />
          <SkeletonBlock className="h-4 w-1/2" />
        </div>

        {/* Location */}
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-4 w-4 rounded-full" />
          <SkeletonBlock className="h-4 w-2/3" />
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-5">
          <SkeletonBlock className="h-5 w-20" />
          <SkeletonBlock className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
};

export default EventCardSkeleton;
