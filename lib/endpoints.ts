import { CODE, BASE_URL, SITE_ENVIRONMENT } from "@/constant/envConstants";

export const urls = {
  accessibilities: `${BASE_URL}/accessibilities`,
  tourismBusinesses: `${BASE_URL}/tourism/businesses`,
  carts: `${BASE_URL}/carts`,
  categories: `${BASE_URL}/categories?campCode=${CODE}`,
  groupTypes: `${BASE_URL}/group-types`,
  locations: `${BASE_URL}/tourism/map-businesses?campCode=${CODE}`,
  locationData: `${BASE_URL}/tourism/map-businesses`,
  orders: `${BASE_URL}/orders`,
  paymentFailure: `${BASE_URL}/payment/failure`,
  paymentSuccess: `${BASE_URL}/payment/success`,
  subcategory: `${BASE_URL}/subcategory`,
  voucherByCode: `${BASE_URL}/voucher-by-code`,
  vouchers: `${BASE_URL}/vouchers`,
  externalApi: `${BASE_URL}/external-api`,
  siteInfo: `${BASE_URL}/external-api/site-info`,
  businessDetails: `${BASE_URL}/tourism/businesses`,
  sendContactInfo: `${BASE_URL}/contact-us`,

  productsDetails: `${BASE_URL}/products`,
  productsList: `${BASE_URL}/products`,

  events: `${BASE_URL}/events`,
  eventDetails: `${BASE_URL}/events`,
  searchRecommendation: `${BASE_URL}/tourism/search-recommendation?campCode=${CODE}`,
  tourismSearch: `${BASE_URL}/tourism-search?campCode=${CODE}`,

  trails: `${BASE_URL}/trips`,
  trailDetails: `${BASE_URL}/trips`,

  ticketDetails: `${BASE_URL}/tickets`,

  blogs: `${BASE_URL}/blogs`,
  marketing: `${BASE_URL}/marketing`,

  themes: `${BASE_URL}/themes`,
  aminitiesInfo: `${BASE_URL}/amenities-info`,
};

export const pathNames = {
  home: "/",
  cart: "/cart",
  businessDetails: "/business-details",
  businesses: "/businesses",
  productsDetails: "/product-details",
  events: "/events",
  eventDetails: "/event-details",
  trails: "/trails",
  trailDetails: "/trail-details",
  termsConditions: "/terms-conditions",
  privacyPolicy: "/privacy-policy",
  checkout: "/check-out",
  contactUs: "/contact-us",
  blogArticles: "/blogs-articles",
  blogArticleDetails: "/blog-article-details",
  joinBusiness:
    SITE_ENVIRONMENT === "prod"
      ? "https://console.metgo.app"
      : "https://stg.console.metgo.app",
};
