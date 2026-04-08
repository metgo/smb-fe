import { useState } from "react";
import {
  ArrowLeft,
  Edit,
  FileText,
  Copy,
  Globe,
  Image as ImageIcon,
  Eye,
  Share2,
  BarChart3,
} from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useGetBlogByIdQuery } from "@/store/api/blogQueryApi";
import { IOpMode } from "@/enums/operation.types";
import { CreateArticleWizard } from "../components";

// ─── Interfaces ───────────────────────────────────────────────────────────────

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
  subTitle: string;
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

interface ArticleDetailsProps {
  article?: any; // fallback prop
  theme: Theme;
  onBack: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapBlogDetailsToArticle(data: any): BlogDetails {
  return {
    _id: data._id,
    status: data.status?.toLowerCase() ?? "draft",
    title: data.title ?? "",
    subTitle: data.subTitle ?? "",
    shortDescription: data.shortDescription ?? "",
    content: data.content ?? "",
    summary: data.summary ?? "",
    slug: data.slug ?? "",
    metaTitle: data.metaTitle ?? "",
    metaDescription: data.metaDescription ?? "",
    tags: data.tags ?? [],
    images: data.images ?? [],
    createdAt: data.createdAt ?? "",
    updatedAt: data.updatedAt ?? null,
    createdBy: data.createdBy ?? "",
    updatedBy: data.updatedBy ?? null,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPrimaryImage(images: BlogImage[]): string {
  return images.find((img) => img.isPrimary)?.image ?? images[0]?.image ?? "";
}

function formatStatus(
  status: string,
): "draft" | "published" | "scheduled" | "archived" | "approved" {
  const map: Record<string, any> = {
    approved: "approved",
    published: "published",
    draft: "draft",
    scheduled: "scheduled",
    archived: "archived",
  };
  return map[status] ?? "draft";
}

const USER_ROLE = "admin";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ArticleDetails({
  article,
  theme,
  onBack,
  onEdit,
  onDuplicate,
}: ArticleDetailsProps) {
  const { t } = useTranslation("common");
  const [activeTab, setActiveTab] = useState("overview");
  const [searchParams] = useSearchParams();
  const blogId = searchParams.get("blogId") ?? "";
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [opMode, setOpMode] = useState<TOpMode>(IOpMode.EDIT);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isDark, language, isRTL } = useThemeClasses();

  const { data: blogDetailsRaw, isLoading: isDetailLoading } =
    useGetBlogByIdQuery({ blogId }, { skip: !blogId });

  // Prefer API data; fall back to passed article prop
  const data: BlogDetails | null = blogDetailsRaw
    ? mapBlogDetailsToArticle(blogDetailsRaw)
    : null;

  const canEdit = ["superadmin", "admin", "dmo", "authority"].includes(
    USER_ROLE,
  );
  const handleEdit = (mode: TOpMode) => {
    setIsEditOpen(true);
    setOpMode(mode);
  };
  const bgPrimary = theme === "dark" ? "bg-gray-900" : "bg-white";
  const bgSecondary = theme === "dark" ? "bg-gray-800" : "bg-gray-50";
  const textPrimary = theme === "dark" ? "text-white" : "text-gray-900";
  const textSecondary = theme === "dark" ? "text-gray-300" : "text-gray-700";
  const textTertiary = theme === "dark" ? "text-gray-400" : "text-gray-500";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";

  const tabs = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "content", label: "Content", icon: FileText },
    { id: "seo", label: "SEO & Publishing", icon: Globe },
    { id: "media", label: "Media", icon: ImageIcon },
  ];

  // ─── Status Badge ───────────────────────────────────────────────────────────

  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      draft: { color: "bg-gray-500", label: "Draft" },
      published: { color: "bg-green-500", label: "Published" },
      scheduled: { color: "bg-blue-500", label: "Scheduled" },
      archived: { color: "bg-orange-500", label: "Archived" },
      approved: { color: "bg-teal-500", label: "Approved" },
    };
    const config = statusConfig[status] ?? statusConfig.draft;
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm text-white ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  // ─── Loading State ──────────────────────────────────────────────────────────

  if (isDetailLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${bgPrimary}`}
      >
        <p className={textTertiary}>Loading article...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${bgPrimary}`}
      >
        <p className={textTertiary}>Article not found.</p>
      </div>
    );
  }

  const primaryImage = getPrimaryImage(data.images);

  // ─── Tab Renderers ──────────────────────────────────────────────────────────

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Featured Image */}
      {primaryImage && (
        <div>
          <h3 className={`text-sm mb-2 ${textTertiary}`}>Featured Image</h3>
          <div className="w-full h-64 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600">
            <img
              src={primaryImage}
              alt={data.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Short Description */}
      <div>
        <h3 className={`text-sm mb-2 ${textTertiary}`}>Short Description</h3>
        <p className={textPrimary}>{data.shortDescription}</p>
      </div>

      {/* Subtitle */}
      {data.subTitle && (
        <div>
          <h3 className={`text-sm mb-2 ${textTertiary}`}>Subtitle</h3>
          <p className={textSecondary}>{data.subTitle}</p>
        </div>
      )}

      {/* Tags */}
      {data.tags.length > 0 && (
        <div>
          <h3 className={`text-sm mb-2 ${textTertiary}`}>Tags</h3>
          <div className="flex flex-wrap gap-2">
            {data.tags.map((tag, idx) => (
              <span
                key={idx}
                className={`px-3 py-1 rounded-full text-sm ${
                  theme === "dark"
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

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className={`text-sm mb-2 ${textTertiary}`}>Created</h3>
          <p className={textSecondary}>
            {new Date(data.createdAt).toLocaleString()}
          </p>
        </div>
        {data.updatedAt && (
          <div>
            <h3 className={`text-sm mb-2 ${textTertiary}`}>Last Updated</h3>
            <p className={textSecondary}>
              {new Date(data.updatedAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      <div
        className={`p-6 rounded-lg border ${borderColor} ${bgSecondary} prose max-w-none`}
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
    </div>
  );

  const renderSEO = () => (
    <div className="space-y-6">
      {/* Slug */}
      <div>
        <h3 className={`text-sm mb-2 ${textTertiary}`}>URL Slug</h3>
        <p className={textSecondary}>{data.slug || "—"}</p>
      </div>

      {/* Meta Title */}
      <div>
        <h3 className={`text-sm mb-2 ${textTertiary}`}>Meta Title</h3>
        <p className={textSecondary}>{data.metaTitle || "—"}</p>
      </div>

      {/* Meta Description */}
      <div>
        <h3 className={`text-sm mb-2 ${textTertiary}`}>Meta Description</h3>
        <p className={textSecondary}>{data.metaDescription || "—"}</p>
      </div>

      {/* Summary */}
      <div>
        <h3 className={`text-sm mb-2 ${textTertiary}`}>Summary</h3>
        <p className={`${textSecondary} leading-relaxed`}>
          {data.summary || "—"}
        </p>
      </div>
    </div>
  );

  const renderMedia = () => (
    <div className="space-y-6">
      {data.images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.images.map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <img
                src={img.image}
                alt={img.alt || data.title}
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
        <p className={textTertiary}>No media available.</p>
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
      <div className="max-w-[1400px] mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 mb-4 ${textSecondary} hover:${textPrimary} transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Articles</span>
          </button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className={`text-3xl font-bold ${textPrimary}`}>
                  {data.title}
                </h1>
                <StatusBadge status={formatStatus(data.status)} />
              </div>
              <p className={textTertiary}>Article ID: {data._id}</p>
            </div>
            <button
              onClick={() => {
                handleEdit(IOpMode.EDIT);
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
        </div>

        {/* Tabs */}
        <div className={`border-b ${borderColor} mb-6`}>
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? `border-blue-600 ${textPrimary}`
                      : `border-transparent ${textSecondary} hover:${textPrimary}`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className={`${bgPrimary} rounded-lg`}>{renderTabContent()}</div>
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
