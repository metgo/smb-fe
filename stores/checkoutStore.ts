import { create } from "zustand";

type CartedProduct = {
  cartId: string;
  productId: string;
};

type OrderProducts = {
  _id: string;
  name: string;
  alt: string;
  image: string;
  price: number;
  quantity: number;
  itemType: string;
  deliveryArea: DeliveryArea[];
};

type BuyNowProduct = {
  _id: string;
  quantity: number;
  type: string;
};

type PlaceOrderItems = { _id: string; quantity: number; itemType: string };

const initilaCustomerInfo = {
  firstName: "",
  phone: "",
  email: "",
};

const initalBuyNowProductInfo = {
  _id: "",
  quantity: 1,
  type: "PRODUCT",
};

interface CheckoutStoreState {
  customerInfo: CustomerInfoProps;
  setCustomerInfo: (customeInfo: CustomerInfoProps) => void;

  cartedProduct: CartedProduct;
  setCartedProduct: (cartedProduct: CartedProduct) => void;

  orderProducts: OrderProducts[];
  setOrderProducts: (orderProducts: OrderProducts[]) => void;

  totalDeliveryFee: number;
  setTotalDeliveryFee: (fee: number) => void;

  isStepOneComplete: boolean;
  isStepOneSubmitBtnDisabled: boolean;
  setIsStepOneComplete: (isComplete: boolean) => void;
  setIsStepOneSubmitBtnComplete: (isDisabled: boolean) => void;

  isStepTwoComplete: boolean;
  isStepTwoSubmitBtnDisabled: boolean;
  setIsStepTwoComplete: (isComplete: boolean) => void;
  setIsStepTwoSubmitBtnDisabled: (isDisabled: boolean) => void;

  buyNowProduct: BuyNowProduct;
  setBuyNowProduct: (buyNowProduct: BuyNowProduct) => void;

  placeOrderItems: PlaceOrderItems[];
  setPlaceOrderItems: (items: PlaceOrderItems[]) => void;
}

const useCheckoutStore = create<CheckoutStoreState>((set) => ({
  customerInfo: initilaCustomerInfo,
  setCustomerInfo: (customerInfo) => set({ customerInfo }),

  cartedProduct: { cartId: "", productId: "" },
  setCartedProduct: (cartedProduct) => set({ cartedProduct }),

  orderProducts: [],
  setOrderProducts: (orderProducts) => set({ orderProducts }),

  totalDeliveryFee: 0,
  setTotalDeliveryFee: (totalDeliveryFee) => set({ totalDeliveryFee }),

  isStepOneComplete: true,
  setIsStepOneComplete: (isStepOneComplete) => set({ isStepOneComplete }),

  isStepTwoComplete: true,
  setIsStepTwoComplete: (isStepTwoComplete) => set({ isStepTwoComplete }),

  isStepOneSubmitBtnDisabled: false,
  setIsStepOneSubmitBtnComplete: (isStepOneSubmitBtnDisabled) =>
    set({ isStepOneSubmitBtnDisabled }),

  isStepTwoSubmitBtnDisabled: false,
  setIsStepTwoSubmitBtnDisabled: (isStepTwoSubmitBtnDisabled) =>
    set({ isStepTwoSubmitBtnDisabled }),

  buyNowProduct: initalBuyNowProductInfo,
  setBuyNowProduct: (buyNowProduct) => set({ buyNowProduct }),

  placeOrderItems: [],
  setPlaceOrderItems: (items) => set({ placeOrderItems: items }),
}));

export default useCheckoutStore;
