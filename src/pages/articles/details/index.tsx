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

interface Article {
  id: string;
  websiteId: string;
  websiteName: string;
  title: { en: string; he: string; ar: string };
  shortDescription: { en: string; he: string; ar: string };
  slug: string;
  status: "draft" | "published" | "scheduled" | "archived";
  tags: string[];
  primaryMedia: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  views: number;
  shares: number;
}

interface ArticleDetailsProps {
  article: Article;
  theme: Theme;
  onBack: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
}

const USER_ROLE = "admin"; // Can be: 'superadmin', 'admin', 'dmo', 'authority', 'business_owner'

export default function ArticleDetails({
  article,
  theme,
  onBack,
  onEdit,
  onDuplicate,
}: ArticleDetailsProps) {
  const { t } = useTranslation("common");
  const { language } = useThemeClasses();
  const [activeTab, setActiveTab] = useState("overview");

  const canEdit = ["superadmin", "admin", "dmo", "authority"].includes(
    USER_ROLE,
  );

  const bgPrimary = theme === "dark" ? "bg-gray-900" : "bg-white";
  const bgSecondary = theme === "dark" ? "bg-gray-800" : "bg-gray-50";
  const textPrimary = theme === "dark" ? "text-white" : "text-gray-900";
  const textSecondary = theme === "dark" ? "text-gray-300" : "text-gray-700";
  const textTertiary = theme === "dark" ? "text-gray-400" : "text-gray-500";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";

  const tabs = [
    { id: "overview", label: t.overview || "Overview", icon: FileText },
    { id: "content", label: "Content", icon: FileText },
    { id: "seo", label: "SEO & Publishing", icon: Globe },
    { id: "media", label: t.media || "Media", icon: ImageIcon },
  ];

  const StatusBadge = ({ status }: { status: Article["status"] }) => {
    const statusConfig = {
      draft: { color: "bg-gray-500", label: "Draft" },
      published: { color: "bg-green-500", label: "Published" },
      scheduled: { color: "bg-blue-500", label: "Scheduled" },
      archived: { color: "bg-orange-500", label: "Archived" },
    };

    const config = statusConfig[status];

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm text-white ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Article Image */}
      <div>
        <h3 className={`text-sm mb-2 ${textTertiary}`}>Featured Image</h3>
        <div className="w-full h-64 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600">
          <img
            src={article.primaryMedia}
            alt={article.title[language as "en" | "he" | "ar"]}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Short Description */}
      <div>
        <h3 className={`text-sm mb-2 ${textTertiary}`}>Short Description</h3>
        <p className={textPrimary}>
          {article.shortDescription[language as "en" | "he" | "ar"]}
        </p>
      </div>

      {/* Website */}
      <div>
        <h3 className={`text-sm mb-2 ${textTertiary}`}>Website</h3>
        <div className={`flex items-center gap-2 ${textSecondary}`}>
          <Globe className="w-4 h-4" />
          <span>{article.websiteName}</span>
        </div>
      </div>

      {/* Author */}
      <div>
        <h3 className={`text-sm mb-2 ${textTertiary}`}>Author</h3>
        <p className={textSecondary}>{article.author}</p>
      </div>

      {/* Tags */}
      <div>
        <h3 className={`text-sm mb-2 ${textTertiary}`}>Tags</h3>
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag, idx) => (
            <span
              key={idx}
              className={`px-3 py-1 rounded-full text-sm ${theme === "dark"
                  ? "bg-blue-900/30 text-blue-400"
                  : "bg-blue-100 text-blue-800"
                }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className={`text-sm mb-2 ${textTertiary}`}>Created</h3>
          <p className={textSecondary}>
            {new Date(article.createdAt).toLocaleString()}
          </p>
        </div>
        <div>
          <h3 className={`text-sm mb-2 ${textTertiary}`}>Last Updated</h3>
          <p className={textSecondary}>
            {new Date(article.updatedAt).toLocaleString()}
          </p>
        </div>
        {article.publishedAt && (
          <div>
            <h3 className={`text-sm mb-2 ${textTertiary}`}>Published</h3>
            <p className={textSecondary}>
              {new Date(article.publishedAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-lg border ${borderColor} ${bgSecondary}`}>
        <p className={textSecondary}>
          Full article content editor would go here. This would include a rich
          text editor for managing the complete article body in multiple
          languages.
        </p>
      </div>
    </div>
  );

  const renderSEO = () => (
    <div className="space-y-6">
      <div>
        <h3 className={`text-sm mb-2 ${textTertiary}`}>URL Slug</h3>
        <p className={textSecondary}>{article.slug}</p>
      </div>

      <div className={`p-6 rounded-lg border ${borderColor} ${bgSecondary}`}>
        <p className={textSecondary}>
          SEO metadata, meta descriptions, keywords, and social sharing
          configurations would be displayed here.
        </p>
      </div>
    </div>
  );

  const renderMedia = () => (
    <div className="space-y-6">
      <div>
        <h3 className={`text-sm mb-2 ${textTertiary}`}>Featured Image</h3>
        <div className="w-full h-80 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600">
          <img
            src={article.primaryMedia}
            alt={article.title[language as "en" | "he" | "ar"]}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className={`p-6 rounded-lg border ${borderColor} ${bgSecondary}`}>
        <p className={textSecondary}>
          Additional images, videos, and media gallery would be displayed here.
        </p>
      </div>
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
              <div className="flex items-center gap-3 mb-2">
                <h1 className={`text-3xl font-bold ${textPrimary}`}>
                  {article.title[language as "en" | "he" | "ar"]}
                </h1>
                <StatusBadge status={article.status} />
              </div>
              <p className={textTertiary}>Article ID: {article.id}</p>
            </div>

            {canEdit && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onDuplicate}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textSecondary} hover:${textPrimary} transition-colors`}
                >
                  <Copy className="w-4 h-4" />
                  <span>Duplicate</span>
                </button>
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Article</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div
            className={`p-4 rounded-lg border ${borderColor} ${bgSecondary}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className={`text-sm ${textTertiary}`}>Total Views</h3>
            </div>
            <p className={`text-3xl font-bold ${textPrimary}`}>
              {article.views.toLocaleString()}
            </p>
          </div>

          <div
            className={`p-4 rounded-lg border ${borderColor} ${bgSecondary}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className={`text-sm ${textTertiary}`}>Total Shares</h3>
            </div>
            <p className={`text-3xl font-bold ${textPrimary}`}>
              {article.shares.toLocaleString()}
            </p>
          </div>

          <div
            className={`p-4 rounded-lg border ${borderColor} ${bgSecondary}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className={`text-sm ${textTertiary}`}>Engagement Rate</h3>
            </div>
            <p className={`text-3xl font-bold ${textPrimary}`}>
              {article.views > 0
                ? ((article.shares / article.views) * 100).toFixed(1)
                : "0"}
              %
            </p>
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
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
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
    </div>
  );
}
