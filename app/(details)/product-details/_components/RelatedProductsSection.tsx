"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";

const RelatedProductsSection = ({
  products,
  businessName,
}: {
  products: Product[];
  businessName?: string;
}) => {
  const router = useRouter();

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
        {products.map((product) => (
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
                dangerouslySetInnerHTML={{ __html: product?.description }}
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
