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
}));

export default useCheckoutStore;
