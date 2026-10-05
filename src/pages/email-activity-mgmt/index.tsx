import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Send,
  CheckCircle2,
  MousePointerClick,
  XCircle,
  Clock,
  CalendarClock,
} from "lucide-react";

import { SearchInput } from "@/components/shared";
import DatePicker from "@/components/shared/DatePicker";
import ListHeaderBar from "@/components/shared/ListHeaderBar";
import { FilterSelect } from "@/pages/orders-mgmt/components";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useGetEmailActivityQuery,
  useGetEmailActivityLiveQuery,
  useGetEmailActivityLiveStatsQuery,
} from "@/store/api/emailActivityQueryApi";

import { EmailActivityList } from "./components";

const STATUS_ICONS: Record<string, React.ReactNode> = {
  sent: <Send className="w-4 h-4 text-blue-500" />,
  delivered: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  bounced: <MousePointerClick className="w-4 h-4 text-orange-500" />,
  rejected: <XCircle className="w-4 h-4 text-red-500" />,
  queued: <Clock className="w-4 h-4 text-gray-500" />,
  scheduled: <CalendarClock className="w-4 h-4 text-violet-500" />,
};

const LIMIT = 200;

const STATUS_OPTIONS: EmailActivityStatus[] = [
  "sent",
  "delivered",
  "opened",
  "clicked",
  "bounced",
  "rejected",
  "deferred",
  "spam",
  "unsub",
];

const EmailActivityMgmtPage = () => {
  const { t } = useTranslation("email_activity");
  const { textPrimary } = useThemeClasses();

  const [searchQuery, setSearchQuery] = usePersistentState(
    "emailActivitySearch",
    "",
  );
  const [status, setStatus] = usePersistentState(
    "emailActivityStatusFilter",
    "all",
  );
  const [fromDate, setFromDate] = usePersistentState(
    "emailActivityFromDate",
    "",
  );
  const [toDate, setToDate] = usePersistentState("emailActivityToDate", "");

  const [page, setPage] = useState(1);
  const [combinedActivity, setCombinedActivity] = useState<IEmailActivity[]>(
    [],
  );

  // Reset pagination whenever filters change
  useEffect(() => {
    setPage(1);
    setCombinedActivity([]);
  }, [searchQuery, status, fromDate, toDate]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: LIMIT,
      ...(searchQuery && { search: searchQuery }),
      ...(status !== "all" && { status: status as EmailActivityStatus }),
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
    }),
    [page, searchQuery, status, fromDate, toDate],
  );

  const { data, isLoading, isFetching } = useGetEmailActivityQuery(
    queryParams,
    { refetchOnMountOrArgChange: true },
  );

  const totalData: number = data?.datas?.totalData ?? 0;
  const hasMoreFromLog = !!data?.datas?.meta?.hasNextPage;

  // Accumulate pages for infinite scroll
  useEffect(() => {
    const pageItems: IEmailActivity[] = data?.datas?.data ?? [];

    if (!pageItems.length) {
      if (page === 1) setCombinedActivity([]);
      return;
    }

    setCombinedActivity((prev) => {
      if (page === 1) return pageItems;
      const existingIds = new Set(prev.map((item) => item._id));
      const newItems = pageItems.filter((item) => !existingIds.has(item._id));
      return newItems.length ? [...prev, ...newItems] : prev;
    });
  }, [data, page]);

  const fetchNextPage = useCallback(() => {
    if (!hasMoreFromLog || isFetching) return;
    setPage((prev) => prev + 1);
  }, [hasMoreFromLog, isFetching]);

  const hasActiveFilters =
    !!searchQuery || status !== "all" || !!fromDate || !!toDate;

  // Our own activity log only fills up as the Mailchimp webhook receives new
  // events, so it can legitimately be empty (e.g. right after setup). Fall
  // back to live Mailchimp data (last ~7 days) when there's nothing in the
  // log yet, so the admin isn't staring at an empty table while waiting for
  // webhook history to accumulate.
  const shouldUseLiveFallback =
    !isLoading && page === 1 && combinedActivity.length === 0;

  const liveParams = useMemo(
    () => ({
      limit: LIMIT,
      ...(searchQuery && { search: searchQuery }),
      ...(status !== "all" && { status: status as EmailActivityStatus }),
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
    }),
    [searchQuery, status, fromDate, toDate],
  );

  const { data: liveData, isFetching: isLiveFetching } =
    useGetEmailActivityLiveQuery(liveParams, {
      skip: !shouldUseLiveFallback,
    });

  const liveList: IEmailActivity[] = useMemo(
    () => liveData?.datas?.data ?? [],
    [liveData],
  );

  const isUsingLiveFallback = shouldUseLiveFallback && liveList.length > 0;
  const displayList = isUsingLiveFallback ? liveList : combinedActivity;
  const hasMore = !isUsingLiveFallback && hasMoreFromLog;
  const isListLoading =
    isLoading ||
    (page === 1 && isFetching) ||
    (shouldUseLiveFallback && isLiveFetching);

  const statsParams = useMemo(
    () => ({
      ...(searchQuery && { search: searchQuery }),
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
    }),
    [searchQuery, fromDate, toDate],
  );

  const { data: statsData, isLoading: isStatsLoading } =
    useGetEmailActivityLiveStatsQuery(statsParams);

  const statsItems = useMemo(
    () =>
      Object.entries(statsData?.datas?.statusCounts ?? {}).map(
        ([status, count]) => ({
          id: status,
          title: t(`status_${status}`, status),
          value: count,
          icon: STATUS_ICONS[status] ?? (
            <Send className="w-4 h-4 text-violet-500" />
          ),
        }),
      ),
    [statsData, t],
  );

  return (
    <div className="flex flex-col h-full pt-10 md:pt-0 gap-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <ListHeaderBar
          title={t("email_activity_management")}
          titleGradient="from-blue-500 via-indigo-600 to-purple-600"
          count={totalData}
          stats={statsItems}
          isStatsLoading={isStatsLoading}
        />
        {isUsingLiveFallback && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-100">
            {t("live_from_mailchimp")}
          </span>
        )}
      </div>

      <div className="flex items-end gap-3 flex-wrap">
        <div className="flex-1 min-w-30">
          <SearchInput
            placeholder={t("search_placeholder")}
            searchTerm={searchQuery}
            setSearchTerm={(value) => {
              setSearchQuery(value);
            }}
          />
        </div>
        {/* Date Range */}
        <div className="w-40">
          <label className={`block text-sm mb-1 ${textPrimary}`}>
            {t("from_date")}
          </label>
          <DatePicker
            value={fromDate}
            onChange={(value) => {
              setFromDate(value);
            }}
            maxDate={toDate || undefined}
          />
        </div>
        <div className="w-40">
          <label className={`block text-sm mb-1 ${textPrimary}`}>
            {t("to_date")}
          </label>
          <DatePicker
            value={toDate}
            onChange={(value) => {
              setToDate(value);
            }}
            minDate={fromDate || undefined}
            disableFuture
          />
        </div>
        <div className="w-44">
          <FilterSelect
            label={t("status")}
            value={status}
            onChange={(value) => {
              setStatus(value);
            }}
            options={[
              { value: "all", label: t("all_statuses") },
              ...STATUS_OPTIONS.map((s) => ({
                value: s,
                label: t(`status_${s}`),
              })),
            ]}
          />
        </div>
      </div>

      {!isListLoading && displayList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 text-center px-4">
          <p className="text-lg font-medium mb-1">
            {hasActiveFilters
              ? t("no_activity_filtered")
              : t("no_activity_found")}
          </p>
          <p className="text-sm text-gray-400 max-w-md">
            {hasActiveFilters
              ? t("no_activity_filtered_desc")
              : t("no_activity_found_desc")}
          </p>
        </div>
      ) : (
        <EmailActivityList
          data={displayList}
          isLoading={isListLoading}
          hasMore={hasMore}
          next={fetchNextPage}
          canViewContent={!isUsingLiveFallback}
        />
      )}
    </div>
  );
};

export default EmailActivityMgmtPage;
