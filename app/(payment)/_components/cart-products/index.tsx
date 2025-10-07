"use client";

import YourCartProducts from "./YourCartProducts";
import RecommendedProducts from "./RecommendedProducts";
import useCartStore from "@/stores/cartStore";
import EmptyCart from "@/components/EmptyCart";
import MobileYourCartProducts from "./YourCartProducts.mobile";

const CartProducts = () => {
  const { getTotalQuantity } = useCartStore();
  return (
    <div className="max-sm:px-4 md:px-20 py-12">
      {getTotalQuantity() === 0 ? (
        <EmptyCart />
      ) : (
        <>
          <YourCartProducts />
          <MobileYourCartProducts />
          <RecommendedProducts />
        </>
      )}
    </div>
  );
};

export default CartProducts;
