import clsx from "clsx";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Edit, FileText, Globe, Image as ImageIcon } from "lucide-react";

import { routes } from "@/lib/routes";
import { CreateArticleWizard } from "../components";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetBlogByIdQuery } from "@/store/api/blogQueryApi";
import { BackToListBtn, StatusChangeBtn } from "@/components/btns";
import { useUpdateBlogMutation } from "@/store/api/blogMutationApi";
import { ImageWithFallback, Spinner, TabsSection } from "@/components/shared";
import { formatDateTime } from "@/helpers/formatter";

interface BlogImage {
  image: string;
  alt: string;
  isPrimary: boolean;
  caption?: string;
}

interface BlogDetails {
  _id: string;
  status: string;
  title: string;
  shortDescription: string;
  content: string;
  summary: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  images: BlogImage[];
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapBlogDetailsToArticle(blogDetails: any): BlogDetails {
  return {
    _id: blogDetails?._id,
    status: blogDetails?.status?.toLowerCase() ?? "draft",
    title: blogDetails?.title ?? "",
    shortDescription: blogDetails?.shortDescription ?? "",
    content: blogDetails?.content ?? "",
    summary: blogDetails?.summary ?? "",
    slug: blogDetails?.slug ?? "",
    metaTitle: blogDetails?.metaTitle ?? "",
    metaDescription: blogDetails?.metaDescription ?? "",
    tags: blogDetails?.tags ?? [],
    images: blogDetails?.images ?? [],
    createdAt: blogDetails?.createdAt ?? "",
    updatedAt: blogDetails?.updatedAt ?? null,
    createdBy: blogDetails?.createdBy ?? "",
    updatedBy: blogDetails?.updatedBy ?? null,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPrimaryImage(images: BlogImage[]): string {
  return images.find((img) => img.isPrimary)?.image ?? images[0]?.image ?? "";
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ArticleDetails() {
  const { t } = useTranslation("article");
  const { t: tt } = useTranslation("toast");

  const { isDark, language } = useThemeClasses();
  const [searchParams] = useSearchParams();
  const blogId = searchParams.get("blogId") ?? "";

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [updateBlog] = useUpdateBlogMutation();
  const {
    data: blogDetailsRaw,
    isLoading: isDetailLoading,
    refetch,
  } = useGetBlogByIdQuery({ blogId }, { skip: !blogId });

  // Prefer API data; fall back to passed article prop
  const blogDetails: BlogDetails | null = blogDetailsRaw
    ? mapBlogDetailsToArticle(blogDetailsRaw)
    : null;

  useEffect(() => {
    if (!isEditOpen) refetch();
  }, [refetch, isEditOpen]);

  const {
    bgPrimary,
    bgSecondary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
  } = useThemeClasses();

  const tabs = [
    { id: "overview", label: t("tab_overview"), icon: FileText },
    { id: "content", label: t("tab_content"), icon: FileText },
    { id: "seo", label: t("tab_seo"), icon: Globe },
    { id: "media", label: t("tab_media"), icon: ImageIcon },
  ];

  const primaryImage = getPrimaryImage(blogDetails?.images || []);

  const onStatusChangeHandler = async (status: string) => {
    try {
      await updateBlog({
        blogId,
        body: { status: status.toUpperCase() },
      }).unwrap();

      toast.success(tt("business_status_update_success"));
      refetch();
    } catch (error) {
      toast.error(tt("business_status_update_failed"));
      console.error(error);
    }
  };

  // ─── Tab Renderers ──────────────────────────────────────────────────────────

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Featured Image */}
      {primaryImage && (
        <div>
          <h3 className={`text-sm mb-2 ${textTertiary}`}>
            {t("featured_image")}
          </h3>
          <div className="w-full h-64 rounded-lg overflow-hidden bg-linear-to-br from-blue-500 to-indigo-600">
            <ImageWithFallback
              src={primaryImage}
              alt={blogDetails?.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Short Description */}
      <div>
        <h3 className={`text-sm mb-2 ${textTertiary}`}>
          {t("short_description")}
        </h3>
        <p className={textPrimary}>{blogDetails?.shortDescription}</p>
      </div>

      {/* Subtitle */}
      {blogDetails?.summary && (
        <div>
          <h3 className={`text-sm mb-2 ${textTertiary}`}>{t("summary")}</h3>
          <p className={textSecondary}>{blogDetails?.summary}</p>
        </div>
      )}

      {/* Tags */}
      {blogDetails && blogDetails?.tags?.length > 0 && (
        <div>
          <h3 className={`text-sm mb-2 ${textTertiary}`}>{t("tags")}</h3>
          <div className="flex flex-wrap gap-2">
            {blogDetails?.tags?.map((tag, idx) => (
              <span
                key={idx}
                className={`px-3 py-1 rounded-full text-sm ${
                  isDark
                    ? "bg-blue-900/30 text-blue-400"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      <div
        className={`p-6 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} prose max-w-none`}
        dangerouslySetInnerHTML={{ __html: blogDetails?.content || "" }}
      />
    </div>
  );

  const renderSEO = () => (
    <div
      className={clsx(
        "space-y-6 p-6 rounded-lg",
        borderColor,
        bgSecondary,
        textPrimary,
      )}
    >
      {/* Slug */}
      <div>
        <h3 className={`text-sm mb-2 ${textTertiary}`}>{t("url_slug")}</h3>
        <p className={textSecondary}>{blogDetails?.slug || "—"}</p>
      </div>

      {/* Meta Title */}
      <div>
        <h3 className={`text-sm mb-2 ${textTertiary}`}>{t("meta_title")}</h3>
        <p className={textSecondary}>{blogDetails?.metaTitle || "—"}</p>
      </div>

      {/* Meta Description */}
      <div>
        <h3 className={`text-sm mb-2 ${textTertiary}`}>
          {t("meta_description")}
        </h3>
        <p className={textSecondary}>{blogDetails?.metaDescription || "—"}</p>
      </div>

      {/* Summary */}
      <div>
        <h3 className={`text-sm mb-2 ${textTertiary}`}>{t("summary")}</h3>
        <p className={`${textSecondary} leading-relaxed`}>
          {blogDetails?.summary || "—"}
        </p>
      </div>
    </div>
  );

  const renderMedia = () => (
    <div className="space-y-6">
      {blogDetails && blogDetails?.images?.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {blogDetails?.images.map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-lg  overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <img
                src={img.image}
                alt={img.alt || blogDetails?.title}
                className="w-full h-full object-cover"
              />
              {img.isPrimary && (
                <span className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded">
                  Primary
                </span>
              )}
              {img.caption && (
                <p
                  className={`absolute bottom-0 left-0 right-0 text-xs px-2 py-1 bg-black/50 text-white`}
                >
                  {img.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className={textTertiary}>{t("no_media_available")}</p>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "content":
        return renderContent();
      case "seo":
        return renderSEO();
      case "media":
        return renderMedia();
      default:
        return renderOverview();
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={`min-h-screen ${bgPrimary}`}>
      <Spinner isLoading={isDetailLoading} />
      <div className=" mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <BackToListBtn navPath={routes.articleMgmt} />

            <div className="flex items-center gap-4">
              <StatusChangeBtn
                handleStatusChange={onStatusChangeHandler}
                status={blogDetails?.status as TStatus}
              />
              <div>
                <button
                  onClick={() => setIsEditOpen(true)}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm transition-colors cursor-pointer bg-blue-500 rounded-md ${
                    isDark
                      ? "text-white hover:bg-gray-800"
                      : "text-indigo-200 hover:text-indigo-500 hover:bg-gray-200"
                  }`}
                >
                  <Edit className="w-4 h-4 shrink-0" />
                  {t("edit")}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className={`text-3xl font-bold ${textPrimary}`}>
              {blogDetails?.title}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {blogDetails?.createdAt && (
              <div className="flex items-center gap-1.5">
                <svg
                  className={clsx("w-3.5 h-3.5 shrink-0", textTertiary)}
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="2" y="3" width="12" height="11" rx="1.5" />
                  <path d="M5 1.5v3M11 1.5v3M2 7h12" />
                </svg>
                <span className={clsx(" font-medium", textTertiary)}>
                  {t("created")}
                </span>
                <span className={clsx("", textTertiary)}>
                  {formatDateTime(blogDetails?.createdAt, language)}
                </span>
              </div>
            )}

            <div
              className={clsx("w-px h-3 shrink-0", textTertiary, "opacity-30")}
              style={{ background: "currentColor" }}
            />

            {blogDetails?.updatedAt && (
              <div className="flex items-center gap-1.5">
                <svg
                  className={clsx("w-3.5 h-3.5 shrink-0", textTertiary)}
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5" strokeLinecap="round" />
                  <path
                    d="M10.5 1.5l3 1-1 3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 5v3.5l2 1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className={clsx(" font-medium", textTertiary)}>
                  {t("updated")}
                </span>
                <span className={clsx("", textTertiary)}>
                  {formatDateTime(blogDetails?.updatedAt, language)}
                </span>
              </div>
            )}
          </div>
        </div>

        <TabsSection
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Tab Content */}
        <div className={`${bgPrimary} rounded-lg mt-4`}>
          {renderTabContent()}
        </div>
      </div>
      {isEditOpen && (
        <CreateArticleWizard
          onClose={() => setIsEditOpen(false)}
          existingArticle={blogDetailsRaw}
        />
      )}
    </div>
  );
}
