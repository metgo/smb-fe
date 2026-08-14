import axios from "axios";
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
import { useCommon } from "@/hooks/useCommon";
import { envKeys } from "@/lib/envKeys";
import {
  BulkActionBar,
  ConfirmDialog,
  FilterChips,
  PageHeader,
  PageStats,
  ShowColumns,
  // ViewModeToggle,
} from "@/components/shared";
import {
  FilterSelect,
  MonthFilter,
  OrderDetailsModal,
  QRScannerModal,
  ExportOrdersButton,
} from "./components";
import {
  useGetAllOrdersQuery,
  useGetOrderStatsQuery,
} from "@/store/api/orderQueryApi";
import { useGetAllWebsitesQuery } from "@/store/api/websiteConfigApi";
import { FilterButton } from "@/components/btns";
import { toast } from "sonner";
import SearchInput from "@/components/shared/SearchInput";
import OrderListView from "../products-mgmt/components/sub-components/OrderListView";
import { useBulkOrdersUpdateMutation } from "@/store/api/orderMutationApi";
import { useUserRoles } from "@/hooks/useUserRoles";
import { formatDateTime, formatILS } from "@/helpers/formatter";
import { ORDER_COLUMNS } from "@/lib/utils";

const limit = 20;

const { defaultColumns, columnDefinitions } = ORDER_COLUMNS;

type ColumnVisibility = typeof defaultColumns;

export default function OrdersMgmtPage() {
  const { t } = useTranslation("orders");
  const { t: tc } = useTranslation("common");
  const { dmoId, authorityId, websiteId } = useAppSelector(
    (state) => state.auth,
  );
  const { isSuperadmin, isTraveller } = useUserRoles();
  const { isDark, isRTL, language } = useThemeClasses();
  const { dmosAuthorities } = useCommon();

  // QR Token handling - detect from URL on first load
  const urlParams = new URLSearchParams(window.location.search);
  const jwtToken = urlParams.get("token");
  const urlOrderId = urlParams.get("orderId");
  const storedQrMode = sessionStorage.getItem("isQrMode") === "true";
  const qrToken =
    jwtToken || (storedQrMode ? sessionStorage.getItem("qr_token") : null);
  const isQRMode = !!qrToken;
  // const [qrOrder, setQrOrder] = useState<any | null>(null);
  const [qrSessionReady, setQrSessionReady] = useState(
    () =>
      !isQRMode ||
      (!jwtToken && sessionStorage.getItem("isQrVerified") === "true"),
  );
  const canUseAuthenticatedOrderApis = !isQRMode || qrSessionReady;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const [showQRScanner, setShowQRScanner] = useState(false);
  const columnSettingsRef = useRef<HTMLDivElement>(null);
  const [bulkOrdersUpdate] = useBulkOrdersUpdateMutation();

  const { data: allWebsites } = useGetAllWebsitesQuery();
  const websiteMap = useMemo(() => {
    if (!allWebsites) return {} as Record<string, IWebsiteRes>;
    return allWebsites.reduce(
      (map, w) => {
        map[w._id] = w;
        return map;
      },
      {} as Record<string, IWebsiteRes>,
    );
  }, [allWebsites]);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [page, setPage] = useState(1);

  const [pendingRecipient, setPendingRecipient] = useState<
    "VENDOR" | "CUSTOMER" | null
  >(null);

  useEffect(() => {
    if (!isQRMode) {
      setQrSessionReady(true);
      return;
    }

    const syncQrSessionReady = () => {
      setQrSessionReady(sessionStorage.getItem("isQrVerified") === "true");
    };

    syncQrSessionReady();
    window.addEventListener("session:updated", syncQrSessionReady);
    window.addEventListener("storage", syncQrSessionReady);

    return () => {
      window.removeEventListener("session:updated", syncQrSessionReady);
      window.removeEventListener("storage", syncQrSessionReady);
    };
  }, [isQRMode]);

  // Fetch the scanned order via the no-auth QR endpoint.
  // Only used when there's no orderId in the URL (token-only QR scan).
  useEffect(() => {
    if (!isQRMode || !qrToken || qrSessionReady || urlOrderId) return;

    const fetchQROrder = async () => {
      try {
        const response = await axios.get(
          `${envKeys.baseUrl}/public/orders/verify/${qrToken}`,
        );

        const orderData = response.data?.data || response.data;
        if (orderData) {
          // setQrOrder(orderData);
          setSelectedOrder(orderData);
          setShowOrderDetails(true); // Auto-open order details modal
        }
      } catch (error) {
        console.error("QR order fallback fetch failed", error);
      }
    };

    fetchQROrder();
  }, [isQRMode, qrSessionReady, qrToken, urlOrderId]);

  // Auto-open order details modal when orderId is present in URL params.
  // In QR mode, wait until auth is established before opening so the
  // authenticated order API has a valid token to use.
  useEffect(() => {
    if (urlOrderId && canUseAuthenticatedOrderApis) {
      setSelectedOrder({ _id: urlOrderId });
      setShowOrderDetails(true);
    }
  }, [urlOrderId, canUseAuthenticatedOrderApis]);

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
    paymentMethod: "all",

    deliveryType: "all",
    status: "all",
    startDate: "",
    endDate: "",
    month: "all", // 'all', 'MM-YYYY', or 'custom'
    dmoId: dmoId || "all",
    authorityId: authorityId || "all",
  });

  const lastGlobalDmoId = useRef(dmoId);
  const lastGlobalAuthorityId = useRef(authorityId);

  useEffect(() => {
    if (dmoId !== lastGlobalDmoId.current) {
      lastGlobalDmoId.current = dmoId;
      setFilters((prev) => ({
        ...prev,
        dmoId: dmoId || "all",
        authorityId: "all",
      }));
    }
  }, [dmoId]);

  useEffect(() => {
    if (authorityId !== lastGlobalAuthorityId.current) {
      lastGlobalAuthorityId.current = authorityId;
      setFilters((prev) => ({ ...prev, authorityId: authorityId || "all" }));
    }
  }, [authorityId]);

  // const dmoOptions = useMemo(() => {
  //   const options = [{ value: "all", label: t("all") }];
  //   if (dmosAuthorities) {
  //     dmosAuthorities.forEach((d) => {
  //       options.push({ value: d._id, label: d.name });
  //     });
  //   }
  //   return options;
  // }, [dmosAuthorities, t]);

  // const selectedLocalDmo = useMemo(() => {
  //   const currentDmoId = orderSummaryClick ? summaryFilters.dmoId : filters.dmoId;
  //   return dmosAuthorities?.find((d) => d._id === currentDmoId);
  // }, [dmosAuthorities, orderSummaryClick, summaryFilters.dmoId, filters.dmoId]);

  // const authorityOptions = useMemo(() => {
  //   const options = [{ value: "all", label: t("all") }];
  //   if (selectedLocalDmo) {
  //     selectedLocalDmo.authorities?.forEach((a: any) => {
  //       options.push({ value: a._id, label: a.name });
  //     });
  //   } else {
  //     dmosAuthorities?.forEach((d) => {
  //       d.authorities?.forEach((a: any) => {
  //         options.push({ value: a._id, label: `${a.name} (${d.name})` });
  //       });
  //     });
  //   }
  //   return options;
  // }, [selectedLocalDmo, dmosAuthorities, t]);

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

    if (filters.dmoId !== "all") {
      const dmoName =
        dmosAuthorities?.find((d) => d._id === filters.dmoId)?.name ||
        filters.dmoId;
      chips.push({
        key: "dmoId",
        value: dmoName,
      });
    }

    if (filters.authorityId !== "all") {
      let authName = "";
      dmosAuthorities?.forEach((d) => {
        const found = d.authorities?.find(
          (a: any) => a._id === filters.authorityId,
        );
        if (found) authName = found.name;
      });
      chips.push({
        key: "authorityId",
        value: authName || filters.authorityId,
      });
    }

    return chips;
  }, [filters, dmosAuthorities, t]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filters]);

  const canViewOrders = isSuperadmin || isTraveller || qrSessionReady;
  const [combinedOrders, setCombinedOrders] = useState<any[]>([]);

  const orderQueryParams = useMemo(() => {
    const params: any = {
      page,
      limit,
      dmoId: filters.dmoId !== "all" ? filters.dmoId : undefined,
      authorityId:
        filters.authorityId !== "all" ? filters.authorityId : undefined,
      websiteId,
    };

    if (searchTerm) params.search = searchTerm;

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

      // format from the Date's own local year/month/day, not
      // toISOString() - that converts to UTC first, which silently shifts
      // the date back a day for any timezone ahead of UTC (midnight local
      // time is still "yesterday evening" in UTC)
      const formatLocalDate = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      };

      const firstDay = new Date(Number(year), Number(month) - 1, 1);
      const lastDay = new Date(Number(year), Number(month), 0);

      params.startDate = formatLocalDate(firstDay);
      params.endDate = formatLocalDate(lastDay);
    }

    // Custom date range
    if (filters.month === "custom") {
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
    }

    return params;
  }, [page, limit, searchTerm, filters, websiteId]);

  const { data: orderStat, isLoading: isStatsLoading } = useGetOrderStatsQuery(
    orderQueryParams,
    { skip: !canUseAuthenticatedOrderApis },
  );
  const {
    data: orders,
    isLoading,
    refetch,
    isFetching,
  } = useGetAllOrdersQuery(orderQueryParams, {
    skip: !canUseAuthenticatedOrderApis,
  });

  const hasMore = orders?.meta?.hasNextPage;
  const totalData = orders?.totalData;
  const orderss = orders?.data ?? [];

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
    dmoId: "all",
    authorityId: "all",
  };

  // Column visibility
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibility>(defaultColumns);

  const columns = [
    { key: "checkbox", label: "", width: "50px" },

    columnVisibility.productCount && {
      key: "productCount",
      label: t("productCount"),
      sortable: true,
      render: (order: any) => (
        <div className="text-sm">{order?.productCount ?? "-"}</div>
      ),
    },
    columnVisibility.totalOrderAmount && {
      key: "totalOrderAmount",
      label: t("totalOrderAmount"),
      sortable: true,
      render: (order: IOrder) => (
        <div className="text-sm font-medium">
          {order?.totalAmount != null
            ? `₪${order.totalAmount.toLocaleString()}`
            : "-"}
        </div>
      ),
    },
    columnVisibility.deliveryFee && {
      key: "deliveryFee",
      label: t("deliveryFee"),
      sortable: true,
      render: (order: IOrder) => (
        <div className="text-sm font-medium">
          {order?.deliveryFee != null
            ? `₪${order.deliveryFee.toLocaleString()}`
            : "-"}
        </div>
      ),
    },
    columnVisibility.status && {
      key: "status",
      label: t("order_status"),
      render: (order: IOrder) => getOrderStatusBadge(order.status),
    },
    columnVisibility.paymentStatus && {
      key: "paymentStatus",
      label: t("paymentStatus"),
      render: (order: IOrder) => getPaymentStatusBadge(order.paymentStatus),
    },
    columnVisibility.paymentMethod && {
      key: "paymentMethod",
      label: t("paymentMethod"),
      render: (order: IOrder) => (
        <div className="text-sm">
          {Array.isArray(order.paymentMethod) && order.paymentMethod.length > 0
            ? order.paymentMethod.map((m) => t(m)).join(", ")
            : order.paymentMethod || "-"}
        </div>
      ),
    },
    columnVisibility.createdAt && {
      key: "createdAt",
      label: t("created_date"),
      sortable: true,
      render: (order: IOrder) => (
        <div className="text-sm text-gray-500">
          {formatDateTime(order?.createdAt, language)}
        </div>
      ),
    },

    columnVisibility._id && {
      key: "_id",
      label: t("_id"),
      sortable: true,
      render: (order: any) => (
        <div className="text-sm">{order?._id ?? "-"}</div>
      ),
    },

    columnVisibility.name && {
      key: "name",
      label: t("purchaser_name_field"),
      sortable: true,
      render: (order: IOrder) => <div className="text-sm">{order?.name}</div>,
    },

    columnVisibility.email && {
      key: "email",
      label: t("purchaser_email"),
      render: (order: IOrder) => (
        <a
          href={`mailto:${order?.email}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-sm text-teal-500 hover:text-teal-600"
        >
          <Mail className="w-3 h-3" />
          {order?.email}
        </a>
      ),
    },

    columnVisibility.phone && {
      key: "phone",
      label: t("purchaser_phone"),
      render: (order: IOrder) => (
        <a
          href={`tel:${order?.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-sm text-teal-500 hover:text-teal-600"
        >
          <Phone className="w-3 h-3" />
          {order?.phone ? order.phone : "-"}
        </a>
      ),
    },
    columnVisibility.website && {
      key: "website",
      label: t("website"),
      render: (order: IOrder) => {
        const website = websiteMap[order.externalApiId ?? ""];
        if (!website) return <span className="text-sm text-gray-400">-</span>;
        return (
          <div className="flex items-center gap-1.5">
            {website.logoUrl && (
              <img
                src={website.logoUrl}
                alt={website.websiteName}
                className="w-5 h-5 object-contain rounded"
              />
            )}
            <span className="text-sm">{website.websiteName}</span>
          </div>
        );
      },
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    width?: string;
    sortable?: boolean;
    render?: (row: IOrder) => React.ReactNode;
  }[];

  const handleRowClick = (order: IOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const promptBulkResend = useCallback(
    (recipient: "VENDOR" | "CUSTOMER") => {
      if (!selectedOrders.size) return;
      setIsBulkDelete(true);
      setPendingRecipient(recipient);
      setIsConfirmOpen(true);
    },
    [selectedOrders.size],
  );

  const handleBulkResend = useCallback(
    async (recipient: "VENDOR" | "CUSTOMER") => {
      if (!selectedOrders.size) return;

      const toastId = toast.loading(t("resend_loading"));

      try {
        const results = await bulkOrdersUpdate({
          ordersId: Array.from(selectedOrders),
          emailRecipient: recipient,
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
    },
    [selectedOrders, bulkOrdersUpdate, refetch],
  );

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
      value: formatILS(orderStat?.totalRevenue),
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

  const getPaymentStatusBadge = (status: TPaymentStatus) => {
    const badges: Record<string, { bg: string; text: string; label: string }> =
      {
        PENDING: {
          bg: "bg-orange-100 dark:bg-orange-900/30",
          text: "text-orange-800 dark:text-orange-400",
          label: t("pending"),
        },
        SUCCESS: {
          bg: "bg-emerald-100 dark:bg-emerald-900/30",
          text: "text-emerald-800 dark:text-emerald-400",
          label: t("success"),
        },
        FAILURE: {
          bg: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-800 dark:text-red-400",
          label: t("failed"),
        },
        FAILED: {
          bg: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-800 dark:text-red-400",
          label: t("failed"),
        },
        REFUNDED: {
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-800 dark:text-blue-400",
          label: t("refunded"),
        },
        PARTIALLY_REFUNDED: {
          bg: "bg-orange-100 dark:bg-orange-900/30",
          text: "text-orange-800 dark:text-orange-400",
          label: t("partially_refunded"),
        },
      };
    const badge = badges[status];
    if (!badge)
      return <span className="text-xs text-gray-500">{status ?? "-"}</span>;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs ${badge.bg} ${badge.text}`}
      >
        {badge.label}
      </span>
    );
  };

  const getOrderStatusBadge = (status: IOrder["status"]) => {
    const badges = {
      pending: {
        bg: "bg-orange-100 dark:bg-orange-900/30",
        text: "text-orange-800 dark:text-orange-400",
        label: t("pending"),
      },
      processing: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-800 dark:text-blue-400",
        label: t("processing"),
      },
      completed: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-800 dark:text-emerald-400",
        label: t("completed"),
      },
      shipped: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-800 dark:text-emerald-400",
        label: t("shipped"),
      },
      canceled: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-800 dark:text-red-400",
        label: t("cancelled"),
      },
      draft: {
        bg: "bg-gray-100 dark:bg-gray-800",
        text: "text-gray-800 dark:text-gray-300",
        label: t("draft"),
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
      partially_cancelled: {
        bg: "bg-orange-100 dark:bg-orange-900/30",
        text: "text-orange-800 dark:text-orange-400",
        label: t("partiallyCancelled"),
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

  return (
    <div
      className={`h-[calc(100vh-7rem)] pt-10 md:pt-0 flex flex-col overflow-hidden ${isDark ? "bg-gray-950" : "bg-gray-50"}`}
    >
      {/* Page Header */}
      <div className="shrink-0">
        <div
          className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 ${isRTL ? "sm:flex-row-reverse" : ""}`}
        >
          <div
            className={`${isDark ? "border-gray-800" : "bg-transparent border-gray-200"} z-5 min-w-0`}
          >
            <PageHeader
              title={t("online_orders_management")}
              description={t("online_orders_subtitle")}
              h1Gradient="bg-linear-to-r text-transparent from-blue-500 via-indigo-600 to-purple-600"
              totalCount={totalData ?? 0}
            />
          </div>
          <div
            className={`flex gap-2 shrink-0 mb-4 md:mb-0 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            {canViewOrders && (
              <button
                onClick={getVideoStream}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? "border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300"
                    : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                }`}
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {canViewOrders ? (
          <PageStats
            stats={orderStats}
            isLoading={isStatsLoading}
            className="sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4"
            wrapperClassName="mb-3"
          />
        ) : (
          <UserStatsCards stats={orderStats} isLoading={isStatsLoading} />
        )}

        {/* Search and Filters */}
        {canViewOrders && (
          <div className="mb-3 mt-1">
            <div className="flex flex-col gap-2">
              <div className="flex-1 relative">
                <SearchInput
                  placeholder={t("search_orders")}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  storageKey="orderSearchTerm"
                />
              </div>

              <div className={`flex items-center gap-2 justify-between w-full`}>
                <div className="flex items-center gap-2">
                  <FilterButton value={showFilters} onChange={setShowFilters} />
                  <ShowColumns
                    t={t}
                    viewMode="list"
                    columnDefinitions={columnDefinitions}
                    columnVisibility={columnVisibility}
                    showColumnSettings={showColumnSettings}
                    setShowColumnSettings={setShowColumnSettings}
                    setColumnVisibility={setColumnVisibility}
                    resetToDefault={() =>
                      setColumnVisibility(ORDER_COLUMNS.defaultColumns)
                    }
                  />
                  <ExportOrdersButton
                    orders={combinedOrders}
                    selectedOrders={selectedOrders}
                    columnVisibility={columnVisibility}
                    websiteMap={websiteMap}
                    isSummaryMode={false}
                    summaryData={[]}
                    t={t}
                    tc={tc}
                    monthFilter={filters.month}
                    customDateFrom={filters.startDate}
                    customDateTo={filters.endDate}
                  />
                </div>

                {/* <ViewModeToggle onChange={setViewMode} value={viewMode} /> */}
              </div>
            </div>

            {showFilters && (
              <div className="flex flex-wrap items-start gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="min-w-45">
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

                <div className="min-w-55">
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
                    t={t}
                  />
                </div>

                <>
                  <div className="min-w-45">
                    <FilterSelect
                      label={t("deliveryType")}
                      value={filters.deliveryType}
                      onChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          deliveryType: value,
                        }))
                      }
                      options={[
                        { value: "all", label: t("all") },
                        { value: "pick_up", label: t("pickups") },
                        { value: "deliver", label: t("delivery") },
                      ]}
                    />
                  </div>

                  <div className="min-w-45">
                    <FilterSelect
                      label={t("paymentMethod")}
                      value={filters.paymentMethod}
                      onChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          paymentMethod: value,
                        }))
                      }
                      options={[
                        { value: "all", label: t("all") },
                        { value: "voucher", label: t("voucher") },
                        { value: "card", label: t("creditCard") },
                      ]}
                    />
                  </div>

                  {/* Active Filter Chips */}
                  {activeFilterChips?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3 mt-3">
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
                      <button
                        onClick={() => setFilters(defaultFilters)}
                        className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs hover:bg-red-500/30 transition-colors"
                      >
                        {t("clear_all")}
                      </button>
                    </div>
                  )}
                </>
              </div>
            )}
          </div>
        )}
      </div>
      {/* end shrink-0 */}

      <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
        <div>
          {selectedOrders.size > 0 && (
            <BulkActionBar
              selectedItemCount={selectedOrders.size}
              handleResendToVendor={() => promptBulkResend("VENDOR")}
              handleResendToCustomer={() => promptBulkResend("CUSTOMER")}
              hancleClearSelection={() => setSelectedOrders(new Set())}
            />
          )}
        </div>

        {/* Orders Table */}
        {canViewOrders && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div
              className={`${isDark ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"} border rounded-lg overflow-hidden`}
            >
              <OrderListView
                isLoading={isLoading || isFetching}
                storageKey="ordersTableColumnOrder"
                hasMore={hasMore}
                combinedOrders={combinedOrders}
                fetchNextPage={fetchNextPage}
                selectedOrders={selectedOrders}
                setSelectedOrders={setSelectedOrders}
                handleRowClick={handleRowClick}
                columns={columns}
              />
            </div>
          </div>
        )}
      </div>
      {/* end flex-1 */}

      {selectedOrder && showOrderDetails && (
        <OrderDetailsModal
          t={t}
          orderId={selectedOrder._id}
          onClose={() => {
            setShowOrderDetails(false);
            // setCombinedOrders([]);
            setPage(1);
            refetch();
          }}
          qrToken={isQRMode && !qrSessionReady ? qrToken : null}
          isQRMode={isQRMode && !qrSessionReady}
        />
      )}

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
          if (pendingRecipient && isBulkDelete) {
            handleBulkResend(pendingRecipient);
          }
          setIsConfirmOpen(false);
          setPendingRecipient(null);
        }}
      />
    </div>
  );
}
