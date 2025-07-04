import { CODE, BASE_URL } from "@/constant/envConstants";

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
  products: `${BASE_URL}/products`,
  subcategory: `${BASE_URL}/subcategory`,
  voucherByCode: `${BASE_URL}/voucher-by-code`,
  vouchers: `${BASE_URL}/vouchers`,
  externalApi: `${BASE_URL}/external-api`,
  siteInfo: `${BASE_URL}/external-api/site-info`,
  businessDetails: `${BASE_URL}/tourism/businesses`,
};
