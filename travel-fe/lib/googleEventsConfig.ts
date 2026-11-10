export const triggerName = {
  clickToLogo: "click_to_logo",
  clickToSearch: "click_to_search",
  clickToCart: "click_to_cart",
  clickToFunDayBtn: "click_to_funday_btn",
  clickToLayoutSwitchBtn: "click_to_layout_switch_btn",
  clickToFilterBtn: "click_to_filter_btn",
  clickToMenuBar: "click_to_menu_bar",
  clickToAudioBtn: "click_to_audio_btn",
  clickToFilterResetBtn: "click_to_filter_reset_btn",

  clickToCategory: "click_to_category",
  clickToSubCategory: "click_to_subcategory",
  clickToGroupType: "click_to_group_type",
  clickToAccessibility: "click_to_accessibility",
  clickToViewTicket: "click_to_view_ticket",
  clickToShareUrl: "click_to_share_url",
  clickToServiceType: "click_to_service_type",

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

// export function googleSendGtmEvent(eventName: string, eventValue: any) {
//   sendGTMEvent({ event: eventName, ...eventValue });
// }

// export function googleSendGaEvent(eventName: string, eventValue: any) {
//   sendGAEvent({ event: eventName, value: eventValue });
// }

// Implementation
// export const gtmEventNavToBusiness = (businessId: string) => {
//   googleSendGtmEvent(triggerName.navigateToBusiness, { businessId });
// };

export const sendGAEvent = (eventName: string, eventParams: any) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, eventParams);
    // console.log('GA Event sent:', { eventName, ...eventParams });
  }
};
