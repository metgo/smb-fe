import axios from "axios";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";

import { useAppSelector } from "@/hooks/hooks";
import { envKeys } from "@/lib/envKeys";
import {
  useGetAllOrdersQuery,
  useGetOrderStatsQuery,
} from "@/store/api/orderQueryApi";
import { useGetAllWebsitesQuery } from "@/store/api/websiteConfigApi";
import { useBulkOrdersUpdateMutation } from "@/store/api/orderMutationApi";
import {
  useGetBusinessForProductQuery,
  useLazyGetBusinessForProductQuery,
} from "@/store/api/businessQueryApi";
import { useUserRoles } from "@/hooks/useUserRoles";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useViewMode } from "@/hooks/useViewMode";
import { useRemoteSelectData } from "@/hooks/useRemoteSelectData";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useCommon } from "@/hooks/useCommon";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ORDER_COLUMNS } from "@/lib/utils";

const limit = 20;

// Backend `paymentStatus` query enum:
// SUCCESS, FAILURE, PENDING, CANCELING, REFUND_IN_PROCESS, REFUND_SUCCESS, UNPAID
export const PAYMENT_STATUS_FILTER_OPTIONS: {
  value: string;
  labelKey: string;
}[] = [
  { value: "SUCCESS", labelKey: "success" },
  { value: "FAILURE", labelKey: "failed" },
  { value: "PENDING", labelKey: "pending" },
  { value: "CANCELING", labelKey: "cancelling" },
  { value: "REFUND_IN_PROCESS", labelKey: "refund_in_process" },
  { value: "REFUND_SUCCESS", labelKey: "refund_success" },
  { value: "UNPAID", labelKey: "unpaid" },
];

export const ITEM_TYPE_FILTER_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "PRODUCT", labelKey: "products" },
  { value: "TICKET", labelKey: "tickets" },
  { value: "BUSINESS", labelKey: "itemTypeBusiness" },
  { value: "PUNCH_PASS", labelKey: "punchPasses" },
];

const { defaultColumns } = ORDER_COLUMNS;

type ColumnVisibility = typeof defaultColumns;

const defaultFilters = {
  orderType: "all",
  deliveryType: "all",
  paymentMethod: "all",
  paymentStatus: "all",
  itemType: "all",
  vendor: "all",
  status: "all",
  campaign: "all",
  month: "all",
  startDate: "",
  endDate: "",
  dmoId: "all",
  authorityId: "all",
  businessId: "all",
  amount: "",
};

export function useOrdersMgmt() {
  const { t } = useTranslation("orders");
  const { t: tc } = useTranslation("common");
  const { language } = useThemeClasses();
  const { dmoId, authorityId, websiteId } = useAppSelector(
    (state) => state.auth,
  );
  const { isSuperadmin, isTraveller } = useUserRoles();
  const { dmosAuthorities } = useCommon();

  // QR Token handling - detect from URL on first load
  const urlParams = new URLSearchParams(window.location.search);
  const jwtToken = urlParams.get("token");
  const urlOrderId = urlParams.get("orderId");
  const storedQrMode = sessionStorage.getItem("isQrMode") === "true";
  const qrToken =
    jwtToken || (storedQrMode ? sessionStorage.getItem("qr_token") : null);
  const isQRMode = !!qrToken;
  const [qrSessionReady, setQrSessionReady] = useState(
    () =>
      !isQRMode ||
      (!jwtToken && sessionStorage.getItem("isQrVerified") === "true"),
  );
  const canUseAuthenticatedOrderApis = !isQRMode || qrSessionReady;

  const [searchTerm, setSearchTerm] = usePersistentState(
    "orders_mgmt_search",
    "",
  );
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const [showQRScanner, setShowQRScanner] = useState(false);
  const [viewMode, setViewMode] = useViewMode("ordersViewMode");
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
  const [filters, setFilters] = usePersistentState("orders_mgmt_filters", {
    paymentMethod: "all",
    paymentStatus: "all",
    itemType: "all",
    deliveryType: "all",
    status: "all",
    startDate: "",
    endDate: "",
    month: "all", // 'all', 'MM-YYYY', or 'custom'
    dmoId: dmoId || "all",
    authorityId: authorityId || "all",
    businessId: "all",
    amount: "",
  });

  // Business filter - scoped to the currently selected dmo/authority, same
  // as the role-based scoping the backend already applies to the order list
  const { data: businessData, isLoading: isBusinessesLoading } =
    useGetBusinessForProductQuery({
      locale: language,
      limit: 20,
      page: 1,
      dmoId: filters.dmoId !== "all" ? filters.dmoId : undefined,
      authorityId:
        filters.authorityId !== "all" ? filters.authorityId : undefined,
    });
  const [getBusinessList] = useLazyGetBusinessForProductQuery();

  const {
    items: businesses,
    search: searchBusiness,
    isSearching: isBusinessSearching,
  } = useRemoteSelectData({
    initialData: businessData?.data,
    debounceMs: 400,
    searchParams: {
      locale: language,
      dmoId: filters.dmoId !== "all" ? filters.dmoId : undefined,
      authorityId:
        filters.authorityId !== "all" ? filters.authorityId : undefined,
    },
    lazySearch: async (params) => {
      const res = await getBusinessList(params).unwrap();
      return { data: res?.data };
    },
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
        businessId: "all",
      }));
    }
  }, [dmoId]);

  useEffect(() => {
    if (authorityId !== lastGlobalAuthorityId.current) {
      lastGlobalAuthorityId.current = authorityId;
      setFilters((prev) => ({
        ...prev,
        authorityId: authorityId || "all",
        businessId: "all",
      }));
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

    if (filters.paymentStatus !== "all") {
      const opt = PAYMENT_STATUS_FILTER_OPTIONS.find(
        (o) => o.value === filters.paymentStatus,
      );
      chips.push({
        key: "paymentStatus",
        value: opt ? t(opt.labelKey) : filters.paymentStatus,
      });
    }

    if (filters.itemType && filters.itemType !== "all") {
      const opt = ITEM_TYPE_FILTER_OPTIONS.find(
        (o) => o.value === filters.itemType,
      );
      chips.push({
        key: "itemType",
        value: opt ? t(opt.labelKey) : filters.itemType,
      });
    }

    if (filters.month !== "all" && filters.month !== "custom")
      chips.push({ key: "month", value: filters.month });

    if (filters.amount !== "")
      chips.push({ key: "amount", value: `₪${filters.amount}` });

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

    if (filters.businessId !== "all") {
      const business = businesses?.find((b) => b._id === filters.businessId);
      chips.push({
        key: "businessId",
        value: business?.name || filters.businessId,
      });
    }

    return chips;
  }, [filters, dmosAuthorities, businesses, t]);

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
      businessId: filters.businessId !== "all" ? filters.businessId : undefined,
      websiteId,
    };

    if (searchTerm) params.search = searchTerm;

    if (filters.deliveryType !== "all") {
      params.deliveryType = filters.deliveryType;
    }

    if (filters.paymentMethod !== "all") {
      params.paymentMethod = filters.paymentMethod;
    }
    if (filters.paymentStatus !== "all") {
      params.paymentStatus = filters.paymentStatus;
    }
    if (filters.status !== "all") {
      params.status = filters.status;
    }
    if (filters.itemType && filters.itemType !== "all") {
      params.itemType = filters.itemType;
    }

    if (filters.amount !== "") {
      params.amount = filters.amount;
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
  }, [page, searchTerm, filters, websiteId]);

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

  // Column visibility
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibility>(defaultColumns);

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
    [selectedOrders, bulkOrdersUpdate, refetch, t],
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

  return {
    t,
    tc,

    // QR mode
    isQRMode,
    qrSessionReady,
    canUseAuthenticatedOrderApis,

    // search & filters
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    defaultFilters,
    activeFilterChips,
    showFilters,
    setShowFilters,

    // business filter
    businesses,
    searchBusiness,
    isBusinessesLoading,
    isBusinessSearching,

    // selection
    selectedOrders,
    setSelectedOrders,

    // column visibility
    showColumnSettings,
    setShowColumnSettings,
    columnSettingsRef,
    columnVisibility,
    setColumnVisibility,

    // view mode
    viewMode,
    setViewMode,

    // order details modal
    showOrderDetails,
    setShowOrderDetails,
    selectedOrder,
    handleRowClick,

    // QR scanner / camera
    showQRScanner,
    stream,
    getVideoStream,
    stopCamera,

    // data
    canViewOrders,
    combinedOrders,
    websiteMap,
    orderStat,
    isStatsLoading,
    isLoading,
    isFetching,
    refetch,
    hasMore,
    totalData,
    fetchNextPage,
    qrToken,

    // bulk resend
    isConfirmOpen,
    setIsConfirmOpen,
    isBulkDelete,
    setIsBulkDelete,
    pendingRecipient,
    setPendingRecipient,
    promptBulkResend,
    handleBulkResend,
  };
}
