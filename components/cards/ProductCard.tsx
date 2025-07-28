"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { misc } from "@/constant/hebrew";
import { CardSkeleton } from "../skeletons";
import { IconImage, NextImage } from "@/components/ui";
import { useImageScale } from "@/hooks/useImageScale";
import { useImagePresent } from "@/hooks/useImagePresent";

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
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="absolute top-0 left-0 h-full w-full"
    >
      <NextImage
        isFill
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
  primaryCategoryId,
}: {
  product: Product;
  primaryCategoryId: string;
}) => {
  const { scale } = useImageScale();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  function handleImageIndexChange() {
    setActiveImageIndex((prev) => (prev + 1) % product?.images?.length);
  }

  return (
    <div className=" rounded-2xl overflow-hidden border border-[#D3D3D3]">
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
            <div onClick={handleImageIndexChange} className="cursor-pointer">
              <IconImage width={30} height={30} icon="prev" />
            </div>
          </div>
        )}
      </div>

      <div className="m-4">
        <h3 className="text-dark font-bold line-clamp-1">{product?.name}</h3>
        <div
          className="line-clamp-2 text-theme text-[12px] h-8.5"
          dangerouslySetInnerHTML={{ __html: product?.description }}
        />
        <div className="text-[32px] text-dark font-normal my-2.5">
          <span>₪{product?.price?.sellingPrice}</span>
        </div>

        <div className="flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => {}}
            className="h-10 rounded-xl bg-dark text-white flex-auto cursor-pointer"
          >
            {misc.quickPurchase}
          </button>
          <div className="flex-none">
            <IconImage width={40} height={40} icon="circular-cart" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
