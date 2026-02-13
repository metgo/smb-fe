export const routes = {
  dashboard: "/",

  businessMgmt: "/businesses-management",
  businessDetails: "/business-details",

  eventsMgmt: "/events-management",
  eventDetails: "/event-details",

  productsMgmt: "/products-management",
  ordersMgmt: "/orders-management",
  productDetails: "/product-details",
  orderDetails: "/order-details",
  pointOfInterest: "/point-of-interest",
  trips: "/trips",

  funDays: "/fun-days",
  vouchers: "/vouchers",
  offlineVouchers: "/offline-vouchers",
  miniCampaignMgmt: "/mini-campaign-management",
  auth: "/authentication",
  miniSiteMgmt: "/mini-site-management",
  miniSiteDetails: "/mini-site-details",
  profile: "/profile",
};

export type RouteKey = keyof typeof routes;
export type RoutePath = (typeof routes)[RouteKey];
