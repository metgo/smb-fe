import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  X,
  Monitor,
  Smartphone,
  Tablet,
  Wifi,
  WifiOff,
  Globe,
  User,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { formatDate } from "@/helpers";
import {
  useGetAllCrashesQuery,
  type IWebsiteCrash,
} from "@/store/api/websiteCrashApi";
import { routes } from "@/lib/routes";

const LIMIT = 20;

const deviceIcon = (type?: string) => {
  if (type === "mobile") return <Smartphone className="w-3.5 h-3.5" />;
  if (type === "tablet") return <Tablet className="w-3.5 h-3.5" />;
  return <Monitor className="w-3.5 h-3.5" />;
};

function CrashCard({
  crash,
  onClick,
}: {
  crash: IWebsiteCrash;
  onClick: () => void;
}) {
  const {
    isDark,
    bgSecondary,
    borderColor,
    textSecondary,
    textTertiary,
    hoverBg,
  } = useThemeClasses();

  const isOnline = crash.device?.network?.online;

  return (
    <div
      onClick={onClick}
      className={clsx(
        "flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition-all",
        bgSecondary,
        borderColor,
        hoverBg,
        "hover:border-red-400/60",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <span
            className={clsx(
              "text-sm font-semibold truncate",
              isDark ? "text-red-300" : "text-red-600",
            )}
          >
            {crash.error?.name ?? "Error"}
          </span>
        </div>
        <span className={clsx("text-xs shrink-0 mt-0.5", textTertiary)}>
          {formatDate(crash.timestamp)}
        </span>
      </div>

      <p className={clsx("text-sm line-clamp-2", textSecondary)}>
        {crash.error?.message ?? "No message"}
      </p>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span
          className={clsx(
            "flex items-center gap-1 px-2 py-0.5 rounded-full border",
            borderColor,
            textSecondary,
          )}
        >
          <User className="w-3 h-3" />
          {crash.user?.name ?? "Guest"}
        </span>

        {crash.device?.browser && (
          <span
            className={clsx(
              "flex items-center gap-1 px-2 py-0.5 rounded-full border",
              borderColor,
              textSecondary,
            )}
          >
            <Globe className="w-3 h-3" />
            {crash.device.browser.name} {crash.device.browser.version}
          </span>
        )}

        {crash.device?.deviceType && (
          <span
            className={clsx(
              "flex items-center gap-1 px-2 py-0.5 rounded-full border capitalize",
              borderColor,
              textSecondary,
            )}
          >
            {deviceIcon(crash.device.deviceType)}
            {crash.device.deviceType}
          </span>
        )}

        {crash.device?.network && (
          <span
            className={clsx(
              "flex items-center gap-1 px-2 py-0.5 rounded-full border",
              borderColor,
              isOnline ? "text-green-500" : "text-red-500",
            )}
          >
            {isOnline ? (
              <Wifi className="w-3 h-3" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
            {isOnline ? "Online" : "Offline"}
          </span>
        )}

        {crash.error?.status && (
          <span
            className={clsx(
              "px-2 py-0.5 rounded-full font-mono",
              crash.error.status >= 500
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
            )}
          >
            {crash.error.status}
          </span>
        )}
      </div>

      {crash.error?.url && (
        <p className={clsx("text-xs truncate font-mono", textTertiary)}>
          {crash.error.url}
        </p>
      )}
    </div>
  );
}

export default function WebsiteCrashesPage() {
  const navigate = useNavigate();
  const {
    isDark,
    bgPrimary,
    bgSecondary,
    borderColor,
    textPrimary,
    textSecondary,
    textTertiary,
  } = useThemeClasses();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [errorNameFilter, setErrorNameFilter] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [allCrashes, setAllCrashes] = useState<IWebsiteCrash[]>([]);

  const params = useMemo(
    () => ({
      page,
      limit: LIMIT,
      ...(search && { search }),
      ...(errorNameFilter && { errorName: errorNameFilter }),
      ...(userIdFilter && { userId: userIdFilter }),
    }),
    [page, search, errorNameFilter, userIdFilter],
  );

  const { data, isFetching } = useGetAllCrashesQuery(params);

  useEffect(() => {
    if (!data?.data) return;
    if (page === 1) {
      setAllCrashes(data.data);
    } else {
      setAllCrashes((prev) => {
        const existingIds = new Set(prev.map((c) => c._id));
        const newItems = data.data.filter((c) => !existingIds.has(c._id));
        return [...prev, ...newItems];
      });
    }
  }, [data?.data, page]);

  useEffect(() => {
    setPage(1);
  }, [search, errorNameFilter, userIdFilter]);

  const hasMore = data?.meta?.hasNextPage ?? false;

  return (
    <div
      className={clsx(
        "min-h-screen flex flex-col transition-colors",
        isDark ? "bg-gray-900" : "bg-white",
      )}
    >
      <div className="h-[calc(100vh-64px)] flex flex-col">
        {/* Header */}
        <div
          className={clsx("shrink-0 px-4 sm:px-6 py-5 border-b", borderColor)}
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                Website Crashes
              </h1>
              <p className={clsx("text-sm mt-0.5", textSecondary)}>
                Monitor and manage application error reports
              </p>
            </div>
            {data?.meta?.total !== undefined && (
              <span
                className={clsx(
                  "shrink-0 text-sm px-3 py-1 rounded-full border font-medium",
                  borderColor,
                  textSecondary,
                )}
              >
                {data.meta.total} total
              </span>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className={clsx("shrink-0 px-4 sm:px-6 pt-4 pb-2", bgPrimary)}>
          <div className="max-w-5xl mx-auto flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div
                className={clsx(
                  "flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border",
                  borderColor,
                  bgSecondary,
                )}
              >
                <Search className={clsx("w-4 h-4 shrink-0", textTertiary)} />
                <input
                  type="text"
                  placeholder="Search by error message…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={clsx(
                    "flex-1 bg-transparent text-sm outline-none",
                    textPrimary,
                    "placeholder:text-gray-400",
                  )}
                />
                {search && (
                  <button onClick={() => setSearch("")}>
                    <X className={clsx("w-4 h-4", textTertiary)} />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowFilters((v) => !v)}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition cursor-pointer",
                  borderColor,
                  showFilters
                    ? "bg-orange-500 text-white border-orange-500"
                    : clsx(bgSecondary, textSecondary),
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>

            {showFilters && (
              <div
                className={clsx(
                  "grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border",
                  borderColor,
                  bgSecondary,
                )}
              >
                <div className="flex flex-col gap-1">
                  <label className={clsx("text-xs font-medium", textSecondary)}>
                    Error Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TypeError"
                    value={errorNameFilter}
                    onChange={(e) => setErrorNameFilter(e.target.value)}
                    className={clsx(
                      "px-3 py-2 rounded-lg border text-sm outline-none",
                      borderColor,
                      bgPrimary,
                      textPrimary,
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={clsx("text-xs font-medium", textSecondary)}>
                    User ID
                  </label>
                  <input
                    type="text"
                    placeholder="Paste user ID…"
                    value={userIdFilter}
                    onChange={(e) => setUserIdFilter(e.target.value)}
                    className={clsx(
                      "px-3 py-2 rounded-lg border text-sm outline-none font-mono",
                      borderColor,
                      bgPrimary,
                      textPrimary,
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 pt-4">
          <div className="max-w-5xl mx-auto flex flex-col gap-3">
            {isFetching && page === 1 && allCrashes.length === 0 ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={clsx(
                      "h-28 rounded-xl border animate-pulse",
                      borderColor,
                      bgSecondary,
                    )}
                  />
                ))}
              </div>
            ) : allCrashes.length === 0 ? (
              <div
                className={clsx(
                  "flex flex-col items-center justify-center py-20 rounded-xl border",
                  borderColor,
                  bgSecondary,
                )}
              >
                <AlertTriangle
                  className={clsx("w-10 h-10 mb-3", textTertiary)}
                />
                <p className={clsx("text-sm font-medium", textPrimary)}>
                  No crash reports found
                </p>
                <p className={clsx("text-xs mt-1", textTertiary)}>
                  {search || errorNameFilter || userIdFilter
                    ? "Try adjusting your filters"
                    : "No errors have been reported yet"}
                </p>
              </div>
            ) : (
              <>
                {allCrashes.map((crash) => (
                  <CrashCard
                    key={crash._id}
                    crash={crash}
                    onClick={() =>
                      navigate(
                        `${routes.websiteCrashDetails}?crashId=${crash._id}`,
                      )
                    }
                  />
                ))}

                {hasMore && (
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={isFetching}
                    className={clsx(
                      "w-full py-3 rounded-xl border text-sm font-medium transition cursor-pointer",
                      borderColor,
                      bgSecondary,
                      textSecondary,
                      "hover:border-orange-400/60",
                      isFetching && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    {isFetching ? "Loading…" : "Load more"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
