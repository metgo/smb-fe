"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Sparkles } from "lucide-react";

import { useItemBuyCart } from "@/hooks";
import { itemTypeEnum } from "@/lib/utils";
import { pathNames } from "@/lib/endpoints";
import useCartStore from "@/stores/cartStore";
import { getProducts } from "@/actions/productActions";
import { startLoading } from "@/components/wrappers/ProgressBar";
import { sanitizeHtml } from "@/lib/helpers";

interface BusinessProductsProps {
  bussinessId: string;
}

const BusinessProducts = ({ bussinessId }: BusinessProductsProps) => {
  const router = useRouter();
  const productScrollRef = useRef<HTMLDivElement>(null);
  const { addToCart, quickPurchase } = useItemBuyCart();

  const { cartItems } = useCartStore();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", bussinessId],
    queryFn: () => getProducts(bussinessId),
  });

  function handleNavigation(productId: string) {
    startLoading();
    router.push(`${pathNames.productsDetails}/${productId}`);
  }
  if (isLoading) {
    return (
      <div className="rounded-3xl shadow-lg p-6 sm:p-8 mb-8 bg-white">
        <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse mb-6" />
        <div className="flex gap-4 overflow-hidden pb-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[280px] sm:w-[300px] rounded-2xl overflow-hidden bg-gray-100 animate-pulse"
            >
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products?.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-3xl shadow-lg p-6 sm:p-8 mb-8 bg-white"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-900">המוצרים שלנו</h2>

      <div
        ref={productScrollRef}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {products?.map((product: ProductRes) => {
          const primaryImage =
            product.images.find((i) => i.isPrimary)?.image ??
            product.images[0]?.image;
          return (
            <div
              key={product._id}
              onClick={() => handleNavigation(product?._id)}
              className="flex-shrink-0 w-[280px] sm:w-[300px] rounded-2xl overflow-hidden shadow-lg snap-start relative bg-white border border-gray-200"
            >
              <button className="w-full text-right">
                <div className="relative h-48">
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4 pb-14">
                  <h3 className="text-xl font-bold mb-2 line-clamp-2 text-gray-900">
                    {product.name}
                  </h3>

                  <div
                    className="text-sm mb-2 line-clamp-2 text-gray-600"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(product?.description),
                    }}
                  />

                  <div className="mb-2">
                    <p className="text-xs mb-0.5 text-gray-500">מחיר</p>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-xl font-bold text-teal-600">
                        ₪{product.price.sellingPrice}
                      </span>
                      {product.price.markedPrice >
                        product.price.sellingPrice && (
                        <span className="text-sm line-through text-gray-400">
                          ₪{product.price.markedPrice}
                        </span>
                      )}
                      {product.price.discountPercent > 0 && (
                        <span className="text-xs font-bold text-orange-500">
                          -{product.price.discountPercent}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>

              {/* Action Buttons */}
              <div className="absolute bottom-2 left-3 right-3 flex gap-2 justify-end">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  className="px-4 h-12 cursor-pointer rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all flex items-center justify-center gap-2 text-sm font-bold"
                  onClick={(e) =>
                    quickPurchase(e, product, itemTypeEnum.product)
                  }
                >
                  <Sparkles className="w-5 h-5" />
                  <span>רכישה</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  className={`w-12 h-12 cursor-pointer rounded-xl transition-all flex items-center justify-center text-sm font-medium ${
                    cartItems.some((item) => item._id === product._id)
                      ? "bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-300"
                  }`}
                  onClick={(e) =>
                    addToCart(e, product, 1, itemTypeEnum.product)
                  }
                >
                  <ShoppingCart className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {products?.map((_: any, index: number) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all ${
              index === 0 ? "w-8 bg-teal-500" : "w-1.5 bg-gray-300"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default BusinessProducts;
