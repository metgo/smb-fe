import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useState, useCallback, useEffect } from "react";
import { FileText, Globe } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ModalWrapper } from "@/components/wrapper";
import { ConfirmDialog, WizardFooter } from "@/components/shared";

import {
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useGenerateBlogSeoMutation,
} from "@/store/api/blogMutationApi";
import { useAppSelector } from "@/hooks/hooks";
import { ReactSelect } from "@/components/form-fields";
import { useImagesUpload } from "@/hooks/useImagesUpload";

import ArticleContentForm from "./sub-components/ArticleContentForm";
import ArticleSeoSettings from "./sub-components/ArticleSeoSettings";
import { getLngWiseStr } from "@/helpers";

const EMPTY_FORM: IArticleFormData = {
  externalApiId: "",
  title: "",
  titleHe: "",
  titleAr: "",
  shortDescription: "",
  shortDescriptionHe: "",
  shortDescriptionAr: "",
  content: "",
  contentHe: "",
  contentAr: "",
  tags: [],
  tagsHe: [],
  tagsAr: [],
  summary: "",
  summaryHe: "",
  summaryAr: "",
  metaTitle: "",
  metaTitleHe: "",
  metaTitleAr: "",
  metaDescription: "",
  metaDescriptionHe: "",
  metaDescriptionAr: "",
  slug: "",
  status: "DRAFT",
};

function buildFormFromArticle(article: any): IArticleFormData {
  const str = (v: any) => (typeof v === "string" ? v : v?.en || "");
  const arr = (v: any) => (Array.isArray(v) ? v : []);

  return {
    externalApiId: article.externalApiId || "",
    title: str(article.title),
    titleHe: article.titleHe || "",
    titleAr: article.titleAr || "",
    shortDescription: str(article.shortDescription),
    shortDescriptionHe: article.shortDescriptionHe || "",
    shortDescriptionAr: article.shortDescriptionAr || "",
    content: article.content || "",
    contentHe: article.contentHe || "",
    contentAr: article.contentAr || "",
    tags: arr(article.tags),
    tagsHe: arr(article.tagsHe),
    tagsAr: arr(article.tagsAr),
    summary: article.summary || "",
    summaryHe: article.summaryHe || "",
    summaryAr: article.summaryAr || "",
    metaTitle: article.metaTitle || "",
    metaTitleHe: article.metaTitleHe || "",
    metaTitleAr: article.metaTitleAr || "",
    metaDescription: article.metaDescription || "",
    metaDescriptionHe: article.metaDescriptionHe || "",
    metaDescriptionAr: article.metaDescriptionAr || "",
    slug: article.slug || "",
    status:
      (article.status?.toUpperCase() as IArticleFormData["status"]) || "DRAFT",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CreateArticleWizardProps {
  onClose: () => void;
  existingArticle?: any;
}

const LANG_OPTIONS: { key: Language; label: string }[] = [
  { key: "en", label: "EN" },
  { key: "he", label: "HE" },
  { key: "ar", label: "AR" },
];

function getTagsField(lang: Language): keyof IArticleFormData {
  if (lang === "en") return "tags";
  if (lang === "he") return "tagsHe";
  return "tagsAr";
}

const CreateArticleWizard = ({
  onClose,
  existingArticle,
}: CreateArticleWizardProps) => {
  const { t } = useTranslation("article");
  const { associatedWebsite } = useAppSelector((state) => state.auth);
  const { bgSecondary, textPrimary, textSecondary, borderColor } =
    useThemeClasses();

  const [galleryImages, setGalleryImages] = useState<TImages>([]);
  const {
    images,
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

  // ─── Form state ───────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<IArticleFormData>(
    existingArticle ? buildFormFromArticle(existingArticle) : EMPTY_FORM,
  );
  const [editingLanguage, setEditingLanguage] = useState<Language>("en");
  const [tagInput, setTagInput] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (existingArticle) {
      setFormData(buildFormFromArticle(existingArticle));
      const arr = (v: any) => (Array.isArray(v) ? v : []);
      const images = arr(existingArticle.images)
        .filter((img: any) => img?.image) // only keep items with image
        .map((img: any) => ({
          image: img.image,
          alt: img.alt || "",
          isPrimary: img.isPrimary ?? false,
        }));

      setGalleryImages(images);
    }
  }, [existingArticle]);

  // ─── Mutations ────────────────────────────────────────────────────────────────
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const [generateBlogSeo, { isLoading: isGeneratingSeo }] =
    useGenerateBlogSeoMutation();

  const isEditMode = !!existingArticle;
  const isLoading = isCreating || isUpdating;

  // ─── Handlers ─────────────────────────────────────────────────────────────────
  const handleChange = useCallback((updates: Partial<IArticleFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;
    const field = getTagsField(editingLanguage);
    const current = formData[field] as string[];
    if (!current.includes(tag)) {
      setFormData((prev) => ({ ...prev, [field]: [...current, tag] }));
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    const field = getTagsField(editingLanguage);
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((t) => t !== tag),
    }));
  };

  // ─── Validation ───────────────────────────────────────────────────────────────
  const validateArticle = () => {
    const hasTitle =
      formData.title.trim() ||
      formData.titleHe.trim() ||
      formData.titleAr.trim();
    if (!hasTitle) {
      toast.error(t("validation_title_required"));
      return false;
    }
    const hasShortDescription =
      formData.shortDescription.trim() ||
      formData.shortDescriptionHe.trim() ||
      formData.shortDescriptionAr.trim();
    if (!hasShortDescription) {
      toast.error(t("validation_short_desc_required"));
      return false;
    }
    return true;
  };

  // ─── SEO generation ───────────────────────────────────────────────────────────
  const handleGenerateSeo = async () => {
    try {
      const result = await generateBlogSeo({
        title: getLngWiseStr(
          editingLanguage,
          formData.title,
          formData.titleHe,
          formData.titleAr,
        ),
        shortDescription: getLngWiseStr(
          editingLanguage,
          formData.shortDescription,
          formData.shortDescriptionHe,
          formData.shortDescriptionAr,
        ),
        content: getLngWiseStr(
          editingLanguage,
          formData.content,
          formData.contentHe,
          formData.contentAr,
        ),
      }).unwrap();

      setFormData((prev) => ({
        ...prev,
        summary: result.summary ?? prev.summary,
        metaTitle: result.metaTitle ?? prev.metaTitle,
        metaDescription: result.metaDescription ?? prev.metaDescription,
        tags: result.tags?.length ? result.tags : prev.tags,
        summaryHe: result.summaryHe ?? prev.summaryHe,
        metaTitleHe: result.metaTitleHe ?? prev.metaTitleHe,
        metaDescriptionHe: result.metaDescriptionHe ?? prev.metaDescriptionHe,
        tagsHe: result.tagsHe?.length ? result.tagsHe : prev.tagsHe,
        summaryAr: result.summaryAr ?? prev.summaryAr,
        metaTitleAr: result.metaTitleAr ?? prev.metaTitleAr,
        metaDescriptionAr: result.metaDescriptionAr ?? prev.metaDescriptionAr,
        tagsAr: result.tagsAr?.length ? result.tagsAr : prev.tagsAr,
        // Auto-fill slug from title if empty
        slug:
          prev.slug ||
          result.slug ||
          formData.title.toLowerCase().replace(/\s+/g, "-"),
      }));
      toast.success(t("seo_generated_success"));
    } catch (err: any) {
      toast.error(err?.data?.message || t("seo_generate_failed"));
    }
  };

  const saveArticle = useCallback(
    async (isPublish: boolean = false) => {
      if (!formData?.externalApiId) {
        toast.error(t("please_select_website"));
        return;
      }
      if (!validateArticle()) return;

      const uploadedImages = await uploadAll();

      const mapped = uploadedImages.map((img, idx) => ({
        image: img?.gcsURL,
        alt: formData.title || "",
        isPrimary: idx === primaryImageIndex,
      }));

      const payload = {
        ...formData,
        status: isPublish ? "APPROVED" : "PENDING",
        images: mapped,
      };

      try {
        if (isEditMode && existingArticle?._id) {
          await updateBlog({
            body: payload,
            blogId: existingArticle._id,
          }).unwrap();
          toast.success(
            isPublish ? t("article_published") : t("article_updated"),
          );
        } else {
          await createBlog(payload).unwrap();
          toast.success(isPublish ? t("article_published") : t("draft_saved"));
        }
        if (isPublish) onClose();
      } catch (err: any) {
        toast.error(err?.data?.message || t("save_failed"));
      }
    },
    [
      formData,
      isEditMode,
      existingArticle,
      t,
      createBlog,
      updateBlog,
      onClose,
      uploadAll,
      primaryImageIndex,
      validateArticle,
    ],
  );

  const handleSaveDraft = () => saveArticle(false);
  const handlePublish = async () => {
    setIsPublishing(true);
    await saveArticle(true);
    setIsPublishing(false);
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <ModalWrapper
      maxWidth="max-w-7xl"
      onClose={onClose}
      showSpinner={isLoading}
    >
      <div
        className={`px-6 py-4 flex items-center justify-between border-b ${borderColor} flex-wrap gap-3`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <h2 className={`text-xl font-bold ${textPrimary}`}>
              {isEditMode ? t("edit_article") : t("create_article")}
            </h2>
          </div>

          <ReactSelect
            minWidth={180}
            value={formData.externalApiId}
            onChange={(value) => handleChange({ externalApiId: value })}
            items={associatedWebsite}
            placeholder={t("select_website")}
          />
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1.5">
          <Globe className={`w-4 h-4 ${textSecondary}`} />
          <div
            className={`flex items-center rounded-xl border ${borderColor} ${bgSecondary} p-1 gap-1`}
          >
            {LANG_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setEditingLanguage(key)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  editingLanguage === key
                    ? "bg-blue-600 text-white shadow-sm"
                    : `${textSecondary} hover:bg-blue-50 dark:hover:bg-gray-700`
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex">
        {/* Main editor */}
        <div className="flex-1 overflow-y-auto p-6">
          <ArticleContentForm
            formData={formData}
            editingLanguage={editingLanguage}
            onChange={handleChange}
            images={images}
            primaryImageIndex={primaryImageIndex}
            onImageUpload={handleImageUpload}
            onImageDelete={handleDeleteImage}
            onSetPrimaryImage={setPrimaryImage}
            syncKey={existingArticle?._id}
          />
        </div>

        {/* Settings sidebar */}
        <div
          className={`w-80 xl:w-96 border-l ${borderColor} ${bgSecondary} overflow-y-auto p-5 shrink-0`}
        >
          <ArticleSeoSettings
            formData={formData}
            editingLanguage={editingLanguage}
            onChange={handleChange}
            tagInput={tagInput}
            onTagInputChange={setTagInput}
            onAddTag={addTag}
            onRemoveTag={removeTag}
            isGeneratingSeo={isGeneratingSeo}
            onGenerateSeo={handleGenerateSeo}
            showPreview={false}
            onTogglePreview={() => {}}
            existingArticle={existingArticle}
          />
        </div>
      </div>

      {/* ── Image delete confirm ─────────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={t("delete_image")}
        message={t("delete_image_confirm")}
        confirmText={t("delete")}
        loading={isImageDeleting}
        variant="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <WizardFooter
        currentStep={1}
        totalSteps={1}
        isSaving={isLoading}
        isPublishing={isPublishing}
        onPrevious={() => {}}
        onNext={handlePublish}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        isPublishButton={true}
      />
    </ModalWrapper>
  );
};

export default CreateArticleWizard;
