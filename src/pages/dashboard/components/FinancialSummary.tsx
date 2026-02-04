import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Ticket, ShoppingCart, Store } from "lucide-react";

import { InfoTooltip } from "@/components/shared";
import {
  useGetOfflineOrderStatsQuery,
  useGetOnlineOrderStatsQuery,
  useGetVoucherStatsQuery,
} from "@/store/api/itemStatsApi";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { formatILS } from "@/helpers/formatter";
import { useAppSelector } from "@/hooks/hooks";

interface MetricProps {
  isDark: boolean;
  label: string;
  value: string;
  trend?: number;
  icon?: React.ReactNode;
}

function Metric({ isDark, label, value, icon }: MetricProps) {
  return (
    <div
      className={clsx(
        "flex items-start justify-between py-3 border-b last:border-0",
        isDark ? "border-gray-800" : "border-gray-200",
      )}
    >
      <div className="flex items-center gap-2">
        {icon && (
          <div className={clsx(isDark ? "text-gray-500" : "text-gray-400")}>
            {icon}
          </div>
        )}

        <span
          className={clsx(
            "text-sm",
            isDark ? "text-gray-400" : "text-gray-600",
          )}
        >
          {label}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={clsx(
            "font-medium",
            isDark ? "text-white" : "text-gray-900",
          )}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  isDark: boolean;
  title: string;
  icon: React.ReactNode;
  metrics: {
    label: string;
    value: string;
    icon?: React.ReactNode;
  }[];
  subtitle: string;
}

function SummaryCard({
  isDark,
  title,
  icon,
  metrics,
  subtitle,
}: SummaryCardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border p-6 hover:shadow-lg transition-shadow",
        isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-linear-to-br from-orange-500 to-amber-600 rounded-lg">
          {icon}
        </div>

        <div>
          <h3
            className={clsx(
              "font-semibold",
              isDark ? "text-white" : "text-gray-900",
            )}
          >
            {title}
          </h3>

          <p
            className={clsx(
              "text-sm",
              isDark ? "text-gray-400" : "text-gray-500",
            )}
          >
            {subtitle}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-0">
        {metrics.map((metric, index) => (
          <Metric key={index} isDark={isDark} {...metric} />
        ))}
      </div>
    </div>
  );
}

export default function FinancialSummary() {
  const { t } = useTranslation("dashboard");
  const { t: tc } = useTranslation("common");

  const { startDate, endDate, timeFrame } = useAppSelector(
    (state) => state.auth,
  );
  const { isDark } = useThemeClasses();

  const voucherStatsParams = {
    createdEndDate: endDate,
    createdStartDate: startDate,
  };
  const { data: onlineOrderData } = useGetOnlineOrderStatsQuery({
    startDate,
    endDate,
  });
  const { data: voucherData } = useGetVoucherStatsQuery(voucherStatsParams);
  const { data: offilneOrderData } = useGetOfflineOrderStatsQuery({
    startDate,
    endDate,
  });

  const voucherMetrics = [
    {
      label: t("created"),
      value: voucherData?.datas?.[0]?.totalNumberOfVouchers,
    },
    {
      label: t("assigned_vouchers"),
      value: voucherData?.datas?.[0]?.totalAssignedVouchers,
    },
    {
      label: t("value"),
      value: formatILS(voucherData?.datas?.[0]?.totalValueOfVoucher),
    },
    {
      label: t("remaining_amount"),
      value: formatILS(voucherData?.datas?.[0]?.totalAmountToRedeem),
    },
  ];

  const onlineOrdersMetrics = [
    {
      label: t("total_number"),
      value: onlineOrderData?.datas?.[0]?.totalNumber,
    },
    {
      label: t("total_amount"),
      value: formatILS(onlineOrderData?.datas?.[0]?.totalAmount),
    },
    {
      label: t("credit_card"),
      value: formatILS(onlineOrderData?.datas?.[0]?.amountPaidByCreditCard),
    },
    // { label: t("paid_by_vouchers"), value: `₪${onlineOrderData?.datas?.totalValueOfVoucher}`, trend: 11.2 },
  ];

  const offlineOrdersMetrics = [
    {
      label: t("total_amount"),
      value: formatILS(offilneOrderData?.totalAmount),
    },
    { label: t("credit_card"), value: formatILS(offilneOrderData?.creditCard) },
    {
      label: t("paid_by_bank_transfer"),
      value: formatILS(offilneOrderData?.bankTransfer),
    },
  ];

  return (
    <section>
      <div className="flex items-start gap-2 mb-6">
        <h2
          className={clsx(" flex-1", isDark ? "text-white" : "text-gray-900")}
        >
          {t("financial_summary")}
        </h2>
        <InfoTooltip
          content={t("financial_summary_desc")}
          title={t("financial_summary")}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SummaryCard
          isDark={isDark}
          title={t("vouchers")}
          subtitle={tc(timeFrame)}
          icon={<Ticket className="w-5 h-5 text-white" />}
          metrics={voucherMetrics}
        />
        <SummaryCard
          isDark={isDark}
          title={t("online_orders")}
          subtitle={tc(timeFrame)}
          icon={<ShoppingCart className="w-5 h-5 text-white" />}
          metrics={onlineOrdersMetrics}
        />
        <SummaryCard
          isDark={isDark}
          title={t("offline_orders")}
          subtitle={tc(timeFrame)}
          icon={<Store className="w-5 h-5 text-white" />}
          metrics={offlineOrdersMetrics}
        />
      </div>
    </section>
  );
}
