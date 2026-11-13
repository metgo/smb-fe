import clsx from "clsx";
import { Smartphone } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";

import { formatDateTime } from "@/helpers/formatter";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";

interface QRScanListViewProps {
  logs: IQRScanLog[];
  hasMore: boolean;
  fetchNextPage: () => void;
}

const QRScanListView = ({
  logs,
  hasMore,
  fetchNextPage,
}: QRScanListViewProps) => {
  const { t } = useTranslation("qr_scan");
  const { language, isDark, textPrimary, textSecondary } = useThemeClasses();

  return (
    <InfiniteScroll
      dataLength={logs?.length || 0}
      next={fetchNextPage}
      hasMore={hasMore}
      loader={
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
        </div>
      }
      endMessage={
        <div className="text-center py-4 text-gray-500 text-sm">
          {t("no_more_logs")}
        </div>
      }
    >
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
              <th className="px-4 py-3">{t("customer")}</th>
              <th className="px-4 py-3">{t("email")}</th>
              <th className="px-4 py-3">{t("phone")}</th>
              <th className="px-4 py-3">{t("device")}</th>
              <th className="px-4 py-3">{t("browser")}</th>
              <th className="px-4 py-3">{t("os")}</th>
              <th className="px-4 py-3">{t("ip_address")}</th>
              <th className="px-4 py-3">{t("scanned_at")}</th>
              <th className="px-4 py-3">{t("referrer")}</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((log) => (
              <tr
                key={log._id}
                className={clsx(
                  "border-b hover:bg-opacity-50 transition-colors",
                  isDark
                    ? "border-gray-800 hover:bg-gray-800/50"
                    : "border-gray-100 hover:bg-gray-50",
                )}
              >
                <td className={clsx("px-4 py-3 text-sm", textPrimary)}>
                  {log.customerName}
                </td>
                <td className={clsx("px-4 py-3 text-sm", textSecondary)}>
                  {log.customerEmail}
                </td>
                <td className={clsx("px-4 py-3 text-sm", textSecondary)}>
                  {log.customerPhone}
                </td>
                <td className={clsx("px-4 py-3", textSecondary)}>
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm capitalize">
                      {log.deviceInfo?.deviceType}
                    </span>
                  </div>
                </td>
                <td
                  className={clsx(
                    "px-4 py-3 text-sm capitalize",
                    textSecondary,
                  )}
                >
                  {log.deviceInfo?.browser}
                </td>
                <td
                  className={clsx(
                    "px-4 py-3 text-sm capitalize",
                    textSecondary,
                  )}
                >
                  {log.deviceInfo?.os}
                </td>
                <td
                  className={clsx("px-4 py-3 text-sm font-mono", textSecondary)}
                >
                  {log.locationInfo?.ip}
                </td>
                <td className={clsx("px-4 py-3 text-sm", textSecondary)}>
                  {formatDateTime(log.scannedAt, language)}
                </td>
                <td
                  className={clsx(
                    "px-4 py-3 text-sm text-blue-600 truncate max-w-xs",
                    textPrimary,
                  )}
                >
                  {log.referrer}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </InfiniteScroll>
  );
};

export default QRScanListView;
