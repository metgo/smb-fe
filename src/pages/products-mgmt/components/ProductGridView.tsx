import { toast } from "sonner";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader, Package, TrashIcon } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { ConfirmDialog, ImageWithFallback } from "@/components/shared";
import { useDeleteProductMutation } from "@/store/api/productMutationApi";
import { routes } from "@/lib/routes";
import { getPlainTextFromRichText } from "@/helpers";

interface ProductGridViewProps {
  products: any[];
  isLoading: boolean;
  hasMore: boolean;
  refetch: () => void;
  fetchNextPage: () => void;
  selectedProducts: Set<string>;
  setSelectedProducts: (v: Set<string>) => void;
}

const ProductGridView: React.FC<ProductGridViewProps> = ({
  products,
  isLoading,
  hasMore,
  refetch,
  fetchNextPage,
  selectedProducts,
  setSelectedProducts,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("products");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { borderColor, isDark } = useThemeClasses();

  useInfiniteScroll({
    ref: scrollRef,
    hasMore,
    isLoading: isLoading,
    onLoadMore: fetchNextPage,
  });

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const handleProductDelete = async (productId: string) => {
    const res = await deleteProduct({ productId });
    toast.success(res?.data?.message || "Product deleted successfully");
    refetch();
  };

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

  const toggleCheckBox = (product: any) => {
    const newSelected = new Set(selectedProducts);
    const key = product._id;
    if (newSelected.has(key)) newSelected.delete(key);
    else newSelected.add(key);
    setSelectedProducts(newSelected);
  };

  const handleProductClick = (productId: string) => {
    navigate(`${routes.productDetails}?productId=${productId}`, {
      replace: true,
    });
  };

  return (
    <div
      className={`py-6 px-4 ${
        isDark ? "border-gray-700 bg-gray-900" : "border-gray-300 bg-white"
      }`}
    >
      <div
        ref={scrollRef}
        id="business-table-scroll"
        className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
          {products?.map((product) => (
            <div
              key={product?._id}
              onClick={() => handleProductClick(product?._id)}
              className={`rounded-xl border ${borderColor} ${
                isDark ? "bg-gray-900 text-gray-300" : "bg-white text-gray-900"
              } overflow-hidden hover:shadow-lg transition-all cursor-pointer group relative`}
            >
              {/* Checkbox and Delete Button */}
              <div
                className="absolute top-3 left-0 z-30 w-full flex items-center justify-between px-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={selectedProducts?.has(product._id) ?? false}
                  onCheckedChange={() => toggleCheckBox(product)}
                  className={`cursor-pointer border transition-colors ${
                    isDark
                      ? "border-gray-600 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500 data-[state=checked]:text-white"
                      : "border-gray-300 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                  }`}
                />

                <div className="flex items-center gap-2">
                  <div>{getStatusBadge(product?.status)}</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsConfirmOpen(true);
                      setItemToDelete(product._id);
                    }}
                    className="z-5 p-1 cursor-pointer rounded-full text-red-600 bg-white"
                    aria-label={`Delete ${product?.name}`}
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
              </div>

              {/* Product Image */}
              <div className="relative h-48 bg-linear-to-br from-blue-500 to-indigo-600">
                {product?.images?.length > 0 ? (
                  <ImageWithFallback
                    src={product?.images?.[0]?.image}
                    alt={product?.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3
                  className={`${isDark ? "text-white" : "text-gray-900"} mb-2 font-medium line-clamp-2`}
                >
                  {product?.name}
                </h3>
                <p
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"} mb-3 line-clamp-1`}
                >
                  {getPlainTextFromRichText(product?.description)}
                </p>

                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    {getProductTypeLabel(product?.productType)}
                  </div>
                  <div className={isDark ? "text-white" : "text-gray-900"}>
                    {product?.price?.markedPrice !==
                      product?.price?.sellingPrice && (
                      <span className="text-xs text-gray-400 line-through mr-2">
                        ₪{product?.price?.markedPrice}
                      </span>
                    )}
                    <span className="font-medium">
                      ₪{product?.price?.sellingPrice}
                    </span>
                  </div>
                </div>
                <p className="text-sm">{product?.businessId?.name}</p>
              </div>
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
            <Loader className="w-10 h-10 animate-spin text-teal-600" />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        title={t("delete_product")}
        message={t("delete_product_confirm")}
        confirmText="delete"
        loading={isDeleting}
        variant="danger"
        onCancel={() => {
          setIsConfirmOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={() => {
          if (!itemToDelete) return;
          handleProductDelete(itemToDelete);
          setIsConfirmOpen(false);
          setItemToDelete(null);
        }}
      />
    </div>
  );
};

export default ProductGridView;
