import type React from "react";
import { Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { routes } from "@/lib/routes";
import { ReordableDataTable } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { getPlainTextFromRichText } from "@/helpers";
import StatusBadge from "@/components/shared/StatusBadge";
interface ProductListViewProps {
  products: any[];
  isLoading: boolean;
  hasMore: boolean;
  fetchNextPage: () => void;
  selectedProducts: Set<string>;
  setSelectedProducts: (v: Set<string>) => void;
  columnVisibility: IColumnVisibility;
}

const ProductListView: React.FC<ProductListViewProps> = ({
  products,
  hasMore,
  fetchNextPage,
  isLoading,
  columnVisibility,
  selectedProducts,
  setSelectedProducts,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("products");
  const { borderColor, bgSecondary, textPrimary, language } = useThemeClasses();
  const USER_ROLE = "admin";

  const canChangeStatus = ["superadmin", "admin", "dmo", "authority"].includes(
    USER_ROLE,
  );
  const handleProductClick = (product: any) => {
    navigate(`${routes.productDetails}?productId=${product?._id}`, {
      replace: true,
    });
  };

  const columns = [
    ...(canChangeStatus ? [{ key: "checkbox", label: "", width: "50px" }] : []),

    columnVisibility?.images && {
      key: "images",
      label: t("product_image"),
      render: (product: any) => (
        <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden">
          {product?.images?.length > 0 ? (
            <img
              src={product?.images[0]?.image}
              alt={product.name[language]}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-6 h-6 text-white" />
          )}
        </div>
      ),
    },

    columnVisibility.name && {
      key: "name",
      label: t("product_name"),
      sortable: true,
      render: (product: any) => (
        <div>
          <div className={`${textPrimary} line-clamp-1`}>
            {product.name
              ? (product.name?.[language] ?? product.name?.en ?? product.name)
              : "-"}
          </div>
        </div>
      ),
    },
    columnVisibility.shortDescription && {
      key: "shortDescription",
      label: t("short_description"),
      sortable: true,
      render: (product: any) => (
        <div className={`${textPrimary} line-clamp-1`}>
          {product.shortDescription
            ? getPlainTextFromRichText(product.shortDescription)
            : "-"}
        </div>
      ),
    },
    columnVisibility.description && {
      key: "description",
      label: t("description"),
      sortable: true,
      render: (product: any) => (
        <div>
          <div className={`${textPrimary} truncate max-w-xs`}>
            {product.description
              ? getPlainTextFromRichText(product.description)
              : "-"}
          </div>
        </div>
      ),
    },
    columnVisibility.businessId && {
      key: "businessId",
      label: t("business_name"),
      render: (product: any) => (
        <div className={`${textPrimary} line-clamp-1`}>
          {product.businessId?.name}
        </div>
      ),
    },

    columnVisibility.status && {
      key: "status",
      label: t("product_status"),
      render: (product: any) => {
        const st = (product?.status || "").toLowerCase();
        return <>{st ? <StatusBadge status={st} /> : "-"}</>;

        // <span
        //   className={clsx(
        //     "inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium",
        //     st === "active"
        //       ? "bg-green-400 text-white"
        //       : st === "inactive"
        //         ? "bg-yellow-500/20 text-yellow-600"
        //         : st === "draft"
        //           ? "bg-gray-500/20 text-gray-600"
        //           : isDark
        //             ? "bg-gray-700 text-gray-400"
        //             : "bg-gray-100 text-gray-600",
        //   )}
        // >
        //   {t(st) || st || t("unknown")}
        // </span>
      },
    },

    columnVisibility.price && {
      key: "price",
      label: t("price"),
      sortable: true,
      render: (product: any) => (
        <div>
          {product?.price?.markedPrice != null &&
            product?.price?.sellingPrice != null &&
            product.price.markedPrice !== product.price.sellingPrice && (
              <div className="text-xs text-gray-400 line-through">
                ₪{product.price.markedPrice.toLocaleString()}
              </div>
            )}

          <div className="font-medium">
            {product.price?.sellingPrice != null
              ? `₪${product.price?.sellingPrice}`
              : "-"}
          </div>
        </div>
      ),
    },

    columnVisibility.impact && {
      key: "impact",
      label: t("impact"),
      sortable: true,
      render: (product: any) => (
        <div className={`${textPrimary} line-clamp-1`}>{product.impact}</div>
      ),
    },

    columnVisibility.quantity && {
      key: "quantity",
      label: t("quantity"),
      sortable: true,
      render: (product: any) => (
        <div className={`${textPrimary} line-clamp-1`}>
          {product?.quantity?.isUnlimited
            ? "∞"
            : product.quantity?.remaining
              ? product.quantity?.remaining
              : "-"}
        </div>
      ),
    },

    columnVisibility.updatedAt && {
      key: "updatedAt",
      label: t("last_updated"),
      sortable: true,
      render: (product: any) => (
        <div className={`${textPrimary} line-clamp-1`}>
          {new Date(product.updatedAt).toLocaleDateString(language)}
        </div>
      ),
    },

    // columnVisibility.actions && {
    //   key: "actions",
    //   label: t("actions"),
    //   render: () => (
    //     <button
    //       onClick={(e) => {
    //         e.stopPropagation();
    //         // handleDuplicateProduct(product);
    //       }}
    //       className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
    //     >
    //       <Copy className="w-4 h-4" />
    //     </button>
    //   ),
    // },
  ].filter(Boolean) as {
    key: string;
    label: string;
    width?: string;
    sortable?: boolean;
    render?: (row: any) => React.ReactNode;
  }[];

  return (
    <div
      className={`rounded-xl border ${borderColor} ${bgSecondary} overflow-hidden max-h-[calc(100vh-400px)] overflow-y-auto`}
    >
      <ReordableDataTable
        rowKey="_id"
        data={products}
        isDataLoading={isLoading}
        selectedItems={selectedProducts}
        onSelectionChange={setSelectedProducts}
        onRowClick={(product) => handleProductClick(product)}
        storageKey="productsTableColumnOrder"
        columns={columns}
        hasMore={hasMore}
        next={fetchNextPage}
      />
    </div>
  );
};

export default ProductListView;
