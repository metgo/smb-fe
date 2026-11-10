import clsx from "clsx";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";

import { routes } from "@/lib/routes";
import {
  BusinessGridView,
  BusinessListView,
  BusinessFiltersPanel,
  CreateBusinessWizard,
  ExportBusinessButton,
} from "./components";

import {
  CheckCircle,
  AlertCircle,
  UtensilsCrossed,
  Landmark,
  Theater,
  Map,
  Compass,
} from "lucide-react";
import { FilterButton } from "@/components/btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useViewMode } from "@/hooks/useViewMode";
import {
  BulkActionBar,
  ConfirmDialog,
  ShowColumns,
  ViewModeToggle,
} from "@/components/shared";
import { useBulkBusinessesUpdateMutation } from "@/store/api/businessMutationApi";
import SearchInput from "@/components/shared/SearchInput";
import EmptyState from "@/components/shared/EmptyState";
import { TourProvider, TourPortal, useTour } from "@/components/tour";
import type { TourStep } from "@/components/tour";

import { useBusinessFilters } from "./hooks/useBusinessFilters";
import { useBusinessListData } from "./hooks/useBusinessListData";
import { BUSINESS_COLUMNS } from "@/lib/utils";
import ListHeaderBar from "@/components/shared/ListHeaderBar";
import { useUserRoles } from "@/hooks/useUserRoles";
import {
  OnboardingReviewWizard,
  VendorOnboarding,
  type CreateResult,
} from "@/pages/onboarding";
import { Sparkles } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const { defaultColumns, columnDefinitions, COLUMNS_STORAGE_KEY } =
  BUSINESS_COLUMNS;

// ─── Main Component ───────────────────────────────────────────────────────────

function BusinessesMgmtPageInner() {
  const navigate = useNavigate();
  const { t } = useTranslation(["businesses", "common"]);
  const { t: tc } = useTranslation("toast");
  const { t: tt } = useTranslation("tour");
  const { isDark, bgSecondary, borderColor } = useThemeClasses();

  // ─── Filter & Search (persisted to localStorage) ─────────────────────
  const {
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    clearFilter,
    hasSavedFilters,
  } = useBusinessFilters();

  // ─── Data fetching & infinite scroll ─────────────────────────────────
  const {
    combinedBusinesses,
    businessStatsData,
    isLoading,
    isFetching,
    isStatsLoading,
    refetch,
    hasMore,
    totalData,
    fetchNextPage,
  } = useBusinessListData(filters, searchTerm);

  // ─── UI State ─────────────────────────────────────────────────────────
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ─── Onboarding (AI-assisted Add business) ────────────────────────────
  const { isTraveller } = useUserRoles();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [reviewBusinessId, setReviewBusinessId] = useState<string | null>(null);
  const autoOpenedRef = useRef(false);
  const hasNoBusinesses =
    !isLoading && !isFetching && totalData === 0 && !searchTerm;

  // A vendor with no businesses lands straight in onboarding (once per session
  // unless they come back via ?onboarding=1, e.g. right after login).
  useEffect(() => {
    if (autoOpenedRef.current || !isTraveller || !hasNoBusinesses) return;
    const params = new URLSearchParams(window.location.search);
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem("onboarding_dismissed") === "1";
    } catch {
      /* storage unavailable */
    }
    if (params.get("onboarding") === "1" || !dismissed) {
      autoOpenedRef.current = true;
      setIsOnboardingOpen(true);
    }
  }, [isTraveller, hasNoBusinesses]);

  const closeOnboarding = () => {
    setIsOnboardingOpen(false);
    try {
      sessionStorage.setItem("onboarding_dismissed", "1");
    } catch {
      /* storage unavailable */
    }
  };

  const handleOnboardingComplete = (result: CreateResult) => {
    setIsOnboardingOpen(false);
    refetch();
    toast.success(t("businesses:onboarding_created"));
    if (result.productsFailed) {
      toast.warning(
        t("businesses:onboarding_products_failed", {
          count: result.productsFailed,
        }),
      );
    }
    setReviewBusinessId(result.businessId);
  };
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [viewMode, setViewMode] = useViewMode("businessViewMode");
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [_isStatsCollapsed, setIsStatsCollapsed] = useState(false);
  const [selectedBusinesses, setSelectedBusinesses] = useState<Set<string>>(
    new Set(),
  );

  const [columnVisibility, setColumnVisibility] =
    useState<IBusinessColumnVisibility>(defaultColumns);

  const columnSettingsRef = useRef<HTMLDivElement>(null);

  // ─── Tour integration ─────────────────────────────────────────────────
  const {
    isOpen: isTourOpen,
    steps: tourSteps,
    currentStep,
    startTour,
    refreshTargetRect,
  } = useTour();

  const buildSteps = useCallback(
    (): TourStep[] => [
      {
        id: "welcome",
        placement: "center",
        title: "business_list.welcome.title",
        desc: "business_list.welcome.desc",
      },
      {
        id: "page-header",
        target: '[data-tour="page-header"]',
        placement: "bottom",
        title: "business_list.page_header.title",
        desc: "business_list.page_header.desc",
      },
      {
        id: "stats",
        target: '[data-tour="stats"]',
        placement: "bottom",
        title: "business_list.stats.title",
        desc: "business_list.stats.desc",
      },
      {
        id: "search",
        target: '[data-tour="search"]',
        placement: "bottom",
        title: "business_list.search.title",
        desc: "business_list.search.desc",
      },
      {
        id: "toolbar",
        target: '[data-tour="toolbar"]',
        placement: "bottom",
        title: "business_list.toolbar.title",
        desc: "business_list.toolbar.desc",
      },
      {
        id: "filter-panel",
        target: '[data-tour="filter-panel"]',
        placement: "bottom",
        title: "business_list.filter_panel.title",
        desc: "business_list.filter_panel.desc",
      },
      {
        id: "business-list",
        target: '[data-tour="business-list"]',
        placement: "top",
        title: "business_list.business_list.title",
        desc: "business_list.business_list.desc",
      },
    ],
    [],
  );

  // Open filter panel or stats when tour lands on that step
  useEffect(() => {
    if (!isTourOpen) return;
    const stepId = tourSteps[currentStep]?.id;
    if (stepId === "stats") {
      setIsStatsCollapsed(false);
      const raf = requestAnimationFrame(() => {
        setTimeout(() => refreshTargetRect(), 40);
      });
      return () => cancelAnimationFrame(raf);
    }
    if (stepId === "filter-panel") {
      setShowFilters(true);
      const raf = requestAnimationFrame(() => {
        setTimeout(() => refreshTargetRect(), 40);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isTourOpen, currentStep, tourSteps, refreshTargetRect]);

  // ─── Column visibility (persisted to localStorage) ────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(COLUMNS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setColumnVisibility((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error("Failed to load column settings:", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(columnVisibility));
  }, [columnVisibility]);

  // ─── Close column dropdown on outside click ────────────────────────────
  useEffect(() => {
    if (!showColumnSettings) return;
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
  }, [showColumnSettings]);

  // ─── Mutations ─────────────────────────────────────────────────────────
  const [bulkBusinessesUpdate, { isLoading: isDeleting }] =
    useBulkBusinessesUpdateMutation();

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleBusinessClick = useCallback(
    (business: any) => {
      navigate(`${routes.businessDetails}?businessId=${business?._id}`, {
        replace: true,
      });
    },
    [navigate],
  );

  const resetToDefault = useCallback(() => {
    setColumnVisibility(BUSINESS_COLUMNS.defaultColumns);
  }, []);

  const promptBulkDelete = useCallback(() => {
    if (!selectedBusinesses.size) return;
    setIsBulkDelete(true);
    setIsConfirmOpen(true);
  }, [selectedBusinesses.size]);

  const handleBulkDelete = useCallback(async () => {
    if (!selectedBusinesses.size) return;
    const toastId = toast.loading(tc("business_delete_loading"));
    try {
      const results = await bulkBusinessesUpdate({
        businessesId: Array.from(selectedBusinesses),
        isDeleted: true,
      });
      if (results?.data) {
        toast.success(tc("business_deleted_success"), { id: toastId });
        setSelectedBusinesses(new Set());
        refetch();
      }
    } catch (error: any) {
      toast.error(error?.message || tc("business_delete_failed"), {
        id: toastId,
      });
    } finally {
      setIsConfirmOpen(false);
      setIsBulkDelete(false);
    }
  }, [selectedBusinesses, bulkBusinessesUpdate, refetch, tc]);

  const handleBulkStatusChange = useCallback(
    async (status: TStatus) => {
      if (!selectedBusinesses.size) return;
      const toastId = toast.loading(tc("business_status_change_loading"));
      try {
        const results = await bulkBusinessesUpdate({
          businessesId: Array.from(selectedBusinesses),
          status: status?.toLocaleUpperCase(),
        });
        if (results?.data) {
          toast.success(tc("business_status_update_success"), { id: toastId });
          setSelectedBusinesses(new Set());
          refetch();
        }
      } catch (error: any) {
        toast.error(error?.message || tc("business_status_update_failed"), {
          id: toastId,
        });
      }
    },
    [selectedBusinesses, bulkBusinessesUpdate, refetch, tc],
  );

  // ─── Stats Cards ───────────────────────────────────────────────────────
  const businessStats = useMemo(
    () => [
      {
        id: 1,
        title: t("total_businesses"),
        value: businessStatsData?.totalBusinesses,
        label: t("registered"),
        icon: <Map className="w-5 h-5 text-purple-600" />,
      },
      {
        id: 2,
        title: t("active_businesses"),
        value: businessStatsData?.activeBusinesses,
        label: t("approved"),
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      },
      {
        id: 3,
        title: t("total_products"),
        value: businessStatsData?.totalProducts,
        label: t("listed"),
        icon: <UtensilsCrossed className="w-5 h-5 text-blue-600" />,
      },
      {
        id: 4,
        title: t("avg_impact"),
        value: businessStatsData?.averageImpactScore,
        label: t("score"),
        icon: <Theater className="w-5 h-5 text-orange-600" />,
      },
      {
        id: 5,
        title: t("pending_approval"),
        value: businessStatsData?.pendingApproval,
        label: t("awaiting"),
        icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
      },
      {
        id: 6,
        title: t("avg_completion"),
        value: businessStatsData?.averageCompletion,
        label: t("profile_data"),
        icon: <Landmark className="w-5 h-5 text-teal-600" />,
      },
    ],
    [businessStatsData, t],
  );

  const isFilterPanelTourStep =
    isTourOpen && tourSteps[currentStep]?.id === "filter-panel";

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex flex-col pt-4 md:pt-0 gap-3 relative">
        {/* Sticky Top Header Bar (Title + Add Button + Horizontal Scrollable Stats) */}
        <div
          className={clsx(
            "sticky top-14 md:top-20 z-30 transition-all duration-200 py-2.5 px-3 md:px-4 rounded-2xl border backdrop-blur-md shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-3",
            isDark
              ? "bg-gray-950/95 border-gray-800/90 shadow-black/40 text-gray-100"
              : "bg-white/95 border-gray-200/90 shadow-gray-200/40 text-gray-900",
          )}
        >
          <ListHeaderBar
            title={t("businesses_management")}
            count={totalData}
            addLabel={t("add_business")}
            onAdd={() => setIsOnboardingOpen(true)}
            stats={businessStats}
            isStatsLoading={isStatsLoading}
            dataTourHeader="page-header"
            dataTourStats="stats"
          />
        </div>

        {/* Search bar (always visible) + collapsible controls on the same row */}
        <div
          className={clsx(
            "transition-all duration-300 py-3 px-3 md:px-4 rounded-2xl border shadow-md flex flex-col gap-3",
            isDark
              ? "bg-gray-900/90 border-gray-800/90"
              : "bg-white border-gray-200",
          )}
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex-1 min-w-0 relative" data-tour="search">
              <SearchInput
                placeholder={t("search_businesses_placeholder")}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>

            <div
              className="flex items-center justify-between gap-2 w-full lg:w-auto flex-wrap"
              data-tour="toolbar"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <FilterButton value={showFilters} onChange={setShowFilters} />
                <ShowColumns
                  t={t}
                  viewMode={viewMode}
                  columnDefinitions={columnDefinitions}
                  columnVisibility={columnVisibility}
                  showColumnSettings={showColumnSettings}
                  setShowColumnSettings={setShowColumnSettings}
                  setColumnVisibility={setColumnVisibility}
                  resetToDefault={resetToDefault}
                />
                <ExportBusinessButton
                  businesses={combinedBusinesses}
                  selectedBusinesses={selectedBusinesses}
                  columnVisibility={columnVisibility}
                  t={t}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => startTour(buildSteps())}
                  title={tt("start_tour")}
                  className={`p-2 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isDark
                      ? "border-gray-700 hover:bg-gray-800 text-gray-400 hover:text-teal-400"
                      : "border-gray-300 hover:bg-gray-100 text-gray-500 hover:text-teal-600"
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">
                    {t("tour") ?? tt("start_tour")}
                  </span>
                </button>
                <ViewModeToggle
                  onChange={setViewMode}
                  value={viewMode}
                  tableName="businessViewMode"
                />
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {(showFilters || hasSavedFilters) && (
            <BusinessFiltersPanel
              filters={filters}
              setFilters={setFilters}
              hasSavedFilters={hasSavedFilters}
              clearFilter={clearFilter}
              isHighlighted={isFilterPanelTourStep}
            />
          )}

          <BulkActionBar
            selectedItemCount={selectedBusinesses.size}
            handleBulkStatusChange={handleBulkStatusChange}
            handleBulkDelete={promptBulkDelete}
            hancleClearSelection={() => setSelectedBusinesses(new Set())}
          />
        </div>

        {/* Content Area (ReordableDataTable rendered naturally) */}
        <div className="flex-1 mt-1" data-tour="business-list">
          {!isLoading && !isFetching && combinedBusinesses?.length === 0 ? (
            <div
              className={`text-center py-16 ${bgSecondary} rounded-xl border ${borderColor}`}
            >
              {isTraveller && hasNoBusinesses ? (
                <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                    <Sparkles className="h-6 w-6" aria-hidden />
                  </span>
                  <h2 className="text-lg font-semibold">
                    {t("businesses:onboarding_empty_title")}
                  </h2>
                  <p className="text-sm opacity-75">
                    {t("businesses:onboarding_empty_desc")}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsOnboardingOpen(true)}
                    className="mt-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                  >
                    {t("businesses:onboarding_empty_cta")}
                  </button>
                </div>
              ) : (
                <EmptyState searchQuery={searchTerm} />
              )}
            </div>
          ) : viewMode === "list" ? (
            <BusinessListView
              t={t}
              hasMore={hasMore}
              next={fetchNextPage}
              isLoading={isLoading}
              columnVisibility={columnVisibility}
              businesses={combinedBusinesses}
              onBusinessClick={handleBusinessClick}
              selectedBusinesses={selectedBusinesses}
              setSelectedBusinesses={setSelectedBusinesses}
            />
          ) : (
            <BusinessGridView
              refetch={refetch}
              hasMore={hasMore}
              next={fetchNextPage}
              data={combinedBusinesses}
              onRowClick={handleBusinessClick}
              isLoading={isLoading || isFetching}
              selectedItems={selectedBusinesses}
              setSelectedItems={setSelectedBusinesses}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <ConfirmDialog
        open={isConfirmOpen}
        title={t("delete_business")}
        message={t("delete_business_confirm")}
        confirmText="delete"
        loading={isDeleting}
        variant="danger"
        onCancel={() => {
          setIsConfirmOpen(false);
          setIsBulkDelete(false);
        }}
        onConfirm={() => {
          if (isBulkDelete) {
            handleBulkDelete();
          }
          setIsConfirmOpen(false);
        }}
      />
      {isCreateModalOpen && (
        <CreateBusinessWizard
          onClose={() => setIsCreateModalOpen(false)}
          refetch={refetch}
        />
      )}

      {isOnboardingOpen && (
        <VendorOnboarding
          onClose={closeOnboarding}
          onManual={() => {
            closeOnboarding();
            setIsCreateModalOpen(true);
          }}
          onComplete={handleOnboardingComplete}
        />
      )}

      {reviewBusinessId && (
        <OnboardingReviewWizard
          businessId={reviewBusinessId}
          onClose={() => setReviewBusinessId(null)}
          refetch={refetch}
        />
      )}

      <TourPortal />
    </>
  );
}

// ─── Exported page (wraps with TourProvider) ──────────────────────────────────

export default function BusinessesMgmtPage() {
  return (
    <TourProvider>
      <BusinessesMgmtPageInner />
    </TourProvider>
  );
}
