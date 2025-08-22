"use client";

import clsx from "clsx";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaMinus, FaPlus } from "react-icons/fa6";

import { IconImage } from "@/components/ui";
import { itemTypeEnum } from "@/lib/utils";
import { pathNames } from "@/lib/endpoints";
import useCartStore from "@/stores/cartStore";
import { productDetailsText } from "@/constant/hebrew";
import { startLoading } from "@/components/wrappers/ProgressBar";

const AddToCartBuyNowBtns = ({ product }: { product: ProductDetailsProps }) => {
  const router = useRouter();
  const [qty, setQty] = useState(1);

  const { setCartItem, setBuyNowProduct } = useCartStore();

  function handleQtyChange(operator: string) {
    if (operator === "increment") setQty((prev) => prev + 1);
    else setQty((prev) => prev - 1);
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
      itemType: itemTypeEnum.product,
      parentId: product.businessId._id,
    };
    setCartItem(cartProduct);
  }

  function handleQuickPurchase(e: React.MouseEvent) {
    startLoading();
    e.preventDefault();
    e.stopPropagation();
    const buyNowProduct = {
      _id: product._id,
      quantity: 1,
      itemType: itemTypeEnum.product,
    };
    setBuyNowProduct(buyNowProduct);
    router.push(`${pathNames.checkout}?isCart=false`);
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          className="size-9 rounded-full border border-secondary flex items-center justify-center cursor-pointer"
          onClick={() => handleQtyChange("increment")}
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
          onClick={() => handleQtyChange("decrement")}
        >
          <FaMinus />
        </button>
      </div>

      <div className=" flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleQuickPurchase}
          className="bg-dark rounded-xl px-6 py-2.75 font-bold text-white cursor-pointer"
        >
          {productDetailsText.continuePlaceOrder}
        </button>
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
