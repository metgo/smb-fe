"use client";

import YourCartProducts from "./YourCartProducts";
import RecommendedProducts from "./RecommendedProducts";
import useCartStore from "@/stores/cartStore";
import EmptyCart from "@/components/EmptyCart";

const CartProducts = () => {
  const { getTotalQuantity } = useCartStore();
  return (
    <div className="mx-20 py-12">
      {getTotalQuantity() === 0 ? (
        <EmptyCart />
      ) : (
        <>
          <YourCartProducts />
          <RecommendedProducts />
        </>
      )}
    </div>
  );
};

export default CartProducts;
