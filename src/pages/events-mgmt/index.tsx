import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, Ticket, DollarSign } from "lucide-react";
import { FilterButton } from "@/components/btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useViewMode } from "@/hooks/useViewMode";
import { ViewModeToggle } from "@/components/shared";
import ListHeaderBar from "@/components/shared/ListHeaderBar";
import { useGetEventsStatsQuery } from "@/store/api/eventQueryApi";
import { CreateEventWizardNew, EventsWithViewMode } from "./components";
import SearchInput from "@/components/shared/SearchInput";
import { FilterByStatus } from "@/components/filter-fields";
import { ReactSelect } from "@/components/form-fields";
import { useEventListData } from "./hooks/useEventListData";
import { formatILS } from "@/helpers/formatter";

const STORAGE_KEY = "event_query_state";

export default function EventsMgmtPage() {
  const { t } = useTranslation("events");
  const { t: tc } = useTranslation("common");

  const navigate = useNavigate();

  const { textSecondary, inputClasses, isDark } = useThemeClasses();

  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);

  // Filters
  const [showFilters, setShowFilters] = useState(false);

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
  const [timeFilter, setTimeFilter] = useState<"all" | "UPCOMING" | "EXPIRED">(
    savedState?.timeFilter || "UPCOMING",
  );

  const hasSavedFilters =
    eventTypeFilter !== "all" ||
    registrationFilter !== "all" ||
    statusFilter !== "all" ||
    timeFilter !== "all" ||
    dateRangeFilter?.start !== "" ||
    dateRangeFilter?.end !== "";

  useEffect(() => {
    const queryState = {
      eventTypeFilter,
      registrationFilter,
      statusFilter,
      dateRangeFilter,
      timeFilter,
      searchQuery,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(queryState));
  }, [
    registrationFilter,
    statusFilter,
    dateRangeFilter,
    eventTypeFilter,
    timeFilter,
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
    {
      eventTypeFilter,
      registrationFilter,
      statusFilter,
      dateRangeFilter,
      timeFilter,
    },
    searchQuery,
  );

  useEffect(() => {
    const urlParams: Record<string, any> = {};

    if (eventQueryParams.search) urlParams.search = eventQueryParams.search;
    if (eventQueryParams.status) urlParams.status = eventQueryParams.status;
    if (eventQueryParams.isFree) urlParams.isFree = eventQueryParams.isFree;
    if (eventQueryParams.isRegistration)
      urlParams.isRegistration = eventQueryParams.isRegistration;
    if (eventQueryParams.timeFilter)
      urlParams.timeFilter = eventQueryParams.timeFilter;

    const searchParams = new URLSearchParams(urlParams).toString();
    navigate(`?${searchParams}`, { replace: true });
  }, [eventQueryParams, navigate]);

  const statsQueryParams = useMemo(() => {
    const { page, limit, status, locale, ...rest } = eventQueryParams;
    return rest;
  }, [eventQueryParams]);

  const { data: eventStatsData, isLoading: isEventStatsFetching } =
    useGetEventsStatsQuery(statsQueryParams);

  const [viewMode, setViewMode] = useViewMode("eventViewMode");

  const handleAddEvent = () => {
    setIsCreateWizardOpen(true);
    navigate({}, { replace: true });
  };

  const handleCreateWizardClose = () => {
    navigate({}, { replace: true });
    setIsCreateWizardOpen(false);
  };

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
      value: formatILS(eventStatsData?.totalRevenue),
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
              : "bg-white/95 border-gray-200/90 shadow-gray-200/40 text-gray-900",
          )}
        >
          <ListHeaderBar
            title={t("events_management_dashboard")}
            count={totalData}
            addLabel={t("add_event")}
            onAdd={handleAddEvent}
            stats={eventStats}
            isStatsLoading={isEventStatsFetching}
          />
        </div>

        {/* Search bar (always visible) + collapsible controls on the same row */}
        <div
          className={clsx(
            "shrink-0 transition-all duration-300 py-3 px-3 md:px-4 rounded-2xl border shadow-md flex flex-col gap-3",
            isDark
              ? "bg-gray-900/90 border-gray-800/90"
              : "bg-white border-gray-200",
          )}
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex-1 min-w-0 relative" data-tour="search">
              <SearchInput
                placeholder={t("search_events_placeholder")}
                searchTerm={searchQuery}
                setSearchTerm={setSearchQuery}
                storageKey="eventSearchTerm"
              />
            </div>

            <div className="flex items-center justify-between gap-2 w-full lg:w-auto flex-wrap">
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
          </div>

          {(showFilters || hasSavedFilters) && (
            <div className={clsx(inputClasses, "px-4 pb-2 rounded-md")}>
              {/* Collapsible Filters */}
              <div className="grid grid-cols-12 gap-2 items-center pt-2 dark:border-gray-700">
                {/* Event Type */}
                <div className="col-span-12 sm:col-span-4 lg:col-span-2">
                  <label className={`block text-sm mb-2 ${textSecondary}`}>
                    {t("event_type")}
                  </label>
                  <ReactSelect
                    isClearable
                    placeholder={tc("all")}
                    value={eventTypeFilter !== "all" ? eventTypeFilter : ""}
                    onChange={(v) => setEventTypeFilter((v || "all") as any)}
                    items={[
                      { _id: "free", name: tc("free") },
                      { _id: "paid", name: tc("paid") },
                    ]}
                    minWidth={160}
                  />
                </div>

                {/* Registration Required */}
                <div className="col-span-12 sm:col-span-4 lg:col-span-2">
                  <label className={`block text-sm mb-2 ${textSecondary}`}>
                    {t("registration")}
                  </label>
                  <ReactSelect
                    isClearable
                    placeholder={tc("all")}
                    value={
                      registrationFilter !== "all" ? registrationFilter : ""
                    }
                    onChange={(v) => setRegistrationFilter((v || "all") as any)}
                    items={[
                      { _id: "true", name: tc("required") },
                      { _id: "false", name: tc("not_required") },
                    ]}
                    minWidth={160}
                  />
                </div>

                {/* Status */}
                <div className="col-span-12 sm:col-span-6 lg:col-span-2">
                  <FilterByStatus
                    filters={{ status: statusFilter }}
                    setFilters={(newStatus) =>
                      setStatusFilter(newStatus.status)
                    }
                  />
                </div>

                {/* Time Status */}
                <div className="col-span-12 sm:col-span-6 lg:col-span-2">
                  <label className={`block text-sm mb-2 ${textSecondary}`}>
                    {t("time_status")}
                  </label>
                  <ReactSelect
                    isClearable
                    placeholder={tc("all")}
                    value={timeFilter !== "all" ? timeFilter : ""}
                    onChange={(v) => setTimeFilter((v || "all") as any)}
                    items={[
                      { _id: "UPCOMING", name: t("upcoming") },
                      { _id: "EXPIRED", name: tc("expired") },
                    ]}
                    minWidth={160}
                  />
                </div>

                {/* Clear All */}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setEventTypeFilter("all");
                    setRegistrationFilter("all");
                    setStatusFilter("all");
                    setTimeFilter("all");
                    setDateRangeFilter({ start: "", end: "" });
                    localStorage.removeItem(STORAGE_KEY);
                    localStorage.removeItem("eventSearchTerm");
                  }}
                  className=" py-1 mt-6 h-8 bg-red-500/20 text-red-500 rounded-md text-xs cursor-pointer hover:bg-red-500/30 transition-colors"
                >
                  {t("clear_all")}
                </button>
              </div>
            </div>
          )}
        </div>

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
