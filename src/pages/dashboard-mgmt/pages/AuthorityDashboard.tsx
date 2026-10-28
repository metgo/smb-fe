import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Package,
  MapPin,
  DollarSign,
  ShoppingCart,
  Globe,
  TrendingUp,
  CheckSquare,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
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
  DashboardSectionHeader,
  DashboardAlertCard,
  DashboardDataTable,
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
  mockOrders,
  mockVendors,
} from "../data/mockDashboardData";
import {
  aggregateOrderCounts,
  aggregateRevenue,
  buildTrend,
  formatCurrency,
  formatCount,
  isUpcoming,
  PERIOD_COMPARISON_LABEL,
  sortRanked,
} from "../data/mockDashboardHelpers";
import type { PerformanceAlert } from "../types/dashboard.types";

// Demo: the Authority user manages Tiberias Authority.
const CURRENT_AUTHORITY_ID = "auth-1";

export default function AuthorityDashboard() {
  const { t } = useTranslation("dashboard_mock");
  const { isDark, textPrimary } = useThemeClasses();
  const { period, setPeriod, series } = useDashboardFilters("monthly");
  const { businesses, products, pois, approvals, alerts, events } =
    useDashboardData({
      role: "authority",
      period,
      authorityId: CURRENT_AUTHORITY_ID,
    });

  const [inspectedAlert, setInspectedAlert] = useState<PerformanceAlert | null>(
    null,
  );

  const authority = mockAuthorities.find((a) => a.id === CURRENT_AUTHORITY_ID);
  const comparisonLabel = PERIOD_COMPARISON_LABEL[period];

  const [isCustomizing, setIsCustomizing] = useState(false);
  const sectionDescriptors = [
    { id: "area-overview", label: t("section_area_overview") },
    { id: "entity-breakdown", label: t("section_entity_breakdown") },
    { id: "revenue-snapshot", label: t("section_revenue_snapshot") },
    { id: "business-health", label: t("section_business_health") },
    { id: "campaign-performance", label: t("section_campaign_performance") },
    { id: "popular-top-earning", label: t("section_popular_top_earning") },
    { id: "events-pois", label: t("section_events_pois") },
    {
      id: "purchase-trend-charts",
      label: t("section_purchase_trend_charts"),
    },
    { id: "actionable-items", label: t("section_actionable_items") },
  ];
  const { orderedSections, moveSection, resetOrder } = useSectionOrder(
    "authority",
    sectionDescriptors,
  );

  const areaOrders = useMemo(
    () =>
      mockOrders.filter((o) => businesses.some((b) => b.id === o.businessId)),
    [businesses],
  );
  const orderCounts = aggregateOrderCounts(areaOrders);
  const areaRevenue = aggregateRevenue(areaOrders);
  const avgOrderValue =
    orderCounts.total > 0 ? Math.round(areaRevenue / orderCounts.total) : 0;

  const overviewKpis = [
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
    {
      id: "businesses",
      label: t("total_businesses"),
      value: formatCount(businesses.length),
      icon: Building2,
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
      label: t("total_business_revenue"),
      value: formatCurrency(areaRevenue),
      icon: DollarSign,
    },
    {
      id: "orders",
      label: t("total_orders"),
      value: formatCount(orderCounts.total),
      icon: ShoppingCart,
    },
  ];

  const activeBusinesses = businesses.filter(
    (b) => b.status === "active",
  ).length;
  const inactiveBusinesses = businesses.filter(
    (b) => b.status === "inactive",
  ).length;
  const pendingBusinesses = businesses.filter(
    (b) => b.status === "pending",
  ).length;
  const attentionBusinesses = businesses.filter(
    (b) => b.performanceScore > 0 && b.performanceScore < 70,
  ).length;

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

  const eventPoiColumns: DashboardDataTableColumn<{
    id: string;
    name: string;
    type: string;
    location: string;
    status: string;
    date?: string;
    registrations?: number;
    capacity?: number;
  }>[] = [
    {
      key: "name",
      header: t("name"),
      render: (r) => r.name,
      className: textPrimary,
    },
    {
      key: "type",
      header: t("type"),
      render: (r) => r.type,
      className: textPrimary,
    },
    {
      key: "location",
      header: t("location"),
      render: (r) => r.location,
      className: textPrimary,
    },
    {
      key: "date",
      header: t("date"),
      render: (r) => r.date ?? "—",
      className: textPrimary,
    },
    {
      key: "status",
      header: t("status"),
      render: (r) => (
        <Badge variant={r.status === "approved" ? "default" : "secondary"}>
          {t(`status_${r.status}`)}
        </Badge>
      ),
      className: textPrimary,
    },
    {
      key: "capacity",
      header: t("capacity"),
      render: (r) =>
        r.capacity !== undefined && r.registrations !== undefined
          ? t("registrations_of_capacity", {
              registrations: r.registrations,
              capacity: r.capacity,
            })
          : "—",
      className: textPrimary,
    },
  ];

  const eventPoiRows = [
    ...events.map((e) => ({
      id: e.id,
      name: e.name,
      type: t(`event_type_${e.type}`),
      location: e.location,
      status: e.status,
      date: e.date,
      registrations: e.registrations,
      capacity: e.capacity,
    })),
    ...pois.map((p) => ({
      id: p.id,
      name: p.name,
      type: t(`poi_type_${p.type}`) || p.type,
      location: p.location,
      status: p.status,
    })),
  ];

  const upcomingEvents = events.filter(isUpcoming).slice(0, 4);

  const sectionContent: Record<string, React.ReactNode> = {
    "area-overview": (
      <section>
        <DashboardSectionHeader title={t("section_area_overview")} />
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

    "revenue-snapshot": (
      <section>
        <DashboardSectionHeader title={t("section_revenue_snapshot")} />
        <DashboardKpiGrid>
          <DashboardKpiCard
            label={t("total_business_revenue")}
            value={formatCurrency(areaRevenue)}
            icon={DollarSign}
          />
          <DashboardKpiCard
            label={t("order_volume")}
            value={formatCount(orderCounts.total)}
            icon={ShoppingCart}
          />
          <DashboardKpiCard
            label={t("average_order_value")}
            value={formatCurrency(avgOrderValue)}
            icon={TrendingUp}
          />
          <DashboardKpiCard
            label={t("vendor_payouts")}
            value={formatCurrency(Math.round(areaRevenue * 0.85))}
            icon={DollarSign}
          />
        </DashboardKpiGrid>
      </section>
    ),

    "business-health": (
      <section>
        <DashboardSectionHeader title={t("section_business_health")} />
        <DashboardKpiGrid>
          <DashboardKpiCard
            label={t("active_businesses")}
            value={formatCount(activeBusinesses)}
            icon={CheckSquare}
          />
          <DashboardKpiCard
            label={t("inactive_businesses")}
            value={formatCount(inactiveBusinesses)}
            icon={CheckSquare}
          />
          <DashboardKpiCard
            label={t("pending_approvals")}
            value={formatCount(pendingBusinesses)}
            icon={CheckSquare}
          />
          <DashboardKpiCard
            label={t("needs_attention")}
            value={formatCount(attentionBusinesses)}
            icon={CheckSquare}
          />
        </DashboardKpiGrid>

        {alerts.length === 0 ? (
          <p
            className={`text-sm mt-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {t("no_performance_alerts")}
          </p>
        ) : (
          <div className="grid lg:grid-cols-2 gap-3 mt-3">
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

    "campaign-performance": (
      <section>
        <DashboardSectionHeader title={t("section_campaign_performance")} />
        <DashboardKpiGrid>
          <DashboardKpiCard
            label={t("minisite_visits")}
            value={formatCount(1_240)}
            icon={Globe}
          />
          <DashboardKpiCard
            label={t("minisite_conversion_rate")}
            value="5.2%"
            icon={TrendingUp}
          />
          <DashboardKpiCard
            label={t("voucher_redemption_rate")}
            value="71%"
            icon={CheckSquare}
          />
          <DashboardKpiCard
            label={t("campaign_trend")}
            value={t("trend_stable")}
            icon={TrendingUp}
          />
        </DashboardKpiGrid>
      </section>
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

    "events-pois": (
      <section>
        <DashboardSectionHeader title={t("section_events_pois")} />
        <div
          className={`dm-glass dm-tilt-static rounded-3xl p-4 ${isDark ? "dm-glass--dark" : ""}`}
        >
          <DashboardDataTable
            rowKey={(r) => r.id}
            emptyMessage={t("no_data_available")}
            columns={eventPoiColumns}
            rows={eventPoiRows}
          />
        </div>
      </section>
    ),

    "purchase-trend-charts": (
      <div className="grid lg:grid-cols-2 gap-4">
        <DashboardChartCard
          title={t("chart_purchase_trends")}
          subtitle={t("chart_purchase_trends_desc")}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series.history}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Area
                type="monotone"
                dataKey="revenue"
                name={t("revenue")}
                stroke="#10b981"
                fill="#10b98133"
              />
            </AreaChart>
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

    "actionable-items": (
      <section>
        <DashboardSectionHeader title={t("section_actionable_items")} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ActionableGroup
            title={t("pending_approvals")}
            emptyLabel={t("no_pending_approvals")}
            items={approvals
              .filter((a) => a.status === "pending")
              .map((a) => a.businessName)}
          />
          <ActionableGroup
            title={t("inactive_listings")}
            emptyLabel={t("no_inactive_listings")}
            items={businesses
              .filter((b) => b.status === "inactive")
              .map((b) => b.name)}
          />
          <ActionableGroup
            title={t("upcoming_events")}
            emptyLabel={t("no_upcoming_events")}
            items={upcomingEvents.map((e) => `${e.name} (${e.date})`)}
            icon={Calendar}
          />
        </div>
      </section>
    ),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <DashboardHeader
          title={t("authority_dashboard_title")}
          subtitle={t("authority_dashboard_subtitle")}
          scopeLabel={t("scope_authority", { name: authority?.name ?? "" })}
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
          onMove={moveSection}
          onMoveUp={() => moveSection(index, index - 1)}
          onMoveDown={() => moveSection(index, index + 1)}
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

function ActionableGroup({
  title,
  emptyLabel,
  items,
  icon: Icon = CheckSquare,
}: {
  title: string;
  emptyLabel: string;
  items: string[];
  icon?: typeof Building2;
}) {
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
          {emptyLabel}
        </p>
      ) : (
        <ul className="space-y-1.5">
          {items.slice(0, 5).map((item, index) => (
            <li
              key={index}
              className={`text-xs truncate ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              • {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
