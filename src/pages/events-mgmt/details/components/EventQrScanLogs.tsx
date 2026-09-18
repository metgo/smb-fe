import clsx from "clsx";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import EmptyState from "@/components/shared/EmptyState";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import SearchInput from "@/components/shared/SearchInput";
import { ViewModeToggle } from "@/components/shared";
import { QRScanGridView, QRScanListView } from "@/components/details-sections";
import { useQrScanListData } from "../hooks/useQrScanListData";
import {
  QRScanGridSkeleton,
  QRScanTableSkeleton,
} from "@/components/skeletons";

const EventQrScanLogs = ({ eventId }: { eventId: string }) => {
  const { t } = useTranslation(["qr_scan"]);
  const { isDark, bgSecondary, borderColor } = useThemeClasses();

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [scanType, setScanType] = useState<"TICKET" | "SESSION">("TICKET");

  const { combinedLogs, isLoading, isFetching, hasMore, fetchNextPage } =
    useQrScanListData(eventId, searchTerm, scanType);

  return (
    <div className="flex flex-col pt-4 md:pt-0 gap-3">
      {/* Search and Controls */}
      <div
        className={clsx(
          "transition-all duration-300 py-3 px-3 md:px-4 rounded-2xl border shadow-md flex flex-col gap-3",
          isDark
            ? "bg-gray-900/90 border-gray-800/90"
            : "bg-white border-gray-200",
        )}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div
            className={clsx(
              "flex items-center rounded-lg p-1",
              isDark ? "bg-gray-800" : "bg-gray-100",
            )}
          >
            <button
              onClick={() => setScanType("TICKET")}
              className={clsx(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                scanType === "TICKET"
                  ? clsx(
                      "shadow-sm",
                      isDark
                        ? "bg-gray-700 text-white"
                        : "bg-white text-gray-900",
                    )
                  : clsx(
                      "hover:text-gray-900",
                      isDark
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600",
                    ),
              )}
            >
              {t("ticket")}
            </button>
            <button
              onClick={() => setScanType("SESSION")}
              className={clsx(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                scanType === "SESSION"
                  ? clsx(
                      "shadow-sm",
                      isDark
                        ? "bg-gray-700 text-white"
                        : "bg-white text-gray-900",
                    )
                  : clsx(
                      "hover:text-gray-900",
                      isDark
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600",
                    ),
              )}
            >
              {t("session")}
            </button>
          </div>
          <div className="flex-1 min-w-0 relative">
            <SearchInput
              placeholder={t("search_placeholder")}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>

          <div className="flex items-center gap-2">
            <ViewModeToggle
              onChange={setViewMode}
              value={viewMode}
              tableName="qrScanLogsViewMode"
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 mt-1">
        {isLoading || isFetching ? (
          viewMode === "list" ? (
            <QRScanTableSkeleton rows={8} />
          ) : (
            <QRScanGridSkeleton count={8} />
          )
        ) : combinedLogs?.length === 0 ? (
          <div
            className={`text-center py-16 ${bgSecondary} rounded-xl border ${borderColor}`}
          >
            <EmptyState searchQuery={searchTerm} />
          </div>
        ) : viewMode === "list" ? (
          <QRScanListView
            logs={combinedLogs}
            hasMore={hasMore}
            fetchNextPage={fetchNextPage}
          />
        ) : (
          <QRScanGridView
            logs={combinedLogs}
            hasMore={hasMore}
            fetchNextPage={fetchNextPage}
          />
        )}
      </div>
    </div>
  );
};

export default EventQrScanLogs;
