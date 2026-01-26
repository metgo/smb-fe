import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  TrendingDown,
  Ticket,
  ShoppingCart,
  Store,
} from "lucide-react";

import { InfoTooltip } from "@/components/shared";

interface MetricProps {
  label: string;
  value: string;
  trend?: number;
  icon?: React.ReactNode;
}

function Metric({ label, value, trend, icon }: MetricProps) {
  const hasTrend = trend !== undefined;
  const isPositive = trend && trend >= 0;

  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-800 last:border-0">
      <div className="flex items-center gap-2">
        {icon && <div className="text-gray-400 dark:text-gray-500">{icon}</div>}
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-900 dark:text-white">{value}</span>
        {hasTrend && (
          <span
            className={`text-xs flex items-center gap-0.5 ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(trend!)}%
          </span>
        )}
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  icon: React.ReactNode;
  metrics: {
    label: string;
    value: string;
    trend?: number;
    icon?: React.ReactNode;
  }[];
  subtitle: string;
}

function SummaryCard({ title, icon, metrics, subtitle }: SummaryCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
          {icon}
        </div>
        <div>
          <h3 className="text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-0">
        {metrics.map((metric, index) => (
          <Metric key={index} {...metric} />
        ))}
      </div>
    </div>
  );
}

export default function FinancialSummary() {
  const { t } = useTranslation("dashboard");

  const voucherMetrics = [
    { label: t("created"), value: "12,847", trend: 8.5 },
    { label: "Assigned Vouchers", value: "9,234", trend: 12.3 },
    { label: t("value"), value: "₪4,892,340", trend: 15.7 },
    { label: "Remaining Amount", value: "₪1,234,890", trend: -3.2 },
  ];

  const onlineOrdersMetrics = [
    { label: t("total_amount"), value: "₪8,945,230", trend: 18.9 },
    { label: t("credit_card"), value: "₪6,234,120", trend: 22.4 },
    { label: "Paid by Vouchers", value: "₪2,711,110", trend: 11.2 },
  ];

  const offlineOrdersMetrics = [
    { label: t("total_amount"), value: "₪3,421,780", trend: 5.6 },
    { label: t("credit_card"), value: "₪1,892,340", trend: 7.8 },
    { label: "Paid by Bank Transfer", value: "₪1,529,440", trend: 3.1 },
  ];

  return (
    <section>
      <div className="flex items-start gap-2 mb-6">
        <h2 className="text-gray-900 dark:text-white flex-1">
          {t("financial_summary")}
        </h2>
        <InfoTooltip
          content={t("financial_summary_desc")}
          title={t("financial_summary")}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SummaryCard
          title={t("vouchers")}
          subtitle={t("last_month")}
          icon={<Ticket className="w-5 h-5 text-white" />}
          metrics={voucherMetrics}
        />
        <SummaryCard
          title={t("online_orders")}
          subtitle={t("last_month")}
          icon={<ShoppingCart className="w-5 h-5 text-white" />}
          metrics={onlineOrdersMetrics}
        />
        <SummaryCard
          title={t("offline_orders")}
          subtitle={t("last_month")}
          icon={<Store className="w-5 h-5 text-white" />}
          metrics={offlineOrdersMetrics}
        />
      </div>
    </section>
  );
}
