export const routes = {
  dashboard: "/",
  analyticsDashboard: "/analytics-dashboard",
  chat: "/chat",
  home: "/home",

  businessMgmt: "/businesses-management",
  businessDetails: "/business-details",
  pendingApprovals: "/pending-approvals",

  articleMgmt: "/articles-management",
  articleDetails: "/article-details",
  eventsMgmt: "/events-management",
  eventDetails: "/event-details",
  documentMgmt: "/documents-management",
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
  paymentTransactions: "/payment-transactions",
  pointOfInterest: "/point-of-interest",
  poiMgmt: "/poi-management",
  poiDetails: "/poi-details",
  tripsMgmt: "/trips-management",
  tripDetails: "/trip-details",
  notificationMgmt: "/notifications-management",

  funDays: "/fun-days",
  vouchers: "/vouchers",
  offlineVouchers: "/offline-vouchers",
  miniCampaignMgmt: "/mini-campaign-management",
  auth: "/authentication",
  miniSiteMgmt: "/mini-site-management",
  miniSiteDetails: "/mini-site-details",
  noInternet: "/no-internet",
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
  utmBuilder: "/campaign-url-builder",

  users: "/users",

  publicTicket: "/verify-ticket",
  publicSession: "/verify-session",
  websiteCrashes: "/website-crashes",
  websiteCrashDetails: "/website-crash-details",
  statsSummary: "/stats-summary",
};

export type RouteKey = keyof typeof routes;
export type RoutePath = (typeof routes)[RouteKey];
