import { useTranslation } from "react-i18next";
import UserStatsCards from "@/components/shared/UserStatsCards";
import {
  useState,
  useEffect,
  useMemo,
  useRef,
  Activity,
  useCallback,
} from "react";
import {
  Download,
  // Plus,
  ChevronDown,
  ChevronUp,
  Loader,
  AlertCircle,
  Columns,
  Mail,
  Phone,
  DollarSign,
  TrendingUp,
  Camera,
  ShoppingCart,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";

import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  BulkActionBar,
  ConfirmDialog,
  FilterChips,
  PageHeader,
  PageStats,
  ViewModeToggle,
} from "@/components/shared";
import {
  // CreateOrderWizard,
  FilterSelect,
  MonthFilter,
  OrderDetailsModal,
  QRScannerModal,
} from "./components";
import {
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useGetOrderStatsQuery,
  // useGetOrderStatsQuery,
} from "@/store/api/orderQueryApi";
import { FilterButton } from "@/components/btns";
import { toast } from "sonner";
import SearchInput from "@/components/shared/SearchInput";
import OrderListView from "../products-mgmt/components/sub-components/OrderListView";
import OrderGridView from "../products-mgmt/components/sub-components/OrderGridView";
import { useBulkOrdersUpdateMutation } from "@/store/api/orderMutationApi";
import { UserRole } from "@/enums/user.types";

// Default columns configuration
const defaultColumns = {
  firstName: true,
  email: true,
  phone: true,
  status: true,
  totalAmount: true,
  // paymentStatus: false,
  deliveryFee: true,
  createdAt: true,
  paymentDate: true,
};

type ColumnVisibility = typeof defaultColumns;

export default function OrdersMgmtPage() {
  const { t, i18n } = useTranslation("orders");
  const { t: tb } = useTranslation("businesses");

  const { isRTL, theme } = useAppSelector((state) => state.settings);
  const language = i18n.language;

  const { textSecondary, textTertiary, isDark } = useThemeClasses();
  //view mode toggle
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const { userRole } = useAppSelector((state) => state.auth);

  // const [orders, setOrders] = useState<IOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  // const [showAddOrderWizard, setShowAddOrderWizard] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const columnSettingsRef = useRef<HTMLDivElement>(null);
  const [bulkOrdersUpdate] = useBulkOrdersUpdateMutation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  //camera persmissions
  const [stream, setStream] = useState<MediaStream | null>(null);

  //  clean up on unmount / close
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  async function getVideoStream() {
    try {
      const permissionStatus = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });

      if (permissionStatus.state === "denied") {
        console.error("Camera permission has been denied");
        return;
      }
    } catch (error) {
      console.error("Error checking camera permissions:", error);
    }

    let newStream: MediaStream | null = null;

    try {
      newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          // facingMode: "user"       //  front camera
        },
      });

      setStream(newStream);
      setShowQRScanner(true);
    } catch (error) {
      console.error("Error getting video stream:", error);
      alert("Cannot access camera: " + (error as Error).message);
    }
  }
  // Cleanup function call this on close
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop(); //  this is what turns off the camera
      });
      setStream(null);
      setShowQRScanner(false);
    }
  }, [stream]);

  // clean up if component unmounts while stream is active
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);
  const fetchNextPage = () => {
    if (!hasMore || isFetching) return;
    setPage((prev) => {
      return prev + 1;
    });
  };

  // Filters
  const [filters, setFilters] = useState({
    orderType: "all",
    paymentMethod: "all",
    vendor: "all",
    campaign: "all",
    deliveryType: "all",
    status: "all",
    startDate: "",
    endDate: "",
    month: "all", // 'all', 'MM-YYYY', or 'custom'
  });
  // utils/dateFormatter.ts
  const formatOrderDate = (dateString: string, language: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString(language, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  //active filter chips
  const activeFilterChips = useMemo(() => {
    const chips: { key: string; value: string }[] = [];

    if (filters.deliveryType !== "all")
      chips.push({
        key: "deliveryType",
        value: t(filters.deliveryType),
      });
    if (filters.status !== "all")
      chips.push({
        key: "status",
        value: t(filters.status),
      });

    if (filters.paymentMethod !== "all")
      chips.push({
        key: "paymentMethod",
        value: filters.paymentMethod,
      });

    if (filters.month !== "all" && filters.month !== "custom")
      chips.push({ key: "month", value: filters.month });

    if (filters.month === "custom") {
      if (filters.startDate)
        chips.push({
          key: "dateFrom",
          value: filters.startDate,
        });

      if (filters.endDate)
        chips.push({ key: "dateTo", value: filters.endDate });
    }

    return chips;
  }, [filters]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filters]);
  const { dmoId, authorityId, websiteId } = useAppSelector(
    (state) => state.auth,
  );
  const canViewOrders =
    userRole === UserRole.SUPERADMIN || userRole === UserRole.TRAVELLER;
  const [combinedOrders, setCombinedOrders] = useState<any[]>([]);
  console.log("🚀 ~ OrdersMgmtPage ~ combinedOrders:", combinedOrders);

  const orderQueryParams = useMemo(() => {
    const params: any = {
      page,
      limit,
      dmoId,
      authorityId,

      websiteId,
    };

    if (searchTerm) params.search = searchTerm;

    if (filters.orderType !== "all") {
      params.orderType = filters.orderType;
    }

    if (filters.deliveryType !== "all") {
      params.deliveryType = filters.deliveryType;
    }

    if (filters.paymentMethod !== "all") {
      params.paymentMethod = filters.paymentMethod;
    }
    if (filters.status !== "all") {
      params.status = filters.status;
    }

    // Month filter
    if (filters.month !== "all" && filters.month !== "custom") {
      const [month, year] = filters.month.split("-");

      const firstDay = new Date(Number(year), Number(month) - 1, 1);
      const lastDay = new Date(Number(year), Number(month), 0);

      params.startDate = firstDay.toISOString().split("T")[0];
      params.endDate = lastDay.toISOString().split("T")[0];
    }

    // Custom date range
    if (filters.month === "custom") {
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
    }

    return params;
  }, [page, limit, searchTerm, filters, authorityId, dmoId, websiteId]);
  console.log("🚀 ~ OrdersMgmtPage ~ filters:", filters);

  const { data: orderStat, isLoading: isStatsLoading } =
    useGetOrderStatsQuery(orderQueryParams);

  const {
    data: orders,
    isLoading,

    refetch,
    isFetching,
  } = useGetAllOrdersQuery(orderQueryParams);
  const hasMore = orders?.meta?.hasNextPage;
  const totalData = orders?.totalData;
  const orderss = orders?.data ?? [];

  //update combined order when filters change so combined orders doesnt show stale value
  useEffect(() => {
    setCombinedOrders([]);
    setPage(1);
  }, [searchTerm, filters, authorityId, dmoId, websiteId]);

  useEffect(() => {
    if (!orderss?.length) return;

    if (page === 1) {
      setCombinedOrders(orderss);
    } else {
      setCombinedOrders((prev) => {
        // Prevent duplicates (important!)
        const existingIds = new Set(prev.map((b) => b._id));
        const newItems = orderss.filter((b: any) => !existingIds.has(b._id));

        return [...prev, ...newItems];
      });
    }
  }, [orderss, page]);

  const defaultFilters = {
    orderType: "all",
    deliveryType: "all",
    paymentMethod: "all",
    vendor: "all",
    status: "all",
    campaign: "all",
    month: "all",
    startDate: "",
    endDate: "",
  };

  // Column visibility
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibility>(defaultColumns);
  const columns = [
    { key: "checkbox", label: "", width: "50px" },

    columnVisibility.firstName && {
      key: "firstName",
      label: t("purchaser_name_field"),
      sortable: true,
      render: (order: IOrder) => (
        <div className="text-sm">{order.firstName}</div>
      ),
    },

    columnVisibility.email && {
      key: "email",
      label: t("purchaser_email"),
      render: (order: IOrder) => (
        <a
          href={`mailto:${order.email}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-sm text-teal-500 hover:text-teal-600"
        >
          <Mail className="w-3 h-3" />
          {order.email}
        </a>
      ),
    },

    columnVisibility.phone && {
      key: "phone",
      label: t("purchaser_phone"),
      render: (order: IOrder) => (
        <a
          href={`tel:${order.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-sm text-teal-500 hover:text-teal-600"
        >
          <Phone className="w-3 h-3" />
          {order.phone}
        </a>
      ),
    },

    columnVisibility.status && {
      key: "status",
      label: t("order_status"),
      render: (order: IOrder) => getOrderStatusBadge(order.status),
    },

    columnVisibility.totalAmount && {
      key: "totalAmount",
      label: t("price"),
      sortable: true,
      render: (order: IOrder) => (
        <div className="text-sm font-medium">
          ₪{order?.totalAmount?.toLocaleString()}
        </div>
      ),
    },
    columnVisibility.deliveryFee && {
      key: "deliveryFee",
      label: t("deliveryFee"),
      sortable: true,
      render: (order: IOrder) => (
        <div className="text-sm font-medium">
          {order?.deliveryFee ? `₪${order.deliveryFee.toLocaleString()}` : "-"}
        </div>
      ),
    },

    columnVisibility.createdAt && {
      key: "createdAt",
      label: t("created_date"),
      sortable: true,
      render: (order: IOrder) => (
        <div className="text-sm text-gray-500">
          {formatOrderDate(order.createdAt, language)}
        </div>
      ),
    },

    columnVisibility.paymentDate && {
      key: "paymentDate",
      label: t("payment_date"),
      sortable: true,
      render: (order: IOrder) => (
        <div className="text-sm text-gray-500">
          {formatOrderDate(order.paymentDate, language)}
        </div>
      ),
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    width?: string;
    sortable?: boolean;
    render?: (row: IOrder) => React.ReactNode;
  }[];

  //order details
  const {
    data: orderDetails,
    refetch: orderIdrefetch,
    isLoading: isOrderDetailLoading,
    isFetching: isOrderDetailFetching,
  } = useGetOrderByIdQuery(
    { orderId: selectedOrder?._id ?? null },
    {
      skip: !selectedOrder?._id, // only fetch if selectedOrder exists
    },
  );

  const handleRowClick = (order: IOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleExportCSV = () => {
    const ordersToExport =
      selectedOrders.size > 1
        ? orders?.datas?.data?.filter((order: any) =>
            selectedOrders.has(order._id),
          )
        : orders?.datas?.data;
    console.log("export cvs", ordersToExport);
    console.log("export cvs", selectedOrders);

    if (ordersToExport?.length === 0) {
      toast.message(t("noOrdersToExport") || "No orders to export");
      return;
    }

    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return "";
      const stringValue = String(value);
      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const headers: string[] = [];
    const columnKeys: string[] = [];

    if (columnVisibility.firstName) {
      headers.push(t("firstName"));
      columnKeys.push("firstName");
    }
    if (columnVisibility.email) {
      headers.push(t("email"));
      columnKeys.push("email");
    }
    if (columnVisibility.phone) {
      headers.push(t("phone"));
      columnKeys.push("phone");
    }
    if (columnVisibility.status) {
      headers.push(t("status"));
      columnKeys.push("status");
    }
    if (columnVisibility.totalAmount) {
      headers.push(t("totalAmount"));
      columnKeys.push("totalAmount");
    }
    // if (columnVisibility.paymentStatus) {
    //   headers.push(t("paymentStatus"));
    //   columnKeys.push("paymentStatus");
    // }
    // if (columnVisibility.voucherAmount) {
    //   headers.push(t("voucherAmount"));
    //   columnKeys.push("voucherAmount");
    // }
    // if (columnVisibility.creditCardAmount) {
    //   headers.push(t("creditCardAmount"));
    //   columnKeys.push("creditCardAmount");
    // }
    // if (columnVisibility.vendors) {
    //   headers.push(t("vendors"));
    //   columnKeys.push("vendors");
    // }
    // if (columnVisibility.campaign) {
    //   headers.push(t("campaign"));
    //   columnKeys.push("campaign");
    // }
    if (columnVisibility.createdAt) {
      headers.push(t("createdAt"));
      columnKeys.push("createdAt");
    }
    if (columnVisibility.paymentDate) {
      headers.push(t("paymentDate"));
      columnKeys.push("paymentDate");
    }

    let csvContent = headers.map(escapeCSV).join(",") + "\n";

    ordersToExport.forEach((order: IOrder) => {
      const row: string[] = [];

      columnKeys.forEach((key) => {
        if (key === "orderId") row.push(escapeCSV(order._id));
        else if (key === "firstName") row.push(escapeCSV(order.firstName));
        else if (key === "email") row.push(escapeCSV(order.email));
        else if (key === "phone") row.push(escapeCSV(order.phone));
        else if (key === "orderStatus") row.push(escapeCSV(order.status));
        else if (key === "totalAmount")
          row.push(escapeCSV(`₪${order.totalAmount}`));
        else if (key === "paymentStatus")
          row.push(escapeCSV(order.paymentStatus));
        else if (key === "voucherAmount")
          row.push(escapeCSV(`₪${order.voucherAmount}`));
        else if (key === "creditCardAmount")
          row.push(escapeCSV(`₪${order.creditCardAmount}`));
        else if (key === "vendors")
          row.push(escapeCSV(order.vendors.join(", ")));
        else if (key === "campaign") row.push(escapeCSV(order.campaign));
        else if (key === "createdAt")
          row.push(escapeCSV(new Date(order.createdAt).toLocaleDateString()));
        else if (key === "paymentDate")
          row.push(escapeCSV(new Date(order.paymentDate).toLocaleDateString()));
      });

      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().slice(0, 10);

    link.setAttribute("href", url);
    link.setAttribute("download", `orders_export_${timestamp}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const promptBulkResend = useCallback(() => {
    if (!selectedOrders.size) return;
    setIsBulkDelete(true);
    setIsConfirmOpen(true);
  }, [selectedOrders.size]);

  const handleBulkResend = useCallback(async () => {
    if (!selectedOrders.size) return;

    const toastId = toast.loading(t("resend_loading"));

    try {
      const results = await bulkOrdersUpdate({
        ordersId: Array.from(selectedOrders),
      });

      if (results?.data) {
        toast.success(t("resend_success"), { id: toastId });
        setSelectedOrders(new Set());
        refetch();
      }
    } catch (error: any) {
      toast.error(error?.message || t("resend_failed"), {
        id: toastId,
      });
    } finally {
      setIsConfirmOpen(false);
      setIsBulkDelete(false);
    }
  }, [selectedOrders, bulkOrdersUpdate, refetch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        columnSettingsRef.current &&
        !columnSettingsRef.current.contains(event.target as Node)
      ) {
        setShowColumnSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const orderStats = [
    {
      id: 1,
      title: t("totalOrders"),
      value: orderStat?.totalOrders?.toLocaleString(),
      label: t("all"),
      icon: <ShoppingCart className="w-5 h-5 text-purple-500" />,
    },
    {
      id: 2,
      title: t("revenue"),
      value: `₪${orderStat?.totalRevenue?.toLocaleString()}`,
      label: t("gross"),
      icon: <DollarSign className="w-5 h-5 text-green-500" />,
    },
    {
      id: 3,
      title: t("avgOrderValue"),
      value: `₪${Math.round(orderStat?.avgOrderValue).toLocaleString()}`,
      label: t("perOrder"),
      icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
    },
    {
      id: 4,
      title: t("pickups"),
      value: orderStat?.totalPickups?.toLocaleString(),
      label: t("orders"),
      icon: <ShoppingBag className="w-5 h-5 text-orange-500" />,
    },
    {
      id: 5,
      title: t("deliveries"),
      value: orderStat?.totalDeliveries?.toLocaleString(),
      label: t("orders"),
      icon: <Truck className="w-5 h-5 text-teal-500" />,
    },
    {
      id: 6,
      title: t("cancelledOrders"),
      value: orderStat?.totalCanceledOrders?.toLocaleString(),
      label: t("cancelled"),
      icon: <XCircle className="w-5 h-5 text-red-500" />,
    },
  ];

  const getOrderStatusBadge = (status: IOrder["status"]) => {
    const badges = {
      draft: {
        bg: "bg-gray-100 dark:bg-gray-800",
        text: "text-gray-800 dark:text-gray-300",
        label: t("draft"),
      },
      processing: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-800 dark:text-blue-400",
        label: t("processing"),
      },
      paid: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-800 dark:text-green-400",
        label: t("paid"),
      },
      confirmed: {
        bg: "bg-teal-100 dark:bg-teal-900/30",
        text: "text-teal-800 dark:text-teal-400",
        label: t("confirmed"),
      },
      delivered: {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-800 dark:text-purple-400",
        label: t("delivered"),
      },
      completed: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-800 dark:text-emerald-400",
        label: t("completed"),
      },
      canceled: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-800 dark:text-red-400",
        label: t("cancelled"),
      },
      partially_cancelled: {
        bg: "bg-orange-100 dark:bg-orange-900/30",
        text: "text-orange-800 dark:text-orange-400",
        label: t("partially_cancelled"),
      },

      failed: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-800 dark:text-red-400",
        label: t("failed"),
      },
    };
    const badge = badges[status];
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs ${badge?.bg} ${badge?.text}`}
      >
        {badge?.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: IOrder["paymentStatus"]) => {
    const badges = {
      PENDING: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-800 dark:text-yellow-400",
        label: t("pending"),
      },
      SUCCESS: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-800 dark:text-green-400",
        label: t("success"),
      },
      FAILED: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-800 dark:text-red-400",
        label: t("failed"),
      },
      REFUNDED: {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-800 dark:text-purple-400",
        label: t("refunded"),
      },
      REFUND_IN_PROCESS: {
        bg: "bg-orange-100 dark:bg-orange-900/30",
        text: "text-orange-800 dark:text-orange-400",
        label: t("refund_in_process"),
      },
      PARTIALLY_REFUNDED: {
        bg: "bg-orange-100 dark:bg-orange-900/30",
        text: "text-orange-800 dark:text-orange-400",
        label: t("partiallyRefunded"),
      },
      REFUND_SUCCESS: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-800 dark:text-green-400",
        label: t("refund_success"),
      },
    };
    const badge = badges[status];
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs ${badge?.bg} ${badge?.text}`}
      >
        {badge?.label}
      </span>
    );
  };

  return (
    <div
      className={`h-[calc(108vh-210px)] flex flex-col ${isDark ? "bg-gray-950" : "bg-gray-50"}`}
    >
      {/* Page Header */}
      <div
        className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 ${isRTL ? "md:flex-row-reverse" : ""}`}
      >
        <div
          className={`${isDark ? "border-gray-800" : "bg-transparent border-gray-200"} z-10`}
        >
          {" "}
          <PageHeader
            title={t("online_orders_management")}
            description={t("online_orders_subtitle")}
            h1Gradient="bg-linear-to-r text-transparent from-blue-500 via-indigo-600 to-purple-600"
            totalCount={totalData ?? 0}
          />
        </div>
        <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          {canViewOrders && (
            <button
              onClick={getVideoStream}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                isDark
                  ? "border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300"
                  : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
              }`}
            >
              <Camera className="w-4 h-4" />
            </button>
          )}

          {/* <button
            onClick={() => setShowAddOrderWizard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t("addOrder")}</span>
          </button> */}
        </div>
      </div>
      {canViewOrders ? (
        <PageStats
          stats={orderStats}
          isLoading={isStatsLoading}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-3"
        />
      ) : (
        <UserStatsCards stats={orderStats} isLoading={isStatsLoading} />
      )}

      {/* Search and Filters */}
      {canViewOrders && (
        <div className={` border rounded-lg p-4 mb-2`}>
          <div
            className={`flex flex-col md:flex-row gap-4 ${isRTL ? "md:flex-row-reverse" : ""}`}
          >
            <div className="flex-1 relative">
              <SearchInput
                placeholder={t("search_orders")}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                storageKey="orderSearchTerm"

                // isRTL={isRTL}
                // isDark={isDark}
              />
            </div>

            <button
              onClick={handleExportCSV}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                isDark
                  ? "border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300"
                  : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
              }`}
              title={t("downloadCSV")}
            >
              <Download className="w-4 h-4" />
              <span>{t("downloadCSV")}</span>
            </button>

            <FilterButton value={showFilters} onChange={setShowFilters} />
            {viewMode === "list" && (
              <div className="relative" ref={columnSettingsRef}>
                <button
                  onClick={() => setShowColumnSettings(!showColumnSettings)}
                  className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${
                    isDark
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

                {showColumnSettings && (
                  <div
                    className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-64 rounded-lg shadow-lg border z-10 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                  >
                    <div className="p-3 max-h-96 overflow-y-auto">
                      {Object.entries(columnVisibility).map(
                        ([key, visible]) => (
                          <label
                            key={key}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer ${isRTL ? "flex-row-reverse justify-end" : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={visible}
                              onChange={(e) =>
                                setColumnVisibility((prev) => ({
                                  ...prev,
                                  [key]: e.target.checked,
                                }))
                              }
                              className="rounded"
                            />
                            <span className={`text-sm ${textSecondary}`}>
                              {t(key as keyof typeof t)}
                            </span>
                          </label>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <ViewModeToggle onChange={setViewMode} value={viewMode} />
          </div>

          {showFilters && (
            <div className="flex flex-wrap items-start gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Delivery Type */}
              <div className="min-w-[180px]">
                <FilterSelect
                  label={t("deliveryType")}
                  value={filters.deliveryType}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, deliveryType: value }))
                  }
                  options={[
                    { value: "all", label: t("all") },
                    { value: "pick_up", label: t("pickups") },
                    { value: "deliver", label: t("delivery") },
                  ]}
                />
              </div>
              {/* Status */}
              <div className="min-w-[180px]">
                <FilterSelect
                  label={t("status")}
                  value={filters.status}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, status: value }))
                  }
                  options={[
                    { value: "all", label: t("all") },
                    { value: "pending", label: t("pending") },
                    { value: "processing", label: t("processing") },
                    { value: "completed", label: t("completed") },
                    { value: "shipped", label: t("shipped") },

                    { value: "canceled", label: t("canceled") },
                  ]}
                />
              </div>
              {/* Payment Method */}
              <div className="min-w-[180px]">
                <FilterSelect
                  label={t("paymentMethod")}
                  value={filters.paymentMethod}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, paymentMethod: value }))
                  }
                  options={[
                    { value: "all", label: t("all") },
                    { value: "voucher", label: t("voucher") },
                    { value: "card", label: t("creditCard") },
                  ]}
                />
              </div>

              {/* Month Filter */}
              <div className="min-w-[220px]">
                <MonthFilter
                  label={t("month")}
                  value={filters.month}
                  onChange={(value) =>
                    setFilters((prev) => ({ ...prev, month: value }))
                  }
                  dateFrom={filters.startDate}
                  dateTo={filters.endDate}
                  onDateFromChange={(value) =>
                    setFilters((prev) => ({ ...prev, startDate: value }))
                  }
                  onDateToChange={(value) =>
                    setFilters((prev) => ({ ...prev, endDate: value }))
                  }
                  theme={theme}
                  isRTL={isRTL}
                  t={t}
                />
              </div>

              {/* Active Filters */}
              <div className="">
                {activeFilterChips.length > 0 && (
                  <div className="mb-3 text-sm text-gray-500">
                    {tb("active_filters")}:
                  </div>
                )}
                {activeFilterChips.length > 0 && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex flex-wrap gap-2">
                      {activeFilterChips.map((chip) => (
                        <FilterChips
                          key={chip.key}
                          label={t(chip.value)}
                          onRemove={() =>
                            setFilters((prev) => ({
                              ...prev,
                              [chip.key]: chip.key.includes("date")
                                ? ""
                                : "all",
                            }))
                          }
                        />
                      ))}
                    </div>

                    {/* Clear All */}
                    <button
                      onClick={() => setFilters(defaultFilters)}
                      className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs hover:bg-red-500/30 transition-colors"
                    >
                      {t("clear_all")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      <div>
        {selectedOrders.size > 0 && (
          <BulkActionBar
            selectedItemCount={selectedOrders.size}
            handleResendOrderDetails={promptBulkResend}
            handleExportCSV={handleExportCSV}
            hancleClearSelection={() => setSelectedOrders(new Set())}
          />
        )}
      </div>

      {/* Orders Table */}
      {(userRole === UserRole.SUPERADMIN ||
        userRole === UserRole.TRAVELLER) && (
        <>
          {viewMode === "list" ? (
            <div
              className={`${isDark ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"} border rounded-lg overflow-hidden`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader className="w-8 h-8 animate-spin text-teal-500" />
                </div>
              ) : orderss.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className={`w-12 h-12 ${textTertiary} mb-4`} />
                  <p className={`${textSecondary}`}>{t("noOrdersFound")}</p>
                </div>
              ) : (
                <OrderListView
                  theme={theme}
                  isLoading={isLoading || isFetching}
                  hasMore={hasMore}
                  orders={orders}
                  combinedOrders={combinedOrders}
                  fetchNextPage={fetchNextPage}
                  selectedOrders={selectedOrders}
                  setSelectedOrders={setSelectedOrders}
                  handleRowClick={handleRowClick}
                  columns={columns}
                  textTertiary={textTertiary}
                  textSecondary={textSecondary}
                  t={t}
                />
              )}
            </div>
          ) : (
            <div className="overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader className="w-8 h-8 animate-spin text-teal-500" />
                </div>
              ) : (
                <OrderGridView
                  selectedOrders={selectedOrders}
                  setSelectedOrders={setSelectedOrders}
                  data={combinedOrders || []}
                  next={fetchNextPage}
                  hasMore={hasMore}
                  isLoading={isLoading || isFetching}
                  onRowClick={handleRowClick}
                  t={t}
                />
              )}
            </div>
          )}
        </>
      )}
      <Activity mode={selectedOrder && showOrderDetails ? "visible" : "hidden"}>
        <OrderDetailsModal
          t={t}
          isRTL={isRTL}
          theme={theme}
          refetch={orderIdrefetch}
          order={orderDetails}
          isLoading={isOrderDetailLoading}
          isFetching={isOrderDetailFetching}
          onClose={() => setShowOrderDetails(false)}
          getOrderStatusBadge={getOrderStatusBadge}
          getPaymentStatusBadge={getPaymentStatusBadge}
        />
      </Activity>

      {/* <Activity mode={showAddOrderWizard ? "visible" : "hidden"}>
        <CreateOrderWizard
          onClose={() => setShowAddOrderWizard(false)}
          onOpen={() => setShowAddOrderWizard(true)}
        />
      </Activity> */}

      <Activity mode={showQRScanner ? "visible" : "hidden"}>
        <QRScannerModal stream={stream} onClose={stopCamera} />
      </Activity>
      <ConfirmDialog
        open={isConfirmOpen}
        title={t("resend_notification")}
        confirmText={t("resend")}
        variant="info"
        onCancel={() => {
          setIsConfirmOpen(false);
          setIsBulkDelete(false);
        }}
        onConfirm={() => {
          if (isBulkDelete) {
            handleBulkResend();
          }
          setIsConfirmOpen(false);
        }}
      />
    </div>
  );
}
