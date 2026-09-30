import clsx from "clsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Banknote,
  CheckCircle,
  ScanLine,
  ShoppingCart,
  Ticket,
} from "lucide-react";

import { useAppSelector } from "@/hooks/hooks";
import { ViewModeToggle } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useRemoteSelectData } from "@/hooks/useRemoteSelectData";
import {
  CreatePunchPassWizard,
  PunchPassFiltersPanel,
  PunchPassGridView,
  PunchPassListView,
  PunchPassScannerModal,
} from "./components";
import {
  useGetBusinessForProductQuery,
  useLazyGetBusinessForProductQuery,
} from "@/store/api/businessQueryApi";
import { FilterButton } from "@/components/btns";
import EmptyState from "@/components/shared/EmptyState";
import SearchInput from "@/components/shared/SearchInput";
import ListHeaderBar from "@/components/shared/ListHeaderBar";

import { usePunchPassFilters } from "./hooks/usePunchPassFilters";
import { usePunchPassListData } from "./hooks/usePunchPassListData";
import { IOpMode } from "@/enums/operation.types";
import { routes } from "@/lib/routes";
import { useLazyGetPunchPassByIdQuery } from "@/store/api/punchPassApi";

export default function PunchpassMgmtPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlBusinessId = searchParams?.get("businessId");
  const urlBusinessName = searchParams?.get("businessName");

  const { t } = useTranslation("punch_pass");
  const { startDate, endDate } = useAppSelector((state) => state.auth);
  const { isDark, bgSecondary, borderColor, language } = useThemeClasses();

  // ─── Filter & Search (persisted to localStorage) ─────────────────────
  const {
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    clearFilter,
    hasSavedFilters,
  } = usePunchPassFilters();

  // ─── Data fetching & infinite scroll ─────────────────────────────────
  const {
    combinedPunchPasses,
    isLoading,
    isFetching,
    refetchFromPage1,
    hasMore,
    totalData,
    fetchNextPage,
    punchPassStatsData,
  } = usePunchPassListData(filters, searchTerm, urlBusinessId);

  // ─── UI State ─────────────────────────────────────────────────────────
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPunchPass, setEditingPunchPass] =
    useState<IPunchPassDetailsRes | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedPunchPasses, setSelectedPunchPasses] = useState<Set<string>>(
    new Set(),
  );

  // ─── Business Data for Filter Panel ──────────────────────────────────
  const { data: businessData, isLoading: isBusinessesLoading } =
    useGetBusinessForProductQuery(
      !urlBusinessId
        ? {
            locale: language,
            limit: 20,
            page: 1,
            startDate,
            endDate,
          }
        : skipToken,
    );
  const [getBusinessList] = useLazyGetBusinessForProductQuery();

  const {
    items: businesses,
    search: searchBusiness,
    isSearching,
  } = useRemoteSelectData({
    initialData: businessData?.data,
    debounceMs: 400,
    searchParams: { locale: language, startDate, endDate },
    lazySearch: async (params) => {
      const res = await getBusinessList(params).unwrap();
      return { data: res?.data };
    },
  });

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleCreateNew = useCallback(() => {
    setEditingPunchPass(null);
    setIsCreateModalOpen(true);
  }, []);

  useEffect(() => {
    if (urlBusinessId && urlBusinessName) {
      handleCreateNew();
    }
  }, [urlBusinessId, urlBusinessName, handleCreateNew]);

  const [getPunchPassEditData] = useLazyGetPunchPassByIdQuery();

  // List rows lack catalogues/images/translations, so load full details before editing
  const handleEditClick = useCallback(
    async (punchPass: IPunchPass) => {
      const toastId = toast.loading(t("loading_punch_pass"));
      try {
        const details = await getPunchPassEditData({
          punchPassId: punchPass._id,
          language,
        }).unwrap();
        toast.dismiss(toastId);
        setEditingPunchPass(details);
        setIsCreateModalOpen(true);
      } catch (error: any) {
        toast.error(error?.message || t("punch_pass_load_failed"), {
          id: toastId,
        });
      }
    },
    [getPunchPassEditData, t],
  );

  const handleViewDetails = useCallback(
    (punchPass: IPunchPass) => {
      navigate(`${routes.punchPassDetails}?punchPassId=${punchPass._id}`);
    },
    [navigate],
  );

  const removeQueryParams = useCallback(() => {
    navigate({}, { replace: true });
  }, [navigate]);

  const handleCloseWizard = useCallback(() => {
    setIsCreateModalOpen(false);
    setEditingPunchPass(null);
  }, []);

  const punchPassStats = useMemo(
    () => [
      {
        id: 1,
        title: t("stats_total_punch_passes"),
        value: punchPassStatsData?.totalPunchPasses,
        label: t("stats_registered"),
        icon: <Ticket className="w-5 h-5 text-purple-600" />,
      },
      {
        id: 2,
        title: t("stats_approved_punch_passes"),
        value: punchPassStatsData?.approvedPunchPasses,
        label: t("stats_approved"),
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      },
      {
        id: 3,
        title: t("stats_total_sold"),
        value: punchPassStatsData?.totalSold,
        label: t("stats_sold"),
        icon: <ShoppingCart className="w-5 h-5 text-blue-600" />,
      },
      {
        id: 4,
        title: t("stats_total_revenue"),
        value: punchPassStatsData?.totalRevenue,
        label: t("stats_earned"),
        icon: <Banknote className="w-5 h-5 text-orange-600" />,
      },
    ],
    [punchPassStatsData, t],
  );

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col pt-4 md:pt-0 gap-3 relative">
      {/* Sticky Top Header Bar */}
      <div
        className={clsx(
          "sticky top-14 md:top-20 z-30 transition-all duration-200 py-2.5 px-3 md:px-4 rounded-2xl border backdrop-blur-md shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-3",
          isDark
            ? "bg-gray-950/95 border-gray-800/90 shadow-black/40 text-gray-100"
            : "bg-white/95 border-gray-200/90 shadow-gray-200/40 text-gray-900",
        )}
      >
        <ListHeaderBar
          title={t("punch_passes_management")}
          count={totalData}
          addLabel={t("create_punch_pass")}
          onAdd={handleCreateNew}
          stats={punchPassStats}
        />
      </div>

      {/* Search bar + collapsible controls */}
      <div
        className={clsx(
          "transition-all duration-300 py-3 px-3 md:px-4 rounded-2xl border shadow-md flex flex-col gap-3",
          isDark
            ? "bg-gray-900/90 border-gray-800/90"
            : "bg-white border-gray-200",
        )}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex-1 min-w-0 relative">
            <SearchInput
              placeholder={t("search_punch_passes")}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>

          <div className="flex items-center justify-between gap-2 w-full lg:w-auto flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <FilterButton value={showFilters} onChange={setShowFilters} />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsScannerOpen(true)}
                className={clsx(
                  "px-3 py-2 rounded md:rounded-lg border transition-colors flex items-center justify-center gap-2 cursor-pointer",
                  isDark
                    ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                    : "border-gray-300 hover:bg-gray-100 text-gray-700",
                )}
                title={t("scan_punch_pass")}
              >
                <ScanLine className="w-4 h-4" />
                <span className="hidden md:block">{t("scan_punch_pass")}</span>
              </button>

              <ViewModeToggle
                onChange={setViewMode}
                value={viewMode}
                tableName="punchPassViewMode"
              />
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {(showFilters || urlBusinessId || hasSavedFilters) && (
          <PunchPassFiltersPanel
            filters={filters}
            setFilters={setFilters}
            hasSavedFilters={hasSavedFilters}
            clearFilter={clearFilter}
            urlBusinessId={urlBusinessId}
            urlBusinessName={urlBusinessName}
            removeQueryParams={removeQueryParams}
            businesses={businesses ?? []}
            searchBusiness={searchBusiness}
            isSearching={isSearching}
            isBusinessesLoading={isBusinessesLoading}
          />
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 mt-1">
        {!isLoading && !isFetching && combinedPunchPasses?.length === 0 ? (
          <div
            className={`text-center py-16 ${bgSecondary} rounded-xl border ${borderColor}`}
          >
            {searchTerm ? (
              <EmptyState searchQuery={searchTerm} />
            ) : (
              <div className="text-center">
                <Ticket className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="opacity-50 mb-6">{t("no_punch_passes_desc")}</p>
                <button
                  onClick={handleCreateNew}
                  className="px-6 py-3 bg-linear-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  {t("create_punch_pass")}
                </button>
              </div>
            )}
          </div>
        ) : viewMode === "list" ? (
          <PunchPassListView
            hasMore={!!hasMore}
            fetchNextPage={fetchNextPage}
            punchPasses={combinedPunchPasses}
            isLoading={isLoading || isFetching}
            selectedPunchPasses={selectedPunchPasses}
            setSelectedPunchPasses={setSelectedPunchPasses}
            refetch={refetchFromPage1}
            onRowClick={handleViewDetails}
            onViewDetails={handleViewDetails}
            onEdit={handleEditClick}
          />
        ) : (
          <PunchPassGridView
            hasMore={!!hasMore}
            refetch={refetchFromPage1}
            fetchNextPage={fetchNextPage}
            punchPasses={combinedPunchPasses}
            isLoading={isLoading || isFetching}
            selectedPunchPasses={selectedPunchPasses}
            setSelectedPunchPasses={setSelectedPunchPasses}
            onCardClick={handleEditClick}
            handleEditClick={handleEditClick}
          />
        )}
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreatePunchPassWizard
          onClose={handleCloseWizard}
          refetch={refetchFromPage1}
          punchPass={editingPunchPass}
          opMode={editingPunchPass ? IOpMode.EDIT : IOpMode.CREATE}
        />
      )}

      {isScannerOpen && (
        <PunchPassScannerModal onClose={() => setIsScannerOpen(false)} />
      )}
    </div>
  );
}
