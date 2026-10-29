import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Users,
  Map,
  CheckSquare,
  Globe,
  DollarSign,
  Wallet,
  CreditCard,
  ShoppingCart,
  Ticket,
  Calendar,
  MapPin,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
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
  DashboardDataTable,
  DashboardSectionHeader,
  DashboardDetailDrawer,
  ReorderableSection,
  LayoutCustomizeToggle,
} from "../components";
import type { DashboardDataTableColumn } from "../components";
import { useDashboardFilters } from "../hooks/useDashboardFilters";
import { useDashboardData } from "../hooks/useDashboardData";
import { useSectionOrder } from "../hooks/useSectionOrder";
import {
  mockAuthorities,
  mockDmos,
  mockEvents,
  mockOrders,
  mockPendingApprovals,
  mockProducts,
  mockSystemIncidents,
  mockVendors,
  mockBusinesses,
} from "../data/mockDashboardData";
import {
  aggregateRevenue,
  buildTrend,
  calcCapacity,
  formatCurrency,
  formatCount,
  isUpcoming,
  PERIOD_COMPARISON_LABEL,
  sortRanked,
  toRankedEntity,
} from "../data/mockDashboardHelpers";
import type { HealthStatus, RankedEntity } from "../types/dashboard.types";

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

const STATUS_STYLES: Record<HealthStatus, { bg: string; text: string }> = {
  healthy: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  warning: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
  },
  critical: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
  },
};

export default function SuperadminDashboard() {
  const { t } = useTranslation("dashboard_mock");
  const { isDark, textPrimary } = useThemeClasses();
  const { period, setPeriod, series } = useDashboardFilters("monthly");
  const { events } = useDashboardData({ role: "superadmin", period });

  const [approvals, setApprovals] = useState(mockPendingApprovals);
  const [drawer, setDrawer] = useState<
    null | "businesses" | "orders" | "revenue" | "approvals"
  >(null);
  const comparisonLabel = PERIOD_COMPARISON_LABEL[period];

  const [isCustomizing, setIsCustomizing] = useState(false);
  const sectionDescriptors = [
    { id: "platform-overview", label: t("section_platform_overview") },
    { id: "traffic-overview", label: t("section_traffic_overview") },
    { id: "revenue-overview", label: t("section_revenue_overview") },
    { id: "order-voucher-trends", label: t("section_order_voucher_trends") },
    { id: "system-health", label: t("section_system_health") },
    { id: "top-dmos-authorities", label: t("section_top_dmos_authorities") },
    { id: "top-items", label: t("section_top_items") },
    {
      id: "top-earning-businesses",
      label: t("section_top_earning_businesses"),
    },
    { id: "upcoming-events", label: t("section_upcoming_events") },
  ];
  const {
    orderedSections,
    hidden,
    moveSection,
    toggleSectionVisibility,
    resetOrder,
  } = useSectionOrder("superadmin", sectionDescriptors);

  const totalVendors = mockVendors.length;
  const totalBusinesses = mockBusinesses.length;

  const kpis = [
    {
      id: "dmos",
      label: t("total_dmos"),
      value: formatCount(mockDmos.length),
      icon: Globe,
      trend: buildTrend(mockDmos.length, mockDmos.length - 1, comparisonLabel),
    },
    {
      id: "authorities",
      label: t("total_authorities"),
      value: formatCount(mockAuthorities.length),
      icon: Map,
      trend: buildTrend(
        mockAuthorities.length,
        mockAuthorities.length - 1,
        comparisonLabel,
      ),
    },
    {
      id: "businesses",
      label: t("total_businesses"),
      value: formatCount(totalBusinesses),
      icon: Building2,
      trend: buildTrend(
        series.current.businessGrowth,
        series.previous?.businessGrowth,
        comparisonLabel,
      ),
      onClick: () => setDrawer("businesses"),
    },
    {
      id: "vendors",
      label: t("total_vendors"),
      value: formatCount(totalVendors),
      icon: Users,
      trend: buildTrend(totalVendors, totalVendors - 1, comparisonLabel),
    },
  ];

  const trafficKpis = [
    {
      id: "users",
      label: t("users"),
      value: formatCount(series.current.users),
      icon: Users,
      trend: buildTrend(
        series.current.users,
        series.previous?.users,
        comparisonLabel,
      ),
    },
    {
      id: "sessions",
      label: t("sessions"),
      value: formatCount(series.current.sessions),
      icon: Globe,
      trend: buildTrend(
        series.current.sessions,
        series.previous?.sessions,
        comparisonLabel,
      ),
    },
    {
      id: "pageviews",
      label: t("page_views"),
      value: formatCount(series.current.pageViews),
      icon: Globe,
      trend: buildTrend(
        series.current.pageViews,
        series.previous?.pageViews,
        comparisonLabel,
      ),
    },
    {
      id: "conversions",
      label: t("conversions"),
      value: formatCount(series.current.conversions),
      icon: CheckSquare,
      trend: buildTrend(
        series.current.conversions,
        series.previous?.conversions,
        comparisonLabel,
      ),
    },
  ];

  const conversionRate =
    series.current.sessions > 0
      ? Math.round(
          (series.current.conversions / series.current.sessions) * 1000,
        ) / 10
      : 0;

  const revenueKpis = [
    {
      id: "revenue",
      label: t("total_platform_revenue"),
      value: formatCurrency(series.current.revenue),
      icon: DollarSign,
      trend: buildTrend(
        series.current.revenue,
        series.previous?.revenue,
        comparisonLabel,
      ),
      onClick: () => setDrawer("revenue"),
    },
    {
      id: "fees",
      label: t("platform_fees_collected"),
      value: formatCurrency(series.current.platformFees),
      icon: CreditCard,
      trend: buildTrend(
        series.current.platformFees,
        series.previous?.platformFees,
        comparisonLabel,
      ),
    },
    {
      id: "payouts",
      label: t("vendor_payouts"),
      value: formatCurrency(series.current.vendorPayouts),
      icon: Wallet,
      trend: buildTrend(
        series.current.vendorPayouts,
        series.previous?.vendorPayouts,
        comparisonLabel,
      ),
    },
    {
      id: "pending-payouts",
      label: t("pending_payouts"),
      value: formatCurrency(Math.round(series.current.vendorPayouts * 0.08)),
      icon: Wallet,
    },
  ];

  const orderStatusData = useMemo(() => {
    const counts = mockOrders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([status, count]) => ({
      name: t(`order_status_${status}`),
      value: count,
    }));
  }, [t]);

  const topDmoAuthorities: RankedEntity[] = useMemo(() => {
    const dmoEntities = mockDmos.map((dmo) =>
      toRankedEntity({
        id: dmo.id,
        name: dmo.name,
        region: dmo.region,
        businessCount: mockBusinesses.filter((b) => b.dmoId === dmo.id).length,
        revenue:
          mockBusinesses.filter((b) => b.dmoId === dmo.id).length * 42_000,
        previousRevenue:
          mockBusinesses.filter((b) => b.dmoId === dmo.id).length * 40_000,
      }),
    );
    return sortRanked(dmoEntities, (e) => e.revenue);
  }, []);

  const topEarningBusinesses = useMemo(() => {
    return sortRanked(
      mockBusinesses
        .filter((b) => b.status === "active")
        .map((b) => {
          const vendor = mockVendors.find((v) => v.id === b.vendorId);
          const orders = mockOrders.filter((o) => o.businessId === b.id);
          return {
            business: b,
            vendorName: vendor?.name ?? "—",
            orderCount: orders.length,
            revenue: aggregateRevenue(orders),
          };
        }),
      (row) => row.revenue,
    ).slice(0, 8);
  }, []);

  const incidentStyles: Record<string, HealthStatus> = {
    email_failure: "warning",
    website_crash: "critical",
    operational: "healthy",
  };

  const businessColumns: DashboardDataTableColumn<
    (typeof topEarningBusinesses)[number]
  >[] = [
    {
      key: "name",
      header: t("business_name"),
      render: (row) => row.business.name,
      sortable: true,
      sortValue: (row) => row.business.name,
      className: textPrimary,
    },
    {
      key: "vendor",
      header: t("vendor"),
      render: (row) => row.vendorName,
      className: textPrimary,
    },
    {
      key: "orders",
      header: t("orders"),
      render: (row) => formatCount(row.orderCount),
      sortable: true,
      sortValue: (row) => row.orderCount,
      className: textPrimary,
    },
    {
      key: "revenue",
      header: t("revenue"),
      render: (row) => formatCurrency(row.revenue),
      sortable: true,
      sortValue: (row) => row.revenue,
      className: textPrimary,
    },
  ];

  const approvalColumns: DashboardDataTableColumn<
    (typeof approvals)[number]
  >[] = [
    {
      key: "name",
      header: t("business_name"),
      render: (row) => row.businessName,
    },
    {
      key: "category",
      header: t("category"),
      render: (row) => t(`category_${row.category}`),
    },
    {
      key: "submitted",
      header: t("submitted_at"),
      render: (row) => row.submittedAt,
    },
    {
      key: "status",
      header: t("status"),
      render: (row) => (
        <Badge
          variant={
            row.status === "pending"
              ? "secondary"
              : row.status === "approved"
                ? "default"
                : "destructive"
          }
        >
          {t(`approval_status_${row.status}`)}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: t("actions"),
      render: (row) =>
        row.status === "pending" ? (
          <div className="flex gap-1.5">
            <button
              type="button"
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              onClick={() => handleApprove(row.id)}
            >
              {t("approve")}
            </button>
            <button
              type="button"
              className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline cursor-pointer"
              onClick={() => handleReject(row.id)}
            >
              {t("reject")}
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
  ];

  function handleApprove(id: string) {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "approved" } : a)),
    );
    toast.success(t("approval_approved_toast"));
  }

  function handleReject(id: string) {
    if (!window.confirm(t("confirm_reject_business"))) return;
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "rejected" } : a)),
    );
    toast.success(t("approval_rejected_toast"));
  }

  const upcomingEvents = events.filter(isUpcoming).slice(0, 6);

  const sectionContent: Record<string, React.ReactNode> = {
    "platform-overview": (
      <>
        <section>
          <DashboardSectionHeader title={t("section_platform_overview")} />
          <DashboardKpiGrid>
            {kpis.map((kpi) => (
              <DashboardKpiCard
                key={kpi.id}
                label={kpi.label}
                value={kpi.value}
                icon={kpi.icon}
                trend={kpi.trend}
                onClick={kpi.onClick}
              />
            ))}
          </DashboardKpiGrid>
        </section>

        <DashboardChartCard
          title={t("chart_growth_trend")}
          subtitle={t("chart_growth_trend_desc")}
          accessibleSummary={t("chart_growth_trend_desc")}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series.history}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="businessGrowth"
                name={t("business_growth")}
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="authorityGrowth"
                name={t("authority_growth")}
                stroke="#f59e0b"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </DashboardChartCard>
      </>
    ),

    "traffic-overview": (
      <>
        <section>
          <DashboardSectionHeader
            title={t("section_traffic_overview")}
            subtitle={t("conversion_rate_label", { rate: conversionRate })}
          />
          <DashboardKpiGrid>
            {trafficKpis.map((kpi) => (
              <DashboardKpiCard
                key={kpi.id}
                label={kpi.label}
                value={kpi.value}
                icon={kpi.icon}
                trend={kpi.trend}
              />
            ))}
          </DashboardKpiGrid>
        </section>

        <DashboardChartCard
          title={t("chart_traffic_conversions")}
          subtitle={t("chart_traffic_conversions_desc")}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series.history}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="sessions"
                name={t("sessions")}
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="conversions"
                name={t("conversions")}
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </DashboardChartCard>
      </>
    ),

    "revenue-overview": (
      <>
        <section>
          <DashboardSectionHeader title={t("section_revenue_overview")} />
          <DashboardKpiGrid>
            {revenueKpis.map((kpi) => (
              <DashboardKpiCard
                key={kpi.id}
                label={kpi.label}
                value={kpi.value}
                icon={kpi.icon}
                trend={kpi.trend}
                onClick={kpi.onClick}
              />
            ))}
          </DashboardKpiGrid>
        </section>

        <DashboardChartCard
          title={t("chart_revenue_trend")}
          subtitle={t("chart_revenue_trend_desc")}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series.history}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name={t("total_platform_revenue")}
                stroke="#10b981"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="platformFees"
                name={t("platform_fees_collected")}
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="vendorPayouts"
                name={t("vendor_payouts")}
                stroke="#f59e0b"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </DashboardChartCard>
      </>
    ),

    "order-voucher-trends": (
      <section>
        <DashboardSectionHeader title={t("section_order_voucher_trends")} />
        <div className="grid lg:grid-cols-2 gap-4">
          <DashboardChartCard
            title={t("chart_orders_vouchers")}
            subtitle={t("chart_orders_vouchers_desc")}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series.history}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="orders"
                  name={t("orders")}
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="voucherSales"
                  name={t("voucher_sales")}
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="voucherRedemptions"
                  name={t("voucher_redemptions")}
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </DashboardChartCard>

          <DashboardChartCard
            title={t("chart_order_status_distribution")}
            subtitle={t("chart_order_status_distribution_desc")}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {orderStatusData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </DashboardChartCard>
        </div>
      </section>
    ),

    "system-health": (
      <section>
        <DashboardSectionHeader title={t("section_system_health")} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <DashboardKpiCard
            label={t("pending_approvals")}
            value={formatCount(
              approvals.filter((a) => a.status === "pending").length,
            )}
            icon={CheckSquare}
            onClick={() => setDrawer("approvals")}
          />
          {mockSystemIncidents.map((incident) => {
            const severity = incidentStyles[incident.type] ?? incident.severity;
            const styles = STATUS_STYLES[severity];
            return (
              <div
                key={incident.id}
                className={`dm-glass dm-tilt-static rounded-2xl p-4 ${isDark ? "dm-glass--dark" : ""}`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {t(`incident_type_${incident.type}`)}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${styles.bg} ${styles.text}`}
                  >
                    {t(`health_${severity}`)}
                  </span>
                </div>
                <p
                  className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {incident.description}
                </p>
                <p
                  className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  {incident.occurredAt}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    ),

    "top-dmos-authorities": (
      <section>
        <DashboardSectionHeader title={t("section_top_dmos_authorities")} />
        <div
          className={`dm-glass dm-tilt-static rounded-3xl p-4 ${isDark ? "dm-glass--dark" : ""}`}
        >
          <DashboardDataTable
            rowKey={(row) => row.id}
            emptyMessage={t("no_data_available")}
            columns={[
              {
                key: "name",
                header: t("name"),
                render: (r) => r.name,
                sortable: true,
                sortValue: (r) => r.name,
                className: textPrimary,
              },
              {
                key: "region",
                header: t("region"),
                render: (r) => r.region ?? "—",
                className: textPrimary,
              },
              {
                key: "businesses",
                header: t("businesses"),
                render: (r) => formatCount(r.businessCount ?? 0),
                sortable: true,
                sortValue: (r) => r.businessCount ?? 0,
                className: textPrimary,
              },
              {
                key: "revenue",
                header: t("revenue"),
                render: (r) => formatCurrency(r.revenue),
                sortable: true,
                sortValue: (r) => r.revenue,
                className: textPrimary,
              },
              {
                key: "growth",
                header: t("growth"),
                render: (r) =>
                  r.growthPercent === null
                    ? "—"
                    : `${r.growthPercent > 0 ? "+" : ""}${r.growthPercent}%`,
                className: textPrimary,
              },
              {
                key: "performance",
                header: t("performance"),
                render: (r) => (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[r.performance].bg} ${STATUS_STYLES[r.performance].text}`}
                  >
                    {t(`health_${r.performance}`)}
                  </span>
                ),
                className: textPrimary,
              },
            ]}
            rows={topDmoAuthorities}
          />
        </div>
      </section>
    ),

    "top-items": (
      <section>
        <DashboardSectionHeader title={t("section_top_items")} />
        <div className="grid lg:grid-cols-3 gap-4">
          <TopList
            title={t("top_businesses")}
            icon={Building2}
            items={sortRanked(
              mockBusinesses.filter((b) => b.status === "active"),
              (b) => b.performanceScore,
            )
              .slice(0, 5)
              .map((b) => ({
                id: b.id,
                label: b.name,
                metric: `${b.performanceScore}`,
                status: b.status,
              }))}
          />
          <TopList
            title={t("top_products")}
            icon={ShoppingCart}
            items={sortRanked(mockProducts, (p) => p.revenue)
              .slice(0, 5)
              .map((p) => ({
                id: p.id,
                label: p.name,
                metric: formatCurrency(p.revenue),
                status: p.status,
              }))}
          />
          <TopList
            title={t("top_events")}
            icon={Ticket}
            items={sortRanked(mockEvents, (e) => e.registrations)
              .slice(0, 5)
              .map((e) => ({
                id: e.id,
                label: e.name,
                metric: formatCount(e.registrations),
                status: e.status,
              }))}
          />
        </div>
      </section>
    ),

    "top-earning-businesses": (
      <section>
        <DashboardSectionHeader title={t("section_top_earning_businesses")} />
        <div
          className={`dm-glass dm-tilt-static rounded-3xl p-4 ${isDark ? "dm-glass--dark" : ""}`}
        >
          <DashboardDataTable
            rowKey={(row) => row.business.id}
            emptyMessage={t("no_data_available")}
            columns={businessColumns}
            rows={topEarningBusinesses}
          />
        </div>
      </section>
    ),

    "upcoming-events": (
      <section>
        <DashboardSectionHeader title={t("section_upcoming_events")} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {upcomingEvents.map((event) => {
            const capacity = calcCapacity(event.registrations, event.capacity);
            return (
              <div
                key={event.id}
                className={`dm-glass dm-tilt-static rounded-2xl p-4 ${isDark ? "dm-glass--dark" : ""}`}
              >
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
                  className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  {event.organizer}
                </p>
                <p
                  className={`text-xs flex items-center gap-1 mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  <MapPin className="w-3 h-3" aria-hidden="true" />{" "}
                  {event.location} · {event.date}
                </p>
                <div
                  className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={capacity.percentFull}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full bg-teal-500"
                    style={{ width: `${capacity.percentFull}%` }}
                  />
                </div>
                <p
                  className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  {t("registrations_of_capacity", {
                    registrations: event.registrations,
                    capacity: event.capacity,
                  })}{" "}
                  · {t("remaining_count", { count: capacity.remaining })}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    ),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <DashboardHeader
          title={t("superadmin_dashboard_title")}
          subtitle={t("superadmin_dashboard_subtitle")}
          scopeLabel={t("scope_entire_platform")}
        />
        <LayoutCustomizeToggle
          isCustomizing={isCustomizing}
          onToggle={() => setIsCustomizing((v) => !v)}
          onReset={resetOrder}
        />
      </div>

      <DashboardFilters
        period={period}
        onPeriodChange={setPeriod}
        onRefresh={() => toast.success(t("demo_data_refreshed"))}
      />

      {orderedSections.map((section, index) => (
        <ReorderableSection
          key={section.id}
          id={section.id}
          index={index}
          label={section.label}
          isCustomizing={isCustomizing}
          isFirst={index === 0}
          isLast={index === orderedSections.length - 1}
          isHidden={hidden.has(section.id)}
          onMove={moveSection}
          onMoveUp={() => moveSection(index, index - 1)}
          onMoveDown={() => moveSection(index, index + 1)}
          onToggleVisibility={() => toggleSectionVisibility(section.id)}
        >
          {sectionContent[section.id]}
        </ReorderableSection>
      ))}

      <DashboardDetailDrawer
        isOpen={drawer === "businesses"}
        onClose={() => setDrawer(null)}
        title={t("total_businesses")}
        description={t("drawer_businesses_desc")}
      >
        <ul className="space-y-2">
          {mockBusinesses.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between text-sm"
            >
              <span>{b.name}</span>
              <Badge variant={b.status === "active" ? "default" : "secondary"}>
                {t(`status_${b.status}`)}
              </Badge>
            </li>
          ))}
        </ul>
      </DashboardDetailDrawer>

      <DashboardDetailDrawer
        isOpen={drawer === "revenue"}
        onClose={() => setDrawer(null)}
        title={t("total_platform_revenue")}
        description={t("drawer_revenue_desc")}
      >
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between">
            <span>{t("total_platform_revenue")}</span>
            <span>{formatCurrency(series.current.revenue)}</span>
          </li>
          <li className="flex justify-between">
            <span>{t("platform_fees_collected")}</span>
            <span>{formatCurrency(series.current.platformFees)}</span>
          </li>
          <li className="flex justify-between">
            <span>{t("vendor_payouts")}</span>
            <span>{formatCurrency(series.current.vendorPayouts)}</span>
          </li>
        </ul>
      </DashboardDetailDrawer>

      <DashboardDetailDrawer
        isOpen={drawer === "approvals"}
        onClose={() => setDrawer(null)}
        title={t("pending_approvals")}
        description={t("drawer_approvals_desc")}
      >
        <DashboardDataTable
          rowKey={(row) => row.id}
          emptyMessage={t("no_pending_approvals")}
          columns={approvalColumns}
          rows={approvals}
          pageSize={5}
        />
      </DashboardDetailDrawer>
    </div>
  );
}

interface TopListItem {
  id: string;
  label: string;
  metric: string;
  status: string;
}

function TopList({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: typeof Building2;
  items: TopListItem[];
}) {
  const { t } = useTranslation("dashboard_mock");
  const { isDark } = useThemeClasses();

  return (
    <div
      className={`dm-glass dm-tilt-static rounded-3xl p-4 ${isDark ? "dm-glass--dark" : ""}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-teal-500" aria-hidden="true" />
        <h3
          className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
        >
          {title}
        </h3>
      </div>
      {items.length === 0 ? (
        <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          {t("no_data_available")}
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between text-sm gap-2"
            >
              <span
                className={`truncate ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                {item.label}
              </span>
              <span
                className={`shrink-0 font-medium ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {item.metric}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
