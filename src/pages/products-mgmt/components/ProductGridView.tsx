import { Package } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useRef } from "react";
import { ImageWithFallback } from "@/components/shared";
import { Checkbox } from "@/components/ui/checkbox";
import clsx from "clsx";

interface ProductGridViewProps {
  products: any[];
  isLoading: boolean;
  hasMore: boolean;
  fetchNextPage: () => void;
  selectedProducts: Set<string>;
  setSelectedProducts: (v: Set<string>) => void;
}

const ProductGridView: React.FC<ProductGridViewProps> = ({
  products,
  isLoading,
  hasMore,
  fetchNextPage,
  selectedProducts,
  setSelectedProducts,
}) => {
  const { t } = useTranslation("products");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const {
    borderColor,
    bgSecondary,
    textPrimary,
    textTertiary,
    textSecondary,
    language,
    isDark,
  } = useThemeClasses();

  useInfiniteScroll({
    ref: scrollRef,
    hasMore,
    isLoading: isLoading,
    onLoadMore: fetchNextPage,
  });

  const getStatusBadge = (status: Product["status"]) => {
    const badges = {
      draft: isDark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700",

      pending: isDark
        ? "bg-yellow-900/30 text-yellow-400"
        : "bg-yellow-100 text-yellow-700",

      approved: isDark
        ? "bg-green-900/30 text-green-400"
        : "bg-green-100 text-green-700",

      rejected: isDark
        ? "bg-red-900/30 text-red-400"
        : "bg-red-100 text-red-700",

      archived: isDark
        ? "bg-zinc-800 text-zinc-400"
        : "bg-zinc-100 text-zinc-600",

      active: isDark
        ? "bg-blue-900/30 text-blue-400"
        : "bg-blue-100 text-blue-700",

      inactive: isDark
        ? "bg-gray-700 text-gray-300"
        : "bg-gray-200 text-gray-600",
    };

    const labels = {
      draft: t("draft"),
      pending: t("pending"),
      approved: t("approved"),
      rejected: t("rejected"),
      archived: t("archived"),
      active: t("active"),
      inactive: t("inactive"),
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const getProductTypeLabel = (type: Product["productType"]) => {
    const labels = {
      PHYSICAL: t("physical_product"),
      TABLE_ORDER: t("table_order"),
      SERVICE: t("service"),
      HOTEL: t("hotel_room"),
      EXPERIENCE: t("experience"),
    };
    return labels[type] || type;
  };

  const toggleRow = (product: any) => {
    const newSelected = new Set(selectedProducts);
    const key = product._id;
    if (newSelected.has(key)) newSelected.delete(key);
    else newSelected.add(key);
    setSelectedProducts(newSelected);
  };

  return (
    <div
      ref={scrollRef}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {products?.map((product: any) => (
        <div
          key={product._id}
          onClick={() => {}}
          className={`rounded-xl border ${borderColor} ${bgSecondary} overflow-hidden hover:shadow-lg transition-all cursor-pointer group`}
        >
          <div className="relative h-48 bg-linear-to-br from-blue-500 to-indigo-600">
            {product?.images ? (
              <ImageWithFallback
                src={product?.images?.[0]?.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-white opacity-50" />
              </div>
            )}
            <div className="absolute top-3 left-3">
              <Checkbox
                checked={selectedProducts?.has(product._id) ?? false}
                onCheckedChange={() => toggleRow(product)}
                className={clsx(
                  "cursor-pointer border transition-colors",
                  isDark
                    ? "border-gray-600 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500 data-[state=checked]:text-white"
                    : "border-gray-300 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600",
                )}
              />
            </div>
            <div className="absolute top-3 right-3">
              {getStatusBadge(product.status)}
            </div>
          </div>
          <div className="p-4">
            <h3 className={`${textPrimary} mb-2 font-medium line-clamp-2`}>
              {product.name}
            </h3>
            <p className={`text-sm ${textTertiary} mb-3 line-clamp-2`}>
              {product?.shortDescription?.[language]}
            </p>
            <div className="flex items-center justify-between mb-2">
              <div className={`text-sm ${textSecondary}`}>
                {getProductTypeLabel(product.type)}
              </div>
              <div className={textPrimary}>
                {product?.markedPrice !== product?.sellingPrice && (
                  <span className="text-xs text-gray-400 line-through mr-2">
                    ₪{product?.markedPrice}
                  </span>
                )}
                <span className="font-medium">
                  ₪{product?.price?.selligPrice}
                </span>
              </div>
            </div>
            <div className={`text-xs ${textTertiary}`}>{product.name}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGridView;
