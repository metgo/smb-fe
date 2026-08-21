import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo, useRef } from "react";
import * as XLSX from "xlsx";

import {
  Download,
  Loader,
  DollarSign,
  ShoppingCart,
  ShoppingBag,
  Truck,
  XCircle,
  Building2,
  SlidersHorizontal,
} from "lucide-react";

import { useAppSelector, useAppDispatch } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ShowColumns } from "@/components/shared";
import {
  FilterSelect,
  MonthFilter,
  ExportOrdersButton,
} from "../orders-mgmt/components";
import {
  useGetAllOrderSummaryQuery,
  useGetOrderStatsQuery,
} from "@/store/api/orderQueryApi";
import { FilterButton } from "@/components/btns";
import SearchInput from "@/components/shared/SearchInput";
import StatsMarquee from "@/components/shared/StatsMarquee";
import OrderListView from "../products-mgmt/components/sub-components/OrderListView";
import { getLngWiseStr } from "@/helpers";
import { routes } from "@/lib/routes";
import { useNavigate } from "react-router-dom";
import { OrdersModal } from "../orders-mgmt/components/OrdersModal";
import { formatILS } from "@/helpers/formatter";
import { setDmo, setAuthority } from "@/features/authSlice";
import { ORDER_SUMMARY_COLUMNS } from "@/lib/utils";

const limit = 20;

const { defaultColumns, columnDefinitions } = ORDER_SUMMARY_COLUMNS;

type SummaryColumnVisibility = typeof defaultColumns;

export default function OrdersSummaryMgmtPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("orders");
  const { t: tc } = useTranslation("common");
  const { dmoId, authorityId } = useAppSelector((state) => state.auth);
  const { isDark, isRTL, language } = useThemeClasses();
  const dispatch = useAppDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTermSummary, setSearchTermSummary] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showControlsDrawer, setShowControlsDrawer] = useState(false);
  const [_isScrolled, setIsScrolled] = useState(false);
  const columnSettingsRef = useRef<HTMLDivElement>(null);

  const [pageSummary, setPageSummary] = useState(1);

  const [summaryFilters, setSummaryFilters] = useState({
    status: "all",
    startDate: "",
    endDate: "",
    month: "all",
    dmoId: dmoId || "all",
    authorityId: authorityId || "all",
  });

  const [pendingDownloadId, setPendingDownloadId] = useState<string | null>(
    null,
  );

  const [businessOrderParams, setBusinessOrderParams] = useState<{
    page: number;
    limit: number;
    businessId?: string;
    detailedView: boolean;
  } | null>(null);

  const orderSummaryQueryParams = useMemo(() => {
    const params: any = {
      page: pageSummary,
      limit,
      dmoId: summaryFilters.dmoId !== "all" ? summaryFilters.dmoId : undefined,
      authorityId:
        summaryFilters.authorityId !== "all"
          ? summaryFilters.authorityId
          : undefined,
    };

    if (searchTermSummary) params.search = searchTermSummary;

    if (summaryFilters.status !== "all") {
      params.status = summaryFilters.status;
    }

    // Month filter
    if (summaryFilters.month !== "all" && summaryFilters.month !== "custom") {
      const [month, year] = summaryFilters.month.split("-");

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
    if (summaryFilters.month === "custom") {
      if (summaryFilters.startDate) params.startDate = summaryFilters.startDate;
      if (summaryFilters.endDate) params.endDate = summaryFilters.endDate;
    }

    return params;
  }, [pageSummary, searchTermSummary, summaryFilters, authorityId, dmoId]);

  const {
    data: orderSummaries,
    isFetching: isFetchingOrderSummary,
    isLoading: isLoadingOrderSummary,
  } = useGetAllOrderSummaryQuery(orderSummaryQueryParams);

  // Business-specific order summary query (runs only when businessOrderParams is set)
  const {
    data: businessOrderSummaries,
    isLoading: isLoadingBusinessOrderSummary,
    isFetching: isFetchingBusinessOrderSummary,
  } = useGetAllOrderSummaryQuery(businessOrderParams!, {
    skip: !businessOrderParams,
  });

  const ordersSummariess = orderSummaries?.data ?? [];
  const businessOrdersSummariess = businessOrderSummaries?.data ?? [];
  const [combinedOrdersSummary, setCombinedOrdersSummary] = useState<any[]>([]);

  const orderStatsParams = useMemo(() => {
    const { page: _page, limit: _limit, ...rest } = orderSummaryQueryParams;
    return rest;
  }, [orderSummaryQueryParams]);

  const { data: orderStat, isLoading: isStatsLoading } = useGetOrderStatsQuery(
    orderStatsParams,
  );

  const hasMoreSummary = orderSummaries?.meta?.hasNextPage;
  const totalDataSummary = orderSummaries?.totalData;

  useEffect(() => {
    setCombinedOrdersSummary([]);
    setPageSummary(1);
  }, [searchTermSummary, summaryFilters]);

  useEffect(() => {
    if (!ordersSummariess?.length) return;

    if (pageSummary === 1) {
      setCombinedOrdersSummary(ordersSummariess);
    } else {
      setCombinedOrdersSummary((prev) => {
        const existingIds = new Set(prev.map((b) => b._id));
        const newItems = ordersSummariess.filter(
          (b: any) => !existingIds.has(b._id),
        );

        return [...prev, ...newItems];
      });
    }
  }, [ordersSummariess, pageSummary]);

  const defaultSummaryFilters = {
    status: "all",
    startDate: "",
    endDate: "",
    month: "all",
    dmoId: "all",
    authorityId: "all",
  };

  const [columnVisibility, setColumnVisibility] =
    useState<SummaryColumnVisibility>(defaultColumns);

  const downloadAsXLS = (row: any) => {
    const workbook = XLSX?.utils?.book_new();

    const businessRows = [
      {
        Field: "Business Name",
        Value: getLngWiseStr(
          language,
          row?.businessName,
          row?.businessNameHe,
          row?.businessNameAr,
        ),
      },
      { Field: "Business Email", Value: row.businessEmail },
      { Field: "Country", Value: row.businessAddressCountry },
      { Field: "City", Value: row.businessAddressCity },
      { Field: "Location", Value: row.businessAddressLocation },
      { Field: "Authority", Value: row.authorityName },
      { Field: "DMO", Value: row.dmoName },
      { Field: "Total Orders", Value: row.totalNoOfOrders },
      { Field: "Total Amount", Value: row.totalAmount },
      { Field: "Total Credit Card", Value: row.totalAmountPaidByCreditCard },
      { Field: "Total Delivery Fee", Value: row.totalDeliveryFee },

      {},
    ];

    const orderRows = (row?.orders ?? []).map((order: any) => ({
      "Order ID": order.id,
      "Customer Name": `${order.firstName} ${order.lastName}`.trim(),
      Email: order.email,
      Phone: `+${order.countryCode}${order.phone}`,
      Address: order.address,
      Status: order.status,
      "Payment Status": order.paymentStatus,
      "Total Amount": order.totalAmount,
      "Delivery Fee": order.deliveryFee,
      "Credit Card Amount": order.amountPaidByCreditCard,
      "Order Date": new Date(order.orderInitiatedDate).toLocaleDateString(),
      "Success Date": new Date(order.orderSuccessDate).toLocaleDateString(),
      Products:
        order.products?.map((p: any) => p.name || p._id).join(", ") || "",
    }));

    const sheet = XLSX?.utils?.json_to_sheet(businessRows);

    if (orderRows.length > 0) {
      XLSX?.utils?.sheet_add_json(sheet, orderRows, {
        origin: businessRows.length + 1,
        skipHeader: false,
      });
    }

    XLSX?.utils?.book_append_sheet(workbook, sheet, "Business & Orders");
    XLSX?.writeFile(workbook, `${row.businessName}_orders.xlsx`);
  };

  useEffect(() => {
    if (businessOrderSummaries && pendingDownloadId) {
      const targetRow = businessOrdersSummariess.find(
        (item: any) => item._id === pendingDownloadId,
      );

      if (targetRow) {
        downloadAsXLS(targetRow);
      }

      setPendingDownloadId(null);
    }
  }, [businessOrderSummaries]);

  const summaryColumns = [
    {
      key: "businessName",
      label: t("business_name"),
      sortable: true,
      render: (row: any) => (
        <div className="text-sm">
          {getLngWiseStr(
            language,
            row?.businessName,
            row?.businessNameHe,
            row?.businessNameAr,
          )}
        </div>
      ),
    },
    {
      key: "dmoName",
      label: t("dmos"),
      sortable: true,
      render: (row: any) => <div className="text-sm">{row.dmoName || "-"}</div>,
    },
    {
      key: "authorityName",
      label: t("authorities"),
      sortable: true,
      render: (row: any) => (
        <div className="text-sm">{row.authorityName || "-"}</div>
      ),
    },
    {
      key: "businessAddressCity",
      label: t("business_address_city"),
      sortable: true,
      render: (row: any) => (
        <div className="text-sm">{row.businessAddressCity}</div>
      ),
    },
    {
      key: "businessAddressLocation",
      label: t("business_address_location"),
      sortable: true,
      render: (row: any) => (
        <div className="text-sm">{row.businessAddressLocation}</div>
      ),
    },
    {
      key: "totalNoOfOrders",
      label: t("total_no_of_orders"),
      sortable: true,
      render: (row: any) => (
        <div className="text-sm">{row.totalNoOfOrders}</div>
      ),
    },

    {
      key: "totalAmount",
      label: t("total_amount"),
      sortable: true,
      render: (row: any) => {
        const total = row.totalAmount || 0;

        return (
          <div className="text-sm font-medium">
            {total ? `₪${total.toLocaleString()}` : "-"}
          </div>
        );
      },
    },

    {
      key: "totalAmountPaidByCreditCard",
      label: t("total_amount_paid_by_credit_card"),
      sortable: true,
      render: (row: any) => (
        <div className="text-sm font-medium">
          {row.totalAmountPaidByCreditCard
            ? `₪${row.totalAmountPaidByCreditCard.toLocaleString()}`
            : "-"}
        </div>
      ),
    },

    {
      key: "actions",
      label: t("actions"),
      width: "100px",
      render: (row: any) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();

              setBusinessOrderParams({
                page: 1,
                limit: 10,
                businessId: row._id,
                detailedView: true,
              });

              setIsOpen(true);
            }}
            className="p-1 rounded"
          >
            <ShoppingBag className="w-4 h-4 text-green-600" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`${routes.businessDetails}?businessId=${row?._id}`, {
                replace: true,
              });
            }}
            className="p-1 rounded"
          >
            <Building2 className="w-4.5 h-4.5 text-yellow-500" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();

              setBusinessOrderParams({
                page: 1,
                limit: 10,
                businessId: row._id,
                detailedView: true,
              });
              setPendingDownloadId(row._id);
            }}
            className="p-1 rounded"
            disabled={
              pendingDownloadId === row._id && isFetchingBusinessOrderSummary
            }
          >
            {pendingDownloadId === row._id && isFetchingBusinessOrderSummary ? (
              <Loader className="w-4 h-4 animate-spin text-blue-500" />
            ) : (
              <Download className="w-4 h-4 text-blue-500" />
            )}
          </button>
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
      icon: <ShoppingCart className="w-5 h-5 text-blue-500" />,
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

  const fetchNextPageSummary = () => {
    if (!hasMoreSummary || isFetchingOrderSummary) return;
    setPageSummary((prev) => {
      return prev + 1;
    });
  };

  // ─── Active filter count (search term + any non-default filter values) ──
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTermSummary?.trim()) count += 1;
    if (summaryFilters.status !== "all") count += 1;
    if (summaryFilters.month !== "all") count += 1;
    if (summaryFilters.dmoId !== "all") count += 1;
    if (summaryFilters.authorityId !== "all") count += 1;
    return count;
  }, [searchTermSummary, summaryFilters]);

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
            : "bg-gray-100 border-gray-200 text-teal-700 hover:bg-gray-200 hover:border-teal-400"
      )}
      title={
        showControlsDrawer
          ? tc("close_options") ?? "Close Options"
          : tc("search_and_filters") ?? "Search & Filters"
      }
    >
      <SlidersHorizontal className="w-4 h-4" />
      {activeFilterCount > 0 && (
        <span
          className={clsx(
            "absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center leading-none",
            showControlsDrawer
              ? "bg-white text-teal-600"
              : "bg-teal-500 text-white"
          )}
        >
          {activeFilterCount > 9 ? "9+" : activeFilterCount}
        </span>
      )}
    </button>
  );

  return (
          <div className="flex flex-col pt-4 md:pt-0 gap-3 relative">

      {/* Sticky Top Header Bar (Title + Count + Filter Toggle + Stats) */}
      <div
        className={clsx(
          "shrink-0 sticky top-14 md:top-20 z-30 transition-all duration-200 py-2.5 px-3 md:px-4 rounded-2xl border backdrop-blur-md shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-3",
          isDark
            ? "bg-gray-950/95 border-gray-800/90 shadow-black/40 text-gray-100"
            : "bg-white/95 border-gray-200/90 shadow-gray-200/40 text-gray-900",
          isRTL && "xl:flex-row-reverse",
        )}
      >
        {/* Left: Title + Business Count (Top), Description (Below) */}
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
              <h1 className="text-base md:text-lg font-bold bg-clip-text bg-gradient-to-r text-transparent from-blue-500 via-indigo-600 to-purple-600 whitespace-nowrap">
                {t("online_orders_summary_management")}
              </h1>
              
            </div>

            <div className="block xl:hidden shrink-0">
              {filterToggleButton}
            </div>
          </div>
          <p
            className={clsx(
              "text-xs whitespace-nowrap",
              isDark ? "text-gray-500" : "text-gray-500",
            )}
          >
            {`${t("businesses_list")} ${totalDataSummary ? totalDataSummary : ""}`}
          </p>
        </div>

        {/* Right: Horizontal Scrollable Stats Cards Row */}
        <div
          dir="ltr"
          className="flex-1 min-w-0 flex flex-row items-center gap-2 overflow-x-auto flex-nowrap py-0.5 scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          <StatsMarquee
            stats={orderStats}
            isLoading={isStatsLoading}
            className="flex-1 min-w-0"
          />
        </div>

        {/* Filters Toggle Button Next to Stats (desktop) */}
        <div className="hidden xl:flex items-center gap-2 shrink-0">
          {filterToggleButton}
        </div>
      </div>

      {/* Expandable Search, Filters & Controls Panel */}
      {showControlsDrawer && (
        <div
          className={clsx(
            "shrink-0 transition-all duration-300 py-3 px-3 md:px-4 rounded-2xl border shadow-md flex flex-col gap-3 animate-in fade-in slide-in-from-top-2",
            isDark
              ? "bg-gray-900/90 border-gray-800/90"
              : "bg-white border-gray-200",
          )}
        >
          <div className="flex-1 relative">
            <SearchInput
              placeholder={t("search_orders")}
              searchTerm={searchTermSummary}
              setSearchTerm={setSearchTermSummary}
              storageKey="orderSummarySearchTerm"
            />
          </div>

          <div
            className={clsx(
              "flex items-center justify-between gap-2 w-full flex-wrap",
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
                  setColumnVisibility(ORDER_SUMMARY_COLUMNS.defaultColumns)
                }
              />
              <ExportOrdersButton
                orders={[]}
                selectedOrders={new Set()}
                columnVisibility={columnVisibility as any}
                websiteMap={{}}
                isSummaryMode={true}
                summaryData={combinedOrdersSummary}
                t={t}
                tc={tc}
                monthFilter={summaryFilters.month}
                customDateFrom={summaryFilters.startDate}
                customDateTo={summaryFilters.endDate}
              />
            </div>
          </div>

          {showFilters && (
            <div className="flex flex-wrap items-start gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="min-w-45">
                <FilterSelect
                  label={t("status")}
                  value={summaryFilters.status}
                  onChange={(value) =>
                    setSummaryFilters((prev) => ({
                      ...prev,
                      status: value,
                    }))
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
                  value={summaryFilters.month}
                  onChange={(value) =>
                    setSummaryFilters((prev) => ({
                      ...prev,
                      month: value,
                    }))
                  }
                  dateFrom={summaryFilters.startDate}
                  dateTo={summaryFilters.endDate}
                  onDateFromChange={(value) =>
                    setSummaryFilters((prev) => ({
                      ...prev,
                      startDate: value,
                    }))
                  }
                  onDateToChange={(value) =>
                    setSummaryFilters((prev) => ({
                      ...prev,
                      endDate: value,
                    }))
                  }
                  t={t}
                />
              </div>

              {(summaryFilters.status !== "all" ||
                summaryFilters.month !== "all") && (
                <div className="min-w-55 mt-10">
                  <button
                    onClick={() => {
                      setSummaryFilters(defaultSummaryFilters);
                      dispatch(setDmo(""));
                      dispatch(setAuthority(""));
                    }}
                    className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs hover:bg-red-500/30 transition-colors"
                  >
                    {t("clear_all")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Orders Summary Table */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div
            className={`${isDark ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"} border rounded-lg overflow-hidden`}
          >
            <OrderListView
              isLoading={isLoadingOrderSummary || isFetchingOrderSummary}
              storageKey="orderSummaryTableColumnOrder"
              hasMore={hasMoreSummary}
              combinedOrders={combinedOrdersSummary}
              fetchNextPage={fetchNextPageSummary}
              selectedOrders={new Set()}
              setSelectedOrders={() => {}}
              handleRowClick={() => {}}
              columns={summaryColumns}
            />
          </div>
        </div>
      </div>

      {/* Modal for showing orders from order summary */}
      <OrdersModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isLoading={
          isLoadingBusinessOrderSummary || isFetchingBusinessOrderSummary
        }
        businessOrdersSummaries={businessOrdersSummariess ?? []}
      />
    </div>
  );
}