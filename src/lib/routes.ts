export const routes = {
  dashboard: "/",
  analyticsDashboard: "/analytics-dashboard",
  home: "/home",

  businessMgmt: "/businesses-management",
  businessDetails: "/business-details",
  pendingApprovals: "/pending-approvals",

  articleMgmt: "/articles-management",
  articleDetails: "/article-details",
  eventsMgmt: "/events-management",
  eventDetails: "/event-details",
  eventSessionMgmt: "/event-session-management",

  productsMgmt: "/products-management",
  productDetails: "/product-details",

  ordersMgmt: "/orders-management",
  orderDetails: "/order-details",
  ordersSummaryMgmt: "/orders-summary-management",

  contentMgmt: "/content-management",
  voucherMgmt: "/voucher-management",
  voucherDetails: "/voucher-details",
  vendorReconciliationMgmt: "/vendor-reconciliation",
  pointOfInterest: "/point-of-interest",
  poiMgmt: "/poi-management",
  poiDetails: "/poi-details",
  trips: "/trips",
  notificationMgmt: "/notifications-management",

  funDays: "/fun-days",
  vouchers: "/vouchers",
  offlineVouchers: "/offline-vouchers",
  miniCampaign: "/mini-campaign",
  auth: "/authentication",
  miniSite: "/mini-site",

  profile: "/profile",
  partners: "/partners",
  campaignMgmt: "/campaign-mgmt",
  dmoMgmt: "/dmo-management",
  authorityMgmt: "/authority-management",
  websiteMgmt: "/website-management",
  websiteConfig: "/website-config",

  dynamicPages: "/dynamic-pages",
  promotionMgmt: "/promotions-management",

  users: "/users",

  publicTicket: "/verify-ticket",
  publicSession: "/verify-session",
  websiteCrashes: "/website-crashes",
  websiteCrashDetails: "/website-crash-details",
};

export type RouteKey = keyof typeof routes;
export type RoutePath = (typeof routes)[RouteKey];
