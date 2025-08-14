"use client";

import { useState } from "react";
import { MinusIcon, PlusIcon } from "@/components/ui/icons";
import clsx from "clsx";
import Link from "next/link";
import { productDetailsText } from "@/constant/hebrew";
import { IconImage } from "@/components/ui";
import useCartStore from "@/stores/cartStore";

const AddToCartBuyNowBtns = ({ product }: { product: ProductDetailsProps }) => {
  const canIncrease = true;
  const { setCartProduct } = useCartStore();
  const [qty, setQty] = useState(1);

  function handleIncrease() {
    setQty((prev) => prev + 1);
  }
  function handleDecrease() {
    setQty((prev) => prev - 1);
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const cartProduct = {
      _id: product._id,
      name: product.name,
      image: product.images[0].image,
      desc: product.description,
      price: product.price.sellingPrice,
      quantity: qty,
      parentId: product.businessId._id,
    };
    setCartProduct(cartProduct);
  }

  return (
    <>
      <div className="flex items-center border h-[40px] rounded-lg bg-white border-gray w-max my-6">
        <button
          type="button"
          onClick={handleIncrease}
          className={clsx(
            "w-10 h-[36px] mr-1 flex items-center justify-center text-gray-700 font-bold rounded-full hover:bg-gray-200 transition",
            !canIncrease ? "cursor-not-allowed" : "cursor-pointer",
          )}
        >
          <PlusIcon />
        </button>
        <div className="flex items-center justify-center w-[36px] h-[36px] text-[18px] rounded-full font-semibold">
          {qty}
        </div>
        <button
          type="button"
          onClick={handleDecrease}
          disabled={qty === 1}
          className={clsx(
            "w-10 h-[36px] flex items-center justify-center text-gray-700 font-bold rounded-full hover:bg-gray-200 transition",
            qty === 1 ? "cursor-not-allowed" : "cursor-pointer",
          )}
        >
          <MinusIcon />
        </button>
      </div>
      <div className=" flex items-center gap-2.5">
        <Link
          href={`/check-out?productId=${product._id}`}
          className="bg-dark rounded-xl px-6 py-2.75 font-bold text-white"
        >
          {productDetailsText.continuePlaceOrder}
        </Link>
        <button
          type="button"
          onClick={handleAddToCart}
          className="border border-theme text-theme rounded-xl py-2 flex items-center gap-1 font-bold px-4 cursor-pointer"
        >
          <IconImage icon="basket-gray" />
          <span>{productDetailsText.addToCart}</span>
        </button>
      </div>
    </>
  );
};

export default AddToCartBuyNowBtns;
