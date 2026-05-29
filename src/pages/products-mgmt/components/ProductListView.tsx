import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader, Package, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { routes } from "@/lib/routes";
import { ReordableDataTable } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { getPlainTextFromRichText } from "@/helpers";
import { StatusPill } from "@/components/pills";
import { useUpdateProductMutation } from "@/store/api/productMutationApi";

const STATUS_OPTIONS = [
  "approved",
  "pending",
  "rejected",
  "closed",
  "archived",
  "draft",
];

const InlineStatusSelect = ({
  product,
  onUpdate,
}: {
  product: any;
  onUpdate: (id: string, status: string) => Promise<boolean>;
}) => {
  const { t } = useTranslation("common");
  const { isDark } = useThemeClasses();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState<string>(product?.status || "");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEditing) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsEditing(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [isEditing]);

  const handleChange = async (status: string) => {
    setIsLoading(true);
    const ok = await onUpdate(product._id, status);
    if (ok) setLocalStatus(status);
    setIsLoading(false);
    setIsEditing(false);
  };

  if (isLoading) {
    return <Loader className="w-4 h-4 animate-spin text-teal-500" />;
  }

  if (!isEditing) {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        className="group/status flex items-center gap-1.5 cursor-pointer w-fit"
      >
        <StatusPill status={localStatus} />
        <Pencil className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover/status:opacity-100 transition-opacity shrink-0" />
      </div>
    );
  }

  return (
    <div ref={ref} onClick={(e) => e.stopPropagation()}>
      <select
        autoFocus
        defaultValue={localStatus.toLowerCase()}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => setIsEditing(false)}
        className={`text-sm border rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-teal-500 ${
          isDark
            ? "bg-gray-800 border-gray-600 text-gray-200"
            : "bg-white border-gray-300 text-gray-900"
        }`}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {t(s) || s}
          </option>
        ))}
      </select>
    </div>
  );
};

const InlineQuantityInput = ({
  product,
  onUpdate,
}: {
  product: any;
  onUpdate: (id: string, remaining: number) => Promise<boolean>;
}) => {
  const { textPrimary, isDark } = useThemeClasses();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localQty, setLocalQty] = useState<{
    isUnlimited: boolean;
    remaining: number;
  }>({
    isUnlimited: product?.quantity?.isUnlimited ?? false,
    remaining: product?.quantity?.remaining ?? 0,
  });
  const [inputValue, setInputValue] = useState<number>(localQty.remaining);

  const handleSave = async () => {
    if (!localQty.isUnlimited && inputValue === localQty.remaining) {
      setIsEditing(false);
      return;
    }
    setIsLoading(true);
    const ok = await onUpdate(product._id, inputValue);
    if (ok) setLocalQty({ isUnlimited: false, remaining: inputValue });
    setIsLoading(false);
    setIsEditing(false);
  };

  if (isLoading) {
    return <Loader className="w-4 h-4 animate-spin text-teal-500" />;
  }

  if (!isEditing) {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          setInputValue(localQty.isUnlimited ? 0 : localQty.remaining);
          setIsEditing(true);
        }}
        className="group/qty flex items-center gap-1.5 cursor-pointer w-fit"
      >
        <span className={`${textPrimary} line-clamp-1`}>
          {localQty.isUnlimited ? "∞" : (localQty.remaining ?? "-")}
        </span>
        <Pencil className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover/qty:opacity-100 transition-opacity shrink-0" />
      </div>
    );
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <input
        type="number"
        autoFocus
        min={0}
        value={inputValue}
        onChange={(e) => setInputValue(Number(e.target.value))}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") setIsEditing(false);
        }}
        className={`w-20 text-sm border rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-teal-500 ${
          isDark
            ? "bg-gray-800 border-gray-600 text-gray-200"
            : "bg-white border-gray-300 text-gray-900"
        }`}
      />
    </div>
  );
};

interface ProductListViewProps {
  products: any[];
  isLoading: boolean;
  hasMore: boolean;
  fetchNextPage: () => void;
  selectedProducts: Set<string>;
  setSelectedProducts: (v: Set<string>) => void;
  columnVisibility: IColumnVisibility;
  refetch: () => void;
}

const ProductListView: React.FC<ProductListViewProps> = ({
  products,
  hasMore,
  fetchNextPage,
  isLoading,
  columnVisibility,
  selectedProducts,
  setSelectedProducts,
  refetch,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("products");
  const { t: tc } = useTranslation("toast");
  const { borderColor, bgSecondary, textPrimary, language } = useThemeClasses();
  const USER_ROLE = "admin";

  const [updateProduct] = useUpdateProductMutation();

  const canChangeStatus = ["superadmin", "admin", "dmo", "authority"].includes(
    USER_ROLE,
  );

  const handleProductClick = (product: any) => {
    navigate(`${routes.productDetails}?productId=${product?._id}`, {
      replace: true,
    });
  };

  const handleStatusUpdate = async (
    productId: string,
    status: string,
  ): Promise<boolean> => {
    const toastId = toast.loading(tc("product_status_change_loading"));
    try {
      await updateProduct({
        productId,
        body: { status: status.toUpperCase() },
      }).unwrap();
      toast.success(tc("product_status_update_success"), { id: toastId });
      refetch();
      return true;
    } catch (error: any) {
      toast.error(error?.message || tc("product_status_update_failed"), {
        id: toastId,
      });
      return false;
    }
  };

  const handleQuantityUpdate = async (
    productId: string,
    remaining: number,
  ): Promise<boolean> => {
    const toastId = toast.loading(tc("product_quantity_change_loading"));
    try {
      await updateProduct({
        productId,
        body: { quantity: { remaining, isUnlimited: false } },
      }).unwrap();
      toast.success(tc("product_quantity_update_success"), { id: toastId });
      refetch();
      return true;
    } catch (error: any) {
      toast.error(error?.message || tc("product_quantity_update_failed"), {
        id: toastId,
      });
      return false;
    }
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
      render: (product: any) => (
        <InlineStatusSelect product={product} onUpdate={handleStatusUpdate} />
      ),
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
        <InlineQuantityInput
          product={product}
          onUpdate={handleQuantityUpdate}
        />
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
  ].filter(Boolean) as {
    key: string;
    label: string;
    width?: string;
    sortable?: boolean;
    render?: (row: any) => React.ReactNode;
  }[];

  return (
    <div className={`rounded-xl border ${borderColor} ${bgSecondary}`}>
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
