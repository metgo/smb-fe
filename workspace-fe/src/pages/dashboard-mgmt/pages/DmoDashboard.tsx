import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Map,
  Package,
  MapPin,
  DollarSign,
  CheckSquare,
  Compass,
  TrendingUp,
  Globe,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
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
  DashboardAlertCard,
  DashboardDetailDrawer,
  ReorderableSection,
  LayoutCustomizeToggle,
} from "../components";
import type { DashboardDataTableColumn } from "../components";
import { useDashboardFilters } from "../hooks/useDashboardFilters";
import { useDashboardData } from "../hooks/useDashboardData";
import { useSectionOrder } from "../hooks/useSectionOrder";
import { mockDmos, mockOrders, mockVendors } from "../data/mockDashboardData";
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
import type {
  PendingApproval,
  PerformanceAlert,
} from "../types/dashboard.types";

// Demo: the DMO user manages Galilee Tourism Board.
const CURRENT_DMO_ID = "dmo-1";

export default function DmoDashboard() {
  const { t } = useTranslation("dashboard_mock");
  const { isDark, textPrimary } = useThemeClasses();
  const { period, setPeriod, series } = useDashboardFilters("monthly");
  const {
    authorities,
    businesses,
    products,
    pois,
    approvals: initialApprovals,
    alerts,
    events,
  } = useDashboardData({ role: "dmo", period, dmoId: CURRENT_DMO_ID });

  const [approvals, setApprovals] =
    useState<PendingApproval[]>(initialApprovals);
  const [inspectedAlert, setInspectedAlert] = useState<PerformanceAlert | null>(
    null,
  );

  const dmo = mockDmos.find((d) => d.id === CURRENT_DMO_ID);
  const comparisonLabel = PERIOD_COMPARISON_LABEL[period];

  const [isCustomizing, setIsCustomizing] = useState(false);
  const sectionDescriptors = [
    { id: "regional-overview", label: t("section_regional_overview") },
    { id: "authority-performance", label: t("section_authority_performance") },
    {
      id: "regional-traffic-chart",
      label: t("section_regional_traffic_chart"),
    },
    { id: "entity-breakdown", label: t("section_entity_breakdown") },
    {
      id: "regional-revenue-orders-chart",
      label: t("section_regional_revenue_orders_chart"),
    },
    { id: "business-approvals", label: t("section_business_approvals") },
    { id: "campaign-performance", label: t("section_campaign_performance") },
    { id: "visitor-origin-chart", label: t("section_visitor_origin_chart") },
    { id: "popular-top-earning", label: t("section_popular_top_earning") },
    { id: "upcoming-events", label: t("section_upcoming_events") },
    { id: "performance-alerts", label: t("section_performance_alerts") },
    { id: "minisite-health", label: t("section_minisite_health") },
  ];
  const {
    orderedSections,
    hidden,
    moveSection,
    toggleSectionVisibility,
    resetOrder,
  } = useSectionOrder("dmo", sectionDescriptors);

  const regionalOrders = useMemo(
    () =>
      mockOrders.filter((o) => businesses.some((b) => b.id === o.businessId)),
    [businesses],
  );
  const regionalRevenue = aggregateRevenue(regionalOrders);

  const overviewKpis = [
    {
      id: "authorities",
      label: t("total_authorities"),
      value: formatCount(authorities.length),
      icon: Map,
    },
    {
      id: "businesses",
      label: t("total_businesses"),
      value: formatCount(businesses.length),
      icon: Building2,
      trend: buildTrend(
        series.current.businessGrowth,
        series.previous?.businessGrowth,
        comparisonLabel,
      ),
    },
    {
      id: "products",
      label: t("total_products"),
      value: formatCount(products.length),
      icon: Package,
    },
    {
      id: "pois",
      label: t("total_pois"),
      value: formatCount(pois.length),
      icon: MapPin,
    },
    {
      id: "revenue",
      label: t("regional_revenue"),
      value: formatCurrency(regionalRevenue),
      icon: DollarSign,
      trend: buildTrend(
        series.current.revenue,
        series.previous?.revenue,
        comparisonLabel,
      ),
    },
    {
      id: "sessions",
      label: t("website_sessions"),
      value: formatCount(series.current.sessions),
      icon: Globe,
      trend: buildTrend(
        series.current.sessions,
        series.previous?.sessions,
        comparisonLabel,
      ),
    },
  ];

  const authorityPerformance = useMemo(() => {
    return authorities.map((authority) => {
      const authBusinesses = businesses.filter(
        (b) => b.authorityId === authority.id,
      );
      const authOrders = mockOrders.filter((o) =>
        authBusinesses.some((b) => b.id === o.businessId),
      );
      const revenue = aggregateRevenue(authOrders);
      const pendingApprovals = approvals.filter(
        (a) => a.authorityId === authority.id && a.status === "pending",
      ).length;

      return {
        ...toRankedEntity({
          id: authority.id,
          name: authority.name,
          region: authority.region,
          businessCount: authBusinesses.length,
          revenue,
          previousRevenue: Math.round(revenue * 0.93),
        }),
        orderCount: authOrders.length,
        pendingApprovals,
      };
    });
  }, [authorities, businesses, approvals]);

  const authorityColumns: DashboardDataTableColumn<
    (typeof authorityPerformance)[number]
  >[] = [
    {
      key: "name",
      header: t("authority_name"),
      render: (r) => r.name,
      sortable: true,
      sortValue: (r) => r.name,
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
      key: "orders",
      header: t("orders"),
      render: (r) => formatCount(r.orderCount),
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
      key: "pending",
      header: t("pending_approvals"),
      render: (r) => formatCount(r.pendingApprovals),
      className: textPrimary,
    },
  ];

  const approvalColumns: DashboardDataTableColumn<PendingApproval>[] = [
    {
      key: "name",
      header: t("business_name"),
      render: (row) => row.businessName,
      className: textPrimary,
    },
    {
      key: "category",
      header: t("category"),
      render: (row) => t(`category_${row.category}`),
      className: textPrimary,
    },
    {
      key: "submitted",
      header: t("submitted_at"),
      render: (row) => row.submittedAt,
      className: textPrimary,
    },
    {
      key: "status",
      header: t("status"),
      className: textPrimary,
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

  const popularProducts = sortRanked(products, (p) => p.unitsSold).slice(0, 5);
  const topEarningBusinesses = sortRanked(
    businesses.map((b) => {
      const vendor = mockVendors.find((v) => v.id === b.vendorId);
      const orders = mockOrders.filter((o) => o.businessId === b.id);
      return {
        business: b,
        vendorName: vendor?.name ?? "—",
        revenue: aggregateRevenue(orders),
      };
    }),
    (row) => row.revenue,
  ).slice(0, 5);

  const visitorOrigins = [
    { region: t("origin_tel_aviv"), value: 38 },
    { region: t("origin_jerusalem"), value: 24 },
    { region: t("origin_haifa"), value: 16 },
    { region: t("origin_international"), value: 14 },
    { region: t("origin_other"), value: 8 },
  ];

  const upcomingEvents = events.filter(isUpcoming).slice(0, 4);

  const miniSiteSummary = {
    live: 2,
    draft: 0,
    lastIncidentAt: "2026-10-19",
  };

  const sectionContent: Record<string, React.ReactNode> = {
    "regional-overview": (
      <section>
        <DashboardSectionHeader title={t("section_regional_overview")} />
        <DashboardKpiGrid>
          {overviewKpis.map((kpi) => (
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
    ),

    "authority-performance": (
      <section>
        <DashboardSectionHeader title={t("section_authority_performance")} />
        <div
          className={`dm-glass dm-tilt-static rounded-3xl p-4 ${isDark ? "dm-glass--dark" : ""}`}
        >
          <DashboardDataTable
            rowKey={(r) => r.id}
            emptyMessage={t("no_data_available")}
            columns={authorityColumns}
            rows={authorityPerformance}
          />
        </div>
      </section>
    ),

    "regional-traffic-chart": (
      <DashboardChartCard
        title={t("chart_regional_traffic")}
        subtitle={t("chart_regional_traffic_desc")}
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
              dataKey="users"
              name={t("users")}
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
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
              dataKey="pageViews"
              name={t("page_views")}
              stroke="#f59e0b"
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
    ),

    "entity-breakdown": (
      <section>
        <DashboardSectionHeader title={t("section_entity_breakdown")} />
        <div className="grid sm:grid-cols-3 gap-3">
          <BreakdownCard
            icon={Building2}
            label={t("businesses")}
            items={businesses}
          />
          <BreakdownCard
            icon={Package}
            label={t("products")}
            items={products}
          />
          <BreakdownCard icon={MapPin} label={t("pois")} items={pois} />
        </div>
      </section>
    ),

    "regional-revenue-orders-chart": (
      <div className="grid lg:grid-cols-2 gap-4">
        <DashboardChartCard
          title={t("chart_regional_revenue")}
          subtitle={t("chart_regional_revenue_desc")}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series.history}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar
                dataKey="platformFees"
                name={t("platform_fees_collected")}
                stackId="rev"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="vendorPayouts"
                name={t("vendor_payouts")}
                stackId="rev"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </DashboardChartCard>

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
                dataKey="voucherRedemptions"
                name={t("voucher_redemptions")}
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </DashboardChartCard>
      </div>
    ),

    "business-approvals": (
      <section>
        <DashboardSectionHeader title={t("section_business_approvals")} />
        <div
          className={`dm-glass dm-tilt-static rounded-3xl p-4 ${isDark ? "dm-glass--dark" : ""}`}
        >
          <DashboardDataTable
            rowKey={(row) => row.id}
            emptyMessage={t("no_pending_approvals")}
            columns={approvalColumns}
            rows={approvals}
            pageSize={5}
          />
        </div>
      </section>
    ),

    "campaign-performance": (
      <section>
        <DashboardSectionHeader title={t("section_campaign_performance")} />
        <DashboardKpiGrid>
          <DashboardKpiCard
            label={t("minisite_visits")}
            value={formatCount(3_420)}
            icon={Compass}
          />
          <DashboardKpiCard
            label={t("minisite_conversion_rate")}
            value="4.8%"
            icon={TrendingUp}
          />
          <DashboardKpiCard
            label={t("voucher_redemption_rate")}
            value="68%"
            icon={CheckSquare}
          />
          <DashboardKpiCard
            label={t("campaign_trend")}
            value={t("trend_improving")}
            icon={TrendingUp}
          />
        </DashboardKpiGrid>
      </section>
    ),

    "visitor-origin-chart": (
      <DashboardChartCard
        title={t("section_visitor_origin")}
        subtitle={t("section_visitor_origin_desc")}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={visitorOrigins}
            layout="vertical"
            margin={{ left: 24 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="region"
              width={110}
              tick={{ fontSize: 12 }}
            />
            <Tooltip formatter={(value) => `${value}%`} />
            <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </DashboardChartCard>
    ),

    "popular-top-earning": (
      <section>
        <DashboardSectionHeader title={t("section_popular_top_earning")} />
        <div className="grid lg:grid-cols-2 gap-4">
          <div
            className={`dm-glass dm-tilt-static rounded-3xl p-4 ${isDark ? "dm-glass--dark" : ""}`}
          >
            <h3
              className={`text-sm font-semibold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {t("popular_products")}
            </h3>
            <ul className="space-y-2">
              {popularProducts.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                    {p.name}
                  </span>
                  <span
                    className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {formatCount(p.unitsSold)} {t("units_sold")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className={`dm-glass dm-tilt-static rounded-3xl p-4 ${isDark ? "dm-glass--dark" : ""}`}
          >
            <h3
              className={`text-sm font-semibold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {t("top_earning_businesses")}
            </h3>
            <ul className="space-y-2">
              {topEarningBusinesses.map((row) => (
                <li
                  key={row.business.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                    {row.business.name}
                  </span>
                  <span
                    className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {formatCurrency(row.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    ),

    "upcoming-events": (
      <section>
        <DashboardSectionHeader title={t("section_upcoming_events")} />
        <div className="grid sm:grid-cols-2 gap-3">
          {upcomingEvents.map((event) => {
            const capacity = calcCapacity(event.registrations, event.capacity);
            return (
              <div
                key={event.id}
                className={`dm-glass dm-tilt-static rounded-2xl p-4 ${isDark ? "dm-glass--dark" : ""}`}
              >
                <p
                  className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {event.name}
                </p>
                <p
                  className={`text-xs mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  {event.organizer} · {event.date}
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
                  })}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    ),

    "performance-alerts": (
      <section>
        <DashboardSectionHeader title={t("section_performance_alerts")} />
        {alerts.length === 0 ? (
          <p
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {t("no_performance_alerts")}
          </p>
        ) : (
          <div className="grid lg:grid-cols-2 gap-3">
            {alerts.map((alert) => (
              <DashboardAlertCard
                key={alert.id}
                alert={alert}
                onInspect={setInspectedAlert}
              />
            ))}
          </div>
        )}
      </section>
    ),

    "minisite-health": (
      <section>
        <DashboardSectionHeader title={t("section_minisite_health")} />
        <DashboardKpiGrid>
          <DashboardKpiCard
            label={t("live_minisites")}
            value={formatCount(miniSiteSummary.live)}
            icon={Globe}
          />
          <DashboardKpiCard
            label={t("draft_minisites")}
            value={formatCount(miniSiteSummary.draft)}
            icon={Globe}
          />
          <DashboardKpiCard
            label={t("last_incident")}
            value={miniSiteSummary.lastIncidentAt}
            icon={CheckSquare}
          />
          <DashboardKpiCard
            label={t("current_health_status")}
            value={t("health_warning")}
            icon={CheckSquare}
          />
        </DashboardKpiGrid>
      </section>
    ),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <DashboardHeader
          title={t("dmo_dashboard_title")}
          subtitle={t("dmo_dashboard_subtitle")}
          scopeLabel={t("scope_dmo", { name: dmo?.name ?? "" })}
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
        isOpen={!!inspectedAlert}
        onClose={() => setInspectedAlert(null)}
        title={inspectedAlert?.businessName ?? ""}
        description={t("drawer_alert_desc")}
      >
        {inspectedAlert && (
          <div className="space-y-3 text-sm">
            <p>
              {t("score_change_label")}: {inspectedAlert.previousScore} →{" "}
              {inspectedAlert.currentScore}
            </p>
            <ul className="space-y-1">
              {inspectedAlert.factors.map((factor, index) => (
                <li key={index}>• {factor}</li>
              ))}
            </ul>
            <p className="italic text-xs text-gray-400">
              {inspectedAlert.suggestedAction}
            </p>
          </div>
        )}
      </DashboardDetailDrawer>
    </div>
  );
}

function BreakdownCard({
  icon: Icon,
  label,
  items,
}: {
  icon: typeof Building2;
  label: string;
  items: { status: string }[];
}) {
  const { t } = useTranslation("dashboard_mock");
  const { isDark } = useThemeClasses();
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div
      className={`dm-glass dm-tilt-static rounded-3xl p-4 ${isDark ? "dm-glass--dark" : ""}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-teal-500" aria-hidden="true" />
        <h3
          className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
        >
          {label}
        </h3>
        <span
          className={`ml-auto text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
        >
          {items.length}
        </span>
      </div>
      {Object.keys(counts).length === 0 ? (
        <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          {t("no_data_available")}
        </p>
      ) : (
        <ul className="space-y-1">
          {Object.entries(counts).map(([status, count]) => (
            <li
              key={status}
              className="flex items-center justify-between text-xs"
            >
              <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                {t(`status_${status}`)}
              </span>
              <span className={isDark ? "text-gray-200" : "text-gray-700"}>
                {count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
