import clsx from "clsx";
import { Phone, Smartphone, MapPin, Clock } from "lucide-react";

import { formatDateTime } from "@/helpers/formatter";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";

interface QRScanGridViewProps {
  logs: IQRScanLog[];
  hasMore: boolean;
  fetchNextPage: () => void;
}

const QRScanGridView = ({
  logs,
  hasMore,
  fetchNextPage,
}: QRScanGridViewProps) => {
  const { t } = useTranslation("qr_scan");
  const { language, isDark, textPrimary, textSecondary, textTertiary } =
    useThemeClasses();

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
        <div className={clsx("text-center py-4", textSecondary)}>
          {t("no_more_logs")}
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        {logs?.map((log) => (
          <div
            key={log._id}
            className={clsx(
              "rounded-xl border p-4 space-y-3",
              isDark
                ? "bg-gray-900 border-gray-800"
                : "bg-white border-gray-200",
            )}
          >
            <div className="flex-1">
              <h3 className={clsx("font-semibold text-sm", textPrimary)}>
                {log.customerName}
              </h3>
              <p className={clsx("text-xs", textSecondary)}>
                {log.customerEmail}
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className={clsx("w-4 h-4", textTertiary)} />
                <span className={clsx(textSecondary)}>{log.customerPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className={clsx("w-4 h-4", textTertiary)} />
                <span className={clsx("capitalize", textSecondary)}>
                  {log.deviceInfo?.deviceType}
                </span>
                <span>•</span>
                <span className={clsx("capitalize", textSecondary)}>
                  {log.deviceInfo?.browser}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className={clsx("w-4 h-4", textTertiary)} />
                <span className={clsx("font-mono", textSecondary)}>
                  {log.locationInfo?.ip}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className={clsx("w-4 h-4", textTertiary)} />
                <span className={clsx("text-xs", textSecondary)}>
                  {formatDateTime(log.scannedAt, language)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </InfiniteScroll>
  );
};
export default QRScanGridView;
