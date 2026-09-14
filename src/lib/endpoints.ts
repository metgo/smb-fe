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

  //mini-sites
  miniSites: "mini-sites",

  //products
  products: "/products",
  contentManagementProducts: "/content-management-products",
  bulkProductsUpdate: "/bulk-products-update",

  //orders
  orders: "/orders",
  orderStats: "/orders/stats",
  orderDetails: "/order-details",
  orderSummary: "/orders-summary",
  orderProducts: "/order-products",
  orderProductsDetails: "/order-products/details",
  cancelOrderProduct: "/cancel-order-product",
  approveOrderProduct: "/approve-order-product",
  openDispute: "/orders/dispute",
  respondDispute: "/disputes/respond",
  reopenDispute: "/disputes/reopen",

  ordersStats: "/orders-stats",
  bulkOrdersUpdate: "/resend-order-emails",
  orderProductStatus: "/admin/orderProduct",
  orderConfirmation: "/admin/send-success-emails",
  productsStats: "/products-stat",
  cancleOrderProduct: "/cancel-order-product",
  updateOrderStatus: "/update-order-status",
  bulkApprove: "/orders/bulk-approve",
  reconciliationStats: "/orders/reconciliation-stats",
  paymentSummary: "/payment-summary",
  bulkMarkAsComplete: "/orders/bulk-order-product-status",
  finaliseApprovedOrders: "/admin/monthly-reports/finalize-closed-orders",
  previewFinaliseApprovedOrders:
    "/admin/monthly-reports/finalize-closed-orders/preview",
  exportBankTransferXlsx: "/monthly-reports/export/bank-transfer-xlsx",
  exportVendorwiseXlsx: "/vendors/monthly-reports/export/xlsx",

  // payments
  paymentTransactions: "/payment/transactions",

  // public
  publicEventTicket: "/public/event-tickets",
  publicSessionTicket: "/public/session-tickets",

  // events
  events: "/events",
  eventsStats: "/events-stats",
  upcomingEvents: "/upcoming-events",
  contentManagementEvents: "/content-management-events",
  tickets: "/tickets",
  ticketsReorder: "/tickets/reorder",
  eventTickets: "/event-tickets",
  eventTicketAnswers: "/event-ticket-answers/by-ticket",
  resendTicketEmailToCustomer: "/resend-order-emails",

  // event sessions
  initWrapperCreate: "/event-sessions/initialize",
  eventSessions: "/event-sessions",
  eventSessionPreviwLink: "/event-sessions/preview-link",
  createWrapperSessionBlock: "/event-sessions/blocks",
  createWrapperSession: "/event-sessions/sessions",
  ticketsForEventSession: "/event-sessions/tickets-without-sessions",
  eventSessionCapacityReport: "/event-sessions/capacity-report",
  eventSessionReg: "/event-sessions/registrations",
  eventSessionTargetAudience: "/event-sessions/target-audience",
  eventSessionSendNotification: "/event-sessions/send-notification",
  eventSessionSendHistory: "/event-sessions/send-history",
  eventSessionSendHistoryDetails: "/event-sessions/send-history-detail",
  eventSessionResendNotification: "/event-sessions/resend-notification",
  sendOrderNotification: "/send-order-notification",
  resendConfirmSessionRegister: "event-sessions/resend-confirmation",

  // users
  users: "/users",
  userInfo: "/users/me",
  userAdmin: "/users/admin",
  createUser: "/users/create",
  resetLoginAttempts: "/users/reset-login-attempts",
  notifyUserByEmailSms: "vendors/notify-missing-bank-details",

  // Media
  mediaSignedUrl: "/media-signed-url",
  mediaFileDelete: "/media",

  //document
  docUpload: "doc-upload",
  checkTemplateKey: "doc-upload/check-template-key",

  websites: "/site-settings/websites",
  socialmedia: "admin/social-media",
  websiteAccessItem: "/websites/access-items",

  generateTags: "/generate-tags",

  // Content
  contentConfig: "/site-filter-config",
  contentConfigActivate: "/site-filter-config",
  wizardGenerateTopics: "/site-filter-config/wizard/generate-topics",
  wizardGenerateCategories: "/site-filter-config/wizard/generate-categories",
  wizardAssignEntities: "/site-filter-config/wizard/assign-entities",
  wizardTranslate: "/site-filter-config/wizard/translate",
  wizardGenerateUnified: "/site-filter-config/wizard/generate-unified",

  // Notifications
  notifications: "/notifications",
  notificationStats: "/notifications/stats",
  notificationCount: "/notifications/count",
  notificationsBulkMarkRead: "/notifications/bulk/mark-read",

  // trips
  trips: "/trips",
  stations: "/stations",
  bulkTripsDelete: "/trips/bulk-delete",
  bulkTripsStatusUpdate: "/trips/bulk-status-update",

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
  campaignDetails: "/campaign-details",

  // UTM campaign builder
  utmCampaigns: "/utm-campaigns",

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

  // Stats summary
  businessSummary: "/business-summary",
  poiSummary: "/poi-summary",

  // Chat System
  chatUsers: "/chats/users",
  chatMessages: "/chats/messages",
  chatConversations: "/chats/conversations",
  chatUnreadCount: "/chats/unread-count",
  chatPresence: "/chats/presence",
  chatGroups: "/chats/groups",
  chatBroadcasts: "/chats/broadcasts",

  googleMap: "https://maps.googleapis.com/maps/api/js",
  googlePlaceAutoComplete: "https://places.googleapis.com/v1/places",
  googleGeocode: "https://maps.googleapis.com/maps/api/geocode/json",
  googleMapRouteDirection:
    "https://routes.googleapis.com/directions/v2:computeRoutes",
};
