import { itemTypeEnum } from "@/lib/utils";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartItem = {
  _id: string;
  name: string;
  desc: string;
  image: string;
  price: number;
  itemType: string; // e.g., "PRODUCT", "TICKET"
  quantity: number;
  parentId: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
};

type BuyNowProduct = {
  _id: string;
  quantity: number;
  itemType: string;
};

interface CartStoreState {
  cartItems: CartItem[];
  setCartItem: (item: CartItem) => void;
  updateQuantity: (item: CartItem, quantity: number) => void;
  removeCartItem: (item: CartItem) => void;
  clearCart: () => void;
  getTotalQuantity: () => number;
  getTotalPaidAmount: () => number;
  getUniqueParentIds: () => string[];

  buyNowProduct: BuyNowProduct;
  setBuyNowProduct: (buyNowProduct: BuyNowProduct) => void;
}

// helper to decide whether two items are "the same"
const isSameItem = (a: CartItem, b: CartItem) => {
  if (
    a.itemType === itemTypeEnum.ticket &&
    b.itemType === itemTypeEnum.ticket
  ) {
    return a._id === b._id && a.eventDate === b.eventDate;
  }
  return a._id === b._id;
};

const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      cartItems: [],

      // Add or update item
      setCartItem: (item) => {
        set((state) => {
          const existingIndex = state.cartItems.findIndex((p) =>
            isSameItem(p, item),
          );

          if (existingIndex >= 0) {
            const updatedProducts = [...state.cartItems];
            updatedProducts[existingIndex].quantity += item.quantity;
            return { cartItems: updatedProducts };
          }

          return { cartItems: [...state.cartItems, item] };
        });
      },

      // Update quantity directly
      updateQuantity: (item, quantity) => {
        if (quantity <= 0) {
          set((state) => ({
            cartItems: state.cartItems.filter((p) => !isSameItem(p, item)),
          }));
          return;
        }

        set((state) => ({
          cartItems: state.cartItems.map((p) =>
            isSameItem(p, item) ? { ...p, quantity } : p,
          ),
        }));
      },

      // Remove product
      removeCartItem: (item) => {
        set((state) => ({
          cartItems: state.cartItems.filter((p) => !isSameItem(p, item)),
        }));
      },

      // Clear cart
      clearCart: () => {
        set({ cartItems: [] });
      },

      // Get all quantity
      getTotalQuantity: () =>
        get().cartItems.reduce((total, item) => total + item.quantity, 0),

      // Get total paid amount
      getTotalPaidAmount: () =>
        get().cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        ),

      // Get unique parent IDs
      getUniqueParentIds: () => {
        const parentIds = get().cartItems.map((item) => item.parentId);
        return Array.from(new Set(parentIds));
      },

      // Buy now product
      buyNowProduct: {
        _id: "",
        quantity: 1,
        itemType: "PRODUCT",
      },
      setBuyNowProduct: (buyNowProduct: BuyNowProduct) =>
        set({ buyNowProduct }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        cartItems: state.cartItems,
      }),
    },
  ),
);

export default useCartStore;
