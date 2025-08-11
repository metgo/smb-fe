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
  deliveryArea: DeliveryArea[];
};

const initilaCustomerInfo = {
  firstName: "",
  phone: "",
  email: "",
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
}));

export default useCheckoutStore;
