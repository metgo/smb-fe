import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartProduct = {
  _id: string;
  name: string;
  desc: string;
  image: string;
  price: number;
  itemType: string; // e.g., "PRODUCT", "TICKET"
  quantity: number;
  parentId: string;
};

type BuyNowProduct = {
  _id: string;
  qty: number;
  type: string;
};

interface CartStoreState {
  cartProducts: CartProduct[];
  setCartProduct: (product: CartProduct) => void; // add/update
  updateQuantity: (id: string, quantity: number) => void;
  removeCartProduct: (id: string) => void;
  clearCart: () => void;
  getTotalQuantity: () => number;
  getTotalPaidAmount: () => number;
  getUniqueParentIds: () => string[];

  buyNowProduct: BuyNowProduct;
  setBuyNowProduct: (buyNowProduct: BuyNowProduct) => void;
}

const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      cartProducts: [],

      // Add or update product
      setCartProduct: (product) => {
        set((state) => {
          const existingIndex = state.cartProducts.findIndex(
            (p) => p._id === product._id,
          );

          if (existingIndex >= 0) {
            const updatedProducts = [...state.cartProducts];
            updatedProducts[existingIndex].quantity += product.quantity;
            return { cartProducts: updatedProducts };
          }

          return { cartProducts: [...state.cartProducts, product] };
        });
      },

      // Update quantity directly
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set((state) => ({
            cartProducts: state.cartProducts.filter((p) => p._id !== id),
          }));
          return;
        }

        set((state) => ({
          cartProducts: state.cartProducts.map((p) =>
            p._id === id ? { ...p, quantity } : p,
          ),
        }));
      },

      // Remove product
      removeCartProduct: (id) => {
        set((state) => ({
          cartProducts: state.cartProducts.filter((p) => p._id !== id),
        }));
      },

      // Clear cart
      clearCart: () => {
        set({ cartProducts: [] });
      },

      // Get all quantity
      getTotalQuantity: () =>
        get().cartProducts.reduce(
          (total, product) => total + product.quantity,
          0,
        ),

      // Get total paid amount
      getTotalPaidAmount: () =>
        get().cartProducts.reduce(
          (total, product) => total + product.price * product.quantity,
          0,
        ),

      // Get unique parent IDs
      getUniqueParentIds: () => {
        const parentIds = get().cartProducts.map((product) => product.parentId);
        return Array.from(new Set(parentIds));
      },

      // These two won't persist
      buyNowProduct: {
        _id: "",
        qty: 1,
        type: "PRODUCT",
      },
      setBuyNowProduct: (buyNowProduct: BuyNowProduct) =>
        set({ buyNowProduct }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        cartProducts: state.cartProducts,
      }),
    },
  ),
);

export default useCartStore;
