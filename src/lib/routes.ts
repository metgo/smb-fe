export const routes = {
  dashboard: "/",
  home: "/home",

  businessMgmt: "/businesses-management",
  businessDetails: "/business-details",

  eventsMgmt: "/events-management",
  eventDetails: "/event-details",

  productsMgmt: "/products-management",
  productDetails: "/product-details",

  ordersMgmt: "/orders-management",
  orderDetails: "/order-details",

  contentMgmt: "/content-management",

  pointOfInterest: "/point-of-interest",
  trips: "/trips",

  funDays: "/fun-days",
  vouchers: "/vouchers",
  offlineVouchers: "/offline-vouchers",
  miniCampaign: "/mini-campaign",
  auth: "/authentication",
  miniSite: "/mini-site",
  profile: "/profile",
};

export type RouteKey = keyof typeof routes;
export type RoutePath = (typeof routes)[RouteKey];
