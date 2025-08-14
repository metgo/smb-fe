"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import PriceTag from "../PriceTag";
import { cartLabels, misc } from "@/constant/hebrew";
import { CardSkeleton } from "../skeletons";
import { IconImage, NextImage } from "@/components/ui";
import { useImageScale } from "@/hooks/useImageScale";
import { useImagePresent } from "@/hooks/useImagePresent";
import useCartStore from "@/stores/cartStore";

const ImageCard = ({
  imageItem,
  scale,
  primaryCategoryId,
}: {
  imageItem: ImageItem;
  scale: number;
  primaryCategoryId: string;
}) => {
  const aspectRatio = 242 / 224;
  const { isLoading, updatedImage, isImageLoaded } = useImagePresent(
    aspectRatio,
    imageItem,
    0,
    [imageItem],
  );

  if (isLoading || !isImageLoaded)
    return (
      <CardSkeleton
        className={"rounded-t-2xl w-full h-full"}
        primaryCategoryId={primaryCategoryId}
      />
    );

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ duration: 0, ease: "easeInOut" }}
      className="absolute top-0 left-0 h-full w-full"
    >
      <NextImage
        isFill
        width={242}
        height={224}
        scale={scale}
        alt={updatedImage.alt}
        imgSrc={updatedImage.imageUrl}
        className="w-full object-cover"
      />
    </motion.div>
  );
};

const ProductCard = ({
  product,
  isCartPage = false,
  primaryCategoryId,
}: {
  product: Product;
  isCartPage?: boolean;
  primaryCategoryId: string;
}) => {
  const router = useRouter();
  const { scale } = useImageScale();
  const { setCartProduct } = useCartStore();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const cartProduct = {
      _id: product._id,
      quantity: 1,
      name: product.name,
      image: product.images[0].image,
      desc: product.description,
      price: product.price.sellingPrice,
      parentId: product.businessId._id,
    };
    setCartProduct(cartProduct);
  }

  function handleQuickPurchase(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    router.push(`/check-out?isCart=false&productId=${product._id}`);
  }

  return (
    <div className=" rounded-2xl overflow-hidden border border-[#D3D3D3]">
      <Link href={`/product-details/${product._id}`}>
        <div className="relative w-full overflow-hidden">
          <div
            style={{ width: 242 * scale, height: 224 * scale }}
            className="relative"
          >
            <AnimatePresence mode="sync" initial={false}>
              {product?.images?.map((imageItem, index) =>
                index === activeImageIndex ? (
                  <ImageCard
                    key={index}
                    scale={scale}
                    imageItem={imageItem}
                    primaryCategoryId={primaryCategoryId}
                  />
                ) : null,
              )}
            </AnimatePresence>
          </div>

          {/* Controls & indicators */}
          {product?.images?.length > 1 && (
            <div className="absolute bottom-1 left-0 flex items-center justify-between px-4 mb-3.5 w-full">
              <div className="w-10" />
              <div className="flex items-center gap-1">
                {product?.images?.map((_: any, index: number) => (
                  <div
                    key={index}
                    className={`transition-all duration-300 rounded-full bg-white ${index === activeImageIndex ? "w-2 h-2" : "w-2 h-2 opacity-50"}`}
                  />
                ))}
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setActiveImageIndex(
                    (prev) => (prev + 1) % product?.images?.length,
                  );
                }}
                className="cursor-pointer"
              >
                <IconImage width={30} height={30} icon="prev" />
              </div>
            </div>
          )}
        </div>

        <div className="m-4">
          <h3 className="text-dark font-bold line-clamp-1">{product?.name}</h3>
          <div
            className="line-clamp-2 text-theme text-[12px] h-8.5 font-normal"
            dangerouslySetInnerHTML={{ __html: product?.description }}
          />
          <PriceTag
            price={product?.price?.sellingPrice}
            className="text-[32px] text-dark font-normal my-2.5"
          />

          {isCartPage ? (
            <button
              type="button"
              onClick={handleAddToCart}
              className="h-10 rounded-xl bg-dark text-white flex items-center justify-center w-full flex-auto cursor-pointer font-normal text-lg"
            >
              <span>{cartLabels.addToCart}</span>
            </button>
          ) : (
            <div className="flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handleQuickPurchase}
                className="h-10 rounded-xl bg-dark text-white flex items-center justify-center w-full flex-auto cursor-pointer font-normal text-lg"
              >
                <span>{misc.quickPurchase}</span>
              </button>
              <div className="flex-none" onClick={handleAddToCart}>
                <IconImage width={40} height={40} icon="circular-cart" />
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
