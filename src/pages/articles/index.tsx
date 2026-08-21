import { toast } from "sonner";
import clsx from "clsx";
import { Download, Plus, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo, useCallback } from "react";

import { routes } from "@/lib/routes";
import BlogListView from "./components/sub-components/BlogListView";
import BlogGridView from "./components/sub-components/BlogGridView";

import { useAppSelector } from "@/hooks/hooks";
import { FilterButton } from "@/components/btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  ShowColumns,
  BulkActionBar,
  ConfirmDialog,
  ViewModeToggle,
} from "@/components/shared";
import { useGetAllBlogsQuery } from "@/store/api/blogQueryApi";
import { useDeleteBlogMutation } from "@/store/api/blogMutationApi";
import SearchInput from "@/components/shared/SearchInput";
import FilterChips from "@/components/shared/FilterChips";
import EmptyState from "@/components/shared/EmptyState";
import { FilterByStatus } from "@/components/filter-fields";
import CreateArticleWizard from "./components/CreateArticleWizard";

const LIMIT = 20;
const STORAGE_KEY = "blog_query_state";
const COLUMNS_STORAGE_KEY = "blogsTableColumns";
const SEARCH_STORAGE_KEY = "blogSearchTerm";

type ColumnVisibility = {
  externalApiId: boolean;
  title: boolean;
  subTitle: boolean;
  status: boolean;
  createdAt: boolean;
  updatedAt: boolean;
  imageCount: boolean;
  contentPreview: boolean;
  author?: boolean;
};

const defaultColumns: ColumnVisibility = {
  externalApiId: true,
  title: true,
  subTitle: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  imageCount: true,
  contentPreview: false,
};

const columnDefinitions = [
  { key: "title" as const, isDefault: true },
  { key: "subTitle" as const, isDefault: true },
  { key: "status" as const, isDefault: true },
  { key: "createdAt" as const, isDefault: true },
  { key: "updatedAt" as const, isDefault: false },
  { key: "imageCount" as const, isDefault: true },
];

export default function ArticlesManagement() {
  const navigate = useNavigate();
  const { t } = useTranslation("article");
  const { t: tc } = useTranslation("common");
  const { isDark, textPrimary, borderColor } = useThemeClasses();

  const handleBusinessClick = useCallback(
    (business: any) => {
      navigate(`${routes.articleDetails}?blogId=${business?._id}`, {
        replace: true,
      });
    },
    [navigate],
  );
  const { websiteId } = useAppSelector((state) => state.auth);

  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();

  // Local State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showControlsDrawer, setShowControlsDrawer] = useState(false);
  const [selectedBlogs, setSelectedBlogs] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: "all" as "all" | "ACTIVE" | "APPROVED" | "DRAFT" | "INACTIVE",
  });

  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibility>(defaultColumns);

  const [combinedBlogs, setCombinedBlogs] = useState<any[]>([]);

  // Load persisted state
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (saved.filters) setFilters(saved.filters);
      if (saved.searchTerm) setSearchTerm(saved.searchTerm);
      if (saved.page) setPage(saved.page);
      if (saved.viewMode) setViewMode(saved.viewMode);
    } catch (e) {
      console.error("Failed to load saved state:", e);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COLUMNS_STORAGE_KEY);
      if (saved)
        setColumnVisibility({ ...defaultColumns, ...JSON.parse(saved) });
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Persist state
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ page, filters, searchTerm, viewMode }),
    );
  }, [page, filters, searchTerm, viewMode]);

  useEffect(() => {
    localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(columnVisibility));
  }, [columnVisibility]);

  // Reset page on filter/search change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filters, websiteId]);

  // ─── Collapse the controls drawer on scroll ────────────────────────────
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        (target && target.scrollTop && target.scrollTop > 20) ||
        window.scrollY > 20
      ) {
        setShowControlsDrawer(false);
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

  const queryParams = useMemo(
    () => ({
      page,
      limit: LIMIT,
      externalApiId: websiteId,
      ...(filters.status !== "all" && { status: filters.status }),
      ...(searchTerm && { search: searchTerm }),
    }),
    [page, filters, searchTerm, websiteId],
  );

  // Queries
  const {
    data: blogData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllBlogsQuery(queryParams);

  const hasMore = blogData?.meta?.hasNextPage;
  const totalData = blogData?.totalData || 0;

  // Merge data for infinite scroll
  useEffect(() => {
    if (!blogData?.data?.length) {
      setCombinedBlogs([]);
      return;
    }
    setCombinedBlogs((prev) => {
      if (page === 1) return blogData.data;
      const existingIds = new Set(prev.map((b: any) => b._id));
      const newItems = blogData.data.filter(
        (b: any) => !existingIds.has(b._id),
      );
      return newItems.length ? [...prev, ...newItems] : prev;
    });
  }, [blogData, page]);

  const fetchNextPage = useCallback(() => {
    if (!hasMore || isFetching) return;
    setPage((p) => p + 1);
  }, [hasMore, isFetching]);

  const handleRefetch = useCallback(() => {
    if (page === 1) {
      refetch();
    } else {
      setPage(1);
      refetch();
    }
  }, [page, refetch]);

  const handleBulkDelete = useCallback(async () => {
    try {
      await deleteBlog(Array.from(selectedBlogs)).unwrap();
      toast.success(t("bulk_delete_success"));
      setSelectedBlogs(new Set());
      handleRefetch();
    } catch {
      toast.error(t("bulk_delete_error"));
    } finally {
      setIsBulkDeleteConfirmOpen(false);
    }
  }, [deleteBlog, selectedBlogs, t, handleRefetch]);

  const handleExport = useCallback(() => {
    const blogsToExport =
      selectedBlogs.size > 0
        ? combinedBlogs.filter((b) => selectedBlogs.has(b._id))
        : combinedBlogs;

    if (!blogsToExport.length) {
      toast.info(t("no_blogs_to_export"));
      return;
    }

    const headers = ["Title", "Subtitle", "Status", "Created At", "Images"];
    const rows = blogsToExport.map((blog) => [
      `"${blog.title.replace(/"/g, '""')}"`,
      `"${(blog.subTitle || "").replace(/"/g, '""')}"`,
      blog.status,
      new Date(blog.createdAt).toLocaleDateString(),
      blog.images?.length || 0,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob(["﻿", csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `blogs_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [selectedBlogs, combinedBlogs, t]);

  // ─── Active filter count (search term + any non-default filter values) ──
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm?.trim()) count += 1;
    if (filters.status !== "all") count += 1;
    return count;
  }, [searchTerm, filters]);

  // ─── Reusable icon-only filter toggle button ──────────────────────────
  const filterToggleButton = (
    <button
      onClick={() => setShowControlsDrawer((prev) => !prev)}
      className={clsx(
        "relative p-2 rounded-xl border transition-all cursor-pointer shrink-0",
        showControlsDrawer
          ? "bg-fuchsia-600 text-white border-fuchsia-500 shadow-fuchsia-500/20"
          : isDark
            ? "bg-gray-900 border-gray-800 text-fuchsia-400 hover:bg-gray-800 hover:border-fuchsia-500/40"
            : "bg-gray-100 border-gray-200 text-fuchsia-700 hover:bg-gray-200 hover:border-fuchsia-400"
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
              ? "bg-white text-fuchsia-600"
              : "bg-fuchsia-500 text-white"
          )}
        >
          {activeFilterCount > 9 ? "9+" : activeFilterCount}
        </span>
      )}
    </button>
  );

  return (
    <>
      <div className="flex flex-col pt-4 md:pt-0 gap-3 relative">
        {/* Sticky Top Header Bar (Title + Add Button) */}
        <div
          className={clsx(
  "shrink-0 sticky top-14 md:top-20 z-30 transition-all duration-200 py-2.5 px-3 md:px-4 rounded-2xl border shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-3",
  isDark
    ? "bg-gray-950 border-gray-800/90 shadow-black/40 text-gray-100"
    : "bg-white border-gray-200/90 shadow-gray-200/40 text-gray-900"
)}
        >
          {/* Left: Title + Count (Top), Create Article Button (Below) */}
          <div className="flex flex-col items-start gap-1 shrink-0">
            <div className="flex items-center w-full justify-between gap-2">
              <div className="flex items-center gap-1">
                <h1 className="text-base md:text-lg font-bold bg-clip-text bg-gradient-to-r text-transparent from-violet-500 via-fuchsia-600 to-pink-600 whitespace-nowrap">
                  {t("page_title")}
                </h1>
                {totalData !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 shrink-0">
                    {totalData}
                  </span>
                )}
              </div>

              <div className="block xl:hidden items-center gap-2 shrink-0">
                {filterToggleButton}
              </div>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold 
              bg-gradient-to-r from-violet-500 via-fuchsia-600 to-pink-600 
              hover:opacity-90 active:scale-95 text-white rounded-lg transition-all 
              flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm whitespace-nowrap "
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t("create_article")}</span>
            </button>
          </div>

        

          {/* Search & Filters Toggle Button Next to description (desktop) */}
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
                : "bg-white border-gray-200"
            )}
          >
            <div className="flex-1 relative">
              <SearchInput
                placeholder={t("search_placeholder")}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                storageKey={SEARCH_STORAGE_KEY}
              />
            </div>

            <div className="flex items-center justify-between gap-2 w-full flex-wrap">
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
                  resetToDefault={() => setColumnVisibility(defaultColumns)}
                />
                <button
                  onClick={handleExport}
                  className={`px-4 py-1.5 rounded-lg border flex items-center gap-2 ${textPrimary} ${borderColor}`}
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden md:block">{t("export")}</span>
                </button>
              </div>

              <ViewModeToggle
                onChange={setViewMode}
                value={viewMode}
                tableName="blogViewMode"
              />
            </div>

            {/* Filters */}
            {(showFilters || filters.status !== "all") && (
              <div
                className={clsx(
                  "rounded-md px-4 py-3",
                  isDark ? "bg-gray-900/60" : "bg-gray-50"
                )}
              >
                <FilterByStatus filters={filters} setFilters={setFilters} />
                {filters.status !== "all" && (
                  <FilterChips
                    label={filters.status}
                    onRemove={() => setFilters({ status: "all" })}
                  />
                )}
              </div>
            )}

            {/* Active Filters Summary */}
            {(searchTerm || filters.status !== "all") && (
              <div className="pt-1 flex items-center gap-2 flex-wrap">
                <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {t("active_filters") ?? tc("active_filters")}:
                </span>

                {searchTerm && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-fuchsia-500/20 text-fuchsia-500 rounded-full text-xs">
                    "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm("")}
                      className="ml-1 text-fuchsia-500 hover:text-fuchsia-700 font-bold"
                    >
                      ×
                    </button>
                  </span>
                )}

                {(searchTerm || filters.status !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilters({ status: "all" });
                      localStorage.removeItem(STORAGE_KEY);
                      localStorage.removeItem(SEARCH_STORAGE_KEY);
                    }}
                    className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs hover:bg-red-500/30 transition-colors"
                  >
                    {t("clear_all") ?? tc("clear_all")}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bulk Action Bar */}
        {selectedBlogs.size > 0 && (
          <BulkActionBar
            selectedItemCount={selectedBlogs.size}
            handleBulkDelete={() => setIsBulkDeleteConfirmOpen(true)}
            hancleClearSelection={() => setSelectedBlogs(new Set())}
          />
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {!isLoading && !isFetching && combinedBlogs.length === 0 ? (
            <EmptyState searchQuery={searchTerm} />
          ) : viewMode === "list" ? (
            <BlogListView
              blogs={combinedBlogs}
              columnVisibility={columnVisibility}
              selectedBlogs={selectedBlogs}
              setSelectedBlogs={setSelectedBlogs}
              hasMore={!!hasMore}
              next={fetchNextPage}
              onBlogClick={handleBusinessClick}
              isLoading={isLoading}
            />
          ) : (
            <BlogGridView
              data={combinedBlogs}
              onRowClick={handleBusinessClick}
              selectedItems={selectedBlogs}
              setSelectedItems={setSelectedBlogs}
              hasMore={!!hasMore}
              next={fetchNextPage}
              isLoading={isLoading || isFetching}
              refetch={handleRefetch}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <ConfirmDialog
        open={isBulkDeleteConfirmOpen}
        title={t("delete_articles")}
        message={t("bulk_delete_confirm_message")}
        confirmText={t("delete")}
        loading={isDeleting}
        variant="danger"
        onCancel={() => setIsBulkDeleteConfirmOpen(false)}
        onConfirm={handleBulkDelete}
      />

      {isCreateModalOpen && (
        <CreateArticleWizard
          onClose={() => setIsCreateModalOpen(false)}
          refetch={handleRefetch}
        />
      )}
    </>
  );
}