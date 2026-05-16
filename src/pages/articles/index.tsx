import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";

import { routes } from "@/lib/routes";
import BlogListView from "./components/sub-components/BlogListView";
import BlogGridView from "./components/sub-components/BlogGridView";

import { Download, ChevronDown, ChevronUp, Columns } from "lucide-react";

import { useAppSelector } from "@/hooks/hooks";
import { FilterButton } from "@/components/btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  BulkActionBar,
  ConfirmDialog,
  PageHeader,
  ViewModeToggle,
} from "@/components/shared";
import { useGetAllBlogsQuery } from "@/store/api/blogQueryApi";
import { useDeleteBlogMutation } from "@/store/api/blogMutationApi";
import SearchInput from "@/components/shared/SearchInput";
import FilterChips from "@/components/shared/FilterChips";
import EmptyState from "@/components/shared/EmptyState";
import { FilterByStatus } from "@/components/filter-fields";
import CreateArticleWizard from "./components/CreateArticleWizard";
import clsx from "clsx";

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
  const { isDark, isRTL, textPrimary, borderColor } = useThemeClasses();

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
  const [selectedBlogs, setSelectedBlogs] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: "all" as "all" | "ACTIVE" | "APPROVED" | "DRAFT" | "INACTIVE",
  });

  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibility>(defaultColumns);

  const [combinedBlogs, setCombinedBlogs] = useState<any[]>([]);

  const columnSettingsRef = useRef<HTMLDivElement>(null);

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
  // const { data: blogStatsData, isLoading: isStatsLoading } = useGetBlogStatsQuery(queryParams);
  const {
    data: blogData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllBlogsQuery(queryParams);

  // const [bulkBlogsUpdate, { isLoading: isDeleting }] = useBulkBlogsUpdateMutation();

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

  return (
    <>
      <div className="flex flex-col">
        <div
          className={`border-b ${isDark ? "border-gray-800" : "border-gray-200"} z-10`}
        >
          <PageHeader
            title={t("page_title")}
            description={t("page_description")}
            btnLabel={t("create_article")}
            onClick={() => setIsCreateModalOpen(true)}
            h1Gradient="bg-linear-to-r text-transparent from-violet-500 via-fuchsia-600 to-pink-600"
            totalCount={totalData}
          />

          {/* Search & Controls */}
          <div className="py-4 flex flex-col lg:flex-row gap-3">
            <div className="flex-1">
              <SearchInput
                placeholder={t("search_placeholder")}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                storageKey={SEARCH_STORAGE_KEY}
              />
            </div>

            <FilterButton value={showFilters} onChange={setShowFilters} />

            {viewMode === "list" && (
              <div className="relative" ref={columnSettingsRef}>
                <button
                  onClick={() => setShowColumnSettings(!showColumnSettings)}
                  className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${textPrimary} ${borderColor}`}
                >
                  <Columns className="w-5 h-5" />
                  {t("columns")}
                  {showColumnSettings ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {showColumnSettings && (
                  <div
                    className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-64 rounded-lg shadow-lg border z-50 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                  >
                    <div className="p-4 border-b">
                      <div className="flex justify-between mb-2">
                        <h3>{t("column_settings")}</h3>
                        <button
                          onClick={() => {}}
                          className="text-xs text-teal-600"
                        >
                          {t("reset")}
                        </button>
                      </div>
                    </div>
                    <div className="p-3 space-y-1">
                      {columnDefinitions.map(({ key }) => (
                        <label
                          key={key}
                          className={clsx(
                            "flex items-center gap-2 p-2 rounded cursor-pointer",
                            textPrimary,
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={columnVisibility[key]}
                            onChange={(e) =>
                              setColumnVisibility((prev) => ({
                                ...prev,
                                [key]: e.target.checked,
                              }))
                            }
                          />
                          <span>{t(key) || key}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleExport}
              className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${textPrimary} ${borderColor}`}
            >
              <Download className="w-5 h-5" />
              {t("export")}
            </button>

            <ViewModeToggle
              onChange={setViewMode}
              value={viewMode}
              tableName="blogViewMode"
            />
          </div>

          {/* Filters */}
          {(showFilters || filters.status !== "all") && (
            <div
              className={`border-t py-3 ${isDark ? "bg-gray-900/30" : "bg-gray-50"}`}
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
          {/* 
          <BulkActionBar
            selectedItemCount={selectedBlogs.size}
            handleBulkStatusChange={handleBulkStatusChange}
            handleBulkDelete={promptBulkDelete}
            hancleClearSelection={() => setSelectedBlogs(new Set())}
          /> */}
        </div>

        {/* Bulk Action Bar */}
        {selectedBlogs.size > 0 && (
          <div className="mt-2">
            <BulkActionBar
              selectedItemCount={selectedBlogs.size}
              handleBulkDelete={() => setIsBulkDeleteConfirmOpen(true)}
              hancleClearSelection={() => setSelectedBlogs(new Set())}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto mt-2">
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
          <CreateArticleWizard onClose={() => setIsCreateModalOpen(false)} />
        )}
      </div>
    </>
  );
}
