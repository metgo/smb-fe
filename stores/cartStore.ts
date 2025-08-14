import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartProduct = {
  _id: string;
  name: string;
  desc: string;
  image: string;
  price: number;
  quantity: number;
  parentId: string;
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
            // Update quantity if product exists
            const updatedProducts = [...state.cartProducts];
            updatedProducts[existingIndex].quantity += product.quantity;
            return { cartProducts: updatedProducts };
          }

          // Add new product
          return { cartProducts: [...state.cartProducts, product] };
        });
      },

      // Update quantity directly
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          // Remove if quantity is 0 or negative
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
      getTotalQuantity: () => {
        return get().cartProducts.reduce(
          (total, product) => total + product.quantity,
          0,
        );
      },

      // Get total paid amount
      getTotalPaidAmount: () => {
        return get().cartProducts.reduce(
          (total, product) => total + product.price * product.quantity,
          0,
        );
      },

      getUniqueParentIds: () => {
        const parentIds = get().cartProducts.map((product) => product.parentId);
        return Array.from(new Set(parentIds));
      },
    }),
    {
      name: "cart-storage",
    },
  ),
);

export default useCartStore;
