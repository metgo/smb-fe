import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  Wallet,
  CreditCard,
  TrendingUp,
  Calendar,
  Megaphone,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { Badge } from "@/components/ui/badge";
import {
  DashboardHeader,
  DashboardFilters,
  DashboardKpiCard,
  DashboardKpiGrid,
  DashboardChartCard,
  DashboardSectionHeader,
  DashboardDataTable,
  DashboardDetailDrawer,
  BusinessSwitcher,
} from "../components";
import type { DashboardDataTableColumn } from "../components";
import { useDashboardFilters } from "../hooks/useDashboardFilters";
import { useDashboardData } from "../hooks/useDashboardData";
import {
  CURRENT_VENDOR_ID,
  getVendorBusinesses,
  mockAnnouncements,
  mockPaymentRecords,
  mockProfileCompletion,
} from "../data/mockDashboardData";
import {
  aggregateOrderCounts,
  aggregateRevenue,
  buildTrend,
  calcProfileCompletion,
  formatCurrency,
  formatCount,
  isUpcoming,
  PERIOD_COMPARISON_LABEL,
  sortRanked,
} from "../data/mockDashboardHelpers";
import type { Order } from "../types/dashboard.types";

export default function VendorDashboard() {
  const { t } = useTranslation("dashboard_mock");
  const { isDark } = useThemeClasses();
  const { period, setPeriod } = useDashboardFilters("monthly");

  const vendorBusinesses = useMemo(
    () => getVendorBusinesses(CURRENT_VENDOR_ID),
    [],
  );
  const [selectedBusinessId, setSelectedBusinessId] = useState(
    vendorBusinesses[0]?.id ?? "",
  );

  const { orders, products, events } = useDashboardData({
    role: "traveller",
    period,
    businessId: selectedBusinessId,
  });

  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);

  const comparisonLabel = PERIOD_COMPARISON_LABEL[period];
  const business = vendorBusinesses.find((b) => b.id === selectedBusinessId);
  const payments = mockPaymentRecords.filter(
    (p) => p.businessId === selectedBusinessId,
  );
  const profile = mockProfileCompletion.find(
    (p) => p.businessId === selectedBusinessId,
  );

  const orderCounts = aggregateOrderCounts(orders);
  const grossSales = aggregateRevenue(orders);
  const avgOrderValue =
    orderCounts.total > 0 ? Math.round(grossSales / orderCounts.total) : 0;
  const platformFees = Math.round(grossSales * 0.12);
  const netEarnings = grossSales - platformFees;
  const paidOut = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingPayout = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const ordersKpis = [
    {
      id: "total",
      label: t("total_orders"),
      value: formatCount(orderCounts.total),
      icon: ShoppingCart,
      trend: buildTrend(
        orderCounts.total,
        Math.round(orderCounts.total * 0.92),
        comparisonLabel,
      ),
    },
    {
      id: "pending",
      label: t("pending_orders"),
      value: formatCount(orderCounts.pending),
      icon: Clock,
    },
    {
      id: "completed",
      label: t("completed_orders"),
      value: formatCount(orderCounts.completed),
      icon: CheckCircle2,
    },
    {
      id: "canceled",
      label: t("canceled_orders"),
      value: formatCount(orderCounts.canceled),
      icon: XCircle,
      trend: buildTrend(
        orderCounts.canceled,
        orderCounts.canceled + 1,
        comparisonLabel,
        "negative",
      ),
    },
  ];

  const fulfillmentData = useMemo(() => {
    const pickUp = orders.filter(
      (o) => o.fulfillmentMethod === "pick_up",
    ).length;
    const deliver = orders.filter(
      (o) => o.fulfillmentMethod === "deliver",
    ).length;
    return [
      { name: t("pick_up"), value: pickUp },
      { name: t("deliver"), value: deliver },
    ];
  }, [orders, t]);

  const orderColumns: DashboardDataTableColumn<Order>[] = [
    {
      key: "number",
      header: t("order_number"),
      render: (o) => o.orderNumber,
      sortable: true,
      sortValue: (o) => o.orderNumber,
    },
    {
      key: "date",
      header: t("date"),
      render: (o) => o.date,
      sortable: true,
      sortValue: (o) => o.date,
    },
    { key: "item", header: t("item_summary"), render: (o) => o.itemSummary },
    {
      key: "amount",
      header: t("amount"),
      render: (o) => formatCurrency(o.amount),
      sortable: true,
      sortValue: (o) => o.amount,
    },
    {
      key: "status",
      header: t("status"),
      render: (o) => (
        <Badge
          variant={
            o.status === "completed"
              ? "default"
              : o.status === "canceled"
                ? "destructive"
                : "secondary"
          }
        >
          {t(`order_status_${o.status}`)}
        </Badge>
      ),
    },
    {
      key: "fulfillment",
      header: t("fulfillment_method"),
      render: (o) => t(o.fulfillmentMethod),
    },
    {
      key: "actions",
      header: t("actions"),
      render: (o) => (
        <button
          type="button"
          className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
          onClick={() => setInspectedOrder(o)}
        >
          {t("view")}
        </button>
      ),
    },
  ];

  const paymentColumns: DashboardDataTableColumn<(typeof payments)[number]>[] =
    [
      { key: "reference", header: t("reference"), render: (p) => p.reference },
      { key: "date", header: t("date"), render: (p) => p.date },
      {
        key: "amount",
        header: t("amount"),
        render: (p) => formatCurrency(p.amount),
      },
      {
        key: "status",
        header: t("status"),
        render: (p) => (
          <Badge
            variant={
              p.status === "paid"
                ? "default"
                : p.status === "pending"
                  ? "secondary"
                  : "destructive"
            }
          >
            {t(`payment_status_${p.status}`)}
          </Badge>
        ),
      },
      {
        key: "dispute",
        header: t("dispute_status"),
        render: (p) =>
          p.disputeStatus === "none" ? (
            <span className="text-xs text-gray-400">{t("dispute_none")}</span>
          ) : (
            <Badge
              variant={p.disputeStatus === "open" ? "destructive" : "secondary"}
            >
              {t(`dispute_${p.disputeStatus}`)}
            </Badge>
          ),
      },
    ];

  const topProducts = sortRanked(products, (p) => p.revenue).slice(0, 5);

  const completion = profile
    ? calcProfileCompletion(profile.percent, profile.missingItems)
    : { percent: 0, isComplete: false, missingItems: [] };

  const upcomingEvents = events.filter(isUpcoming).slice(0, 4);

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={t("vendor_dashboard_title")}
        subtitle={t("vendor_dashboard_subtitle")}
        scopeLabel={t("scope_business", { name: business?.name ?? "" })}
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <BusinessSwitcher
          businesses={vendorBusinesses}
          selectedBusinessId={selectedBusinessId}
          onSelect={setSelectedBusinessId}
        />
      </div>

      <DashboardFilters
        period={period}
        onPeriodChange={setPeriod}
        onRefresh={() => toast.success(t("demo_data_refreshed"))}
      />

      {/* B. Orders overview */}
      <section>
        <DashboardSectionHeader title={t("section_orders_overview")} />
        <DashboardKpiGrid>
          {ordersKpis.map((kpi) => (
            <DashboardKpiCard
              key={kpi.id}
              label={kpi.label}
              value={kpi.value}
              icon={kpi.icon}
              trend={kpi.trend}
            />
          ))}
        </DashboardKpiGrid>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <DashboardKpiCard
            label={t("average_order_value")}
            value={formatCurrency(avgOrderValue)}
            icon={TrendingUp}
          />
          <DashboardChartCard
            title={t("chart_pickup_vs_delivery")}
            subtitle={t("chart_pickup_vs_delivery_desc")}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fulfillmentData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </DashboardChartCard>
        </div>
      </section>

      <section>
        <div
          className={`rounded-xl border p-4 ${isDark ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"}`}
        >
          <DashboardDataTable
            rowKey={(o) => o.id}
            emptyMessage={t("no_orders_in_period")}
            columns={orderColumns}
            rows={orders}
          />
        </div>
      </section>

      {/* C. Revenue and payouts */}
      <section>
        <DashboardSectionHeader title={t("section_revenue_payouts")} />
        <DashboardKpiGrid>
          <DashboardKpiCard
            label={t("gross_sales")}
            value={formatCurrency(grossSales)}
            icon={DollarSign}
          />
          <DashboardKpiCard
            label={t("platform_fees")}
            value={formatCurrency(platformFees)}
            icon={CreditCard}
          />
          <DashboardKpiCard
            label={t("net_earnings")}
            value={formatCurrency(netEarnings)}
            icon={Wallet}
          />
          <DashboardKpiCard
            label={t("paid_out_amount")}
            value={formatCurrency(paidOut)}
            icon={Wallet}
          />
        </DashboardKpiGrid>
        <DashboardKpiGrid>
          <DashboardKpiCard
            label={t("pending_payout_amount")}
            value={formatCurrency(pendingPayout)}
            icon={Clock}
          />
        </DashboardKpiGrid>
      </section>

      {/* D. Top-selling products */}
      <section>
        <DashboardSectionHeader title={t("section_top_selling_products")} />
        <div
          className={`rounded-xl border p-4 ${isDark ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"}`}
        >
          {topProducts.length === 0 ? (
            <p
              className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
            >
              {t("no_data_available")}
            </p>
          ) : (
            <ul className="space-y-2">
              {topProducts.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between text-sm gap-2"
                >
                  <span
                    className={`truncate ${isDark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    {p.name}
                  </span>
                  <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                    {formatCount(p.unitsSold)} {t("units_sold")}
                  </span>
                  <span
                    className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {formatCurrency(p.revenue)}
                  </span>
                  <Badge
                    variant={p.status === "approved" ? "default" : "secondary"}
                  >
                    {t(`status_${p.status}`)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* E. Payments and disputes */}
      <section>
        <DashboardSectionHeader title={t("section_payments_disputes")} />
        <div
          className={`rounded-xl border p-4 ${isDark ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"}`}
        >
          <DashboardDataTable
            rowKey={(p) => p.id}
            emptyMessage={t("no_disputes")}
            columns={paymentColumns}
            rows={payments}
            pageSize={5}
          />
        </div>
      </section>

      {/* F. Business performance score */}
      {business && (
        <section>
          <DashboardSectionHeader title={t("section_performance_score")} />
          <div
            className={`rounded-xl border p-4 ${isDark ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {business.performanceScore}
              </span>
              <span
                className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                {t("score_change_label")}: {business.previousPerformanceScore} →{" "}
                {business.performanceScore}
              </span>
            </div>
            <p
              className={`text-xs italic ${isDark ? "text-gray-500" : "text-gray-400"}`}
            >
              {t("simulated_data_notice")}
            </p>
          </div>
        </section>
      )}

      {/* H. Profile completion */}
      <section>
        <DashboardSectionHeader title={t("section_profile_completion")} />
        <div
          className={`rounded-xl border p-4 ${isDark ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {completion.percent}%
            </span>
          </div>
          <div
            className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden mb-3"
            role="progressbar"
            aria-valuenow={completion.percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-teal-500"
              style={{ width: `${completion.percent}%` }}
            />
          </div>
          {completion.missingItems.length > 0 ? (
            <ul className="space-y-1">
              {completion.missingItems.map((item, index) => (
                <li
                  key={index}
                  className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  • {item}
                </li>
              ))}
            </ul>
          ) : (
            <p
              className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {t("profile_complete")}
            </p>
          )}
        </div>
      </section>

      {/* I. Platform updates */}
      <section>
        <DashboardSectionHeader title={t("section_platform_updates")} />
        <div className="grid sm:grid-cols-3 gap-3">
          {mockAnnouncements.map((a) => (
            <div
              key={a.id}
              className={`rounded-lg border p-4 ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Megaphone
                  className="w-4 h-4 text-teal-500"
                  aria-hidden="true"
                />
                <span
                  className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  {a.date}
                </span>
              </div>
              <p
                className={`text-sm font-medium mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {a.title}
              </p>
              <p
                className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                {a.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* J. Upcoming events and sessions */}
      <section>
        <DashboardSectionHeader title={t("section_upcoming_events")} />
        {upcomingEvents.length === 0 ? (
          <p
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {t("no_upcoming_events")}
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className={`rounded-lg border p-4 flex items-center justify-between gap-3 ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar
                      className="w-4 h-4 text-teal-500"
                      aria-hidden="true"
                    />
                    <p
                      className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      {event.name}
                    </p>
                  </div>
                  <p
                    className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {event.date} · {formatCount(event.registrations)}{" "}
                    {t("registrations")}
                  </p>
                </div>
                <Badge
                  variant={
                    event.status === "approved" ? "default" : "secondary"
                  }
                >
                  {t(`status_${event.status}`)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </section>

      <DashboardDetailDrawer
        isOpen={!!inspectedOrder}
        onClose={() => setInspectedOrder(null)}
        title={inspectedOrder?.orderNumber ?? ""}
        description={t("drawer_order_desc")}
      >
        {inspectedOrder && (
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span>{t("date")}</span>
              <span>{inspectedOrder.date}</span>
            </li>
            <li className="flex justify-between">
              <span>{t("item_summary")}</span>
              <span>{inspectedOrder.itemSummary}</span>
            </li>
            <li className="flex justify-between">
              <span>{t("amount")}</span>
              <span>{formatCurrency(inspectedOrder.amount)}</span>
            </li>
            <li className="flex justify-between">
              <span>{t("status")}</span>
              <span>{t(`order_status_${inspectedOrder.status}`)}</span>
            </li>
            <li className="flex justify-between">
              <span>{t("fulfillment_method")}</span>
              <span>{t(inspectedOrder.fulfillmentMethod)}</span>
            </li>
          </ul>
        )}
      </DashboardDetailDrawer>
    </div>
  );
}
