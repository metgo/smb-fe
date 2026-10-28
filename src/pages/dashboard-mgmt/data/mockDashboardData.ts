import type {
  Announcement,
  Authority,
  Business,
  Dmo,
  EventItem,
  MiniSiteStatus,
  Order,
  PaymentRecord,
  PendingApproval,
  PerformanceAlert,
  Poi,
  Product,
  ProfileCompletion,
  SystemIncident,
  TimeSeriesPoint,
  Vendor,
} from "../types/dashboard.types";

/**
 * Centralized, deterministic mock dataset for the role-based dashboard demo.
 * All values are fixed (no Math.random / Date.now at module scope) so the
 * dashboard renders identically on every load and totals stay internally
 * consistent (regional sums, revenue = fees + payouts, etc).
 */

export const DEMO_TODAY = "2026-10-28";

export const mockDmos: Dmo[] = [
  { id: "dmo-1", name: "Galilee Tourism Board", region: "Galilee" },
  { id: "dmo-2", name: "Negev Desert Authority", region: "Negev" },
  { id: "dmo-3", name: "Coastal Plain DMO", region: "Coastal Plain" },
];

export const mockAuthorities: Authority[] = [
  {
    id: "auth-1",
    dmoId: "dmo-1",
    name: "Tiberias Authority",
    region: "Tiberias",
  },
  { id: "auth-2", dmoId: "dmo-1", name: "Safed Authority", region: "Safed" },
  { id: "auth-3", dmoId: "dmo-2", name: "Eilat Authority", region: "Eilat" },
  {
    id: "auth-4",
    dmoId: "dmo-2",
    name: "Mitzpe Ramon Authority",
    region: "Mitzpe Ramon",
  },
  {
    id: "auth-5",
    dmoId: "dmo-3",
    name: "Netanya Authority",
    region: "Netanya",
  },
];

export const mockVendors: Vendor[] = [
  { id: "vendor-1", name: "Dana Cohen", avatarInitial: "D" },
  { id: "vendor-2", name: "Omar Haddad", avatarInitial: "O" },
  { id: "vendor-3", name: "Lior Ben-David", avatarInitial: "L" },
  { id: "vendor-4", name: "Maya Peretz", avatarInitial: "M" },
  { id: "vendor-5", name: "Yosef Azoulay", avatarInitial: "Y" },
  { id: "vendor-6", name: "Noa Shapira", avatarInitial: "N" },
  { id: "vendor-7", name: "Khaled Mansour", avatarInitial: "K" },
];

// The current demo "logged-in" vendor (vendor-1) owns two businesses to
// demonstrate the business switcher.
export const CURRENT_VENDOR_ID = "vendor-1";

export const mockBusinesses: Business[] = [
  {
    id: "biz-1",
    name: "Sea of Galilee Boat Tours",
    vendorId: "vendor-1",
    authorityId: "auth-1",
    dmoId: "dmo-1",
    category: "attraction",
    status: "active",
    createdAt: "2025-02-11",
    performanceScore: 68,
    previousPerformanceScore: 82,
  },
  {
    id: "biz-2",
    name: "Dana's Lakeside Café",
    vendorId: "vendor-1",
    authorityId: "auth-1",
    dmoId: "dmo-1",
    category: "eat",
    status: "active",
    createdAt: "2025-05-20",
    performanceScore: 88,
    previousPerformanceScore: 84,
  },
  {
    id: "biz-3",
    name: "Old City Safed Gallery",
    vendorId: "vendor-2",
    authorityId: "auth-2",
    dmoId: "dmo-1",
    category: "culture",
    status: "active",
    createdAt: "2024-11-02",
    performanceScore: 91,
    previousPerformanceScore: 89,
  },
  {
    id: "biz-4",
    name: "Kinneret Camping Grounds",
    vendorId: "vendor-3",
    authorityId: "auth-1",
    dmoId: "dmo-1",
    category: "travel",
    status: "pending",
    createdAt: "2026-10-15",
    performanceScore: 0,
    previousPerformanceScore: 0,
  },
  {
    id: "biz-5",
    name: "Red Sea Diving Center",
    vendorId: "vendor-4",
    authorityId: "auth-3",
    dmoId: "dmo-2",
    category: "attraction",
    status: "active",
    createdAt: "2024-07-18",
    performanceScore: 94,
    previousPerformanceScore: 92,
  },
  {
    id: "biz-6",
    name: "Eilat Boutique Hostel",
    vendorId: "vendor-5",
    authorityId: "auth-3",
    dmoId: "dmo-2",
    category: "sleep",
    status: "active",
    createdAt: "2024-09-30",
    performanceScore: 76,
    previousPerformanceScore: 79,
  },
  {
    id: "biz-7",
    name: "Crater Rim Desert Tours",
    vendorId: "vendor-6",
    authorityId: "auth-4",
    dmoId: "dmo-2",
    category: "attraction",
    status: "active",
    createdAt: "2025-01-09",
    performanceScore: 85,
    previousPerformanceScore: 85,
  },
  {
    id: "biz-8",
    name: "Mitzpe Ramon Souvenir Shop",
    vendorId: "vendor-6",
    authorityId: "auth-4",
    dmoId: "dmo-2",
    category: "local",
    status: "inactive",
    createdAt: "2024-03-12",
    performanceScore: 52,
    previousPerformanceScore: 61,
  },
  {
    id: "biz-9",
    name: "Netanya Beachfront Grill",
    vendorId: "vendor-7",
    authorityId: "auth-5",
    dmoId: "dmo-3",
    category: "eat",
    status: "active",
    createdAt: "2024-12-05",
    performanceScore: 80,
    previousPerformanceScore: 77,
  },
  {
    id: "biz-10",
    name: "Netanya Cliffside Hotel",
    vendorId: "vendor-7",
    authorityId: "auth-5",
    dmoId: "dmo-3",
    category: "sleep",
    status: "pending",
    createdAt: "2026-10-20",
    performanceScore: 0,
    previousPerformanceScore: 0,
  },
];

export const mockProducts: Product[] = [
  {
    id: "prod-1",
    businessId: "biz-1",
    name: "Sunset Boat Cruise",
    status: "approved",
    unitsSold: 420,
    revenue: 58_800,
    previousRevenue: 71_400,
  },
  {
    id: "prod-2",
    businessId: "biz-1",
    name: "Private Fishing Charter",
    status: "approved",
    unitsSold: 95,
    revenue: 33_250,
    previousRevenue: 35_000,
  },
  {
    id: "prod-3",
    businessId: "biz-2",
    name: "Lakeside Breakfast Set",
    status: "approved",
    unitsSold: 860,
    revenue: 25_800,
    previousRevenue: 22_100,
  },
  {
    id: "prod-4",
    businessId: "biz-3",
    name: "Guided Gallery Walk",
    status: "approved",
    unitsSold: 310,
    revenue: 18_600,
    previousRevenue: 16_750,
  },
  {
    id: "prod-5",
    businessId: "biz-5",
    name: "Open Water Dive Package",
    status: "approved",
    unitsSold: 540,
    revenue: 162_000,
    previousRevenue: 148_500,
  },
  {
    id: "prod-6",
    businessId: "biz-6",
    name: "Standard Dorm Bed (Night)",
    status: "approved",
    unitsSold: 1_240,
    revenue: 99_200,
    previousRevenue: 94_000,
  },
  {
    id: "prod-7",
    businessId: "biz-7",
    name: "Full-Day Crater Jeep Tour",
    status: "pending",
    unitsSold: 0,
    revenue: 0,
    previousRevenue: 0,
  },
  {
    id: "prod-8",
    businessId: "biz-9",
    name: "Beachfront Dinner Platter",
    status: "approved",
    unitsSold: 670,
    revenue: 46_900,
    previousRevenue: 43_200,
  },
];

const buildOrders = (): Order[] => {
  const statusCycle: Order["status"][] = [
    "completed",
    "completed",
    "processing",
    "pending",
    "canceled",
  ];
  const fulfillmentCycle: Order["fulfillmentMethod"][] = ["pick_up", "deliver"];
  const businessByOrder = [
    "biz-1",
    "biz-2",
    "biz-1",
    "biz-5",
    "biz-6",
    "biz-9",
    "biz-3",
    "biz-7",
    "biz-1",
    "biz-2",
    "biz-5",
    "biz-6",
    "biz-9",
    "biz-1",
    "biz-2",
    "biz-5",
    "biz-6",
    "biz-9",
    "biz-1",
    "biz-2",
  ];
  const itemSummaries = [
    "Sunset Boat Cruise x2",
    "Lakeside Breakfast Set x4",
    "Private Fishing Charter",
    "Open Water Dive Package x1",
    "Standard Dorm Bed x3 nights",
    "Beachfront Dinner Platter x2",
    "Guided Gallery Walk x5",
    "Full-Day Crater Jeep Tour",
  ];

  return businessByOrder.map((businessId, index) => {
    const day = 2 + index; // 2026-10-02 .. 2026-10-21
    const status = statusCycle[index % statusCycle.length];
    const baseAmount = 180 + index * 37;
    return {
      id: `order-${index + 1}`,
      orderNumber: `ORD-2026-${(1000 + index).toString()}`,
      businessId,
      date: `2026-10-${String(day).padStart(2, "0")}`,
      itemSummary: itemSummaries[index % itemSummaries.length],
      amount: baseAmount,
      status,
      fulfillmentMethod: fulfillmentCycle[index % fulfillmentCycle.length],
    };
  });
};

export const mockOrders: Order[] = buildOrders();

const MONTHS = [
  "2026-05",
  "2026-06",
  "2026-07",
  "2026-08",
  "2026-09",
  "2026-10",
];

// 6 months of coherent daily-ish aggregated history (one point per month,
// used as the backbone; daily/weekly views derive scaled sub-points from it).
export const mockMonthlyTimeSeries: TimeSeriesPoint[] = [
  {
    date: "2026-05",
    users: 18_200,
    sessions: 24_600,
    pageViews: 61_500,
    conversions: 980,
    revenue: 410_000,
    platformFees: 61_500,
    vendorPayouts: 348_500,
    orders: 640,
    voucherSales: 310,
    voucherRedemptions: 240,
    businessGrowth: 6,
    authorityGrowth: 1,
  },
  {
    date: "2026-06",
    users: 19_850,
    sessions: 26_900,
    pageViews: 66_200,
    conversions: 1_040,
    revenue: 438_000,
    platformFees: 65_700,
    vendorPayouts: 372_300,
    orders: 690,
    voucherSales: 335,
    voucherRedemptions: 268,
    businessGrowth: 7,
    authorityGrowth: 0,
  },
  {
    date: "2026-07",
    users: 24_300,
    sessions: 33_100,
    pageViews: 79_800,
    conversions: 1_310,
    revenue: 512_000,
    platformFees: 76_800,
    vendorPayouts: 435_200,
    orders: 810,
    voucherSales: 402,
    voucherRedemptions: 319,
    businessGrowth: 9,
    authorityGrowth: 1,
  },
  {
    date: "2026-08",
    users: 26_750,
    sessions: 35_400,
    pageViews: 85_100,
    conversions: 1_420,
    revenue: 548_000,
    platformFees: 82_200,
    vendorPayouts: 465_800,
    orders: 870,
    voucherSales: 428,
    voucherRedemptions: 351,
    businessGrowth: 5,
    authorityGrowth: 0,
  },
  {
    date: "2026-09",
    users: 21_400,
    sessions: 28_700,
    pageViews: 70_300,
    conversions: 1_150,
    revenue: 465_000,
    platformFees: 69_750,
    vendorPayouts: 395_250,
    orders: 735,
    voucherSales: 360,
    voucherRedemptions: 289,
    businessGrowth: 4,
    authorityGrowth: 1,
  },
  {
    date: "2026-10",
    users: 19_100,
    sessions: 25_800,
    pageViews: 63_900,
    conversions: 1_020,
    revenue: 421_000,
    platformFees: 63_150,
    vendorPayouts: 357_850,
    orders: 665,
    voucherSales: 322,
    voucherRedemptions: 251,
    businessGrowth: 3,
    authorityGrowth: 0,
  },
];

export const getMonths = () => MONTHS;

export const mockEvents: EventItem[] = [
  {
    id: "evt-1",
    name: "Galilee Harvest Festival",
    type: "event",
    organizer: "Galilee Tourism Board",
    authorityId: "auth-1",
    dmoId: "dmo-1",
    date: "2026-11-05",
    location: "Tiberias Promenade",
    status: "approved",
    registrations: 420,
    capacity: 500,
  },
  {
    id: "evt-2",
    name: "Safed Art & Mysticism Walk",
    type: "event",
    organizer: "Safed Authority",
    authorityId: "auth-2",
    dmoId: "dmo-1",
    date: "2026-11-12",
    location: "Old City Safed",
    status: "approved",
    registrations: 180,
    capacity: 200,
  },
  {
    id: "evt-3",
    name: "Red Sea Night Dive",
    type: "session",
    organizer: "Red Sea Diving Center",
    businessId: "biz-5",
    authorityId: "auth-3",
    dmoId: "dmo-2",
    date: "2026-11-02",
    location: "Eilat Marina",
    status: "approved",
    registrations: 24,
    capacity: 30,
  },
  {
    id: "evt-4",
    name: "Desert Stargazing Night",
    type: "session",
    organizer: "Crater Rim Desert Tours",
    businessId: "biz-7",
    authorityId: "auth-4",
    dmoId: "dmo-2",
    date: "2026-11-08",
    location: "Mitzpe Ramon Crater Rim",
    status: "approved",
    registrations: 55,
    capacity: 60,
  },
  {
    id: "evt-5",
    name: "Netanya Seafood Market Day",
    type: "event",
    organizer: "Netanya Authority",
    authorityId: "auth-5",
    dmoId: "dmo-3",
    date: "2026-11-15",
    location: "Netanya Promenade",
    status: "approved",
    registrations: 310,
    capacity: 600,
  },
  {
    id: "evt-6",
    name: "Sunset Boat Cruise Group Booking",
    type: "session",
    organizer: "Sea of Galilee Boat Tours",
    businessId: "biz-1",
    authorityId: "auth-1",
    dmoId: "dmo-1",
    date: "2026-11-01",
    location: "Tiberias Marina",
    status: "approved",
    registrations: 48,
    capacity: 48,
  },
];

export const mockPois: Poi[] = [
  {
    id: "poi-1",
    name: "Mount Arbel Lookout",
    type: "attraction",
    authorityId: "auth-1",
    location: "Tiberias",
    status: "approved",
  },
  {
    id: "poi-2",
    name: "Safed Artists' Quarter",
    type: "culture",
    authorityId: "auth-2",
    location: "Safed",
    status: "approved",
  },
  {
    id: "poi-3",
    name: "Coral Beach Nature Reserve",
    type: "attraction",
    authorityId: "auth-3",
    location: "Eilat",
    status: "approved",
  },
  {
    id: "poi-4",
    name: "Ramon Crater Visitor Center",
    type: "attraction",
    authorityId: "auth-4",
    location: "Mitzpe Ramon",
    status: "approved",
  },
  {
    id: "poi-5",
    name: "Netanya Cliff Park",
    type: "attraction",
    authorityId: "auth-5",
    location: "Netanya",
    status: "pending",
  },
];

export const mockPendingApprovals: PendingApproval[] = [
  {
    id: "appr-1",
    businessName: "Kinneret Camping Grounds",
    businessId: "biz-4",
    authorityId: "auth-1",
    dmoId: "dmo-1",
    category: "travel",
    submittedAt: "2026-10-15",
    status: "pending",
  },
  {
    id: "appr-2",
    businessName: "Netanya Cliffside Hotel",
    businessId: "biz-10",
    authorityId: "auth-5",
    dmoId: "dmo-3",
    category: "sleep",
    submittedAt: "2026-10-20",
    status: "pending",
  },
  {
    id: "appr-3",
    businessName: "Ramon Crater Visitor Center",
    businessId: "biz-7",
    authorityId: "auth-4",
    dmoId: "dmo-2",
    category: "attraction",
    submittedAt: "2026-10-22",
    status: "pending",
  },
];

export const mockPerformanceAlerts: PerformanceAlert[] = [
  {
    id: "alert-1",
    businessId: "biz-1",
    businessName: "Sea of Galilee Boat Tours",
    currentScore: 68,
    previousScore: 82,
    factors: ["Listing views down 24%", "Voucher redemptions down 18%"],
    suggestedAction:
      "Refresh listing photos and re-launch a limited-time voucher promotion.",
  },
  {
    id: "alert-2",
    businessId: "biz-8",
    businessName: "Mitzpe Ramon Souvenir Shop",
    currentScore: 52,
    previousScore: 61,
    factors: ["No orders in the last 30 days", "Listing marked inactive"],
    suggestedAction: "Reactivate the listing and review product availability.",
  },
  {
    id: "alert-3",
    businessId: "biz-6",
    businessName: "Eilat Boutique Hostel",
    currentScore: 76,
    previousScore: 79,
    factors: ["Average order value down 6%"],
    suggestedAction: "Review pricing against comparable listings in the area.",
  },
];

export const mockMiniSites: MiniSiteStatus[] = [
  {
    id: "ms-1",
    businessId: "biz-1",
    businessName: "Sea of Galilee Boat Tours",
    state: "live",
    health: "warning",
    lastIncident: "Checkout widget failed to load for 40 minutes",
    lastIncidentAt: "2026-10-19",
  },
  {
    id: "ms-2",
    businessId: "biz-2",
    businessName: "Dana's Lakeside Café",
    state: "live",
    health: "healthy",
    lastIncident: null,
    lastIncidentAt: null,
  },
  {
    id: "ms-3",
    businessId: "biz-5",
    businessName: "Red Sea Diving Center",
    state: "live",
    health: "healthy",
    lastIncident: null,
    lastIncidentAt: null,
  },
  {
    id: "ms-4",
    businessId: "biz-7",
    businessName: "Crater Rim Desert Tours",
    state: "draft",
    health: "healthy",
    lastIncident: null,
    lastIncidentAt: null,
  },
  {
    id: "ms-5",
    businessId: "biz-8",
    businessName: "Mitzpe Ramon Souvenir Shop",
    state: "live",
    health: "critical",
    lastIncident: "Mini-site returned 500 errors for 3 hours",
    lastIncidentAt: "2026-10-24",
  },
];

export const mockSystemIncidents: SystemIncident[] = [
  {
    id: "inc-1",
    type: "website_crash",
    description: "Mitzpe Ramon Souvenir Shop mini-site returned 500 errors",
    occurredAt: "2026-10-24",
    severity: "critical",
  },
  {
    id: "inc-2",
    type: "email_failure",
    description: "Booking confirmation emails delayed for ~2 hours",
    occurredAt: "2026-10-21",
    severity: "warning",
  },
  {
    id: "inc-3",
    type: "operational",
    description: "Scheduled maintenance completed without issues",
    occurredAt: "2026-10-12",
    severity: "healthy",
  },
];

export const mockPaymentRecords: PaymentRecord[] = [
  {
    id: "pay-1",
    reference: "PO-98213",
    businessId: "biz-1",
    date: "2026-10-05",
    amount: 4_820,
    status: "paid",
    disputeStatus: "none",
  },
  {
    id: "pay-2",
    reference: "PO-98244",
    businessId: "biz-1",
    date: "2026-10-12",
    amount: 3_150,
    status: "paid",
    disputeStatus: "none",
  },
  {
    id: "pay-3",
    reference: "PO-98301",
    businessId: "biz-1",
    date: "2026-10-19",
    amount: 2_980,
    status: "pending",
    disputeStatus: "open",
  },
  {
    id: "pay-4",
    reference: "PO-98105",
    businessId: "biz-2",
    date: "2026-10-03",
    amount: 1_640,
    status: "paid",
    disputeStatus: "none",
  },
  {
    id: "pay-5",
    reference: "PO-98190",
    businessId: "biz-2",
    date: "2026-10-17",
    amount: 1_920,
    status: "paid",
    disputeStatus: "none",
  },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: "ann-1",
    title: "Platform fee update for November",
    body: "Starting November 1, the platform fee for new bookings will be 11% (down from 12%).",
    date: "2026-10-20",
    category: "fees",
  },
  {
    id: "ann-2",
    title: "Updated cancellation policy",
    body: "Vendors can now offer flexible cancellation windows of 24, 48, or 72 hours.",
    date: "2026-10-14",
    category: "policy",
  },
  {
    id: "ann-3",
    title: "New vendor payout schedule",
    body: "Payouts now process every Monday and Thursday instead of weekly.",
    date: "2026-10-08",
    category: "vendor",
  },
];

export const mockProfileCompletion: ProfileCompletion[] = [
  {
    businessId: "biz-1",
    percent: 85,
    missingItems: ["Add cancellation policy", "Upload 2 more listing photos"],
  },
  { businessId: "biz-2", percent: 100, missingItems: [] },
  {
    businessId: "biz-3",
    percent: 70,
    missingItems: [
      "Add business hours",
      "Verify contact phone",
      "Add bank details",
    ],
  },
];

// ---- Lookup helpers (pure, no side effects) ----

export const getVendorBusinesses = (vendorId: string): Business[] =>
  mockBusinesses.filter((b) => b.vendorId === vendorId);

export const getBusinessesByAuthority = (authorityId: string): Business[] =>
  mockBusinesses.filter((b) => b.authorityId === authorityId);

export const getBusinessesByDmo = (dmoId: string): Business[] =>
  mockBusinesses.filter((b) => b.dmoId === dmoId);

export const getAuthoritiesByDmo = (dmoId: string): Authority[] =>
  mockAuthorities.filter((a) => a.dmoId === dmoId);

export const getBusinessById = (businessId: string): Business | undefined =>
  mockBusinesses.find((b) => b.id === businessId);

export const getVendorById = (vendorId: string): Vendor | undefined =>
  mockVendors.find((v) => v.id === vendorId);
