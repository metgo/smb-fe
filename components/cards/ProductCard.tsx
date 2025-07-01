"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { misc } from "@/constant/hebrew";
import { IconImage, NextImage } from "@/components/ui";
import { useImageScale } from "@/hooks/useImageScale";

const ProductCard = ({ images, name, price }: ProductProps) => {
  const { scale } = useImageScale();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  function handleImageIndexChange() {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  }

  return (
    <div className=" rounded-2xl overflow-hidden border border-[#D3D3D3]">
      <div className="relative w-full overflow-hidden">
        <div
          style={{ width: 242 * scale, height: 224 * scale }}
          className="relative"
        >
          <AnimatePresence mode="sync" initial={false}>
            {images.map((img, index) =>
              index === activeImageIndex ? (
                <motion.div
                  key={index}
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute top-0 left-0 h-full w-full"
                >
                  <NextImage
                    isFill
                    scale={scale}
                    alt={img.alt}
                    imgSrc={img.image}
                    className="w-full object-cover"
                  />
                </motion.div>
              ) : null,
            )}
          </AnimatePresence>
        </div>

        {/* Controls & indicators */}
        <div className="absolute bottom-1 left-0 flex items-center justify-between px-4 mb-3.5 w-full">
          <div className="w-10" />
          <div className="flex items-center gap-1">
            {images?.map((_: any, index: number) => (
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
      </div>

      <div className="m-4">
        <h3 className="text-dark font-bold">{name}</h3>
        <p className="line-clamp-2 text-theme text-[12px]">
          {
            "סוויטת מדבר – סוויטה הממוקמת על קצה הגבעה ומשקיפה היישר אל שיפולי המדבר..."
          }
        </p>
        <div className="text-[32px] text-dark font-normal my-2.5">{price}</div>

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
