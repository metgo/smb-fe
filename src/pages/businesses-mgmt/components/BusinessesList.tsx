import clsx from "clsx";
import { useTranslation } from "react-i18next";
import {
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  Archive,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  Columns,
  ExternalLink,
  UtensilsCrossed,
  Plane,
  Landmark,
  Theater,
  BedDouble,
  Map,
} from "lucide-react";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";

import { useAppSelector } from "@/hooks/hooks";
import { FilterButton } from "@/components/btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { generateMockBusinesses } from "@/constants/data";
import { PageHeader, PageStats, ReordableDataTable } from "@/components/shared";
import {
  useGetAllbusinessesQuery,
  useGetBusinessStatsQuery,
} from "@/store/api/businessQueryApi";

interface BusinessesListProps {
  theme: Theme;
  onBusinessClick: (business: any) => void;
  onCreateNew: () => void;
}

// Simulate user role for permissions
const USER_ROLE = "admin"; // Can be: 'superadmin', 'admin', 'dmo', 'authority', 'business_owner'

// Column configuration
const defaultColumns = {
  impactScore: true,
  businessName: true,
  shortDescription: true,
  contactName: true,
  businessEmail: true,
  phoneNumber: true,
  productsCount: true,
  status: true,
  lifetimeSales: true,
  tripCount: false,
  websiteUrl: false,
  contactPhone: false,
  categories: false,
};

type ColumnVisibility = typeof defaultColumns;

// Column definitions with default status
const columnDefinitions = [
  { key: "impactScore" as keyof ColumnVisibility, isDefault: true },
  { key: "businessName" as keyof ColumnVisibility, isDefault: true },
  { key: "shortDescription" as keyof ColumnVisibility, isDefault: true },
  { key: "contactName" as keyof ColumnVisibility, isDefault: true },
  { key: "businessEmail" as keyof ColumnVisibility, isDefault: true },
  { key: "phoneNumber" as keyof ColumnVisibility, isDefault: true },
  { key: "productsCount" as keyof ColumnVisibility, isDefault: true },
  { key: "status" as keyof ColumnVisibility, isDefault: true },
  { key: "lifetimeSales" as keyof ColumnVisibility, isDefault: true },
  { key: "tripCount" as keyof ColumnVisibility, isDefault: false },
  { key: "websiteUrl" as keyof ColumnVisibility, isDefault: false },
  { key: "contactPhone" as keyof ColumnVisibility, isDefault: false },
  { key: "categories" as keyof ColumnVisibility, isDefault: false },
];

// Category colors for visual distinction
const categoryColors: { [key: string]: string } = {
  "Food & Dining":
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  Cafe: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  Tourism: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  Adventure:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Shopping:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  Culture: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
  Accommodation:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "Eco-Tourism":
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  Workshops:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
};

const defaultCategoryColor =
  "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";

export default function BusinessesList({
  theme,
  onBusinessClick,
  onCreateNew,
}: BusinessesListProps) {
  const { t } = useTranslation("businesses");
  const { isRTL } = useAppSelector((state) => state.settings);
  const { textPrimary, textSecondary } = useThemeClasses();
const [page, setPage] = useState<number>(1);
  const limit = 10;
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [selectedBusinesses, setSelectedBusinesses] = useState<Set<string>>(
    new Set(),
  );
   // Keep all fetched data accumulated here
  const [allData, setAllData] = useState([]);
  const { data: businessStatsData } = useGetBusinessStatsQuery({});
  console.log("busienss stats", businessStatsData);

  const columnSettingsRef = useRef<HTMLDivElement>(null);

  // Filters
  const [filters, setFilters] = useState({
    authority: "all",
    dmo: "all",
    status: "all",
    hasProducts: "all",
    impactMin: 200,
    impactMax: 800,
    dateFrom: "",
    dateTo: "",
  });

  // Column visibility - load from localStorage or use defaults
  const [visibleColumns, setVisibleColumns] = useState<ColumnVisibility>(() => {
    try {
      const saved = localStorage.getItem("businessesTableColumns");
      if (saved) {
        return { ...defaultColumns, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error("Failed to load column settings:", e);
    }
    return defaultColumns;
  });

  // Save column visibility to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        "businessesTableColumns",
        JSON.stringify(visibleColumns),
      );
    } catch (e) {
      console.error("Failed to save column settings:", e);
    }
  }, [visibleColumns]);

  // Close column settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        columnSettingsRef.current &&
        !columnSettingsRef.current.contains(event.target as Node)
      ) {
        setShowColumnSettings(false);
      }
    };

    if (showColumnSettings) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColumnSettings]);

  // Sorting
  const [sortColumn] = useState<string | null>(null);
  const [sortDirection] = useState<"asc" | "desc">("asc");

  // Infinite scroll
  const [displayCount, setDisplayCount] = useState(50);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: businessData, isLoading: _isLoading } =
    useGetAllbusinessesQuery({
      search: searchTerm,
      page: String(1),
      limit: String(10),
      // eventType: eventTypeFilter.toUpperCase()
    });
  // Load mock data
  useEffect(() => {
    try {
      const data = generateMockBusinesses(200);
      setBusinesses(data);
    } catch (err) {
      setError(true);
    }
  }, []);

  console.log("businessData:", businessData);

  // Filter and sort logic
  const filteredBusinesses = useMemo(() => {
    let filtered = [...businesses];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.name.toLowerCase().includes(term) ||
          b.email.toLowerCase().includes(term) ||
          b.phone.toLowerCase().includes(term),
      );
    }

    // // Authority filter
    // if (filters.authority !== "all") {
    //   filtered = filtered.filter((b) => b.authority === filters.authority);
    // }

    // // DMO filter
    // if (filters.dmo !== "all") {
    //   filtered = filtered.filter((b) => b.dmo === filters.dmo);
    // }

    // // Status filter
    // if (filters.status !== "all") {
    //   filtered = filtered.filter((b) => b.status === filters.status);
    // }

    // // Has products filter
    // if (filters.hasProducts !== "all") {
    //   const hasProducts = filters.hasProducts === "yes";
    //   filtered = filtered.filter((b) => b.productsCount > 0 === hasProducts);
    // }

    // // Impact range filter
    // filtered = filtered.filter(
    //   (b) =>
    //     b.impactScore >= filters.impactMin &&
    //     b.impactScore <= filters.impactMax,
    // );

    // // Date range filter
    // if (filters.dateFrom) {
    //   filtered = filtered.filter(
    //     (b) => new Date(b.createdAt) >= new Date(filters.dateFrom),
    //   );
    // }
    // if (filters.dateTo) {
    //   filtered = filtered.filter(
    //     (b) => new Date(b.createdAt) <= new Date(filters.dateTo),
    //   );
    // }

    // // Sorting
    // if (sortColumn) {
    //   filtered.sort((a, b) => {
    //     const aVal = a[sortColumn];
    //     const bVal = b[sortColumn];

    //     if (typeof aVal === "string" && typeof bVal === "string") {
    //       return sortDirection === "asc"
    //         ? aVal.localeCompare(bVal)
    //         : bVal.localeCompare(aVal);
    //     }

    //     if (typeof aVal === "number" && typeof bVal === "number") {
    //       return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    //     }

    //     return 0;
    //   });
    // }

    return filtered;
  }, [businesses, searchTerm, filters, sortColumn, sortDirection]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      setDisplayCount((prev) => Math.min(prev + 50, filteredBusinesses.length));
    }
  }, [filteredBusinesses.length]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Column toggle handler
  const toggleColumn = (column: keyof ColumnVisibility) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  // Reset to default columns
  const resetToDefault = () => {
    setVisibleColumns(defaultColumns);
  };

  // Bulk actions
  const handleBulkApprove = () => {
    console.log("Bulk approve:", Array.from(selectedBusinesses));
    setSelectedBusinesses(new Set());
  };

  const handleBulkReject = () => {
    console.log("Bulk reject:", Array.from(selectedBusinesses));
    setSelectedBusinesses(new Set());
  };

  const handleBulkArchive = () => {
    console.log("Bulk archive:", Array.from(selectedBusinesses));
    setSelectedBusinesses(new Set());
  };

  const handleExport = () => {
    console.log("Export businesses");
  };

  // Get unique values for filters
  const authorities = useMemo(
    () => Array.from(new Set(businesses.map((b: any) => b.authority))),
    [businesses],
  );
  const dmos = useMemo(
    () => Array.from(new Set(businesses.map((b: any) => b.dmo))),
    [businesses],
  );

  // Permission check
  const canChangeStatus = ["superadmin", "admin", "dmo", "authority"].includes(
    USER_ROLE,
  );

  const displayedBusinesses = filteredBusinesses.slice(0, displayCount);

  // Categories badge component
  const CategoriesBadges = ({ categories }: { categories: string[] }) => {
    // Show max 2 categories with +X more indicator
    const displayCategories = categories.slice(0, 2);
    const remaining = categories.length - 2;

    return (
      <div className="flex flex-wrap gap-1">
        {displayCategories.map((category: any, index: number) => (
          <span
            key={index}
            className={`px-2 py-0.5 rounded-full text-xs ${
              categoryColors[category] || defaultCategoryColor
            }`}
          >
            {category}
          </span>
        ))}
        {remaining > 0 && (
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${defaultCategoryColor}`}
          >
            +{remaining}
          </span>
        )}
      </div>
    );
  };
  const columns = [
    ...(canChangeStatus ? [{ key: "checkbox", label: "", width: "50px" }] : []),
    {
      key: "_id",
      label: "id",
    },
    {
      key: "impact",
      label: t("impact_score"),
      sortable: true,
      width: "110px",
      render: (business: any) => {
        const score = business.impact ?? 0;
        return (
          <span
            className={clsx(
              "inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-medium",
              score >= 650
                ? theme === "dark"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-green-100 text-green-700"
                : score >= 450
                  ? theme === "dark"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-yellow-100 text-yellow-700"
                  : theme === "dark"
                    ? "bg-gray-700 text-gray-400"
                    : "bg-gray-100 text-gray-600",
            )}
          >
            {score}
          </span>
        );
      },
    },

    {
      key: "name",
      label: t("business_name"),
      sortable: true,
      render: (business: any) => (
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              theme === "dark" ? "bg-teal-500/10" : "bg-teal-50",
            )}
          >
            {/* You can add icon logic later when categories arrive */}
          </div>
          <span className={textPrimary}>
            {business.name || business.slug || t("unnamed_business") || "-"}
          </span>
        </div>
      ),
    },

    {
      key: "busiEmail",
      label: t("business_email"),
      render: (business: any) => (
        <span className={textSecondary}>{business.busiEmail || "-"}</span>
      ),
    },

    {
      key: "phoneNumber",
      label: t("phone_number"),
      render: (business: any) => (
        <span className={clsx(textSecondary, "whitespace-nowrap")}>
          {business.phoneNumber || "-"}
        </span>
      ),
    },

    {
      key: "productCount",
      label: t("products_count"),
      sortable: true,
      render: (business: any) => (
        <span className={textPrimary}>{business.productCount ?? 0}</span>
      ),
    },

    {
      key: "status",
      label: t("status"),
      sortable: true,
      render: (business: any) => {
        const st = (business.status || "").toLowerCase();
        return (
          <span
            className={clsx(
              "inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium",
              st === "approved"
                ? "bg-blue-500/20 text-blue-400"
                : st === "pending"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : st === "rejected"
                    ? "bg-red-500/20 text-red-400"
                    : st === "draft"
                      ? theme === "dark"
                        ? "bg-gray-700 text-gray-400"
                        : "bg-gray-100 text-gray-600"
                      : "bg-gray-600/20 text-gray-400",
            )}
          >
            {t(st) || st || t("unknown")}
          </span>
        );
      },
    },

    {
      key: "tripCount",
      label: t("trips"),
      sortable: true,
      render: (business: any) => (
        <span className={textPrimary}>{business.tripCount ?? 0}</span>
      ),
    },

    {
      key: "associatedWebsites",
      label: t("website"),
      render: (business: any) => {
        const sites = business.associatedWebsites || [];
        if (!sites.length) return <span className={textSecondary}>-</span>;

        // Show first valid URL (or the most relevant one)
        const mainSite = sites.find((s: any) => s.url) || sites[0];
        if (!mainSite?.url) return <span className={textSecondary}>-</span>;

        try {
          const url = new URL(mainSite.url);
          return (
            <a
              href={mainSite.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-teal-500 hover:text-teal-400 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm">{url.hostname}</span>
            </a>
          );
        } catch {
          return <span className={textSecondary}>{mainSite.url}</span>;
        }
      },
    },

  
  ];
 

  // Helper function to get column label
  const getColumnLabel = (key: keyof ColumnVisibility): string => {
    const labelMap: { [K in keyof ColumnVisibility]: string } = {
      impactScore: t("impactScore"),
      businessName: t("businessName"),
      shortDescription: t("shortDescription"),
      contactName: t("contactPerson"),
      businessEmail: t("businessEmail"),
      phoneNumber: t("phoneNumber"),
      productsCount: t("productsCount"),
      status: t("status"),
      lifetimeSales: t("lifetimeSales"),
      tripCount: t("tripCount") || "Trip Count",
      websiteUrl: t("websiteUrl"),
      contactPhone: t("contactPhone") || "Contact Phone",
      categories: t("categories"),
    };
    return labelMap[key];
  };

  // Calculate trip count (mock - in real app would come from backend)
  const getTripCount = (business: any): number => {
    // Mock calculation based on products count and impact score
    return Math.floor((business.productCount * business.impact) / 10);
  };

  // Get category icon based on main category
  // const getCategoryIcon = (categories: string[]) => {
  //   const mainCategory = categories[0]?.toLowerCase() || "";

  //   if (
  //     mainCategory.includes("food") ||
  //     mainCategory.includes("dining") ||
  //     mainCategory.includes("cafe")
  //   ) {
  //     return <UtensilsCrossed className="w-5 h-5" />;
  //   }
  //   if (mainCategory.includes("tourism") || mainCategory.includes("travel")) {
  //     return <Plane className="w-5 h-5" />;
  //   }
  //   if (
  //     mainCategory.includes("adventure") ||
  //     mainCategory.includes("attraction")
  //   ) {
  //     return <Landmark className="w-5 h-5" />;
  //   }
  //   if (mainCategory.includes("culture")) {
  //     return <Theater className="w-5 h-5" />;
  //   }
  //   if (
  //     mainCategory.includes("accommodation") ||
  //     mainCategory.includes("sleep")
  //   ) {
  //     return <BedDouble className="w-5 h-5" />;
  //   }
  //   if (
  //     mainCategory.includes("local") ||
  //     mainCategory.includes("shopping") ||
  //     mainCategory.includes("eco")
  //   ) {
  //     return <Map className="w-5 h-5" />;
  //   }
  //   // Default icon
  //   return <Map className="w-5 h-5" />;
  // };

  // Loading state
  // if (loading) {
  //   return (
  //     <div className="flex-1 flex items-center justify-center">
  //       <div className="text-center">
  //         <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-teal-600" />
  //         <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
  //           {t('loadingBusinesses')}
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <h3
            className={`text-xl mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
          >
            {t("error_loading_businesses")}
          </h3>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            {t("retry") || "Retry"}
          </button>
        </div>
      </div>
    );
  }

  const businessStats = [
    {
      id: 1,
      title: t("total_businesses") || "Total Businesses",
      value: businessStatsData?.totalBusinesses,
      label: t("registered") || "Registered",
      icon: <Map className="w-5 h-5 text-purple-600" />,
    },
    {
      id: 2,
      title: t("active_businesses") || "Active Businesses",
      value: businessStatsData?.activeBusinesses,
      label: t("approved") || "Approved",
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    },
    {
      id: 3,
      title: t("total_products") || "Total Products",
      value: businessStatsData?.totalProducts,
      label: t("listed") || "Listed",
      icon: <UtensilsCrossed className="w-5 h-5 text-blue-600" />,
    },
    {
      id: 4,
      title: t("avg_impact") || "Avg. Impact",
      value: businessStatsData?.averageImpactScore,
      label: t("score") || "Score",
      icon: <Theater className="w-5 h-5 text-orange-600" />,
    },
    {
      id: 5,
      title: t("pending_approval") || "Pending Approval",
      value: businessStatsData?.pendingApproval,
      label: t("awaiting") || "Awaiting",
      icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
    },
    {
      id: 6,
      title: t("avg_completion") || "Avg. Completion",
      value: businessStatsData?.averageCompletion,
      label: t("profile_data") || "Profile Data",
      icon: <Landmark className="w-5 h-5 text-teal-600" />,
    },
  ];

  return (
    <div className="flex flex-col overflow-hidden h-[calc(108vh-210px)] px-4 ">
      {/* Sticky Header */}
      <div
        className={`border-b ${
          theme === "dark"
            ? "bg-gray-900/50 border-gray-800"
            : "bg-transparent border-gray-200"
        } sticky top-0 z-10`}
      >
        <PageHeader
          title={t("businesses_management")}
          description={t("businesses_management_desc")}
          btnLabel={t("add_business")}
          onClick={onCreateNew}
          h1Gradient="bg-linear-to-r  text-transparent from-blue-500 via-indigo-600 to-purple-600"
        />
        <PageStats
          stats={businessStats}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
        />

        {/* Search and Filters */}
        <div className="py-4 flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-5 h-5 ${
                theme === "dark" ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <input
              type="text"
              placeholder={t("search_businesses_placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} py-2 rounded-lg border ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              } focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
          </div>

          <FilterButton value={showFilters} onChange={setShowFilters} />

          {/* Column Settings */}
          <div className="relative" ref={columnSettingsRef}>
            <button
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${
                theme === "dark"
                  ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                  : "border-gray-300 hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Columns className="w-5 h-5" />
              {t("show_columns")}
              {showColumnSettings ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* Column Settings Dropdown */}
            {showColumnSettings && (
              <div
                className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-72 rounded-lg shadow-lg border z-20 ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div
                  className={`p-4 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className={`text-sm ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}
                    >
                      {t("column_settings") || "Column Settings"}
                    </h3>
                    <button
                      onClick={resetToDefault}
                      className="text-xs text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      {t("reset_to_default") || "Reset to Default"}
                    </button>
                  </div>
                  <p
                    className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {t("select_columns_to_display") ||
                      "Select columns to display"}
                  </p>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {/* Default Columns */}
                  <div
                    className={`p-3 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
                  >
                    <p
                      className={`text-xs mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {t("default_columns") || "Default Columns"}
                    </p>
                    {columnDefinitions
                      .filter((col) => col.isDefault)
                      .map((col) => (
                        <label
                          key={col.key}
                          className={`flex items-center gap-2 px-2 py-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={visibleColumns[col.key]}
                            onChange={() => toggleColumn(col.key)}
                            className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="text-sm">
                            {getColumnLabel(col.key)}
                          </span>
                        </label>
                      ))}
                  </div>

                  {/* Optional Columns */}
                  <div className="p-3">
                    <p
                      className={`text-xs mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {t("optional_columns") || "Optional Columns"}
                    </p>
                    {columnDefinitions
                      .filter((col) => !col.isDefault)
                      .map((col) => (
                        <label
                          key={col.key}
                          className={`flex items-center gap-2 px-2 py-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={visibleColumns[col.key]}
                            onChange={() => toggleColumn(col.key)}
                            className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="text-sm">
                            {getColumnLabel(col.key)}
                          </span>
                        </label>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${
              theme === "dark"
                ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                : "border-gray-300 hover:bg-gray-100 text-gray-700"
            }`}
          >
            <Download className="w-5 h-5" />
            {t("export")}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div
            className={`pb-4 border-t ${
              theme === "dark"
                ? "border-gray-800 bg-gray-900/30"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {/* Authority Filter */}
              <div>
                <label
                  className={`block text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                >
                  {t("authority")}
                </label>
                <select
                  value={filters.authority}
                  onChange={(e) =>
                    setFilters({ ...filters, authority: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700 text-gray-200"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                >
                  <option value="all">{t("all")}</option>
                  {authorities.map((auth: any) => (
                    <option key={auth} value={auth}>
                      {auth}
                    </option>
                  ))}
                </select>
              </div>

              {/* DMO Filter */}
              <div>
                <label
                  className={`block text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                >
                  {t("dmo")}
                </label>
                <select
                  value={filters.dmo}
                  onChange={(e) =>
                    setFilters({ ...filters, dmo: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700 text-gray-200"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                >
                  <option value="all">{t("all")}</option>
                  {dmos.map((dmo: any) => (
                    <option key={dmo} value={dmo}>
                      {dmo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label
                  className={`block text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                >
                  {t("status")}
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700 text-gray-200"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                >
                  <option value="all">{t("all")}</option>
                  <option value="draft">{t("draft")}</option>
                  <option value="pending">{t("pending")}</option>
                  <option value="approved">{t("approved")}</option>
                  <option value="rejected">{t("rejected")}</option>
                  <option value="archived">{t("archived")}</option>
                </select>
              </div>

              {/* Has Products Filter */}
              <div>
                <label
                  className={`block text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                >
                  {t("has_products")}
                </label>
                <select
                  value={filters.hasProducts}
                  onChange={(e) =>
                    setFilters({ ...filters, hasProducts: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700 text-gray-200"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                >
                  <option value="all">{t("all")}</option>
                  <option value="yes">{t("yes")}</option>
                  <option value="no">{t("no")}</option>
                </select>
              </div>
            </div>

            <button
              onClick={() =>
                setFilters({
                  authority: "all",
                  dmo: "all",
                  status: "all",
                  hasProducts: "all",
                  impactMin: 0,
                  impactMax: 10,
                  dateFrom: "",
                  dateTo: "",
                })
              }
              className="mt-3 px-4 py-2 text-sm text-teal-600 hover:text-teal-700 transition-colors"
            >
              {t("clear_all")}
            </button>
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedBusinesses.size > 0 && canChangeStatus && (
          <div
            className={`px-6 py-3 border-t flex items-center justify-between ${
              theme === "dark"
                ? "border-gray-800 bg-teal-900/20"
                : "border-gray-200 bg-teal-50"
            }`}
          >
            <span
              className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
            >
              {selectedBusinesses.size} {t("selected")}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkApprove}
                className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center gap-1"
              >
                <CheckCircle className="w-4 h-4" />
                {t("approve")}
              </button>
              <button
                onClick={handleBulkReject}
                className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center gap-1"
              >
                <XCircle className="w-4 h-4" />
                {t("reject")}
              </button>
              <button
                onClick={handleBulkArchive}
                className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors flex items-center gap-1"
              >
                <Archive className="w-4 h-4" />
                {t("archive")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table with horizontal scroll */}
      <div ref={scrollContainerRef} className="flex-1 overflow-auto py-6">
        {displayedBusinesses.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3
                className={`text-lg mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                {t("no_businesses_found")}
              </h3>
              <p
                className={`text-sm ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}
              >
                {t("no_businesses_found_desc")}
              </p>
            </div>
          </div>
        ) : (
          <div
            className={`rounded-2xl ${theme === "dark" ? "bg-gray-900/50" : "bg-white"}`}
          >
            <ReordableDataTable
              rowKey="_id"
              data={businessData?.data}
              // selectedItems={selectedBusinesses}
              // onSelectionChange={setSelectedBusinesses}
              onRowClick={(business) => onBusinessClick(business)}
              storageKey="businessesTableColumnOrder"
              columns={columns}
            />
          </div>
        )}

        {/* Loading more indicator */}
        {displayCount < filteredBusinesses.length && (
          <div className="flex items-center justify-center py-4">
            <Loader className="w-5 h-5 animate-spin text-teal-600" />
          </div>
        )}
      </div>
    </div>
  );
}
