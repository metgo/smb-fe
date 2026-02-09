import { useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useAppSelector } from "@/hooks/hooks";

const businessId = "";

export function useProductMgmt() {
  const { t, i18n } = useTranslation("products");
  const language = (
    ["en", "he", "ar"].includes(i18n.language) ? i18n.language : "en"
  ) as Language;
  const { isDark } = useThemeClasses();
  const { isRTL } = useAppSelector((state) => state.settings);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set(),
  );
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [businessFilter, setBusinessFilter] = useState<string>(
    businessId || "all",
  );

  // Sorting
  const [sortField, setSortField] = useState<
    "name" | "price" | "soldCount" | null
  >(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // // Mock data - In production, this would come from API
  // const [products, setProducts] = useState<Product[]>(generateMockProducts());

  // Filter products
  // const filteredProducts = products.filter((product) => {
  //   // Business filter (if in business context)
  //   if (businessId && product.businessId !== businessId) return false;

  //   // Search
  //   const searchLower = searchQuery?.toLowerCase();
  //   const nameMatch = Object.values(product.name).some((n) =>
  //     n.toLowerCase().includes(searchLower),
  //   );
  //   const businessMatch = product.businessId
  //     ?.toLowerCase()
  //     .includes(searchLower);
  //   if (searchQuery && !nameMatch && !businessMatch) return false;

  //   // Status filter
  //   if (statusFilter !== "all" && product.status !== statusFilter) return false;

  //   // Type filter
  //   if (typeFilter !== "all" && product.type !== typeFilter) return false;

  //   // Business filter (global view)
  //   if (
  //     !businessId &&
  //     businessFilter !== "all" &&
  //     product.businessId !== businessFilter
  //   )
  //     return false;

  //   return true;
  // });

  // Sort products
  // const sortedProducts = filteredProducts.sort((a, b) => {
  //   if (!sortField) return 0;
  //   if (sortField === "name") {
  //     const nameA = a.name[language].toLowerCase();
  //     const nameB = b.name[language].toLowerCase();
  //     if (nameA < nameB) return sortDirection === "asc" ? -1 : 1;
  //     if (nameA > nameB) return sortDirection === "asc" ? 1 : -1;
  //     return 0;
  //   }
  //   if (sortField === "price") {
  //     return sortDirection === "asc"
  //       ? a.sellingPrice - b.sellingPrice
  //       : b.sellingPrice - a.sellingPrice;
  //   }
  //   if (sortField === "soldCount") {
  //     return sortDirection === "asc"
  //       ? a.soldCount - b.soldCount
  //       : b.soldCount - a.soldCount;
  //   }
  //   return 0;
  // });

  // Bulk actions
  // const handleSelectAll = () => {
  //   if (selectedProducts.size === sortedProducts.length) {
  //     setSelectedProducts(new Set());
  //   } else {
  //     setSelectedProducts(new Set(sortedProducts.map((p) => p._id)));
  //   }
  // };

  // const handleBulkStatusChange = (newStatus: Product["status"]) => {
  //   setProducts((prev) =>
  //     prev.map((p) =>
  //       selectedProducts.has(p._id) ? { ...p, status: newStatus } : p,
  //     ),
  //   );
  //   setSelectedProducts(new Set());
  // };

  // const handleDuplicateProduct = (product: Product) => {
  //   const duplicated: Product = {
  //     ...product,
  //     id: `product-${Date.now()}`,
  //     name: {
  //       en: `${product.name.en} (Copy)`,
  //       he: `${product.name.he} (העתק)`,
  //       ar: `${product.name.ar} (نسخة)`,
  //     },
  //     status: "draft",
  //     soldCount: 0,
  //     availability: {
  //       startDate: null,
  //       endDate: null,
  //     },
  //     lastUpdated: new Date().toISOString(),
  //   };
  //   setProducts((prev) => [duplicated, ...prev]);
  // };

  // const handleProductSubmit = (formData: any, status: "draft" | "pending") => {
  //   const newProduct: Product = {
  //     id:
  //       isEditing && selectedProduct
  //         ? selectedProduct.id
  //         : `product-${Date.now()}`,
  //     name: formData.name,
  //     shortDescription: formData.shortDescription,
  //     businessId: formData.businessId,
  //     businessName:
  //       businesses.find((b) => b.id === formData.businessId)?.name || "",
  //     type: formData.type,
  //     status: status === "pending" ? "pending" : "draft",
  //     markedPrice: parseFloat(formData.markedPrice) || 0,
  //     sellingPrice: parseFloat(formData.sellingPrice),
  //     quantity: formData.isUnlimited ? null : parseInt(formData.quantity),
  //     soldCount: 0,
  //     availability: {
  //       startDate: formData.startDate || null,
  //       endDate: formData.endDate || null,
  //     },
  //     categories: formData.categories,
  //     image: formData.mainImage,
  //     lastUpdated: new Date().toISOString(),
  //     languageCompleteness: {
  //       en: !!formData.name.en,
  //       he: !!formData.name.he,
  //       ar: !!formData.name.ar,
  //     },
  //   };

  //   if (isEditing && selectedProduct) {
  //     setProducts((prev) =>
  //       prev.map((p) => (p.id === selectedProduct.id ? newProduct : p)),
  //     );
  //   } else {
  //     setProducts((prev) => [newProduct, ...prev]);
  //   }

  //   setIsCreating(false);
  //   setIsEditing(false);
  //   setSelectedProduct(null);
  // };

  // Calculate sales metrics
  // const totalRevenue = sortedProducts.reduce(
  //   (sum, p) => sum + p.sellingPrice * p.soldCount,
  //   0,
  // );
  // const totalItemsSold = sortedProducts.reduce(
  //   (sum, p) => sum + p.soldCount,
  //   0,
  // );
  // const avgProductPrice =
  //   sortedProducts.length > 0
  //     ? sortedProducts.reduce((sum, p) => sum + p.sellingPrice, 0) /
  //       sortedProducts.length
  //     : 0;

  // Calculate revenue for products updated this month
  // const currentMonth = new Date().getMonth();
  // const currentYear = new Date().getFullYear();
  // const revenueThisMonth = sortedProducts
  //   .filter((p) => {
  //     const updated = new Date(p.lastUpdated);
  //     return (
  //       updated.getMonth() === currentMonth &&
  //       updated.getFullYear() === currentYear
  //     );
  //   })
  //   .reduce((sum, p) => sum + p.sellingPrice * p.soldCount, 0);
  const totalRevenue = 0;
  const salesMetrics = {
    totalRevenue,
    itemsSold: 0,
    avgPrice: 0,
    monthlyRevenue: 0,
  };

  // Product type labels
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

  // Status badge
  const getStatusBadge = (status: Product["status"]) => {
    const badges = {
      draft: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
      pending:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
      approved:
        "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
      rejected: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
      archived: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
      active:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
      inactive: "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
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

  // Handle sorting
  const handleSort = (field: "name" | "price" | "soldCount") => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to asc
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get sort icon
  const getSortIcon = (field: "name" | "price" | "soldCount") => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 opacity-40" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
    ) : (
      <ArrowDown className="w-4 h-4 text-teal-600 dark:text-teal-400" />
    );
  };

  return {
    t,
    isRTL,
    language,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    isEditing,
    setIsEditing,
    selectedProduct,
    setSelectedProduct,
    selectedProducts,
    setSelectedProducts,
    // sortedProducts,
    setSortDirection,
    isDark,
    showFilters,
    setShowFilters,
    isCreating,
    setIsCreating,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    businessFilter,
    setBusinessFilter,
    // handleSelectAll,
    // handleBulkStatusChange,
    // handleDuplicateProduct,
    // // handleProductSubmit,
    salesMetrics,
    getProductTypeLabel,
    getStatusBadge,
    handleSort,
    getSortIcon,
  };
}
