"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/actions/productActions";
import { sanitizeHtml } from "@/lib/helpers";

const RelatedProductsSection = ({
  businessId,
  currentProductId,
  businessName,
}: {
  businessId: string;
  currentProductId: string;
  businessName?: string;
}) => {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["products", businessId],
    queryFn: () => getProducts(businessId),
  });

  const products = data?.filter(
    (item: Product) => item._id !== currentProductId,
  );

  if (isLoading) {
    return (
      <div className="rounded-3xl shadow-lg p-6 sm:p-8 bg-white">
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
      transition={{ delay: 0.3 }}
      className="rounded-3xl shadow-lg p-6 sm:p-8 bg-white"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        מוצרים נוספים{businessName ? ` מ-${businessName}` : ""}
      </h2>

      <div
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product: Product) => (
          <motion.button
            key={product._id}
            onClick={() => router.push(`/product-details/${product._id}`)}
            whileTap={{ scale: 0.98 }}
            className="flex-shrink-0 w-[280px] sm:w-[300px] rounded-2xl overflow-hidden shadow-lg snap-start bg-white border border-gray-200"
          >
            <div className="relative h-48">
              <img
                src={product.images?.[0]?.image}
                alt={product.images?.[0]?.alt || product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4">
              <h3 className="text-xl font-bold mb-2 line-clamp-2 text-right text-gray-900">
                {product.name}
              </h3>
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(product?.description),
                }}
                className="text-sm mb-3 line-clamp-2 text-right text-gray-600"
              />
              <div className="flex items-center justify-end">
                <p className="text-xl font-bold text-teal-600">
                  ₪{product.price.sellingPrice}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default RelatedProductsSection;
