import type {
  Business,
  EventItem,
  HealthStatus,
  Order,
  RankedEntity,
  TimePeriod,
  TimeSeriesPoint,
  Trend,
} from "../types/dashboard.types";
import { DEMO_TODAY, mockMonthlyTimeSeries } from "./mockDashboardData";

/** Period comparison label, matching agent.md section 9 ("compare Daily vs previous day" etc). */
export const PERIOD_COMPARISON_LABEL: Record<TimePeriod, string> = {
  daily: "vs_previous_day",
  weekly: "vs_previous_week",
  monthly: "vs_previous_month",
  yearly: "vs_previous_year",
  all: "all_time",
};

/** How many of the 6 monthly points are included for a given period (most-recent-first window). */
const PERIOD_WINDOW_SIZE: Record<TimePeriod, number> = {
  daily: 1,
  weekly: 1,
  monthly: 1,
  yearly: 6,
  all: 6,
};

/** Scales a monthly aggregate down to approximate a shorter period, deterministically. */
const PERIOD_SCALE: Record<TimePeriod, number> = {
  daily: 1 / 30,
  weekly: 7 / 30,
  monthly: 1,
  yearly: 1,
  all: 1,
};

export interface ScopedSeries {
  current: TimeSeriesPoint;
  previous: TimeSeriesPoint | null;
  history: TimeSeriesPoint[];
}

/** Filters/derives the time series for the selected period, scaled consistently. */
export function filterByPeriod(period: TimePeriod): ScopedSeries {
  const months = mockMonthlyTimeSeries;
  const windowSize = PERIOD_WINDOW_SIZE[period];
  const scale = PERIOD_SCALE[period];

  const scalePoint = (point: TimeSeriesPoint): TimeSeriesPoint => ({
    ...point,
    users: Math.round(point.users * scale),
    sessions: Math.round(point.sessions * scale),
    pageViews: Math.round(point.pageViews * scale),
    conversions: Math.round(point.conversions * scale),
    revenue: Math.round(point.revenue * scale),
    platformFees: Math.round(point.platformFees * scale),
    vendorPayouts: Math.round(point.vendorPayouts * scale),
    orders: Math.round(point.orders * scale),
    voucherSales: Math.round(point.voucherSales * scale),
    voucherRedemptions: Math.round(point.voucherRedemptions * scale),
  });

  if (period === "all" || period === "yearly") {
    const history = months.map(scalePoint);
    return {
      current: history[history.length - 1],
      previous:
        period === "yearly" ? (history[history.length - 2] ?? null) : null,
      history,
    };
  }

  const latest = months[months.length - 1];
  const previousMonth = months[months.length - 2];
  const history = Array.from({ length: windowSize }).map(() =>
    scalePoint(latest),
  );

  return {
    current: scalePoint(latest),
    previous: previousMonth ? scalePoint(previousMonth) : null,
    history,
  };
}

/** Percent change from previous to current; null when a comparison isn't meaningful. */
export function calcPercentChange(
  current: number,
  previous: number | null | undefined,
): number | null {
  if (previous === null || previous === undefined || previous === 0)
    return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function buildTrend(
  current: number,
  previous: number | null | undefined,
  comparisonLabel: string,
  polarity: "positive" | "negative" = "positive",
): Trend {
  const changePercent = calcPercentChange(current, previous);
  if (changePercent === null) {
    return {
      direction: "flat",
      changePercent: null,
      comparisonLabel,
      polarity,
    };
  }
  const direction =
    changePercent > 0 ? "up" : changePercent < 0 ? "down" : "flat";
  return { direction, changePercent, comparisonLabel, polarity };
}

/** Groups a list of dated records by their calendar-day date string. */
export function groupByDate<T extends { date: string }>(
  records: T[],
): Record<string, T[]> {
  return records.reduce<Record<string, T[]>>((acc, record) => {
    (acc[record.date] ??= []).push(record);
    return acc;
  }, {});
}

export function aggregateRevenue(orders: Order[]): number {
  return orders.reduce((sum, order) => sum + order.amount, 0);
}

export function aggregateOrderCounts(orders: Order[]) {
  return {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    completed: orders.filter((o) => o.status === "completed").length,
    canceled: orders.filter((o) => o.status === "canceled").length,
  };
}

export function sortRanked<T>(
  items: T[],
  key: (item: T) => number,
  direction: "asc" | "desc" = "desc",
): T[] {
  const sorted = [...items].sort((a, b) => key(a) - key(b));
  return direction === "desc" ? sorted.reverse() : sorted;
}

export function calcCapacity(registrations: number, capacity: number) {
  const remaining = Math.max(capacity - registrations, 0);
  const percentFull =
    capacity > 0 ? Math.round((registrations / capacity) * 100) : 0;
  return { remaining, percentFull, isFull: remaining === 0 };
}

export function deriveBusinessPerformance(business: Business): {
  scoreChange: number;
  direction: "up" | "down" | "flat";
  isDeclining: boolean;
} {
  const scoreChange =
    business.performanceScore - business.previousPerformanceScore;
  return {
    scoreChange,
    direction: scoreChange > 0 ? "up" : scoreChange < 0 ? "down" : "flat",
    isDeclining: scoreChange < -5,
  };
}

export function calcProfileCompletion(
  percent: number,
  missingItems: string[],
): { percent: number; isComplete: boolean; missingItems: string[] } {
  const clamped = Math.max(0, Math.min(100, percent));
  return { percent: clamped, isComplete: clamped >= 100, missingItems };
}

export function filterBusinessesByDmo<T extends { dmoId: string }>(
  items: T[],
  dmoId: string,
): T[] {
  return items.filter((item) => item.dmoId === dmoId);
}

export function filterBusinessesByAuthority<T extends { authorityId: string }>(
  items: T[],
  authorityId: string,
): T[] {
  return items.filter((item) => item.authorityId === authorityId);
}

export function filterByBusiness<T extends { businessId: string }>(
  items: T[],
  businessId: string,
): T[] {
  return items.filter((item) => item.businessId === businessId);
}

export function toRankedEntity(args: {
  id: string;
  name: string;
  region?: string;
  businessCount?: number;
  revenue: number;
  previousRevenue?: number;
}): RankedEntity {
  const growthPercent = calcPercentChange(args.revenue, args.previousRevenue);
  const performance: HealthStatus =
    growthPercent === null
      ? "healthy"
      : growthPercent >= 0
        ? "healthy"
        : growthPercent >= -10
          ? "warning"
          : "critical";

  return {
    id: args.id,
    name: args.name,
    region: args.region,
    businessCount: args.businessCount,
    revenue: args.revenue,
    growthPercent,
    performance,
  };
}

export function isUpcoming(event: EventItem): boolean {
  return event.date >= DEMO_TODAY;
}

export function formatCurrency(value: number): string {
  return `₪${Math.round(value).toLocaleString()}`;
}

export function formatCount(value: number): string {
  return value.toLocaleString();
}

export function formatPercent(value: number | null): string {
  if (value === null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}%`;
}
