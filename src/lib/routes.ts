export const routes = {
  dashboard: "/",
  analyticsDashboard: "/analytics-dashboard",
  home: "/home",

  businessMgmt: "/businesses-management",
  businessDetails: "/business-details",

  articleMgmt: "/articles-management",
  articleDetails: "/article-details",
  eventsMgmt: "/events-management",
  eventDetails: "/event-details",
  documentMgmt: "/documents-management",
  productsMgmt: "/products-management",
  productDetails: "/product-details",

  ordersMgmt: "/orders-management",
  orderDetails: "/order-details",

  contentMgmt: "/content-management",
  voucherMgmt: "/voucher-management",
  voucherDetails: "/voucher-details",

  pointOfInterest: "/point-of-interest",
  trips: "/trips",
  notificationMgmt: "/notifications-management",

  funDays: "/fun-days",
  vouchers: "/vouchers",
  offlineVouchers: "/offline-vouchers",
  miniCampaign: "/mini-campaign",
  auth: "/authentication",
  miniSite: "/mini-site",
  profile: "/profile",
  websiteMgmt: "/website-settings",
  dynamicPages: "/dynamic-pages",
};

export type RouteKey = keyof typeof routes;
export type RoutePath = (typeof routes)[RouteKey];
