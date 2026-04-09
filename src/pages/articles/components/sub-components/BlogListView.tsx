import { AlertCircle, ExternalLink, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ReordableDataTable } from "@/components/shared";
import { getPlainTextFromRichText } from "@/helpers";
import { StatusPill } from "@/components/pills";
import { useTranslation } from "react-i18next";

export const defaultBlogColumns = {
  title: true,
  subTitle: true,
  status: true,
  createdAt: true,
  updatedAt: false,
  imageCount: true,
  contentPreview: false, // optional: show a snippet of content
};

export type BlogColumnVisibility = typeof defaultBlogColumns;

interface BlogListViewProps {
  blogs: any[];
  isLoading: boolean;
  onBlogClick: (blog: any) => void;
  next: () => void;
  hasMore: boolean;
  columnVisibility: BlogColumnVisibility;
  selectedBlogs: Set<string>;
  setSelectedBlogs: (v: Set<string>) => void;
}

const USER_ROLE = "admin"; // Change this based on your auth logic

const BlogListView = ({
  isLoading,
  blogs,
  onBlogClick,
  next,
  hasMore,
  columnVisibility,
  selectedBlogs,
  setSelectedBlogs,
}: BlogListViewProps) => {
    const { t } = useTranslation("article");
  
  const { textPrimary, textSecondary, isDark } = useThemeClasses();
  const [error, setError] = useState(false);

  // Permission check (you can make this dynamic later)
  const canChangeStatus = ["superadmin", "admin", "dmo", "authority"].includes(
    USER_ROLE,
  );

  const columns = [
    ...(canChangeStatus ? [{ key: "checkbox", label: "", width: "50px" }] : []),

    // Title
    columnVisibility.title && {
      key: "title",
      sortable: true,
      label: t("title") || "Title",
      render: (blog: any) => (
        <div className={`${textPrimary} font-medium line-clamp-2 pr-4`}>
          {blog.title || t("untitled_article")}
        </div>
      ),
    },

    // Subtitle
    columnVisibility.subTitle && {
      key: "subTitle",
      sortable: true,
      label: t("subtitle") || "Subtitle",
      render: (blog: any) => (
        <div className={`${textSecondary} line-clamp-2 text-sm`}>
          {blog.subTitle || "-"}
        </div>
      ),
    },

    // Content Preview (optional but useful)
    columnVisibility.contentPreview && {
      key: "contentPreview",
      label: t("preview") || "Preview",
      render: (blog: any) => {
        const plainText = getPlainTextFromRichText(blog.content || "");
        return (
          <div className={`${textSecondary} line-clamp-2 text-sm`}>
            {plainText.length > 120
              ? plainText.substring(0, 120) + "..."
              : plainText || "-"}
          </div>
        );
      },
    },

    // Images Count
    columnVisibility.imageCount && {
      key: "imageCount",
      sortable: true,
      label: t("images") || "Images",
      width: "100px",
      render: (blog: any) => (
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-purple-500" />
          <span className={textPrimary}>{blog.images?.length || 0}</span>
        </div>
      ),
    },

    // Status
    columnVisibility.status && {
      key: "status",
      label: t("status") || "Status",
      sortable: true,
      render: (blog: any) => <StatusPill status={blog.status} />,
    },

    // Created At
    columnVisibility.createdAt && {
      key: "createdAt",
      sortable: true,
      label: t("created_at") || "Created",
      render: (blog: any) => (
        <span className={textSecondary}>
          {new Date(blog.createdAt).toLocaleDateString()}
        </span>
      ),
    },

    // Updated At
    columnVisibility.updatedAt && {
      key: "updatedAt",
      sortable: true,
      label: t("updated_at") || "Updated",
      render: (blog: any) => (
        <span className={textSecondary}>
          {blog.updatedAt ? new Date(blog.updatedAt).toLocaleDateString() : "-"}
        </span>
      ),
    },

    // Optional: View on Site (if you have a public URL)
    {
      key: "viewOnSite",
      label: "",
      width: "80px",
      render: (blog: any) => {
        // Replace with your actual blog URL logic
        const publicUrl = blog.slug ? `/blog/${blog.slug}` : null;

        if (!publicUrl) return null;

        return (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center text-teal-500 hover:text-teal-600"
            title="View on site"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        );
      },
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    width?: string;
    sortable?: boolean;
    render?: (row: any) => React.ReactNode;
  }[];

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <h3
            className={`text-xl mb-2 ${isDark ? "text-gray-200" : "text-gray-800"}`}
          >
            {t("failed_to_load")}
          </h3>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden h-[calc(100vh-400px)]">
      <ReordableDataTable
        rowKey="_id"
        data={blogs}
        isDataLoading={isLoading}
        selectedItems={selectedBlogs}
        onSelectionChange={setSelectedBlogs}
        onRowClick={(blog) => onBlogClick(blog)}
        storageKey="blogsTableColumnOrder"
        columns={columns}
        hasMore={hasMore}
        next={next}
        t={t}
      />
    </div>
  );
};
export default BlogListView;
