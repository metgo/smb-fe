import clsx from "clsx";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, Loader, Package } from "lucide-react";

import { routes } from "@/lib/routes";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { getLngWiseStr } from "@/helpers";
import { useDeleteProductMutation } from "@/store/api/productMutationApi";
import { ConfirmDialog, GridCard } from "@/components/shared";

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
    isLoading,
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

  return (
    <div
      className={`py-3 px-2 rounded-xl ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-white"}`}
    >
      <div
        ref={scrollRef}
        id="business-table-scroll"
        className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
          {products?.map((product) => (
            <GridCard
              key={product._id}
              image={product.images?.[0]?.image}
              imageAlt={product.name}
              fallbackIcon={Package}
              fallbackGradient="from-blue-500 to-indigo-600"
              title={getLngWiseStr(
                language,
                product?.name,
                product?.nameHe,
                product?.nameAr,
              )}
              status={product?.status?.toLowerCase()}
              isChecked={selectedProducts?.has(product._id) ?? false}
              onCheckChange={
                selectedProducts ? () => toggleCheckBox(product._id) : undefined
              }
              onEdit={
                handleEditClick
                  ? (e) => {
                      e.stopPropagation();
                      handleEditClick(product._id);
                    }
                  : undefined
              }
              onDelete={(e) => {
                e.stopPropagation();
                setIsConfirmOpen(true);
                setItemToDelete(product._id);
              }}
              onClick={() =>
                navigate(`${routes.productDetails}?productId=${product._id}`, {
                  replace: true,
                })
              }
              footer={
                <div className="flex items-center justify-between">
                  <span
                    className={clsx(
                      "font-bold text-sm",
                      isDark ? "text-white" : "text-gray-900",
                    )}
                  >
                    ₪ {product?.price?.sellingPrice ?? "-"}
                  </span>
                  {product?.businessId?.name && (
                    <div
                      className={clsx(
                        "flex items-center gap-1 text-xs",
                        isDark ? "text-gray-400" : "text-gray-500",
                      )}
                    >
                      <Building2 className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-16">
                        {product.businessId.name}
                      </span>
                    </div>
                  )}
                </div>
              }
            />
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
