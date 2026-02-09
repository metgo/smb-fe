import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo, useRef, Activity } from "react";
import {
  Search,
  Filter,
  Download,
  Plus,
  ChevronDown,
  ChevronUp,
  XCircle,
  Loader,
  AlertCircle,
  Columns,
  Mail,
  Phone,
  Truck,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Camera,
  ShoppingCart,
} from "lucide-react";

import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  BulkActionBar,
  PageStats,
  ReordableDataTable,
} from "@/components/shared";
import {
  CreateOrderWizard,
  FilterSelect,
  MonthFilter,
  OrderDetailsModal,
  QRScannerModal,
} from "./components";
import {
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
} from "@/store/api/orderQueryApi";
import { FilterButton } from "@/components/btns";
import { toast } from "sonner";
import { useBulkOrdersUpdateMutation } from "@/store/api/orderMutationApi";

// Default columns configuration
const defaultColumns = {
  firstName: true,
  email: true,
  phone: true,
  status: true,

  createdAt: false,
  paymentDate: false,
};

type ColumnVisibility = typeof defaultColumns;

export default function OrdersMgmtPage() {
  const { t, i18n } = useTranslation("orders");
  const { isRTL, theme } = useAppSelector((state) => state.settings);
  const language = i18n.language;

  const { textPrimary, textSecondary, textTertiary, isDark } =
    useThemeClasses();

  // const [orders, setOrders] = useState<IOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [showAddOrderWizard, setShowAddOrderWizard] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const columnSettingsRef = useRef<HTMLDivElement>(null);
  const [bulkOrdersUpdate] = useBulkOrdersUpdateMutation();

  const handleBulkDelete = async () => {
    if (!selectedOrders.size) return;
    const toastId = toast.loading("Please wait. Orders are deleting...");
    try {
      const results = await bulkOrdersUpdate({
        ordersId: Array.from(selectedOrders),
        isDeleted: true,
      });

      if (results?.data) {
        const message = "Orders deleted successfully";
        toast.success(message, { id: toastId });
        setSelectedOrders(new Set());
        refetch();
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete Orders", {
        id: toastId,
      });
    }
  };
  const handleBulkStatusChange = async (status: TStatus) => {
    if (!selectedOrders.size) return;
    const toastId = toast.loading(
      "Please wait. Order's status are changing...",
    );

    try {
      const results = await bulkOrdersUpdate({
        ordersId: Array.from(selectedOrders),
        status: status?.toLocaleUpperCase(),
      });

      if (results?.data) {
        const message = "Orders status updated successfully";
        toast.success(message, { id: toastId });
        setSelectedOrders(new Set());
        refetch();
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to change Orders status", {
        id: toastId,
      });
    }
  };
  const defaultFilters = {
    orderType: "all",
    deliveryType: "all",
    paymentMethod: "all",
    vendor: "all",
    campaign: "all",
    month: "all",
    dateFrom: "",
    dateTo: "",
  };

  // Filters
  const [filters, setFilters] = useState({
    orderType: "all",
    paymentMethod: "all",
    vendor: "all",
    campaign: "all",
    deliveryType: "all",
    dateFrom: "",
    dateTo: "",
    month: "all", // 'all', 'MM-YYYY', or 'custom'
  });
  //active filter chips
  const activeFilterChips = useMemo(() => {
    const chips: { key: string; value: string }[] = [];

    if (filters.orderType !== "all")
      chips.push({
        key: "orderType",
        value: filters.orderType,
      });

    if (filters.deliveryType !== "all")
      chips.push({
        key: "deliveryType",
        value: filters.deliveryType,
      });

    if (filters.paymentMethod !== "all")
      chips.push({
        key: "paymentMethod",
        value: filters.paymentMethod,
      });

    if (filters.month !== "all" && filters.month !== "custom")
      chips.push({ key: "month", value: filters.month });

    if (filters.month === "custom") {
      if (filters.dateFrom)
        chips.push({
          key: "dateFrom",
          value: filters.dateFrom,
        });

      if (filters.dateTo) chips.push({ key: "dateTo", value: filters.dateTo });
    }

    return chips;
  }, [filters, t]);

  const FilterChip = ({ value, onRemove }: any) => (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-blue-100 text-sm">
      <span>{value}</span>
      <button onClick={onRemove} className=" transition">
        ✕
      </button>
    </div>
  );

  // Column visibility
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibility>(defaultColumns);
  const columns = [
    { key: "checkbox", label: "", width: "50px" },

    // columnVisibility._id && {
    //   key: "_id",
    //   label: t("order_id"),
    //   sortable: true,
    //   render: (order: IOrder) => <div className="text-sm">{order._id}</div>,
    // },

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

    // columnVisibility.totalAmount && {
    //   key: "totalAmount",
    //   label: t("total_amount"),
    //   sortable: true,
    //   render: (order: IOrder) => (
    //     <div className="text-sm font-medium">
    //       ₪{order.totalAmount.toLocaleString()}
    //     </div>
    //   ),
    // },

    // columnVisibility.paymentStatus && {
    //   key: "paymentStatus",
    //   label: t("payment_status"),
    //   render: (order: IOrder) => getPaymentStatusBadge(order.paymentStatus),
    // },

    // columnVisibility.voucherAmount && {
    //   key: "voucherAmount",
    //   label: t("voucher_amount"),
    //   sortable: true,
    //   render: (order: IOrder) => (
    //     <div className="text-sm text-gray-500">
    //       ₪{order.voucherAmount.toLocaleString()}
    //     </div>
    //   ),
    // },

    // columnVisibility.creditCardAmount && {
    //   key: "creditCardAmount",
    //   label: t("credit_card_amount"),
    //   sortable: true,
    //   render: (order: IOrder) => (
    //     <div className="text-sm text-gray-500">
    //       ₪{order.creditCardAmount.toLocaleString()}
    //     </div>
    //   ),
    // },

    // columnVisibility.vendors && {
    //   key: "vendors",
    //   label: t("vendors"),
    //   render: (order: IOrder) => (
    //     <div className="text-sm text-gray-500">{order.vendors.join(", ")}</div>
    //   ),
    // },

    // columnVisibility.campaign && {
    //   key: "campaign",
    //   label: t("campaign"),
    //   render: (order: IOrder) => (
    //     <div className="text-sm text-gray-500">{order.campaign}</div>
    //   ),
    // },

    columnVisibility.createdAt && {
      key: "createdAt",
      label: t("created_date"),
      sortable: true,
      render: (order: IOrder) => (
        <div className="text-sm text-gray-500">
          {new Date(order.createdAt).toLocaleDateString(language)}
        </div>
      ),
    },

    columnVisibility.paymentDate && {
      key: "paymentDate",
      label: t("payment_date"),
      sortable: true,
      render: (order: IOrder) => (
        <div className="text-sm text-gray-500">
          {new Date(order.paymentDate).toLocaleDateString(language)}
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

  const [page, setPage] = useState(1);
  const limit = 20;
  const orderQueryParams = useMemo(() => {
    const params: any = {
      page,
      limit,
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

    if (filters.vendor !== "all") {
      params.vendor = filters.vendor;
    }

    if (filters.campaign !== "all") {
      params.campaign = filters.campaign;
    }

    // Month filter
    if (filters.month !== "all" && filters.month !== "custom") {
      params.month = filters.month;
    }

    // Custom date range
    if (filters.month === "custom") {
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
    }

    return params;
  }, [page, limit, searchTerm, filters]);

  const {
    data: orders,
    isLoading,
    refetch,
  } = useGetAllOrdersQuery(orderQueryParams);

  //order details
  const { data: orderDetails, isLoading: isOrderDetailLoading } =
    useGetOrderByIdQuery(
      { orderId: selectedOrder?._id ?? null },
      {
        skip: !selectedOrder?._id, // only fetch if selectedOrder exists
      },
    );
  console.log("🚀 ~ OrdersMgmtPage ~ orderDetails:", orderDetails);

  // Load mock data
  // useEffect(() => {
  //   setLoading(true);
  //   setTimeout(() => {
  //     setOrders(generateMockOrders(100));
  //     setLoading(false);
  //   }, 800);
  // }, []);

  // Statistics
  // const statistics = useMemo(() => {
  //   const totalOrders = filteredOrders?.length;
  //   const totalRevenue = filteredOrders?.reduce(
  //     (sum, o) => sum + o.totalAmount,
  //     0,
  //   );
  //   const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  //   const pickups = filteredOrders?.filter(
  //     (o) => o.deliveryType === "pickup",
  //   ).length;
  //   const deliveries = filteredOrders?.filter(
  //     (o) => o.deliveryType === "delivery",
  //   ).length;
  //   const paidOrders = filteredOrders?.filter(
  //     (o) => o.paymentStatus === "success",
  //   ).length;
  //   const cancelledOrders = filteredOrders?.filter(
  //     (o) => o.orderStatus === "cancelled",
  //   ).length;

  //   return {
  //     totalOrders,
  //     totalRevenue,
  //     avgOrderValue,
  //     pickups,
  //     deliveries,
  //     paidOrders,
  //     cancelledOrders,
  //   };
  // }, [filteredOrders]);

  // // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map((o) => o.id)));
    }
  };

  // const handleSelectOrder = (orderId: string) => {
  //   const newSelected = new Set(selectedOrders);
  //   if (newSelected.has(orderId)) {
  //     newSelected.delete(orderId);
  //   } else {
  //     newSelected.add(orderId);
  //   }
  //   setSelectedOrders(newSelected);
  // };

  const handleRowClick = (order: IOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleExportCSV = () => {
    const ordersToExport =
      selectedOrders.size > 0
        ? orders?.datas?.data?.filter((order) => selectedOrders.has(order.id))
        : orders?.data?.data;

    if (ordersToExport?.length === 0) {
      alert(t("noOrdersToExport") || "No orders to export");
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

    if (columnVisibility.orderId) {
      headers.push(t("orderId"));
      columnKeys.push("orderId");
    }
    if (columnVisibility.purchaserName) {
      headers.push(t("purchaserName"));
      columnKeys.push("purchaserName");
    }
    if (columnVisibility.email) {
      headers.push(t("email"));
      columnKeys.push("email");
    }
    if (columnVisibility.phone) {
      headers.push(t("phone"));
      columnKeys.push("phone");
    }
    if (columnVisibility.orderStatus) {
      headers.push(t("orderStatus"));
      columnKeys.push("orderStatus");
    }
    if (columnVisibility.totalAmount) {
      headers.push(t("totalAmount"));
      columnKeys.push("totalAmount");
    }
    if (columnVisibility.paymentStatus) {
      headers.push(t("paymentStatus"));
      columnKeys.push("paymentStatus");
    }
    if (columnVisibility.voucherAmount) {
      headers.push(t("voucherAmount"));
      columnKeys.push("voucherAmount");
    }
    if (columnVisibility.creditCardAmount) {
      headers.push(t("creditCardAmount"));
      columnKeys.push("creditCardAmount");
    }
    if (columnVisibility.vendors) {
      headers.push(t("vendors"));
      columnKeys.push("vendors");
    }
    if (columnVisibility.campaign) {
      headers.push(t("campaign"));
      columnKeys.push("campaign");
    }
    if (columnVisibility.createdDate) {
      headers.push(t("createdDate"));
      columnKeys.push("createdDate");
    }
    if (columnVisibility.paymentDate) {
      headers.push(t("paymentDate"));
      columnKeys.push("paymentDate");
    }

    let csvContent = headers.map(escapeCSV).join(",") + "\n";

    ordersToExport.forEach((order) => {
      const row: string[] = [];

      columnKeys.forEach((key) => {
        if (key === "orderId") row.push(escapeCSV(order.id));
        else if (key === "purchaserName")
          row.push(escapeCSV(order.purchaserName));
        else if (key === "email") row.push(escapeCSV(order.email));
        else if (key === "phone") row.push(escapeCSV(order.phone));
        else if (key === "orderStatus") row.push(escapeCSV(order.orderStatus));
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
        else if (key === "createdDate")
          row.push(escapeCSV(new Date(order.createdDate).toLocaleDateString()));
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

  const handleExportXLS = () => {
    console.log("Exporting XLS...");
    // XLS export logic
  };

  const handleResendOrderDetails = () => {
    const ordersToResend =
      selectedOrders.size > 0
        ? orders.filter((order) => selectedOrders.has(order.id))
        : [];

    if (ordersToResend.length === 0) {
      alert(t("noOrdersSelected") || "No orders selected");
      return;
    }

    ordersToResend.forEach((order) => {
      console.log(
        `Sending order details to ${order.email} for order ${order.id}`,
      );
    });

    const message =
      ordersToResend.length === 1
        ? `${t("orderDetailsSent")} ${ordersToResend[0].email}`
        : `${t("orderDetailsSent")} ${ordersToResend.length} ${t("customers")}`;

    alert(message);

    setSelectedOrders(new Set());
  };

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

  // const orderStats = [
  //   {
  //     id: 1,
  //     title: t("totalOrders"),
  //     value: statistics?.totalOrders?.toLocaleString(),
  //     label: t("all"),
  //     icon: <ShoppingCart className="w-5 h-5 text-purple-500" />,
  //   },
  //   {
  //     id: 2,
  //     title: t("revenue"),
  //     value: `₪${statistics?.totalRevenue?.toLocaleString()}`,
  //     label: t("gross"),
  //     icon: <DollarSign className="w-5 h-5 text-green-500" />,
  //   },
  //   {
  //     id: 3,
  //     title: t("avgOrderValue"),
  //     value: `₪${Math.round(statistics?.avgOrderValue).toLocaleString()}`,
  //     label: t("perOrder"),
  //     icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
  //   },
  //   {
  //     id: 4,
  //     title: t("pickups"),
  //     value: statistics?.pickups?.toLocaleString(),
  //     label: t("orders"),
  //     icon: <ShoppingBag className="w-5 h-5 text-orange-500" />,
  //   },
  //   {
  //     id: 5,
  //     title: t("deliveries"),
  //     value: statistics?.deliveries?.toLocaleString(),
  //     label: t("orders"),
  //     icon: <Truck className="w-5 h-5 text-teal-500" />,
  //   },
  //   {
  //     id: 6,
  //     title: t("cancelledOrders"),
  //     value: statistics?.cancelledOrders?.toLocaleString(),
  //     label: t("cancelled"),
  //     icon: <XCircle className="w-5 h-5 text-red-500" />,
  //   },
  // ];

  const getOrderStatusBadge = (status: IOrder["orderStatus"]) => {
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
      cancelled: {
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
      pending: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-800 dark:text-yellow-400",
        label: t("pending"),
      },
      success: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-800 dark:text-green-400",
        label: t("success"),
      },
      failed: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-800 dark:text-red-400",
        label: t("failed"),
      },
      refunded: {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-800 dark:text-purple-400",
        label: t("refunded"),
      },
      partially_refunded: {
        bg: "bg-orange-100 dark:bg-orange-900/30",
        text: "text-orange-800 dark:text-orange-400",
        label: t("partiallyRefunded"),
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
      className={`h-[calc(108vh-210px)] flex flex-col ${theme === "dark" ? "bg-gray-950" : "bg-gray-50"}`}
    >
      {/* Page Header */}
      <div
        className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 ${isRTL ? "md:flex-row-reverse" : ""}`}
      >
        <div>
          <h1 className={`text-2xl ${textPrimary}`}>
            {t("online_orders_management")}
          </h1>
          <p className={`text-sm ${textTertiary} mt-1`}>
            {t("online_orders_subtitle")}
          </p>
        </div>
        <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <button
            onClick={() => setShowQRScanner(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300"
                : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
            }`}
            title={t("scanQRCode")}
          >
            <Camera className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddOrderWizard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t("addOrder")}</span>
          </button>
        </div>
      </div>

      {/* <PageStats
        stats={orderStats}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6"
      /> */}

      {/* Search and Filters */}
      <div className={` border rounded-lg p-4 mb-6`}>
        <div
          className={`flex flex-col md:flex-row gap-4 ${isRTL ? "md:flex-row-reverse" : ""}`}
        >
          <div className="flex-1 relative">
            <Search
              className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 ${textTertiary}`}
            />
            <input
              type="text"
              placeholder={t("searchOrders")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? "pr-10 text-right" : "pl-10"} py-2 rounded-lg border transition-colors ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>

          <button
            onClick={handleExportCSV}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300"
                : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
            }`}
            title={t("downloadCSV")}
          >
            <Download className="w-4 h-4" />
            <span>{t("downloadCSV")}</span>
          </button>

          <FilterButton value={showFilters} onChange={setShowFilters} />

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
                  {Object.entries(columnVisibility).map(([key, visible]) => (
                    <label
                      key={key}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${isRTL ? "flex-row-reverse justify-end" : ""}`}
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
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <FilterSelect
              label={t("orderType")}
              value={filters.orderType}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, orderType: value }))
              }
              options={[
                { value: "all", label: t("all") },
                { value: "online", label: t("online") },
                { value: "offline", label: t("offline") },
              ]}
            />

            <FilterSelect
              label={t("deliveryType")}
              value={filters.deliveryType}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, deliveryType: value }))
              }
              options={[
                { value: "all", label: t("all") },
                { value: "pickup", label: t("pickup") },
                { value: "delivery", label: t("delivery") },
                { value: "digital", label: t("digital") },
              ]}
            />

            <FilterSelect
              label={t("paymentMethod")}
              value={filters.paymentMethod}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, paymentMethod: value }))
              }
              options={[
                { value: "all", label: t("all") },
                { value: "voucher", label: t("voucher") },
                { value: "credit_card", label: t("creditCard") },
              ]}
            />

            <MonthFilter
              label={t("month")}
              value={filters.month}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, month: value }))
              }
              dateFrom={filters.dateFrom}
              dateTo={filters.dateTo}
              onDateFromChange={(value) =>
                setFilters((prev) => ({ ...prev, dateFrom: value }))
              }
              onDateToChange={(value) =>
                setFilters((prev) => ({ ...prev, dateTo: value }))
              }
              theme={theme}
              isRTL={isRTL}
              t={t}
            />

            {activeFilterChips.length > 0 && (
              <div className="flex gap-5 items-center mt-4">
                <button
                  onClick={() => setFilters(defaultFilters)}
                  className="text-sm text-green-600"
                >
                  {t("clear_all")}
                </button>

                <div className="flex flex-wrap items-center gap-3">
                  {activeFilterChips.map((chip) => (
                    <FilterChip
                      key={chip.key}
                      value={chip.value}
                      onRemove={() =>
                        setFilters((prev) => ({
                          ...prev,
                          [chip.key]: chip.key.includes("date") ? "" : "all",
                        }))
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <BulkActionBar
        selectedItemCount={selectedOrders.size || 0}
        handleBulkStatusChange={handleBulkStatusChange}
        onBulkAction={{
          delete: handleBulkDelete,
        }}
      />
      {/* Bulk Actions Toolbar */}
      {/* {selectedOrders.size > 0 && (
        <div
          className={`${theme === "dark" ? "bg-teal-900/30 border-teal-800" : "bg-teal-50 border-teal-200"} border rounded-lg p-4 mb-4 flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <span className={`${textPrimary}`}>
            {selectedOrders.size} {t("selected")}
          </span>
          <button
            onClick={handleResendOrderDetails}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              theme === "dark"
                ? "bg-blue-800 hover:bg-blue-700 text-blue-100"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span className="text-sm">{t("resendOrderDetails")}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              theme === "dark"
                ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                : "bg-white hover:bg-gray-100 text-gray-700"
            }`}
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">{t("exportCSV")}</span>
          </button>
          <button
            onClick={handleExportXLS}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              theme === "dark"
                ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                : "bg-white hover:bg-gray-100 text-gray-700"
            }`}
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">{t("exportXLS")}</span>
          </button>
        </div>
      )} */}

      {/* Orders Table */}
      <div
        className={`${theme === "dark" ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"} border rounded-lg overflow-hidden`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        ) : orders?.datas?.data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className={`w-12 h-12 ${textTertiary} mb-4`} />
            <p className={`${textSecondary}`}>{t("noOrdersFound")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-hidden max-h-[calc(100vh-400px)]">
            <ReordableDataTable
              rowKey="_id"
              data={orders?.datas?.data}
              selectedItems={selectedOrders}
              onSelectionChange={setSelectedOrders}
              onRowClick={handleRowClick}
              storageKey="ordersTableColumnOrder"
              columns={columns}
              isDataLoading={isLoading}
            />
          </div>
        )}
      </div>

      <Activity mode={selectedOrder && showOrderDetails ? "visible" : "hidden"}>
        <OrderDetailsModal
          t={t}
          isRTL={isRTL}
          theme={theme}
          order={orderDetails?.datas}
          onClose={() => setShowOrderDetails(false)}
          getOrderStatusBadge={getOrderStatusBadge}
          getPaymentStatusBadge={getPaymentStatusBadge}
        />
      </Activity>

      <Activity mode={showAddOrderWizard ? "visible" : "hidden"}>
        <CreateOrderWizard
          onClose={() => setShowAddOrderWizard(false)}
          onAddOrder={(newOrder) => {
            setOrders((prev) => [newOrder as IOrder, ...prev]);
          }}
        />
      </Activity>

      <Activity mode={showQRScanner ? "visible" : "hidden"}>
        <QRScannerModal onClose={() => setShowQRScanner(false)} />
      </Activity>
    </div>
  );
}
