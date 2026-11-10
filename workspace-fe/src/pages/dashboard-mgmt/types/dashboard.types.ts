export type DashboardRole = "superadmin" | "dmo" | "authority" | "traveller";

export type TimePeriod = "daily" | "weekly" | "monthly" | "yearly" | "all";

export type TrendDirection = "up" | "down" | "flat";

/** Whether an increase in the metric is good (default) or bad (e.g. error counts). */
export type TrendPolarity = "positive" | "negative";

export interface Trend {
  direction: TrendDirection;
  changePercent: number | null;
  comparisonLabel: string;
  polarity?: TrendPolarity;
}

export interface Kpi {
  id: string;
  label: string;
  value: string;
  rawValue: number;
  trend?: Trend;
  icon?: string;
  clickThrough?: KpiClickThrough;
}

export type KpiClickThrough =
  | { type: "businesses" }
  | { type: "orders" }
  | { type: "revenue" }
  | { type: "approvals" }
  | { type: "payouts" }
  | { type: "authorities" }
  | { type: "vendors" }
  | { type: "dmos" };

export type HealthStatus = "healthy" | "warning" | "critical";

export type EntityStatus =
  | "active"
  | "inactive"
  | "approved"
  | "pending"
  | "rejected"
  | "archived"
  | "closed"
  | "draft";

export type OrderStatus = "pending" | "processing" | "completed" | "canceled";

export type FulfillmentMethod = "pick_up" | "deliver";

export interface Dmo {
  id: string;
  name: string;
  region: string;
}

export interface Authority {
  id: string;
  dmoId: string;
  name: string;
  region: string;
}

export interface Vendor {
  id: string;
  name: string;
  avatarInitial: string;
}

export interface Business {
  id: string;
  name: string;
  vendorId: string;
  authorityId: string;
  dmoId: string;
  category: string;
  status: EntityStatus;
  createdAt: string;
  performanceScore: number;
  previousPerformanceScore: number;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  status: EntityStatus;
  unitsSold: number;
  revenue: number;
  previousRevenue: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  businessId: string;
  date: string;
  itemSummary: string;
  amount: number;
  status: OrderStatus;
  fulfillmentMethod: FulfillmentMethod;
}

export interface TimeSeriesPoint {
  date: string;
  users: number;
  sessions: number;
  pageViews: number;
  conversions: number;
  revenue: number;
  platformFees: number;
  vendorPayouts: number;
  orders: number;
  voucherSales: number;
  voucherRedemptions: number;
  businessGrowth: number;
  authorityGrowth: number;
}

export interface EventItem {
  id: string;
  name: string;
  type: "event" | "session";
  organizer: string;
  businessId?: string;
  authorityId?: string;
  dmoId?: string;
  date: string;
  location: string;
  status: EntityStatus;
  registrations: number;
  capacity: number;
}

export interface Poi {
  id: string;
  name: string;
  type: string;
  authorityId: string;
  location: string;
  status: EntityStatus;
}

export interface PendingApproval {
  id: string;
  businessName: string;
  businessId: string;
  authorityId: string;
  dmoId: string;
  category: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface PerformanceAlert {
  id: string;
  businessId: string;
  businessName: string;
  currentScore: number;
  previousScore: number;
  factors: string[];
  suggestedAction: string;
}

export interface MiniSiteStatus {
  id: string;
  businessId: string;
  businessName: string;
  state: "live" | "draft";
  health: HealthStatus;
  lastIncident: string | null;
  lastIncidentAt: string | null;
}

export interface PaymentRecord {
  id: string;
  reference: string;
  businessId: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  disputeStatus: "none" | "open" | "resolved";
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  date: string;
  category: "fees" | "policy" | "vendor";
}

export interface ProfileCompletion {
  businessId: string;
  percent: number;
  missingItems: string[];
}

export interface SystemIncident {
  id: string;
  type: "email_failure" | "website_crash" | "operational";
  description: string;
  occurredAt: string;
  severity: HealthStatus;
}

export interface RankedEntity {
  id: string;
  name: string;
  region?: string;
  businessCount?: number;
  revenue: number;
  growthPercent: number | null;
  performance: HealthStatus;
}
