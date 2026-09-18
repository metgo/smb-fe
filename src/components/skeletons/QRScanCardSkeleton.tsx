import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";

const QRScanCardSkeleton = () => {
  const { isDark } = useThemeClasses();

  return (
    <div
      className={clsx(
        "rounded-xl border p-4 space-y-3 animate-pulse",
        isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
      )}
    >
      {/* Header section */}
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          {/* Name */}
          <div
            className={clsx(
              "h-5 w-3/4 rounded-md",
              isDark ? "bg-gray-700" : "bg-gray-200",
            )}
          />
          {/* Email */}
          <div
            className={clsx(
              "h-4 w-1/2 rounded-md",
              isDark ? "bg-gray-700" : "bg-gray-200",
            )}
          />
        </div>
        {/* Scan type badge */}
        <div
          className={clsx(
            "h-6 w-16 rounded-full",
            isDark ? "bg-gray-700" : "bg-gray-200",
          )}
        />
      </div>

      {/* Info section */}
      <div className="space-y-2">
        {/* Phone */}
        <div className="flex items-center gap-2">
          <div
            className={clsx(
              "h-4 w-4 rounded",
              isDark ? "bg-gray-700" : "bg-gray-200",
            )}
          />
          <div
            className={clsx(
              "h-4 w-1/3 rounded-md",
              isDark ? "bg-gray-700" : "bg-gray-200",
            )}
          />
        </div>
        {/* Device */}
        <div className="flex items-center gap-2">
          <div
            className={clsx(
              "h-4 w-4 rounded",
              isDark ? "bg-gray-700" : "bg-gray-200",
            )}
          />
          <div
            className={clsx(
              "h-4 w-1/4 rounded-md",
              isDark ? "bg-gray-700" : "bg-gray-200",
            )}
          />
          <div
            className={clsx(
              "h-4 w-2 rounded",
              isDark ? "bg-gray-700" : "bg-gray-200",
            )}
          />
          <div
            className={clsx(
              "h-4 w-1/4 rounded-md",
              isDark ? "bg-gray-700" : "bg-gray-200",
            )}
          />
        </div>
        {/* IP */}
        <div className="flex items-center gap-2">
          <div
            className={clsx(
              "h-4 w-4 rounded",
              isDark ? "bg-gray-700" : "bg-gray-200",
            )}
          />
          <div
            className={clsx(
              "h-4 w-1/3 rounded-md",
              isDark ? "bg-gray-700" : "bg-gray-200",
            )}
          />
        </div>
        {/* Time */}
        <div className="flex items-center gap-2">
          <div
            className={clsx(
              "h-4 w-4 rounded",
              isDark ? "bg-gray-700" : "bg-gray-200",
            )}
          />
          <div
            className={clsx(
              "h-3 w-1/2 rounded-md",
              isDark ? "bg-gray-700" : "bg-gray-200",
            )}
          />
        </div>
      </div>
    </div>
  );
};

const QRScanGridSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <QRScanCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default QRScanGridSkeleton;
