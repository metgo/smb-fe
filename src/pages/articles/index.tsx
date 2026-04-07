import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";

import { routes } from "@/lib/routes";
import BlogListView from "./components/sub-components/BlogListView";
import BlogGridView from "./components/sub-components/BlogGridView";

import {
  Download,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Columns,
  FileText,
  Calendar,
  Eye,
  Users,
} from "lucide-react";

import { useAppSelector } from "@/hooks/hooks";
import { FilterButton } from "@/components/btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  BulkActionBar,
  ConfirmDialog,
  PageHeader,
  PageStats,
  ViewModeToggle,
} from "@/components/shared";
import {
  useGetAllBlogsQuery,
  // useGetBlogStatsQuery,
} from "@/store/api/blogQueryApi";
// import { useBulkBlogsUpdateMutation } from "@/store/api/blogMutationApi";
import SearchInput from "@/components/shared/SearchInput";
import FilterChips from "@/components/shared/FilterChips";
import EmptyState from "@/components/shared/EmptyState";
import { FilterByStatus } from "@/components/filter-fields";
import ArticleWizard from "./components/ArticleWizard";

const LIMIT = 20;
const STORAGE_KEY = "blog_query_state";
const COLUMNS_STORAGE_KEY = "blogsTableColumns";
const SEARCH_STORAGE_KEY = "blogSearchTerm";

type ColumnVisibility = {
  title: boolean;
  subTitle: boolean;
  status: boolean;
  createdAt: boolean;
  updatedAt: boolean;
  imageCount: boolean;
  author?: boolean; // if you add author later
};

const defaultColumns: ColumnVisibility = {
  title: true,
  subTitle: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  imageCount: true,
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
  const { t } = useTranslation("blogs"); // ← Create this namespace if needed
  const { isDark, isRTL, language, bgSecondary, borderColor, textSecondary } =
    useThemeClasses();

  const { dmoId, authorityId, websiteId } = useAppSelector(
    (state) => state.auth,
  );

  // Local State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  console.log("🚀 ~ ArticlesManagement ~ isCreateModalOpen:", isCreateModalOpen)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
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
    } catch (e) {}
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

  // const handleBlogClick = useCallback((blog: any) => {
  //   navigate(`${routes.blogDetails}?blogId=${blog._id}`);
  // }, [navigate]);

  const clearFilter = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setFilters({ status: "all" });
    setSearchTerm("");
    setPage(1);
  }, []);

  const resetToDefault = useCallback(() => {
    setColumnVisibility(defaultColumns);
  }, []);

  const promptBulkDelete = useCallback(() => {
    if (selectedBlogs.size === 0) return;
    setIsBulkDelete(true);
    setIsConfirmOpen(true);
  }, [selectedBlogs.size]);

  // const handleBulkDelete = useCallback(async () => {
  //   if (!selectedBlogs.size) return;

  //   const toastId = toast.loading(tc("blog_delete_loading"));
  //   try {
  //     await bulkBlogsUpdate({
  //       blogsId: Array.from(selectedBlogs),
  //       isDeleted: true,
  //     });
  //     toast.success(tc("blog_deleted_success"), { id: toastId });
  //     setSelectedBlogs(new Set());
  //     refetch();
  //   } catch (error: any) {
  //     toast.error(error?.message || tc("blog_delete_failed"), { id: toastId });
  //   } finally {
  //     setIsConfirmOpen(false);
  //     setIsBulkDelete(false);
  //   }
  // }, [selectedBlogs, bulkBlogsUpdate, refetch, tc]);

  // const handleBulkStatusChange = useCallback(async (status: string) => {
  //   if (!selectedBlogs.size) return;

  //   const toastId = toast.loading(tc("blog_status_change_loading"));
  //   try {
  //     await bulkBlogsUpdate({
  //       blogsId: Array.from(selectedBlogs),
  //       status: status.toUpperCase(),
  //     });
  //     toast.success(tc("blog_status_update_success"), { id: toastId });
  //     setSelectedBlogs(new Set());
  //     refetch();
  //   } catch (error: any) {
  //     toast.error(error?.message || tc("blog_status_update_failed"), { id: toastId });
  //   }
  // }, [selectedBlogs, bulkBlogsUpdate, refetch, tc]);

  const handleExport = useCallback(() => {
    const blogsToExport =
      selectedBlogs.size > 0
        ? combinedBlogs.filter((b) => selectedBlogs.has(b._id))
        : combinedBlogs;

    if (!blogsToExport.length) {
      toast.info("No blogs to export");
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
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `blogs_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [selectedBlogs, combinedBlogs]);

  // Stats
  // const blogStats = useMemo(() => [
  //   {
  //     id: 1,
  //     title: "Total Articles",
  //     value: blogStatsData?.totalBlogs,
  //     label: "Created",
  //     icon: <FileText className="w-5 h-5 text-blue-600" />,
  //   },
  //   {
  //     id: 2,
  //     title: "Active / Approved",
  //     value: blogStatsData?.activeBlogs,
  //     label: "Visible",
  //     icon: <CheckCircle className="w-5 h-5 text-green-600" />,
  //   },
  //   {
  //     id: 3,
  //     title: "With Images",
  //     value: blogStatsData?.blogsWithImages,
  //     label: "Media",
  //     icon: <Eye className="w-5 h-5 text-purple-600" />,
  //   },
  //   {
  //     id: 4,
  //     title: "Pending",
  //     value: blogStatsData?.pendingBlogs,
  //     label: "Review",
  //     icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
  //   },
  // ], [blogStatsData]);

  return (
    <>
      <div className="flex flex-col">
        {/* Header */}
        <div
          className={`border-b ${isDark ? "border-gray-800" : "border-gray-200"} z-10`}
        >
          <PageHeader
            title="Blog & Articles Management"
            description="Create, manage and publish high-quality content across your platforms"
            btnLabel="Create Article"
            onClick={() => setIsCreateModalOpen(true)}
            h1Gradient="bg-linear-to-r text-transparent from-violet-500 via-fuchsia-600 to-pink-600"
            totalCount={totalData}
          />

          {/* <PageStats stats={blogStats} isLoading={isStatsLoading} /> */}

          {/* Search & Controls */}
          <div className="py-4 flex flex-col lg:flex-row gap-3">
            <div className="flex-1">
              <SearchInput
                placeholder="Search articles by title or subtitle..."
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
                  className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${isDark ? "border-gray-700 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-100"}`}
                >
                  <Columns className="w-5 h-5" />
                  Columns
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
                        <h3>Column Settings</h3>
                        <button
                          onClick={resetToDefault}
                          className="text-xs text-teal-600"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                    <div className="p-3 space-y-1">
                      {columnDefinitions.map(({ key }) => (
                        <label
                          key={key}
                          className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
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
              className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${isDark ? "border-gray-700 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-100"}`}
            >
              <Download className="w-5 h-5" />
              Export
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto mt-2">
          {!isLoading && !isFetching && combinedBlogs.length === 0 ? (
            <EmptyState searchQuery={searchTerm} />
          ) : viewMode === "list" ? (
            <BlogListView
              blogs={combinedBlogs}
              columnVisibility={columnVisibility}
              onBlogClick={() => {}}
              selectedBlogs={selectedBlogs}
              setSelectedBlogs={setSelectedBlogs}
              hasMore={!!hasMore}
              next={fetchNextPage}
              t={t}
              isLoading={isLoading}
            />
          ) : (
            <BlogGridView
              data={combinedBlogs}
              onRowClick={() => {}}
              selectedItems={selectedBlogs}
              setSelectedItems={setSelectedBlogs}
              hasMore={!!hasMore}
              next={fetchNextPage}
              t={t}
              isLoading={isLoading || isFetching}
              refetch={refetch}
            />
          )}
        </div>

        {/* Modals */}
        {/* <ConfirmDialog
          open={isConfirmOpen}
          title="Delete Articles"
          message="Are you sure you want to delete the selected articles?"
          confirmText="Delete"
          loading={isDeleting}
          variant="danger"
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={handleBulkDelete}
        /> */}

        {isCreateModalOpen && (
          <ArticleWizard
            onClose={() => setIsCreateModalOpen(false)}
            refetch={refetch}
          />
        )}
       
      </div>
    </>
  );
}
