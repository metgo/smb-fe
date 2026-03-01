import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, Ticket, DollarSign } from "lucide-react";
import { FilterButton } from "@/components/btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { PageHeader, PageStats, ViewModeToggle } from "@/components/shared";
import {
  useGetAllEventsQuery,
  useGetEventsStatsQuery,
} from "@/store/api/eventQueryApi";
import { EventsWithViewMode, CreateEventWizard } from "./components";
import SearchInput from "@/components/shared/SearchInput";
import { useAppSelector } from "@/hooks/hooks";
import { FilterByStatus } from "@/components/filter-fields";

export default function EventsMgmtPage() {
  const { t } = useTranslation("events");
  const { t: tc } = useTranslation("common");
  const { dmoId, authorityId, websiteId } = useAppSelector(
    (state) => state.auth,
  );

  const navigate = useNavigate();

  const { textPrimary, textSecondary, inputClasses, textTertiary, isDark } =
    useThemeClasses();

  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);

  // Filters
  const [showFilters, setShowFilters] = useState(false);

  const STORAGE_KEY = "event_query_state";

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
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(queryState));
  }, [registrationFilter, statusFilter, dateRangeFilter, eventTypeFilter]);

  const eventQueryParams = useMemo(() => {
    const params: any = {
      dmoId,
      authorityId,
      externalApiId: websiteId,
    };

    const finalSearchTerm =
      localStorage.getItem("eventsSearchTerm") ?? searchQuery;
    if (finalSearchTerm) params.search = finalSearchTerm;

    if (eventTypeFilter === "free") {
      params.isFree = true;
    }

    if (eventTypeFilter === "paid") {
      params.isFree = false;
    }

    if (registrationFilter !== "all") {
      params.isRegistration = Boolean(registrationFilter);
    }

    if (statusFilter !== "all") {
      params.status = statusFilter;
    }

    if (dateRangeFilter.start) {
      params.startDate = dateRangeFilter.start;
    }

    if (dateRangeFilter.end) {
      params.endDate = dateRangeFilter.end;
    }

    return params;
  }, [
    dmoId,
    authorityId,
    searchQuery,
    eventTypeFilter,
    registrationFilter,
    statusFilter,
    dateRangeFilter.start,
    dateRangeFilter.end,
    websiteId,
  ]);

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

  // Data Fetch
  const {
    data: events,
    refetch,
    isLoading: isLoading,
  } = useGetAllEventsQuery(eventQueryParams);

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

  const eventStats = [
    {
      id: 1,
      title: t("total_events"),
      value: eventStatsData?.totalEventsCount,
      label: `${eventStatsData?.upcomingEventsCount} ${t("upcoming")}`,
      labelClass: "text-green-500",
      icon: <Calendar className="w-8 h-8 text-teal-500" />,
    },
    {
      id: 2,
      title: t("total_registrations"),
      value: eventStatsData?.totalRegistration,
      icon: <Users className="w-8 h-8 text-blue-500" />,
    },
    {
      id: 3,
      title: t("total_revenue"),
      value: `₪${(eventStatsData?.totalRevenue / 1000).toFixed(1)}K`,
      icon: <DollarSign className="w-8 h-8 text-green-500" />,
    },
    {
      id: 4,
      title: t("avg_capacity_fill"),
      value: `${eventStatsData?.avgCapacityFill}%`,
      icon: <Ticket className="w-8 h-8 text-purple-500" />,
    },
  ];

  return (
    <>
      <div className="h-[calc(108vh-210px)] flex flex-col">
        <PageHeader
          title={t("events_management_dashboard")}
          description={t("events_management_desc")}
          btnLabel={t("add_event")}
          h1Gradient={textPrimary}
          onClick={handleAddEvent}
          totalCount={events?.totalData || 0}
        />

        <PageStats
          stats={eventStats}
          isLoading={isEventStatsFetching}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        />

        {/* Search and Filter Section */}
        <div className={`mb-2`}>
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-2">
            <div className="flex-1 relative">
              <SearchInput
                placeholder={t("search_events_placeholder")}
                searchTerm={searchQuery}
                setSearchTerm={setSearchQuery}
                storageKey="eventSearchTerm"
              />
            </div>
            <FilterButton value={showFilters} onChange={setShowFilters} />
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
              <div className="grid grid-cols-12 gap-2 pt-2  dark:border-gray-700">
                {/* Event Type */}
                <div className="col-span-3">
                  <label className={`block text-sm mb-2 ${textSecondary}`}>
                    {t("event_type")}
                  </label>
                  <select
                    value={eventTypeFilter}
                    onChange={(e) => setEventTypeFilter(e.target.value as any)}
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
                <div className="col-span-3">
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
                <div className="col-span-2">
                  <FilterByStatus
                    filters={statusFilter}
                    setFilters={(newStatus) =>
                      setStatusFilter(newStatus.status)
                    }
                  />
                </div>

                {/* Date Range */}
                <div className="col-span-4">
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

        {/* Events with different View */}
        <EventsWithViewMode
          isLoading={isLoading}
          events={(events?.data as any) || []}
          refetch={refetch}
          eventTypeFilter={eventTypeFilter}
          registrationFilter={registrationFilter}
          statusFilter={statusFilter}
          searchQuery={searchQuery}
          viewMode={viewMode}
        />
      </div>
      {/* Create Event Wizard */}
      <CreateEventWizard
        isOpen={isCreateWizardOpen}
        onClose={handleCreateWizardClose}
        refetch={refetch}
      />
    </>
  );
}
