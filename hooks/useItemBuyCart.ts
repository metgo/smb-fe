import { useRouter } from "next/navigation";

import { itemTypeEnum } from "@/lib/utils";
import { pathNames } from "@/lib/endpoints";
import useCartStore from "@/stores/cartStore";
import { startLoading } from "@/components/wrappers/ProgressBar";
import { googleSendGtmEvent, triggerName } from "@/lib/googleEventsConfig";

export const useItemBuyCart = () => {
  const router = useRouter();
  const { setCartItem, setBuyNowProduct } = useCartStore();

  function addToCart(e: React.MouseEvent, product: any, qty: number = 1) {
    e.preventDefault();
    e.stopPropagation();

    setCartItem({
      _id: product._id,
      name: product.name,
      image: product.images?.[0]?.image ?? "",
      desc: product.description,
      price: product.price?.sellingPrice,
      quantity: qty,
      parentId: product.businessId?._id,
      itemType: itemTypeEnum.product,
    });

    googleSendGtmEvent(triggerName.addToCart, {
      productId: product._id,
      productName: product.name,
    });
  }

  function quickPurchase(e: React.MouseEvent, product: any) {
    e.preventDefault();
    e.stopPropagation();
    startLoading();

    setBuyNowProduct({
      _id: product._id,
      quantity: 1,
      itemType: itemTypeEnum.product,
    });

    googleSendGtmEvent(triggerName.buyNowBtn, {
      productId: product._id,
      productName: product.name,
    });

    router.push(`${pathNames.checkout}?isCart=false`);
  }

  return { addToCart, quickPurchase };
};
