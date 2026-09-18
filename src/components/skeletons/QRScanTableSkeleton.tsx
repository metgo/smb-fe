import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";

const QRScanTableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  const { isDark } = useThemeClasses();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr
            className={clsx(
              "border-b text-left text-sm font-medium",
              isDark
                ? "border-gray-700 text-gray-300"
                : "border-gray-200 text-gray-600",
            )}
          >
            {/* Header skeleton */}
            <th className="px-4 py-3">
              <div
                className={clsx(
                  "h-4 w-12 rounded",
                  isDark ? "bg-gray-700" : "bg-gray-200",
                )}
              />
            </th>
            <th className="px-4 py-3">
              <div
                className={clsx(
                  "h-4 w-16 rounded",
                  isDark ? "bg-gray-700" : "bg-gray-200",
                )}
              />
            </th>
            <th className="px-4 py-3">
              <div
                className={clsx(
                  "h-4 w-12 rounded",
                  isDark ? "bg-gray-700" : "bg-gray-200",
                )}
              />
            </th>
            <th className="px-4 py-3">
              <div
                className={clsx(
                  "h-4 w-20 rounded",
                  isDark ? "bg-gray-700" : "bg-gray-200",
                )}
              />
            </th>
            <th className="px-4 py-3">
              <div
                className={clsx(
                  "h-4 w-24 rounded",
                  isDark ? "bg-gray-700" : "bg-gray-200",
                )}
              />
            </th>
            <th className="px-4 py-3">
              <div
                className={clsx(
                  "h-4 w-20 rounded",
                  isDark ? "bg-gray-700" : "bg-gray-200",
                )}
              />
            </th>
            <th className="px-4 py-3">
              <div
                className={clsx(
                  "h-4 w-16 rounded",
                  isDark ? "bg-gray-700" : "bg-gray-200",
                )}
              />
            </th>
            <th className="px-4 py-3">
              <div
                className={clsx(
                  "h-4 w-16 rounded",
                  isDark ? "bg-gray-700" : "bg-gray-200",
                )}
              />
            </th>
            <th className="px-4 py-3">
              <div
                className={clsx(
                  "h-4 w-12 rounded",
                  isDark ? "bg-gray-700" : "bg-gray-200",
                )}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr
              key={i}
              className={clsx(
                "border-b animate-pulse",
                isDark ? "border-gray-800" : "border-gray-100",
              )}
            >
              <td className="px-4 py-3">
                <div
                  className={clsx(
                    "h-5 w-16 rounded",
                    isDark ? "bg-gray-700" : "bg-gray-200",
                  )}
                />
              </td>
              <td className="px-4 py-3">
                <div
                  className={clsx(
                    "h-5 w-16 rounded",
                    isDark ? "bg-gray-700" : "bg-gray-200",
                  )}
                />
              </td>
              <td className="px-4 py-3">
                <div
                  className={clsx(
                    "h-6 w-16 rounded-full",
                    isDark ? "bg-gray-700" : "bg-gray-200",
                  )}
                />
              </td>
              <td className="px-4 py-3">
                <div
                  className={clsx(
                    "h-5 w-24 rounded",
                    isDark ? "bg-gray-700" : "bg-gray-200",
                  )}
                />
              </td>
              <td className="px-4 py-3">
                <div
                  className={clsx(
                    "h-5 w-32 rounded",
                    isDark ? "bg-gray-700" : "bg-gray-200",
                  )}
                />
              </td>
              <td className="px-4 py-3">
                <div
                  className={clsx(
                    "h-5 w-20 rounded",
                    isDark ? "bg-gray-700" : "bg-gray-200",
                  )}
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div
                    className={clsx(
                      "h-4 w-4 rounded",
                      isDark ? "bg-gray-700" : "bg-gray-200",
                    )}
                  />
                  <div
                    className={clsx(
                      "h-5 w-16 rounded",
                      isDark ? "bg-gray-700" : "bg-gray-200",
                    )}
                  />
                </div>
              </td>
              <td className="px-4 py-3">
                <div
                  className={clsx(
                    "h-5 w-16 rounded",
                    isDark ? "bg-gray-700" : "bg-gray-200",
                  )}
                />
              </td>
              <td className="px-4 py-3">
                <div
                  className={clsx(
                    "h-5 w-16 rounded",
                    isDark ? "bg-gray-700" : "bg-gray-200",
                  )}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QRScanTableSkeleton;
