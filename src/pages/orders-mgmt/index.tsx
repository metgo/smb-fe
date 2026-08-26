import clsx from "clsx";
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
  SlidersHorizontal,
} from "lucide-react";

import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useCommon } from "@/hooks/useCommon";
import { envKeys } from "@/lib/envKeys";
import {
  BulkActionBar,
  ConfirmDialog,
  FilterChips,
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
import StatsMarquee from "@/components/shared/StatsMarquee";
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
  const [showControlsDrawer, setShowControlsDrawer] = useState(false);
  const [_isScrolled, setIsScrolled] = useState(false);
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

  // ─── Collapse the controls drawer on scroll ────────────────────────────
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        (target && target.scrollTop && target.scrollTop > 20) ||
        window.scrollY > 20
      ) {
        setIsScrolled(true);
        setShowControlsDrawer(false);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });
    return () =>
      window.removeEventListener("scroll", handleScroll, {
        capture: true,
      } as any);
  }, []);

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

  // ─── Reusable icon-only filter toggle button ──────────────────────────
  const filterToggleButton = (
    <button
      onClick={() => setShowControlsDrawer((prev) => !prev)}
      className={clsx(
        "relative p-2 rounded-xl border transition-all cursor-pointer shrink-0",
        showControlsDrawer
          ? "bg-teal-600 text-white border-teal-500 shadow-teal-500/20"
          : isDark
            ? "bg-gray-900 border-gray-800 text-teal-400 hover:bg-gray-800 hover:border-teal-500/40"
            : "bg-gray-100 border-gray-200 text-teal-700 hover:bg-gray-200 hover:border-teal-400",
      )}
      title={
        showControlsDrawer
          ? (tc("close_options") ?? "Close Options")
          : (tc("search_and_filters") ?? "Search & Filters")
      }
    >
      <SlidersHorizontal className="w-4 h-4" />
      {activeFilterChips.length > 0 && (
        <span
          className={clsx(
            "absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center leading-none",
            showControlsDrawer
              ? "bg-white text-teal-600"
              : "bg-teal-500 text-white",
          )}
        >
          {activeFilterChips.length > 9 ? "9+" : activeFilterChips.length}
        </span>
      )}
    </button>
  );

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

  // Create stats params without page and limit
  const orderStatsQueryParams = useMemo(() => {
    const { page: _, limit: __, ...statsParams } = orderQueryParams;
    return statsParams;
  }, [orderQueryParams]);

  const { data: orderStat, isLoading: isStatsLoading } = useGetOrderStatsQuery(
    orderStatsQueryParams,
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
          bg: isDark ? "bg-orange-900/30" : "bg-orange-100",
          text: isDark ? "text-orange-400" : "text-orange-800",
          label: t("pending"),
        },
        SUCCESS: {
          bg: isDark ? "bg-emerald-900/30" : "bg-emerald-100",
          text: isDark ? "text-emerald-400" : "text-emerald-800",
          label: t("success"),
        },
        FAILURE: {
          bg: isDark ? "bg-red-900/30" : "bg-red-100",
          text: isDark ? "text-red-400" : "text-red-800",
          label: t("failed"),
        },
        FAILED: {
          bg: isDark ? "bg-red-900/30" : "bg-red-100",
          text: isDark ? "text-red-400" : "text-red-800",
          label: t("failed"),
        },
        REFUNDED: {
          bg: isDark ? "bg-blue-900/30" : "bg-blue-100",
          text: isDark ? "text-blue-400" : "text-blue-800",
          label: t("refunded"),
        },
        PARTIALLY_REFUNDED: {
          bg: isDark ? "bg-orange-900/30" : "bg-orange-100",
          text: isDark ? "text-orange-400" : "text-orange-800",
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
        bg: isDark ? "bg-orange-900/30" : "bg-orange-100",
        text: isDark ? "text-orange-400" : "text-orange-800",
        label: t("pending"),
      },
      processing: {
        bg: isDark ? "bg-blue-900/30" : "bg-blue-100",
        text: isDark ? "text-blue-400" : "text-blue-800",
        label: t("processing"),
      },
      completed: {
        bg: isDark ? "bg-emerald-900/30" : "bg-emerald-100",
        text: isDark ? "text-emerald-400" : "text-emerald-800",
        label: t("completed"),
      },
      shipped: {
        bg: isDark ? "bg-emerald-900/30" : "bg-emerald-100",
        text: isDark ? "text-emerald-400" : "text-emerald-800",
        label: t("shipped"),
      },
      canceled: {
        bg: isDark ? "bg-red-900/30" : "bg-red-100",
        text: isDark ? "text-red-400" : "text-red-800",
        label: t("cancelled"),
      },
      draft: {
        bg: isDark ? "bg-gray-800" : "bg-gray-100",
        text: isDark ? "text-gray-300" : "text-gray-800",
        label: t("draft"),
      },
      paid: {
        bg: isDark ? "bg-green-900/30" : "bg-green-100",
        text: isDark ? "text-green-400" : "text-green-800",
        label: t("paid"),
      },
      confirmed: {
        bg: isDark ? "bg-teal-900/30" : "bg-teal-100",
        text: isDark ? "text-teal-400" : "text-teal-800",
        label: t("confirmed"),
      },
      delivered: {
        bg: isDark ? "bg-purple-900/30" : "bg-purple-100",
        text: isDark ? "text-purple-400" : "text-purple-800",
        label: t("delivered"),
      },
      partially_cancelled: {
        bg: isDark ? "bg-orange-900/30" : "bg-orange-100",
        text: isDark ? "text-orange-400" : "text-orange-800",
        label: t("partiallyCancelled"),
      },
      failed: {
        bg: isDark ? "bg-red-900/30" : "bg-red-100",
        text: isDark ? "text-red-400" : "text-red-800",
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
    <div className="flex flex-col pt-4 md:pt-0 gap-3 relative">
      {/* Sticky Top Header Bar (Title + Count + Camera/Filter Toggle + Stats) */}
      <div
        className={clsx(
          "shrink-0 sticky top-14 md:top-20 z-30 transition-all duration-200 py-2.5 px-3 md:px-4 rounded-2xl border backdrop-blur-md shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-3",
          isDark
            ? "bg-gray-950/95 border-gray-800/90 shadow-black/40 text-gray-100"
            : "bg-white/95 border-gray-200/90 shadow-gray-200/40 text-gray-900",
          isRTL && "xl:flex-row-reverse",
        )}
      >
        {/* Left: Title + Order Count (Top), Description (Below) */}
        <div className="flex flex-col items-start gap-1 shrink-0 min-w-0">
          <div
            className={clsx(
              "flex items-center w-full justify-between gap-2",
              isRTL && "flex-row-reverse",
            )}
          >
            <div
              className={clsx(
                "flex items-center gap-1",
                isRTL && "flex-row-reverse",
              )}
            >
              <h1 className="text-base md:text-lg font-bold bg-clip-text bg-linear-to-r text-transparent from-blue-500 via-indigo-600 to-purple-600 whitespace-nowrap">
                {t("online_orders_management")}
              </h1>
              {totalData !== undefined && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
                  {totalData}
                </span>
              )}
            </div>

            <div
              className={clsx(
                "flex items-center gap-2 shrink-0",
                isRTL && "flex-row-reverse",
              )}
            >
              {canViewOrders && (
                <button
                  onClick={getVideoStream}
                  className={clsx(
                    "p-2 rounded-xl border transition-colors cursor-pointer",
                    isDark
                      ? "border-gray-800 bg-gray-900 hover:bg-gray-800 text-gray-300"
                      : "border-gray-200 bg-gray-100 hover:bg-gray-200 text-gray-700",
                  )}
                  title={t("scan_qr") ?? "Scan QR"}
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
              {canViewOrders && (
                <div className="block xl:hidden">{filterToggleButton}</div>
              )}
            </div>
          </div>
          <p
            className={clsx(
              "text-xs whitespace-nowrap",
              isDark ? "text-gray-500" : "text-gray-500",
            )}
          >
            {t("online_orders_subtitle")}
          </p>
        </div>

        {/* Right: Horizontal Scrollable Stats Cards Row */}
        <div
          dir="ltr"
          className="flex-1 min-w-0 flex flex-row items-center gap-2 overflow-x-auto flex-nowrap py-0.5 scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          {canViewOrders ? (
            <StatsMarquee
              stats={orderStats}
              isLoading={isStatsLoading}
              className="flex-1 min-w-0"
            />
          ) : (
            <UserStatsCards stats={orderStats} isLoading={isStatsLoading} />
          )}
        </div>

        {/* Filters Toggle Button Next to Stats (desktop) */}
        {canViewOrders && (
          <div className="hidden xl:flex items-center gap-2 shrink-0">
            {filterToggleButton}
          </div>
        )}
      </div>

      {/* Expandable Search, Filters & Controls Panel */}
      {canViewOrders && showControlsDrawer && (
        <div
          className={clsx(
            "shrink-0 transition-all duration-300 py-3 px-3 md:px-4 rounded-2xl border shadow-md flex flex-col gap-3 animate-in fade-in slide-in-from-top-2",
            isDark
              ? "bg-gray-900/90 border-gray-800/90"
              : "bg-white border-gray-200",
          )}
        >
          <div
            className={clsx(
              "flex flex-col lg:flex-row lg:items-center gap-3",
              isRTL && "lg:flex-row-reverse",
            )}
          >
            <div className="flex-1 min-w-0 relative">
              <SearchInput
                placeholder={t("search_orders")}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                storageKey="orderSearchTerm"
              />
            </div>

            <div
              className={clsx(
                "flex items-center justify-between gap-2 w-full lg:w-auto flex-wrap",
                isRTL && "flex-row-reverse",
              )}
            >
              <div className="flex items-center gap-2 flex-wrap">
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
            </div>
          </div>

          {showFilters && (
            <div
              className={`flex flex-wrap items-start gap-4 pt-4 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}
            >
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
