"use client";

import clsx from "clsx";
import { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";

import { useItemBuyCart } from "@/hooks";
import { IconImage } from "@/components/ui";
import { productDetailsText } from "@/constant/hebrew";

const AddToCartBuyNowBtns = ({ product }: { product: ProductDetailsProps }) => {
  const [qty, setQty] = useState(1);

  const { addToCart, quickPurchase } = useItemBuyCart();

  function handleQtyChange(operator: string) {
    if (operator === "increment") setQty((prev) => prev + 1);
    else setQty((prev) => prev - 1);
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          className="size-9 rounded-full border border-secondary flex items-center justify-center custom-cursor"
          onClick={() => handleQtyChange("increment")}
        >
          <FaPlus />
        </button>
        <span className="text-xl font-bold">{qty}</span>
        <button
          type="button"
          disabled={qty === 1}
          className={clsx(
            qty === 1 ? "cursor-not-allowed" : "custom-cursor",
            "size-9 rounded-full border border-secondary flex items-center justify-center",
          )}
          onClick={() => handleQtyChange("decrement")}
        >
          <FaMinus />
        </button>
      </div>

      <div className=" flex items-center gap-2.5">
        <button
          type="button"
          onClick={(e) => quickPurchase(e, product)}
          className="bg-dark rounded-xl px-6 py-2.75 font-bold text-white custom-cursor"
        >
          {productDetailsText.continuePlaceOrder}
        </button>
        <button
          type="button"
          onClick={(e) => addToCart(e, product, qty)}
          className="border border-theme text-theme rounded-xl py-2 flex items-center gap-1 font-bold px-4 custom-cursor"
        >
          <IconImage icon="basket-gray" />
          <span>{productDetailsText.addToCart}</span>
        </button>
      </div>
    </>
  );
};

export default AddToCartBuyNowBtns;
