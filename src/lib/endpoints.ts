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
  icons: "/admin/icons?isCategories=true",
  googleAnalyticsViews: "/google-analytics-views",

  categories: "/admin/buss-category",
  subCategories: "admin/buss-sub-category",
  tags: "/tags",

  accessibility: "/admin/accessibility",
  groupType: "/admin/group-type",
  dmosAuthorities: "/dmos-authorities",
  changeOwner: "/admin/businesses/assign-user/",

  // poi
  poi: "/point-of-interests",
  pois: "/point-of-interests",
  poisStatDashboard: "/point-of-interests-stat",
  bulkPoisUpdate: "/bulk-point-of-interests-update",

  // business
  business: "/businesses",
  businesses: "/businesses",
  searchBusiness: "/search-businesses",
  businessStatDashboard: "/businesses-stat",
  bulkBusinessesUpdate: "/bulk-businesses-update",
  pendingApprovals: "/admin/pending-approvals",

  //products
  products: "/products",
  bulkProductsUpdate: "/bulk-products-update",

  //orders
  orders: "/orders",
  orderDetails: "/order-details",

  orderSummary: "/orders-summary",

  ordersStats: "/orders-stats",
  bulkOrdersUpdate: "/resend-order-emails",
  orderStatus: "/orders",
  orderProductStatus: "/admin/orderProduct",
  orderConfirmation: "/admin/send-success-emails",
  productsStats: "/products-stat",
  cancleOrderProduct: "/cancel-order-product",
  updateOrderStatus: "/update-order-status",

  // public
  publicEventTicket: "/public/event-tickets",
  publicSessionTicket: "/public/session-tickets",

  // events
  events: "/events",
  eventsStats: "/events-stats",
  upcomingEvents: "/upcoming-events",

  users: "/users",
  userInfo: "/users/me",
  userAdmin: "/users/admin",
  createUser: "/users/create",
  tickets: "/tickets",
  eventTickets: "/event-tickets",

  // Media
  mediaSignedUrl: "/media-signed-url",
  mediaFileDelete: "/media",

  websites: "/site-settings/websites",
  socialmedia: "admin/social-media",
  websiteAccessItem: "/websites/access-items",

  generateTags: "/generate-tags",

  // Content
  contentConfig: "/site-filter-config",

  // Notifications
  notifications: "/notifications",
  notificationStats: "/notifications/stats",
  notificationCount: "/notifications/count",
  notificationsBulkMarkRead: "/notifications/bulk/mark-read",

  // trips
  trips: "/trips",
  stations: "/stations",

  //voucher
  vouchers: "/vouchers",
  voucher: "/voucher-id",
  searchVoucher: "/search-vouchers",
  voucherStatDashboard: "/vouchers-stats",
  bulkVouchersUpdate: "/bulk-vouchers-update",
  sendemail: "/vouchers/send-email",
  sendsms: "/vouchers/send-sms",

  // cmpaings
  campaign: "/admin/campaign",

  // Admin endpoints
  dynamicPage: "/settings",

  // Blog Articles
  blogs: "/blogs",
  blogGenerateSeo: "/blogs/generate-seo",
  bloggenerateName: "/generate-blog-name",

  // Website settgins & Config
  dmos: "/dmos",
  authorities: "/authorities",
  websiteSettings: "/site-settings",
  websiteList: "/site-settings/list",
  partners: "/partners",
  campaigns: "/campaigns",

  // Promotions
  promotions: "/promotions",
  promotionGroups: "/promotion-groups",

  // Website error report
  websiteCrashes: "/website-crashes",

  googleMap: "https://maps.googleapis.com/maps/api/js",
  googlePlaceAutoComplete: "https://places.googleapis.com/v1/places",
  googleMapRouteDirection:
    "https://routes.googleapis.com/directions/v2:computeRoutes",
};
