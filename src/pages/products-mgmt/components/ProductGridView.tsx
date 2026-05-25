import clsx from "clsx";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Loader, Package } from "lucide-react";

import { routes } from "@/lib/routes";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { DeleteIconBtn, EditIconBtn } from "@/components/btns";
import { getLngWiseStr, getPlainTextFromRichText } from "@/helpers";
import { useDeleteProductMutation } from "@/store/api/productMutationApi";
import {
  ConfirmDialog,
  ImageWithFallback,
  ItemStatusBadge,
} from "@/components/shared";

interface ProductGridViewProps {
  products: any[];
  isLoading: boolean;
  hasMore: boolean;
  refetch: () => void;
  fetchNextPage: () => void;
  selectedProducts?: Set<string>;
  setSelectedProducts?: (v: Set<string>) => void;
  handleEditClick?: (productId: string) => void;
}

const ProductGridView: React.FC<ProductGridViewProps> = ({
  products,
  isLoading,
  hasMore,
  refetch,
  fetchNextPage,
  selectedProducts,
  setSelectedProducts,
  handleEditClick,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("products");
  const { isDark, language } = useThemeClasses();

  const scrollRef = useRef<HTMLDivElement | null>(null);

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

  const toggleCheckBox = (itemId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(itemId)) newSelected.delete(itemId);
    else newSelected.add(itemId);
    if (setSelectedProducts) setSelectedProducts(newSelected);
  };

  const handleProductClick = (productId: string) => {
    navigate(`${routes.productDetails}?productId=${productId}`, {
      replace: true,
    });
  };

  return (
    <div
      className={`py-3 px-2 rounded-xl ${
        isDark ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-white"
      }`}
    >
      <div
        ref={scrollRef}
        id="business-table-scroll"
        className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
          {products?.map((product) => {
            const isChecked = selectedProducts?.has(product._id) ?? false;
            return (
              <div
                key={product?._id}
                onClick={() => handleProductClick(product?._id)}
                className={clsx(
                  "rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group relative",
                  isDark ? "bg-gray-800" : "bg-white",
                  isChecked
                    ? "border-2 border-teal-500"
                    : `border ${isDark ? "border-gray-700" : "border-gray-200"}`,
                )}
              >
                {/* Top overlay: checkbox + status + actions */}
                <div
                  className="absolute top-2 left-0 z-30 w-full flex items-center justify-between px-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5">
                    {selectedProducts && (
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleCheckBox(product?._id)}
                        className="cursor-pointer border-2 transition-colors border-teal-300 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                      />
                    )}
                    <ItemStatusBadge status={product?.status?.toLowerCase()} />
                  </div>

                  <div className="flex items-center gap-1">
                    {handleEditClick && (
                      <EditIconBtn
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(product._id);
                        }}
                      />
                    )}
                    <DeleteIconBtn
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsConfirmOpen(true);
                        setItemToDelete(product?._id);
                      }}
                    />
                  </div>
                </div>

                {/* Product Image */}
                <div className="relative h-24 sm:h-28 bg-linear-to-br from-blue-500 to-indigo-600">
                  {product?.images?.length > 0 ? (
                    <ImageWithFallback
                      src={product?.images?.[0]?.image}
                      alt={product?.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-10 h-10 text-white opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-6 bg-linear-to-t from-black/20 to-transparent" />
                </div>

                {/* Product Info */}
                <div className="px-2.5 py-2">
                  <h3
                    className={`font-semibold text-sm leading-tight mb-1 line-clamp-1 ${
                      isDark ? "text-gray-100" : "text-gray-800"
                    }`}
                  >
                    {getLngWiseStr(
                      language,
                      product?.name,
                      product?.nameHe,
                      product?.nameAr,
                    )}
                  </h3>
                  <p
                    className={`text-xs mb-1.5 line-clamp-1 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {getPlainTextFromRichText(
                      getLngWiseStr(
                        language,
                        product?.description,
                        product?.descriptionHe,
                        product?.descriptionAr,
                      ),
                    )}
                  </p>

                  <div className="flex items-center justify-between">
                    <span
                      className={`font-bold text-sm ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      ₪ {product?.price?.sellingPrice ?? "-"}
                    </span>
                    {product?.businessId?.name && (
                      <div
                        className={`flex items-center gap-1 text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        <Building2 className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-16">
                          {product?.businessId?.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
