import { sendGAEvent, sendGTMEvent } from "@next/third-parties/google";

export const triggerName = {
  clickToCategory: "click_to_category",
  clickToSubCategory: "click_to_subcategory",
  clickToGroupType: "click_to_group_type",
  clickToAccessibility: "click_to_accessibility",
  clickToViewTicket: "click_to_view_ticket",
  clickToShareUrl: "click_to_share_url",

  addToCart: "add_to_cart",
  buyNowBtn: "buy_now_btn",
  navigateToBusiness: "navigate_to_business",
  voucherCheckoutBtn: "voucher_checkout_btn",
  continueToVoucherPurchaseSubmit: "continue_to_voucher_purchase_submit",
  orderCheckoutPersonalDetailsBtn: "order_checkout_personal_details_btn",
  searchProduct: "search_product",
  mapNavigationBtn: "map_navigation_btn",
  orderCheckoutBtn: "order_checkout_btn",
  locationBtn: "location_btn",
  orderCheckoutDeliveryInfoBtn: "order_checkout_delivery_info_submit",
  orderPlaceBtn: "order_place_btn",
  orderCheckoutCardcomWindow: "order_checkout_cardcom_window",
  orderCheckoutCardcomSuccess: "order_checkout_cardcom_success",
  orderCheckoutCardcomFailure: "order_checkout_cardcom_failure",
};

export function googleSendGtmEvent(eventName: string, eventValue: any) {
  sendGTMEvent({ event: eventName, ...eventValue });
}

export function googleSendGaEvent(eventName: string, eventValue: any) {
  sendGAEvent({ event: eventName, value: eventValue });
}

// Implementation
export const gtmEventNavToBusiness = (businessId: string) => {
  googleSendGtmEvent(triggerName.navigateToBusiness, { businessId });
};
