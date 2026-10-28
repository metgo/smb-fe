import clsx from "clsx";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import {
  Edit,
  ExternalLink,
  FileText,
  Globe,
  History,
  Image as ImageIcon,
  ChevronDown,
} from "lucide-react";

import { routes } from "@/lib/routes";
import { CreateArticleWizard } from "../components";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetBlogByIdQuery } from "@/store/api/blogQueryApi";
import { BackToListBtn, StatusChangeBtn } from "@/components/btns";
import { useUpdateBlogMutation } from "@/store/api/blogMutationApi";
import { ImageWithFallback, Spinner, TabsSection } from "@/components/shared";
import { AuditInfoDetails } from "@/components/details-sections";
import { formatDateTime } from "@/helpers/formatter";
import { sanitizeRichTextHtml } from "@/helpers";

interface BlogImage {
  image: string;
  alt: string;
  isPrimary: boolean;
  caption?: string;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────
function mapBlogDetailsToArticle(blogDetails: any): IBlogDetails {
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
    tagsHe: blogDetails?.tagsHe ?? [],
    tagsAr: blogDetails?.tagsAr ?? [],
    images: blogDetails?.images ?? [],
    createdAt: blogDetails?.createdAt ?? "",
    updatedAt: blogDetails?.updatedAt ?? null,
    createdBy: blogDetails?.createdBy,
    updatedBy: blogDetails?.updatedBy,
    externalApiId: blogDetails?.externalApiId ?? null,
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [updateBlog] = useUpdateBlogMutation();
  const {
    data: blogDetailsRaw,
    isLoading: isDetailLoading,
    refetch,
  } = useGetBlogByIdQuery({ blogId, language }, { skip: !blogId });

  // Prefer API data; fall back to passed article prop
  const blogDetails: IBlogDetails | null = blogDetailsRaw
    ? mapBlogDetailsToArticle(blogDetailsRaw)
    : null;

  useEffect(() => {
    if (!isEditOpen) refetch();
  }, [refetch, isEditOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { bgSecondary, textPrimary, textSecondary, textTertiary, borderColor } =
    useThemeClasses();

  const tabs = [
    { id: "overview", label: t("tab_overview"), icon: FileText },
    { id: "content", label: t("tab_content"), icon: FileText },
    { id: "seo", label: t("tab_seo"), icon: Globe },
    { id: "media", label: t("tab_media"), icon: ImageIcon },
    { id: "audit_info", label: "audit_info", icon: History },
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
        <div
          className={textPrimary}
          dangerouslySetInnerHTML={{
            __html: sanitizeRichTextHtml(blogDetails?.shortDescription || ""),
          }}
        />
      </div>

      {/* Subtitle */}
      {blogDetails?.summary && (
        <div>
          <h3 className={`text-sm mb-2 ${textTertiary}`}>{t("summary")}</h3>
          <p className={textSecondary}>{blogDetails?.summary || "-"}</p>
        </div>
      )}

      {/* Tags */}
      {blogDetails &&
        (() => {
          const localizedTags =
            language === "he"
              ? blogDetails?.tagsHe
              : language === "ar"
                ? blogDetails?.tagsAr
                : blogDetails?.tags;

          return (
            localizedTags?.length > 0 && (
              <div>
                <h3 className={`text-sm mb-2 ${textTertiary}`}>{t("tags")}</h3>
                <div className="flex flex-wrap gap-2">
                  {localizedTags.map((tag, idx) => (
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
            )
          );
        })()}
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      <div
        className={`p-6 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} prose max-w-none`}
        dangerouslySetInnerHTML={{
          __html: sanitizeRichTextHtml(blogDetails?.content || ""),
        }}
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
        <p className={textSecondary}>{blogDetails?.metaTitle || "-"}</p>
      </div>

      {/* Meta Description */}
      <div>
        <h3 className={`text-sm mb-2 ${textTertiary}`}>
          {t("meta_description")}
        </h3>
        <p className={textSecondary}>{blogDetails?.metaDescription || "-"}</p>
      </div>

      {/* Summary */}
      <div>
        <h3 className={`text-sm mb-2 ${textTertiary}`}>{t("summary")}</h3>
        <p className={`${textSecondary} leading-relaxed`}>
          {blogDetails?.summary || "-"}
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
      case "audit_info":
        return (
          <AuditInfoDetails
            createdAt={blogDetails?.createdAt}
            updatedAt={blogDetails?.updatedAt ?? undefined}
            createdBy={blogDetails?.createdBy}
            updatedBy={blogDetails?.updatedBy}
          />
        );
      default:
        return renderOverview();
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] overflow-hidden relative pt-10 md:pt-0">
      <Spinner isLoading={isDetailLoading} />

      {/* Title + meta */}
      <div className="details-top shrink-0">
        <BackToListBtn navPath={routes.articleMgmt} />
        <div className="flex items-center gap-3 mt-2">
          <ImageWithFallback
            src={primaryImage}
            alt={blogDetails?.title || "-"}
            className={clsx(
              "w-14 h-14 rounded-xl object-cover border shrink-0",
              isDark ? "border-gray-600" : "border-gray-200",
            )}
          />
          <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 min-w-0">
            <div className="min-w-0">
              <h1
                className={`text-lg font-semibold leading-tight truncate ${
                  isDark ? "text-gray-100" : "text-gray-900"
                }`}
              >
                {blogDetails?.title || "-"}
              </h1>
              <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                {blogDetails?.createdAt && (
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1 text-xs",
                      textTertiary,
                    )}
                  >
                    <svg
                      className="w-3 h-3 shrink-0"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="2" y="3" width="12" height="11" rx="1.5" />
                      <path d="M5 1.5v3M11 1.5v3M2 7h12" />
                    </svg>
                    {formatDateTime(blogDetails?.createdAt, language)}
                  </span>
                )}
                {blogDetails?.updatedAt && (
                  <>
                    <div
                      className={clsx(
                        "w-px h-3 shrink-0 opacity-30",
                        textTertiary,
                      )}
                      style={{ background: "currentColor" }}
                    />
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1 text-xs",
                        textTertiary,
                      )}
                    >
                      <svg
                        className="w-3 h-3 shrink-0"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path
                          d="M13.5 8A5.5 5.5 0 1 1 8 2.5"
                          strokeLinecap="round"
                        />
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
                      {formatDateTime(blogDetails?.updatedAt, language)}
                    </span>
                  </>
                )}
                {blogDetails?.externalApiId && (
                  <>
                    <div
                      className={clsx(
                        "w-px h-3 shrink-0 opacity-30",
                        textTertiary,
                      )}
                      style={{ background: "currentColor" }}
                    />
                    <a
                      href={`${blogDetails?.externalApiId?.url}blog-article-details/${blogDetails?.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={clsx(
                        "inline-flex items-center gap-1 text-xs",
                        textSecondary,
                      )}
                    >
                      <img
                        src={blogDetails?.externalApiId?.logo}
                        alt={blogDetails?.externalApiId?.name}
                        className="w-4 h-4 object-contain rounded"
                      />
                      <span className="font-medium hover:underline">
                        {blogDetails?.externalApiId?.name}
                      </span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <StatusChangeBtn
                handleStatusChange={onStatusChangeHandler}
                status={blogDetails?.status as TStatus}
              />
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className={`px-3 py-2 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isDark
                      ? "border-gray-700 hover:bg-gray-800 text-gray-300 bg-gray-900"
                      : "border-gray-300 hover:bg-gray-100 text-gray-700 bg-white"
                  }`}
                >
                  <span className="text-sm font-medium">
                    {t("actions") || "Actions"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isDropdownOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-52 rounded-xl shadow-lg border z-50 overflow-hidden ${
                      isDark
                        ? "bg-gray-900 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <button
                      onClick={() => {
                        setIsEditOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm transition-colors cursor-pointer ${
                        isDark
                          ? "text-indigo-400 hover:bg-gray-800"
                          : "text-indigo-600 hover:bg-gray-50"
                      }`}
                    >
                      <Edit className="w-4 h-4 shrink-0" />
                      {t("edit") || "Edit"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + scrollable content */}
      <div className="mt-6 flex flex-col flex-1 min-h-0">
        <div className="shrink-0">
          <TabsSection
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
        <div className="details-content flex-1 overflow-y-auto min-h-0">
          {renderTabContent()}
        </div>
      </div>

      {isEditOpen && (
        <CreateArticleWizard
          onClose={() => setIsEditOpen(false)}
          existingArticle={blogDetailsRaw}
          refetch={refetch}
        />
      )}
    </div>
  );
}
