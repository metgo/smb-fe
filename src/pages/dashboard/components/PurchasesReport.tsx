import clsx from "clsx";
import { Receipt } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { InfoTooltip } from "@/components/shared";
import { useGetPurchaseReportsStatsQuery } from "@/store/api/itemStatsApi";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { formatILS } from "@/helpers/formatter";
import { useAppSelector } from "@/hooks/hooks";

interface PurchaseMetricProps {
  label: string;
  value: string;
  description?: string;
}

const formatMonth = (month: string) =>
  new Date(month + "-01").toLocaleString("en", { month: "short" });

function PurchaseMetric({ label, value, description }: PurchaseMetricProps) {
  const { isDark } = useThemeClasses();

  return (
    <div
      className={clsx(
        "rounded-lg p-4",
        isDark ? "bg-gray-800/50" : "bg-gray-50",
      )}
    >
      <p
        className={clsx(
          "text-sm mb-2",
          isDark ? "text-gray-400" : "text-gray-600",
        )}
      >
        {label}
      </p>

      <div className="flex items-baseline gap-3">
        <p
          className={clsx(
            "text-2xl font-semibold",
            isDark ? "text-white" : "text-gray-900",
          )}
        >
          {formatILS(value)}
        </p>
      </div>

      {description && (
        <p
          className={clsx(
            "text-xs mt-1",
            isDark ? "text-gray-500" : "text-gray-500",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export default function PurchasesReport() {
  const { t } = useTranslation("dashboard");
  const { t: tc } = useTranslation("common");

  const { isDark } = useThemeClasses();
  const { startDate, endDate, timeFrame } = useAppSelector(
    (state) => state.auth,
  );

  const { data } = useGetPurchaseReportsStatsQuery({ startDate, endDate });

  const chartData =
    data?.monthlyBreakdown?.map((item: any) => ({
      month: formatMonth(item?.month),
      creditCards: Number(item?.totalOrderAmount || 0),
      vouchers: Number(item?.totalVoucherAmountRedeemed || 0),
      total:
        Number(item?.totalOrderAmount || 0) +
        Number(item?.totalVoucherAmountRedeemed || 0),
    })) ?? [];

  const purchasesReports = [
    {
      id: 1,
      label: t("avg_order"),
      value: data?.averageOrderAmount,
      description: t("per_transaction"),
    },
    {
      id: 2,
      label: t("avg_voucher"),
      value: data?.averageVoucherAmountRedeemed,
      description: t("per_redemption"),
    },
    {
      id: 3,
      label: t("voucher_sold"),
      value: data?.averageVoucherAmountSold,
      description: t("per_sale"),
    },
    {
      id: 4,
      label: t("total_orders"),
      value: data?.totalOrderAmount,
      description: tc(timeFrame),
    },
    {
      id: 5,
      label: t("total_vouchers"),
      value: data?.totalVoucherAmount,
      description: tc(timeFrame),
    },
  ];

  return (
    <section>
      {/* Section header */}
      <div className="flex items-start gap-2 mb-6">
        <h2
          className={clsx(
            "flex-1 font-semibold",
            isDark ? "text-white" : "text-gray-900",
          )}
        >
          {t("purchases_report")}
        </h2>

        <InfoTooltip
          content={t("purchases_report_desc")}
          title={t("purchases_report")}
        />
      </div>

      {/* Card */}
      <div
        className={clsx(
          "rounded-xl border p-6 hover:shadow-lg transition-shadow",
          isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
        )}
      >
        {/* Card header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-linear-to-br from-green-500 to-emerald-600 rounded-lg">
            <Receipt className="w-5 h-5 text-white" />
          </div>

          <div>
            <h3
              className={clsx(
                "font-semibold",
                isDark ? "text-white" : "text-gray-900",
              )}
            >
              {t("purchases_report")}
            </h3>

            <p
              className={clsx(
                "text-sm",
                isDark ? "text-gray-400" : "text-gray-500",
              )}
            >
              {t("purchases_report_summary_desc")}
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {purchasesReports.map((item) => (
            <PurchaseMetric
              key={item.id}
              label={item.label}
              value={item.value}
              description={item.description}
            />
          ))}
        </div>

        {/* Chart */}
        <div className="h-64 min-h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <defs>
                <linearGradient
                  id="creditCardGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#0891b2" />
                </linearGradient>

                <linearGradient
                  id="voucherGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#fde047" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="month"
                stroke={isDark ? "#9ca3af" : "#6b7280"}
                style={{ fontSize: "12px" }}
              />

              <YAxis
                stroke={isDark ? "#9ca3af" : "#6b7280"}
                style={{ fontSize: "12px" }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: isDark
                    ? "rgba(17, 24, 39, 0.95)"
                    : "rgba(255, 255, 255, 0.95)",
                  border: "none",
                  borderRadius: "8px",
                  color: isDark ? "#fff" : "#111827",
                }}
                formatter={(
                  value: number | undefined,
                  name: string | undefined,
                ) => {
                  const safeValue = value ?? 0;
                  const label =
                    name === "Vouchers" ? t("vouchers") : t("credit_card");
                  return [`${safeValue / 1000}K ₪`, label];
                }}
              />

              <Bar
                dataKey="creditCards"
                stackId="orders"
                fill="url(#creditCardGradient)"
                name={t("credit_card")}
              />

              <Bar
                dataKey="vouchers"
                stackId="orders"
                fill="url(#voucherGradient)"
                radius={[8, 8, 0, 0]}
                name={t("vouchers")}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span
              className={clsx(
                "text-sm",
                isDark ? "text-gray-400" : "text-gray-600",
              )}
            >
              {t("credit_card")} (thousands ₪)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span
              className={clsx(
                "text-sm",
                isDark ? "text-gray-400" : "text-gray-600",
              )}
            >
              {t("vouchers")} (thousands ₪)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Receipt
              className={clsx(
                "w-3 h-3",
                isDark ? "text-gray-400" : "text-gray-600",
              )}
            />
            <span
              className={clsx(
                "text-sm",
                isDark ? "text-gray-400" : "text-gray-600",
              )}
            >
              Total = {t("orders")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
