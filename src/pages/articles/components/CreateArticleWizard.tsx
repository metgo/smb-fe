import {
  X,
  Eye,
  Calendar,
  Clock,
  Plus,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useCallback, useEffect } from "react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

import { ModalWrapper } from "@/components/wrapper";
import { ConfirmDialog, ImageWithFallback, WizardFooter } from "@/components/shared";
import RichTextEditor from "./sub-components/RichTextEditor";

import {
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useGenerateBlogSeoMutation,
} from "@/store/api/blogMutationApi";
import { ReactSelect } from "@/components/form-fields";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/hooks/hooks";
import { useImagesUpload } from "@/hooks/useImagesUpload";

interface CreateArticleWizardProps {
  onClose: () => void;
  existingArticle?: Article;
}

// Mirrors the API payload shape exactly
interface ArticleImage {
  image: string; // base64 or URL
  caption: string;
  alt: string;
  isPrimary: boolean;
  stationId?: string;
}

interface ArticleFormData {
  externalApiId: string;
  title: string; // single-language string per API schema
  subTitle: string;
  shortDescription: string;
  content: string; // full HTML content
  slug: string;
  tags: string[];
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
  summary: string;
  metaTitle: string;
  metaDescription: string;
  images: ArticleImage[];
}

const DEFAULT_FORM: ArticleFormData = {
  externalApiId: "",
  title: "",
  subTitle: "",
  shortDescription: "",
  content: "",
  slug: "",
  tags: [],
  status: "DRAFT",
  summary: "",
  metaTitle: "",
  metaDescription: "",
  images: [],
};

// Helper: build form from existingArticle (maps your Article type → API shape)
function buildFormFromArticle(article: Article): ArticleFormData {
  const titleStr =
    typeof article.title === "string" ? article.title : article.title?.en || "";

  const shortDesc =
    typeof article.shortDescription === "string"
      ? article.shortDescription
      : article.shortDescription?.en || "";

  const content =
    typeof article.fullDescription === "string"
      ? article.fullDescription
      : article.fullDescription?.en || "";

  const images: ArticleImage[] = article.primaryMedia
    ? [
      {
        image: article.primaryMedia,
        caption: "",
        alt: titleStr,
        isPrimary: true,
      },
    ]
    : [];

  return {
    externalApiId: article.externalApiId || article.id || "",
    title: titleStr,
    subTitle: article.subTitle || "",
    shortDescription: shortDesc,
    content,
    slug: article.slug || "",
    tags: article.tags || [],
    status:
      (article.status?.toUpperCase() as ArticleFormData["status"]) || "DRAFT",
    summary: article.summary || shortDesc,
    metaTitle: article.metaTitle || titleStr,
    metaDescription: article.metaDescription || shortDesc,
    images,
  };
}

const CreateArticleWizard = ({
  onClose,
  existingArticle,
}: CreateArticleWizardProps) => {
  const { t } = useTranslation("blogs");
  const { associatedWebsite } = useAppSelector((state) => state.auth);

  const { theme, bgPrimary, bgSecondary, textPrimary, textSecondary, textTertiary, borderColor } = useThemeClasses()
  const [galleryImages, setGalleryImages] = useState<TImages>([]);

  const {
    images,
    imagesRef,
    primaryImageIndex,
    handleImageUpload,
    uploadAll,
    setPrimaryImage,
    deleteTarget,
    setDeleteTarget,
    confirmDelete,
    isImageDeleting,
    handleDeleteImage,
  } = useImagesUpload({
    initialImages: galleryImages,
    onChange: setGalleryImages,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [externalApiId, setExternalApiId] = useState("");
  const [editingLanguage, setEditingLanguage] = useState<"en" | "he" | "ar">(
    "en",
  );
  const [tagInput, setTagInput] = useState("");

  // ─── Form State (matches API payload) ───────────────────────────────────────
  const [formData, setFormData] = useState<ArticleFormData>(DEFAULT_FORM);

  // ─── Populate from existingArticle via useEffect ─────────────────────────────
  useEffect(() => {
    if (existingArticle) {
      setFormData(buildFormFromArticle(existingArticle));
    } else {
      setFormData(DEFAULT_FORM);
    }
  }, [existingArticle]);

  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const [generateBlogSeo, { isLoading: isGeneratingSeo }] = useGenerateBlogSeoMutation();

  const isEditMode = !!existingArticle;
  const isLoading = isCreating || isUpdating;



  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      metaTitle: prev.metaTitle || value, // auto-fill metaTitle if empty
    }));
  };


  // ─── Tags ─────────────────────────────────────────────────────────────────────
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // ─── Validation ───────────────────────────────────────────────────────────────
  const validateArticle = () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return false;
    }
    if (!formData.shortDescription.trim()) {
      toast.error("Please enter a short description");
      return false;
    }
    if (formData.images.length === 0) {
      toast.error("Please upload at least one image");
      return false;
    }
    return true;
  };

  // ─── Save / Publish ───────────────────────────────────────────────────────────
  const saveArticle = useCallback(
    async (isPublish: boolean = false) => {
      if (!validateArticle()) return;

      // Build exact API payload
      const payload: ArticleFormData = {
        ...formData,
        status: isPublish ? "PUBLISHED" : formData.status,
      };

      try {
        if (isEditMode && existingArticle?.id) {
          await updateBlog({
            body: payload,
            blogId: existingArticle.id,
          }).unwrap();
          toast.success(isPublish ? "Article published!" : "Article updated!");
        } else {
          await createBlog(payload).unwrap();
          toast.success(isPublish ? "Article published!" : "Draft saved!");
        }
        if (isPublish) onClose();
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to save article");
      }
    },
    [formData, isEditMode, existingArticle, createBlog, updateBlog, onClose],
  );

  const handleGenerateSeo = async () => {
    try {
      const result = await generateBlogSeo({
        title: formData.title,
        subTitle: formData.subTitle,
        shortDescription: formData.shortDescription,
        content: formData.content,
      }).unwrap();

      setFormData((prev) => ({
        ...prev,
        summary: result.summary ?? prev.summary,
        metaTitle: result.metaTitle ?? prev.metaTitle,
        metaDescription: result.metaDescription ?? prev.metaDescription,
        tags: result.tags?.length ? result.tags : prev.tags,
      }));
      toast.success("SEO fields generated successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to generate SEO");
    }
  };

  const handleSaveDraft = () => saveArticle(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    await saveArticle(true);
    setIsPublishing(false);
  };

  const handleNext = () =>
    currentStep === 2 ? handlePublish() : setCurrentStep((p) => p + 1);

  const handlePrevious = () => currentStep > 1 && setCurrentStep((p) => p - 1);

  const totalSteps = 1;

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <ModalWrapper maxWidth="max-w-7xl" onClose={onClose} showSpinner={isLoading}>
      {/* Header */}
      <div
        className={`px-6 py-4 flex items-center justify-between border-b ${borderColor}`}
      >
        <div className="flex items-center gap-4">
          <h2 className={`text-2xl font-bold ${textPrimary}`}>
            {existingArticle ? "Edit Article" : "Create Article"}
          </h2>

          <ReactSelect
            minWidth={180}
            value={externalApiId}
            items={associatedWebsite}
            onChange={(value) => setExternalApiId(value)}
            placeholder={t("select_website")}
          />

          {/* Language selector (UI only — API accepts single lang strings) */}
          <div className="flex items-center gap-2">
            {(["en", "he", "ar"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setEditingLanguage(lang)}
                className={`px-3 py-1 rounded-lg transition-colors ${editingLanguage === lang
                  ? "bg-blue-600 text-white"
                  : `${bgSecondary} ${textSecondary}`
                  }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden flex">
          {/* ── Editor ────────────────────────────────────────────────────── */}
          <div
            className={`flex-1 overflow-y-auto p-6 ${showPreview ? "hidden lg:block" : ""}`}
          >
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Title */}
              <div>
                <label
                  className={`block text-sm font-medium ${textSecondary} mb-2`}
                >
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter article title..."
                  className={`w-full text-3xl font-bold ${bgSecondary} ${textPrimary} border ${borderColor} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  dir={editingLanguage !== "en" ? "rtl" : "ltr"}
                />
                <p className={`text-xs ${textTertiary} mt-1`}>
                  {formData.title.length} characters
                </p>
              </div>

              {/* Subtitle */}
              <div>
                <label
                  className={`block text-sm font-medium ${textSecondary} mb-2`}
                >
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subTitle}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subTitle: e.target.value,
                    }))
                  }
                  placeholder="Enter subtitle..."
                  className={`w-full ${bgSecondary} ${textPrimary} border ${borderColor} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  dir={editingLanguage !== "en" ? "rtl" : "ltr"}
                />
              </div>

              {/* Short Description */}
              <div>
                <label
                  className={`block text-sm font-medium ${textSecondary} mb-2`}
                >
                  Short Description *
                </label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      shortDescription: e.target.value,
                    }))
                  }
                  placeholder="Enter a brief description..."
                  className={`w-full ${bgSecondary} ${textPrimary} border ${borderColor} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                  rows={3}
                  dir={editingLanguage !== "en" ? "rtl" : "ltr"}
                />
                <p className={`text-xs ${textTertiary} mt-1`}>
                  {formData.shortDescription.length} characters
                </p>
              </div>

              {/* Summary */}
              <div>
                <label
                  className={`block text-sm font-medium ${textSecondary} mb-2`}
                >
                  Summary
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      summary: e.target.value,
                    }))
                  }
                  placeholder="Enter article summary..."
                  className={`w-full ${bgSecondary} ${textPrimary} border ${borderColor} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                  rows={2}
                  dir={editingLanguage !== "en" ? "rtl" : "ltr"}
                />
              </div>

              {/* Rich Text Content */}
              <RichTextEditor
                content={formData.content}
                onChange={(html) =>
                  setFormData((prev) => ({ ...prev, content: html }))
                }
                editingLanguage={editingLanguage}
                bgPrimary={bgPrimary}
                bgSecondary={bgSecondary}
                textPrimary={textPrimary}
                textTertiary={textTertiary}
                borderColor={borderColor}
                syncKey={existingArticle?.id}
              />

              {/* Image Gallery */}
              <div>
                <label
                  className={`block text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                >
                  {t("image_gallery")}
                  <span className="text-xs ml-2 text-gray-500">
                    ({t("upload_up_to_10_images")})
                  </span>
                </label>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative aspect-square rounded-lg overflow-hidden border group ${theme === "dark" ? "border-gray-700" : "border-gray-300"
                        }`}
                    >
                      <ImageWithFallback
                        src={img.previewUrl}
                        alt={`Image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteImage(img, idx)}
                        className="absolute top-2 right-2 cursor-pointer p-1 bg-red-600 text-white rounded-full hover:bg-red-700 z-10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {img.status === "uploading" && (
                        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center">
                          {/* Circular loader */}
                          <Loader2 className="w-16 h-16 text-white animate-spin" />

                          {/* Progress text */}
                          <span className="mt-2 text-white font-bold text-xs">
                            {img.progress}%
                          </span>
                        </div>
                      )}
                      {/* Primary Badge */}
                      {idx === primaryImageIndex && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded z-10">
                          {t("primary_image")}
                        </div>
                      )}

                      {/* Set as Primary */}
                      <button
                        onClick={() => setPrimaryImage(idx)}
                        className="absolute bottom-2 left-2 right-2 cursor-pointer px-3 py-1.5 bg-teal-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-teal-700"
                      >
                        {t("set_as_primary") || "Set as Primary"}
                      </button>
                    </div>
                  ))}

                  {/* Upload New Image */}
                  {images?.length < 10 && (
                    <div
                      className={`aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer ${theme === "dark"
                        ? "border-gray-700 hover:border-gray-600"
                        : "border-gray-300 hover:border-gray-400"
                        }`}
                      onClick={() => document.getElementById("image-upload")?.click()}
                    >
                      {/* Hidden file input */}
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) =>
                          e.target.files && handleImageUpload(e.target.files)
                        }
                        className="hidden"
                      />
                      <div className="text-center">
                        <Plus
                          className={`w-8 h-8 mx-auto mb-1 ${theme === "dark" ? "text-gray-600" : "text-gray-400"
                            }`}
                        />
                        <p
                          className={`text-xs ${theme === "dark" ? "text-gray-600" : "text-gray-500"
                            }`}
                        >
                          {t("upload_images") || "Upload"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <ConfirmDialog
                open={!!deleteTarget}
                title="delete_image"
                message="delete_image_confirm"
                confirmText="delete"
                loading={isImageDeleting}
                variant="danger"
                onCancel={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
              />
            </div>
          </div>















          {/* ── Settings Sidebar ────────────────────────────────────────────── */}
          <div
            className={`w-full lg:w-96 border-l ${borderColor} ${bgSecondary} overflow-y-auto p-6 ${showPreview ? "" : "hidden lg:block"}`}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${textPrimary}`}>
                  Settings
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateSeo}
                    disabled={isGeneratingSeo}
                    title="Generate SEO with AI"
                    className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGeneratingSeo ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`p-2 rounded-lg ${textTertiary} lg:hidden`}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>


              {/* Tags */}
              <div>
                <h4 className={`text-sm font-semibold ${textSecondary} mb-3`}>
                  Tags
                </h4>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                    placeholder="Add tag..."
                    className={`flex-1 px-3 py-2 ${bgPrimary} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1 px-3 py-1 ${bgPrimary} ${textSecondary} border ${borderColor} rounded-full text-sm`}
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* SEO */}
              <div>
                <h4 className={`text-sm font-semibold ${textSecondary} mb-3`}>
                  SEO & Metadata
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className={`block text-xs ${textTertiary} mb-1`}>
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          metaTitle: e.target.value,
                        }))
                      }
                      className={`w-full px-3 py-2 ${bgPrimary} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${textTertiary} mb-1`}>
                      Meta Description
                    </label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          metaDescription: e.target.value,
                        }))
                      }
                      rows={2}
                      className={`w-full px-3 py-2 ${bgPrimary} ${textPrimary} border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none`}
                    />
                  </div>
                </div>
              </div>

              {/* Attribution */}
              <div>
                <h4 className={`text-sm font-semibold ${textSecondary} mb-3`}>
                  Attribution
                </h4>
                <div className="space-y-2">
                  {existingArticle && (
                    <>
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${textTertiary}`} />
                        <span className={`text-sm ${textTertiary}`}>
                          Created{" "}
                          {new Date(
                            existingArticle.createdAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${textTertiary}`} />
                        <span className={`text-sm ${textTertiary}`}>
                          Updated{" "}
                          {new Date(
                            existingArticle.updatedAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <WizardFooter
        currentStep={currentStep}
        totalSteps={totalSteps}
        isSaving={isLoading}
        isPublishing={isPublishing}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        isPublishButton={true}
      />
    </ModalWrapper>
  );
};
export default CreateArticleWizard;
