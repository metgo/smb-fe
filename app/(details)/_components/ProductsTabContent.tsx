"use client";

import { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

import { misc } from "@/constant/hebrew";
import { ProductCard } from "@/components/cards";
import { products } from "@/constant/placeholderData";

const ProductsTabContent = () => {
  const [productCount, setProductCount] = useState(10);
  const nextProductRef = useRef<HTMLDivElement | null>(null);

  function handleShowMoreProducts() {
    setProductCount((prev) => prev + 10);
  }

  // Scroll with custom 100px offset
  useEffect(() => {
    if (nextProductRef.current && productCount > 10) {
      const top =
        nextProductRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: top - 120,
        behavior: "smooth",
      });
    }
  }, [productCount]);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="grid grid-cols-5 gap-5 w-full">
        {products?.slice(0, productCount).map((product, index) => {
          const isFirstNew = index === productCount - 10;
          return (
            <div key={product._id} ref={isFirstNew ? nextProductRef : null}>
              <ProductCard {...product} />
            </div>
          );
        })}
      </div>

      {products.length > productCount && (
        <button
          type="button"
          onClick={handleShowMoreProducts}
          className="h-10 px-4 border border-theme text-theme rounded-xl w-max cursor-pointer font-bold flex items-center gap-1.25"
        >
          <span>{misc.showMoreProducts}</span>
          <IoIosArrowDown size={24} />
        </button>
      )}
    </div>
  );
};

export default ProductsTabContent;
