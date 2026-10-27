import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useState, useCallback, useEffect } from "react";
import { BarChart, Eye, FileText, Image as ImageIcon } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ModalWrapper } from "@/components/wrapper";
import {
  ConfirmDialog,
  WizardFooter,
  WizardStepper,
} from "@/components/shared";
import {
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useGenerateBlogSeoMutation,
} from "@/store/api/blogMutationApi";
import { useAppSelector } from "@/hooks/hooks";
import { ReactSelect } from "@/components/form-fields";

import Media from "@/components/details-sections/Media";
import { getPlainText } from "@/components/shared/RichTextEditor";
import ArticleContentForm from "./sub-components/ArticleContentForm";
import ArticleSeoSettings from "./sub-components/ArticleSeoSettings";
import ArticleReviewSection from "./sub-components/ArticleReviewSection";
import { useFilesUpload } from "@/hooks/useFilesUpload";

const EMPTY_FORM: IArticleFormData = {
  externalApiId: {
    id: "",
    name: "",
    logo: "",
    url: "",
  },
  title: "",
  shortDescription: "",
  content: "",
  tags: [],
  summary: "",
  metaTitle: "",
  metaDescription: "",
  status: "DRAFT",
};

function buildFormFromArticle(article: any): IArticleFormData {
  const str = (v: any) => (typeof v === "string" ? v : v?.en || "");
  const arr = (v: any) => (Array.isArray(v) ? v : []);

  return {
    externalApiId: article?.externalApiId?.id || "",
    title: str(article.title),
    shortDescription: str(article.shortDescription),
    content: article.content || "",
    tags: arr(article.tags),
    summary: article.summary || "",
    metaTitle: article.metaTitle || "",
    metaDescription: article.metaDescription || "",
    status:
      (article?.status?.toUpperCase() as IArticleFormData["status"]) || "DRAFT",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CreateArticleWizardProps {
  onClose: () => void;
  existingArticle?: any;
  refetch: () => void;
}

const CreateArticleWizard = ({
  onClose,
  existingArticle,
  refetch,
}: CreateArticleWizardProps) => {
  const { t } = useTranslation("article");
  const { t: tc } = useTranslation("common");
  const { associatedWebsite } = useAppSelector((state) => state.auth);
  const { textPrimary, borderColor, textTertiary, language } =
    useThemeClasses();
  const [currentStep, setCurrentStep] = useState(1);
  const steps = [
    { number: 1, title: t("form"), icon: FileText },
    { number: 2, title: t("media"), icon: ImageIcon },
    { number: 3, title: t("seo"), icon: BarChart },
    { number: 4, title: t("review"), icon: Eye },
  ];
  const [galleryImages, setGalleryImages] = useState<TImages>([]);

  // ─── Mutations ────────────────────────────────────────────────────────────────
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const [generateBlogSeo, { isLoading: isGeneratingSeo }] =
    useGenerateBlogSeoMutation();

  const isEditMode = !!existingArticle;
  const isLoading = isCreating || isUpdating;

  const {
    images,
    imagesRef,
    primaryImageIndex,
    handleImageUpload,
    setPrimaryImage,
    deleteTarget,
    setDeleteTarget,
    confirmDelete,
    isImageDeleting,
    handleDeleteImage,
  } = useFilesUpload({
    initialImages: galleryImages,
    onChange: setGalleryImages,
    onImagesChange:
      isEditMode && existingArticle?._id
        ? (updatedImages) => {
            const mapped = updatedImages.map((img) => ({
              image: img.image,
              alt: existingArticle.title || "",
              isPrimary: img.isPrimary,
            }));
            updateBlog({
              language,
              blogId: existingArticle._id,
              body: { images: mapped },
            });
          }
        : undefined,
  });

  // ─── Form state ───────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<IArticleFormData>(
    existingArticle ? buildFormFromArticle(existingArticle) : EMPTY_FORM,
  );

  const [tagInput, setTagInput] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (existingArticle) {
      setFormData(buildFormFromArticle(existingArticle));
      const arr = (v: any) => (Array.isArray(v) ? v : []);
      const images = arr(existingArticle.images)
        .filter((img: any) => img?.image)
        .map((img: any) => ({
          image: img.image,
          alt: img.alt || "",
          isPrimary: img.isPrimary ?? false,
        }));

      setGalleryImages(images);
    }
  }, [existingArticle]);

  // ─── Handlers ─────────────────────────────────────────────────────────────────
  const handleChange = useCallback((updates: Partial<IArticleFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;

    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags : [...prev.tags, tag],
    }));

    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleNext = async () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };
  // ─── Validation ───────────────────────────────────────────────────────────────
  const validateArticle = () => {
    if (!formData.title.trim()) {
      toast.error(t("validation_title_required"));
      return false;
    }
    if (!formData.shortDescription.trim()) {
      toast.error(t("validation_short_desc_required"));
      return false;
    }
    if (getPlainText(formData.shortDescription || "").length > 150) {
      toast.error(tc("exceeds_char_limit", { limit: 150 }));
      return false;
    }

    return true;
  };

  // ─── SEO generation ───────────────────────────────────────────────────────────
  const handleGenerateSeo = async () => {
    try {
      const result = await generateBlogSeo({
        title: formData.title,
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

      const mapped = galleryImages.map((img) => ({
        image: img.image,
        alt: formData.title || "",
        isPrimary: img.isPrimary,
      }));

      const payload = {
        ...formData,
        status: isPublish ? "APPROVED" : "PENDING",
        images: mapped,
      };

      try {
        if (isEditMode && existingArticle?._id) {
          await updateBlog({
            language,
            body: payload,
            blogId: existingArticle._id,
          }).unwrap();
          toast.success(
            isPublish ? t("article_published") : t("article_updated"),
          );
        } else {
          await createBlog({ body: payload, language }).unwrap();
          toast.success(isPublish ? t("article_published") : t("draft_saved"));
        }
        if (isPublish) onClose();
      } catch (err: any) {
        toast.error(err?.data?.message || t("save_failed"));
      }
    },
    [
      formData,
      galleryImages,
      isEditMode,
      existingArticle,
      t,
      createBlog,
      updateBlog,
      onClose,
      validateArticle,
      language,
    ],
  );

  const renderStepContent = () => {
    const mediaProps = {
      t,
      images,
      imagesRef,
      primaryImageIndex,
      setPrimaryImage,
      handleImageUpload,
      deleteTarget,
      setDeleteTarget,
      isImageDeleting,
      confirmDelete,
      handleDeleteImage,
    };

    const commonProps = {
      t,
      formData,
      images,
      handleImageUpload,
      setCurrentStep,
    };

    switch (currentStep) {
      case 1:
        return (
          <div>
            <ArticleContentForm
              formData={formData}
              onChange={handleChange}
              syncKey={existingArticle?._id}
              editingLanguage={language}
            />
          </div>
        );
      case 2:
        return <Media {...mediaProps} {...commonProps} />;
      case 3:
        return (
          <ArticleSeoSettings
            formData={formData}
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
            editingLanguage={language}
          />
        );
      case 4:
        return (
          <ArticleReviewSection formData={formData} onEdit={setCurrentStep} />
        );
      default:
        return null;
    }
  };
  const handleSaveDraft = () => saveArticle(false);

  const handlePublish = async () => {
    const externalId =
      typeof formData?.externalApiId === "string"
        ? formData.externalApiId
        : formData?.externalApiId?.id;

    if (!externalId) {
      toast.error(t("please_select_website_before_publishing"));
      return;
    }
    setIsPublishing(true);
    try {
      await saveArticle(true);
      refetch();
    } finally {
      setIsPublishing(false);
    }
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
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <h2 className={`text-xl font-bold ${textPrimary}`}>
                {isEditMode ? t("edit_article") : t("create_article")}
              </h2>
            </div>

            <p
              className={`text-sm ${textTertiary} flex justify-center items-center gap-1`}
            >
              {t("step")} {currentStep} {t("of")} {steps.length}:{" "}
              {steps[currentStep - 1]?.title}
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="ml-auto">
          <ReactSelect
            minWidth={180}
            value={
              typeof formData.externalApiId === "string"
                ? formData?.externalApiId
                : formData?.externalApiId?.id || undefined
            }
            onChange={(value) => handleChange({ externalApiId: value })}
            items={associatedWebsite}
            placeholder={t("select_website")}
          />
        </div>
      </div>

      {/* ── Step Tracker ────────────────────────────────────────────────────── */}
      <div className={`px-6 pt-4 pb-2 border-b ${borderColor}`}>
        <WizardStepper
          steps={steps}
          currentStep={currentStep}
          totalSteps={steps.length}
          onStepClick={setCurrentStep}
        />
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4">{renderStepContent()}</div>

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
        currentStep={currentStep}
        totalSteps={steps.length}
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
