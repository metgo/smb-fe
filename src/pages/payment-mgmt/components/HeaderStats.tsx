import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";

import { shekel } from "../helpers";
import type { OrderStats } from "../hooks/useOrderStats";
import { ViewModeToggle } from "@/components/shared";
import PayoutCalculationInfo from "./PayoutCalculationInfo";
import PayableOrdersInfo from "./PayableOrdersInfo";
import { Landmark } from "lucide-react";
import clsx from "clsx";

function Kpi({
  label,
  value,
  sub,
  accent,
  labelHelp,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
  accent?: boolean;
  labelHelp?: React.ReactNode;
}) {
  const { isDark } = useThemeClasses();
  return (
    <div
      className={
        isDark
          ? "bg-gray-900 px-3 py-3 sm:px-5 sm:py-4"
          : "bg-white px-3 py-3 sm:px-5 sm:py-4"
      }
    >
      <div
        className={`flex items-center gap-1 font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider ${
          isDark ? "text-gray-500" : "text-gray-400"
        }`}
      >
        {label}
        {labelHelp && (
          <span className="font-normal normal-case tracking-normal">
            {labelHelp}
          </span>
        )}
      </div>
      <div
        className={`mt-1 sm:mt-1.5 font-semibold text-lg sm:text-xl md:text-2xl tracking-tight ${
          accent ? "text-teal-500" : isDark ? "text-gray-100" : "text-gray-900"
        }`}
      >
        {value}
      </div>
      <div
        className={`mt-1 sm:mt-1.5 text-[11px] sm:text-xs ${
          isDark ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {sub}
      </div>
    </div>
  );
}

function RatioKpi({
  label,
  actual,
  potential,
}: {
  label: string;
  actual: number;
  potential: number;
}) {
  const { t } = useTranslation("reconciliation");
  const { isDark } = useThemeClasses();
  // Fall back to `actual` when the API omits a potential figure, so the bar
  // reads as fully realized instead of empty.
  const denom = potential || actual;
  const pct = denom ? Math.min(100, Math.max(0, (actual / denom) * 100)) : 0;

  return (
    <div
      className={
        isDark
          ? "bg-gray-900 px-3 py-3 sm:px-5 sm:py-4"
          : "bg-white px-3 py-3 sm:px-5 sm:py-4"
      }
    >
      <div
        className={`font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider ${
          isDark ? "text-gray-500" : "text-gray-400"
        }`}
      >
        {label}
      </div>
      <div className="mt-1 sm:mt-1.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
        <span className="font-semibold text-base sm:text-lg tracking-tight text-teal-500">
          {shekel(actual)}
        </span>
        <span
          className={`font-semibold text-base sm:text-lg ${
            isDark ? "text-gray-500" : "text-gray-400"
          }`}
        >
          / {shekel(potential)}
        </span>
      </div>
      <div
        className={`mt-2 h-1 w-full overflow-hidden rounded-full ${
          isDark ? "bg-gray-800" : "bg-gray-100"
        }`}
      >
        <div
          className="h-full rounded-full bg-teal-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div
        className={`mt-1 sm:mt-1.5 text-[11px] sm:text-xs ${
          isDark ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {t("realized")} · {t("potential")}
      </div>
    </div>
  );
}

type StatusKey =
  | "pending"
  | "approved"
  | "disputed"
  | "cancelled"
  | "rejected"
  | "closed"
  | "processing"
  | "shipped"
  | "completed"
  | "canceled";

const STATUS_DOT: Record<StatusKey, string> = {
  pending: "bg-yellow-500",
  approved: "bg-green-500",
  disputed: "bg-orange-500",
  cancelled: "bg-red-500",
  rejected: "bg-red-500",
  closed: "bg-gray-400",
  processing: "bg-blue-500",
  shipped: "bg-indigo-500",
  completed: "bg-green-500",
  canceled: "bg-red-500",
};

// `cancelled` (reconciliation status) and `canceled` (order-product status) share
// one translation key.
const STATUS_LABEL_KEY: Record<StatusKey, string> = {
  pending: "pending",
  approved: "approved",
  disputed: "disputed",
  cancelled: "canceled",
  rejected: "rejected",
  closed: "closed",
  processing: "processing",
  shipped: "shipped",
  completed: "completed",
  canceled: "canceled",
};

function StatusInline({
  status,
  n,
  isReconciliation,
}: {
  status: StatusKey;
  n: number;
  isReconciliation?: boolean;
}) {
  const { t } = useTranslation("reconciliation");
  const { isDark } = useThemeClasses();

  // Hide zero-count statuses entirely.
  if (!n) return null;

  // Reconciliation `pending` is the default/unset state (no dispute, not yet
  // finalized) - label it "No Dispute" and drop the warning-yellow dot so it
  // doesn't read as an action item.
  const reconPending = isReconciliation && status === "pending";
  const labelKey = reconPending ? "no_dispute" : STATUS_LABEL_KEY[status];
  const dot = reconPending ? "bg-slate-400" : STATUS_DOT[status];

  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span
        className={`font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}
      >
        {n}
      </span>
      <span className={isDark ? "text-gray-400" : "text-gray-500"}>
        {t(labelKey)}
      </span>
    </span>
  );
}

const PRODUCT_STATUS_ORDER: StatusKey[] = [
  "pending",
  "processing",
  "shipped",
  "completed",
  "canceled",
];

const RECONCILIATION_STATUS_ORDER: StatusKey[] = [
  "pending",
  "approved",
  "disputed",
  "cancelled",
  "rejected",
  "closed",
];

function StatusBreakdown({
  order,
  counts,
  isReconciliation,
}: {
  order: StatusKey[];
  counts: Partial<Record<StatusKey, number>>;
  isReconciliation?: boolean;
}) {
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-1">
      {order.map((status) => (
        <StatusInline
          key={status}
          status={status}
          n={counts[status] ?? 0}
          isReconciliation={isReconciliation}
        />
      ))}
    </span>
  );
}

interface HeaderStatsProps {
  stats: OrderStats;
  adminView: boolean;
  showVenderWiseOrderTable: boolean;
  vendorSummaryViewMode: "list" | "grid";
  setVendorSummaryViewMode: (mode: "list" | "grid") => void;
  onOpenCloseAllOrdersModal: () => void;
  onOpenVendorBankDetails: () => void;
  hasBankAccount: boolean;
}

const HeaderStats = ({
  stats,
  adminView,
  showVenderWiseOrderTable,
  vendorSummaryViewMode,
  setVendorSummaryViewMode,
  onOpenCloseAllOrdersModal,
  onOpenVendorBankDetails,
  hasBankAccount,
}: HeaderStatsProps) => {
  const { t } = useTranslation("reconciliation");
  const { isDark } = useThemeClasses();

  return (
    <div>
      <header className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className={`mt-1 sm:mt-2 text-xl sm:text-2xl font-semibold tracking-tight md:text-3xl ${
              isDark ? "text-gray-100" : "text-gray-900"
            }`}
          >
            {t("orders_overview")}
          </h1>
          <p
            className={`mt-1 text-xs sm:text-sm ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {stats.totalOrders} {t("orders")} · {stats.totalOrderProductCount}{" "}
            {t("total_item_orders")}
          </p>
        </div>
        <div>
          <div
            className={clsx(
              "flex flex-col md:flex-row md:items-center justify-between gap-2 px-1",
            )}
          >
            {adminView ? (
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={onOpenCloseAllOrdersModal}
                  className="px-3 py-1.5 cursor-pointer rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  {t("close_all_orders")}
                </button>
                {!showVenderWiseOrderTable && (
                  <ViewModeToggle
                    value={vendorSummaryViewMode}
                    onChange={setVendorSummaryViewMode}
                    tableName="vendorMonthlySummaryViewMode"
                  />
                )}
                <PayoutCalculationInfo t={t} />
              </div>
            ) : (
              <div className="flex flex-col md:items-end gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onOpenVendorBankDetails}
                    className="px-3 py-1.5 cursor-pointer rounded bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <Landmark className="w-4 h-4" />
                    {t("bank_details")}
                  </button>
                  <PayoutCalculationInfo t={t} />
                </div>
                {!hasBankAccount && (
                  <span className={clsx("text-xs font-semibold text-red-500")}>
                    {t("bank_details_incomplete_info")}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Summary band */}
      <section
        className={`mb-2 grid grid-cols-1 gap-px overflow-hidden rounded-xl border sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 ${
          isDark ? "border-gray-800 bg-gray-800" : "border-gray-200 bg-gray-200"
        }`}
      >
        <RatioKpi
          label={t("net_payout")}
          actual={stats.netPayout}
          potential={stats.netPayoutPotential}
        />
        <RatioKpi
          label={t("total_revenue")}
          actual={stats?.totalRevenue}
          potential={stats?.totalRevenuePotential}
        />
        <RatioKpi
          label={t("platform_fee")}
          actual={stats?.totalFee}
          potential={stats?.totalFeePotential}
        />
        <Kpi
          label={t("total_orders")}
          value={String(stats?.totalOrderProductCount)}
          sub={
            <StatusBreakdown
              order={PRODUCT_STATUS_ORDER}
              counts={stats?.orderProductOverview}
            />
          }
        />
        <Kpi
          label={t("payable_orders")}
          labelHelp={<PayableOrdersInfo t={t} />}
          value={String(stats?.pending + stats?.approved)}
          sub={
            <StatusBreakdown
              order={RECONCILIATION_STATUS_ORDER}
              counts={stats?.statusOverview}
              isReconciliation
            />
          }
        />
      </section>
    </div>
  );
};

export default HeaderStats;
