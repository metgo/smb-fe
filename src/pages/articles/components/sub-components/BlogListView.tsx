import { useTranslation } from "react-i18next";

import { StatusPill } from "@/components/pills";
import { getPlainTextFromRichText } from "@/helpers";
import { ReordableDataTable } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useUserRoles } from "@/hooks/useUserRoles";

export const defaultBlogColumns = {
  externalApiId: true,
  title: true,
  subTitle: true,
  status: true,
  createdAt: true,
  updatedAt: false,
  imageCount: true,
  contentPreview: false,
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
  const { textPrimary, textSecondary } = useThemeClasses();
  const { isSuperadmin } = useUserRoles();

  const columns = [
    ...(isSuperadmin ? [{ key: "checkbox", label: "", width: "50px" }] : []),

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

    columnVisibility.externalApiId && {
      key: "externalApi",
      sortable: false,
      label: t("externalApi") || "External Api",
      render: (blog: any) => {
        const api = blog?.externalApiId;
        if (!api) return <div className={`${textPrimary} font-medium`}>-</div>;

        return (
          <a
            href={api.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 w-44"
          >
            <img
              src={api.logo}
              alt={api.name}
              className="w-6 h-6 object-contain rounded"
            />
            <span className={`${textPrimary} font-medium hover:underline`}>
              {api.name}
            </span>
          </a>
        );
      },
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
    // {
    //   key: "viewOnSite",
    //   label: "",
    //   width: "80px",
    //   render: (blog: any) => {
    //     // Replace with your actual blog URL logic
    //     const publicUrl = blog.slug ? `/blog/${blog.slug}` : null;

    //     if (!publicUrl) return null;

    //     return (
    //       <a
    //         href={publicUrl}
    //         target="_blank"
    //         rel="noopener noreferrer"
    //         onClick={(e) => e.stopPropagation()}
    //         className="flex items-center justify-center text-teal-500 hover:text-teal-600"
    //         title="View on site"
    //       >
    //         <ExternalLink className="w-4 h-4" />
    //       </a>
    //     );
    //   },
    // },
  ].filter(Boolean) as {
    key: string;
    label: string;
    width?: string;
    sortable?: boolean;
    render?: (row: any) => React.ReactNode;
  }[];
  console.log("🚀 ~ BlogListView ~ columns:", columns);

  return (
    <div className="flex flex-col overflow-hidden h-[85vh]">
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
