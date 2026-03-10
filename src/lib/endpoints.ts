export const endpoints = {
  login: "/auth/login",
  forgotPassword: "/auth/send-otp",
  signUp: "/auth/signUp",
  verifyOtp: "/auth/verify-otp",
  resetPassword: "/auth/forget-password",
  googleAuth: "/auth/google/url",
  registerStep1: "/auth/register-step1",
  registerStep2: "/auth/register-step2",

  popularProductsStats: "/popular-products",
  popularBusinessStats: "/popular-business",
  popularPoiStats: "/popular-poi",

  businessStats: "/home-stats/businesses",
  poiStats: "/home-stats/point-of-interests",
  productStats: "/home-stats/products",
  eventStats: "/stats/events",
  voucherStats: "/stats/vouchers",
  onlineOrderStats: "/stats/orders",
  offlineOrderStats: "/home-stats/offline-order",
  purchaseReportsStats: "/home-stats/purchase-reports",

  googleAnalyticsViews: "/google-analytics-views",

  categories: "/admin/buss-category",
  subCategories: "admin/buss-sub-category",
  tags: "/tags",

  accessibility: "/admin/accessibility",
  groupType: "/admin/group-type",
  dmos: "/dmos",
  changeOwner: "/admin/businesses/assign-user/",

  // business
  business: "/businesses",
  businesses: "/businesses",
  searchBusiness: "/search-businesses",
  businessStatDashboard: "/businesses-stat",
  bulkBusinessesUpdate: "/bulk-businesses-update",

  //products
  products: "/products",
  bulkProductsUpdate: "/bulk-products-update",

  //orders
  orders: "/orders",
  ordersStats: "/orders-stats",
  bulkOrdersUpdate: "/bulk-orders-update",
  orderStatus: "/admin/cancel-orders",
  orderProductStatus: "/admin/orderProduct",
  orderConfirmation: "/admin/send-success-emails",
  productsStats: "/products-stat",

  // events
  events: "/events",
  eventsStats: "/events-stats",

  users: "/users",
  userInfo: "/users/me",
  userAdmin: "/users/admin",
  tickets: "/tickets",

  // Media
  mediaSignedUrl: "/media-signed-url",
  mediaFileDelete: "/media",

  websites: "/websites",
  socialmedia: "admin/social-media",
  websiteAccessItem: "/websites/access-items",

  generateTags: "/generate-tags",

  // Content
  contentConfig: "/site-filter-config",

  googleMap: "https://maps.googleapis.com/maps/api/js",
  googlePlaceAutoComplete: "https://places.googleapis.com/v1/places",
};
