import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  Ticket,
  DollarSign,
  SlidersHorizontal,
} from "lucide-react";
import { FilterButton } from "@/components/btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ViewModeToggle } from "@/components/shared";
import ListHeaderBar from "@/components/shared/ListHeaderBar";
import { useGetEventsStatsQuery } from "@/store/api/eventQueryApi";
import { CreateEventWizardNew, EventsWithViewMode } from "./components";
import SearchInput from "@/components/shared/SearchInput";
import { FilterByStatus } from "@/components/filter-fields";
import { useEventListData } from "./hooks/useEventListData";

const STORAGE_KEY = "event_query_state";

export default function EventsMgmtPage() {
  const { t } = useTranslation("events");
  const { t: tc } = useTranslation("common");

  const navigate = useNavigate();

  const { textSecondary, inputClasses, textTertiary, isDark } =
    useThemeClasses();

  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [showControlsDrawer, setShowControlsDrawer] = useState(false);
  const [_isScrolled, setIsScrolled] = useState(false);

  const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const [searchQuery, setSearchQuery] = useState(savedState?.searchQuery || "");
  const [eventTypeFilter, setEventTypeFilter] = useState<
    "all" | "free" | "paid"
  >(savedState?.eventTypeFilter || "all");
  const [registrationFilter, setRegistrationFilter] = useState<
    "all" | "true" | "false"
  >(savedState?.registrationFilter || "all");
  const [statusFilter, setStatusFilter] = useState<any | "all">(
    savedState?.statusFilter || "all",
  );
  const [dateRangeFilter, setDateRangeFilter] = useState({
    start: savedState?.dateRangeFilter?.start || "",
    end: savedState?.dateRangeFilter?.end || "",
  });

  const hasSavedFilters =
    eventTypeFilter !== "all" ||
    registrationFilter !== "all" ||
    statusFilter !== "all" ||
    dateRangeFilter?.start !== "" ||
    dateRangeFilter?.end !== "";

  useEffect(() => {
    const queryState = {
      eventTypeFilter,
      registrationFilter,
      statusFilter,
      dateRangeFilter,
      searchQuery,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(queryState));
  }, [
    registrationFilter,
    statusFilter,
    dateRangeFilter,
    eventTypeFilter,
    searchQuery,
  ]);

  // Data Fetch (paginated, infinite scroll)
  const {
    combinedEvents,
    isLoading,
    isFetching,
    refetch,
    hasMore,
    totalData,
    eventQueryParams,
    fetchNextPage,
  } = useEventListData(
    { eventTypeFilter, registrationFilter, statusFilter, dateRangeFilter },
    searchQuery,
  );

  useEffect(() => {
    const urlParams: Record<string, any> = {};

    if (eventQueryParams.search) urlParams.search = eventQueryParams.search;
    if (eventQueryParams.status) urlParams.status = eventQueryParams.status;
    if (eventQueryParams.isFree) urlParams.isFree = eventQueryParams.isFree;
    if (eventQueryParams.isRegistration)
      urlParams.isRegistration = eventQueryParams.isRegistration;
    if (eventQueryParams.startDate)
      urlParams.startDate = eventQueryParams.startDate;
    if (eventQueryParams.endDate) urlParams.endDate = eventQueryParams.endDate;

    const searchParams = new URLSearchParams(urlParams).toString();
    navigate(`?${searchParams}`, { replace: true });
  }, [eventQueryParams, navigate]);

  const statsQueryParams = useMemo(() => {
    const { page, limit, status, locale, ...rest } = eventQueryParams;
    return rest;
  }, [eventQueryParams]);

  const { data: eventStatsData, isLoading: isEventStatsFetching } =
    useGetEventsStatsQuery(statsQueryParams);

  const [viewMode, setViewMode] = useState<"list" | "grid" | "calendar">(
    (localStorage.getItem("eventViewMode") as "list" | "grid") ?? "list",
  );

  const handleAddEvent = () => {
    setIsCreateWizardOpen(true);
    navigate({}, { replace: true });
  };

  const handleCreateWizardClose = () => {
    navigate({}, { replace: true });
    setIsCreateWizardOpen(false);
  };

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

  // ─── Active filter count (search term + any non-default filter values) ──
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery?.trim()) count += 1;
    if (eventTypeFilter !== "all") count += 1;
    if (registrationFilter !== "all") count += 1;
    if (statusFilter !== "all") count += 1;
    if (dateRangeFilter.start || dateRangeFilter.end) count += 1;
    return count;
  }, [
    searchQuery,
    eventTypeFilter,
    registrationFilter,
    statusFilter,
    dateRangeFilter,
  ]);

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

  const eventStats = [
    {
      id: 1,
      title: t("total_events"),
      value: eventStatsData?.totalEventsCount,
      label: `${eventStatsData?.upcomingEventsCount} ${t("upcoming")}`,
      labelClass: "text-green-500",
      icon: <Calendar className="w-5 h-5 text-teal-500" />,
    },
    {
      id: 2,
      title: t("total_registrations"),
      value: eventStatsData?.totalRegistration,
      icon: <Users className="w-5 h-5 text-blue-500" />,
    },
    {
      id: 3,
      title: t("total_revenue"),
      value: `₪${(eventStatsData?.totalRevenue / 1000).toFixed(1)}K`,
      icon: <DollarSign className="w-5 h-5 text-green-500" />,
    },
    {
      id: 4,
      title: t("avg_capacity_fill"),
      value: `${eventStatsData?.avgCapacityFill}%`,
      icon: <Ticket className="w-5 h-5 text-purple-500" />,
    },
  ];

  return (
    <>
          <div className="flex flex-col pt-4 md:pt-0 gap-3 relative">
        {/* Sticky Top Header Bar (Title + Add Button + Stats) */}
        <div
          className={clsx(
            "shrink-0 sticky top-14 md:top-20 z-30 transition-all duration-200 py-2.5 px-3 md:px-4 rounded-2xl border backdrop-blur-md shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-3",
            isDark
              ? "bg-gray-950/95 border-gray-800/90 shadow-black/40 text-gray-100"
              : "bg-white/95 border-gray-200/90 shadow-gray-200/40 text-gray-900"
          )}
        >
          <ListHeaderBar
            title={t("events_management_dashboard")}
            count={totalData}
            addLabel={t("add_event")}
            onAdd={handleAddEvent}
            stats={eventStats}
            isStatsLoading={isEventStatsFetching}
            filterToggle={filterToggleButton}
          />
        </div>

        {/* Expandable Search, Filters & Controls Panel */}
        {showControlsDrawer && (
          <div
            className={clsx(
              "shrink-0 transition-all duration-300 py-3 px-3 md:px-4 rounded-2xl border shadow-md flex flex-col gap-3 animate-in fade-in slide-in-from-top-2",
              isDark
                ? "bg-gray-900/90 border-gray-800/90"
                : "bg-white border-gray-200"
            )}
          >
            <div className="flex-1 relative">
              <SearchInput
                placeholder={t("search_events_placeholder")}
                searchTerm={searchQuery}
                setSearchTerm={setSearchQuery}
                storageKey="eventSearchTerm"
              />
            </div>

            <div className="flex items-center justify-between gap-2 w-full flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <FilterButton value={showFilters} onChange={setShowFilters} />
              </div>

              <ViewModeToggle
                showCalendor
                onChange={setViewMode}
                value={viewMode}
                tableName="eventViewMode"
              />
            </div>

            {(showFilters || hasSavedFilters) && (
              <div className={clsx(inputClasses, "px-4 pb-2 rounded-md")}>
                {/* Collapsible Filters */}
                <div className="grid grid-cols-12 gap-2 pt-2 dark:border-gray-700">
                  {/* Event Type */}
                  <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                    <label className={`block text-sm mb-2 ${textSecondary}`}>
                      {t("event_type")}
                    </label>
                    <select
                      value={eventTypeFilter}
                      onChange={(e) =>
                        setEventTypeFilter(e.target.value as any)
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark
                          ? "bg-gray-900 border-gray-700 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    >
                      <option value="all">{tc("all")}</option>
                      <option value="free">{tc("free")}</option>
                      <option value="paid">{tc("paid")}</option>
                    </select>
                  </div>

                  {/* Registration Required */}
                  <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                    <label className={`block text-sm mb-2 ${textSecondary}`}>
                      {t("registration")}
                    </label>
                    <select
                      value={registrationFilter}
                      onChange={(e) =>
                        setRegistrationFilter(e.target.value as any)
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark
                          ? "bg-gray-900 border-gray-700 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    >
                      <option value="all">{tc("all")}</option>
                      <option value="true">{tc("required")}</option>
                      <option value="false">{tc("not_required")}</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div className="col-span-12 sm:col-span-6 lg:col-span-2">
                    <FilterByStatus
                      filters={statusFilter}
                      setFilters={(newStatus) =>
                        setStatusFilter(newStatus.status)
                      }
                    />
                  </div>

                  {/* Date Range */}
                  <div className="col-span-12 sm:col-span-6 lg:col-span-4">
                    <label className={`block text-sm mb-2 ${textSecondary}`}>
                      {t("date_range")}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={dateRangeFilter.start}
                        onChange={(e) =>
                          setDateRangeFilter({
                            ...dateRangeFilter,
                            start: e.target.value,
                          })
                        }
                        className={`w-full px-3 py-2 rounded-lg border text-sm ${
                          isDark
                            ? "bg-gray-900 border-gray-700 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      />
                      <input
                        type="date"
                        value={dateRangeFilter.end}
                        onChange={(e) =>
                          setDateRangeFilter({
                            ...dateRangeFilter,
                            end: e.target.value,
                          })
                        }
                        className={`w-full px-3 py-2 rounded-lg border text-sm ${
                          isDark
                            ? "bg-gray-900 border-gray-700 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Active Filters Summary */}
                {(eventTypeFilter !== "all" ||
                  registrationFilter !== "all" ||
                  statusFilter !== "all" ||
                  dateRangeFilter.start ||
                  dateRangeFilter.end ||
                  searchQuery) && (
                  <div className=" pt-4 flex items-center gap-2 flex-wrap">
                    <span className={`text-sm ${textTertiary}`}>
                      {t("active_filters")}:
                    </span>

                    {/* Search Query */}
                    {searchQuery && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-teal-500/20 text-teal-500 rounded-full text-xs">
                        "{searchQuery}"
                        <button
                          onClick={() => setSearchQuery("")}
                          className="ml-1 text-teal-500 hover:text-teal-700 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    )}

                    {/* Event Type Filter */}
                    {eventTypeFilter !== "all" && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-500 rounded-full text-xs">
                        {eventTypeFilter === "free" ? t("free") : t("paid")}
                        <button
                          onClick={() => setEventTypeFilter("all")}
                          className="ml-1 text-purple-500 hover:text-purple-700 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    )}

                    {/* Registration Filter */}
                    {registrationFilter !== "all" && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-xs">
                        {registrationFilter === "true"
                          ? t("registration_required")
                          : t("registration_not_required")}
                        <button
                          onClick={() => setRegistrationFilter("all")}
                          className="ml-1 text-green-500 hover:text-green-700 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    )}

                    {/* Status Filter */}
                    {statusFilter !== "all" && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-xs capitalize">
                        {statusFilter === "APPROVED"
                          ? t("approved")
                          : statusFilter === "PENDING"
                            ? t("pending")
                            : t("draft")}
                        <button
                          onClick={() => setStatusFilter("all")}
                          className="ml-1 text-orange-500 hover:text-orange-700 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    )}

                    {/* Date Range Filter */}
                    {dateRangeFilter.start !== "" &&
                      dateRangeFilter.end !== "" && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-xs capitalize">
                          {dateRangeFilter.start} - {dateRangeFilter.end}
                          <button
                            onClick={() =>
                              setDateRangeFilter({ start: "", end: "" })
                            }
                            className="ml-1 text-orange-500 hover:text-orange-700 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      )}

                    {/* Clear All */}
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setEventTypeFilter("all");
                        setRegistrationFilter("all");
                        setStatusFilter("all");
                        setDateRangeFilter({ start: "", end: "" });
                        localStorage.removeItem(STORAGE_KEY);
                        localStorage.removeItem("eventSearchTerm");
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

        {/* Events with different View */}
        <div className="flex-1 mt-1">
          <EventsWithViewMode
            isLoading={isLoading || isFetching}
            events={combinedEvents}
            refetch={refetch}
            hasMore={hasMore}
            fetchNextPage={fetchNextPage}
            eventTypeFilter={eventTypeFilter}
            registrationFilter={registrationFilter}
            statusFilter={statusFilter}
            searchQuery={searchQuery}
            viewMode={viewMode}
          />
        </div>
      </div>
      {/* Create Event Wizard */}
      <CreateEventWizardNew
        isOpen={isCreateWizardOpen}
        onClose={handleCreateWizardClose}
        refetch={refetch}
      />
    </>
  );
}