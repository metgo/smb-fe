"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";

import { IconImage } from "@/components/ui";
import useCartStore from "@/stores/cartStore";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { productDetailsText } from "@/constant/hebrew";

const AddToCartBuyNowBtns = ({ product }: { product: ProductDetailsProps }) => {
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
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          className="size-9 rounded-full border border-secondary flex items-center justify-center cursor-pointer"
          onClick={handleIncrease}
        >
          <FaPlus />
        </button>
        <span>{qty}</span>
        <button
          type="button"
          disabled={qty === 1}
          className={clsx(
            qty === 1 ? "cursor-not-allowed" : "cursor-pointer",
            "size-9 rounded-full border border-secondary flex items-center justify-center",
          )}
          onClick={handleDecrease}
        >
          <FaMinus />
        </button>
      </div>

      <div className=" flex items-center gap-2.5">
        <Link
          href={`/check-out?qty=${qty}&productId=${product._id}`}
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
