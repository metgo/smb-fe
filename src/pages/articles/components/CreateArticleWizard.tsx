import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useState, useCallback, useEffect } from "react";
import {
  Eye,
  FileText,
  Image as ImageIcon,
  // LanguagesIcon,
  Section,
} from "lucide-react";

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

import ArticleContentForm from "./sub-components/ArticleContentForm";
import ArticleSeoSettings from "./sub-components/ArticleSeoSettings";
import { detectLanguage, getLngWiseStr } from "@/helpers";
// import ArticleTranslateButton from "./sub-components/ArticleTranslateButton";
import ArticleReviewSection from "./sub-components/ArticleReviewSection";
import { useFilesUpload } from "@/hooks/useFilesUpload";
import Media from "@/components/details-sections/Media";

const EMPTY_FORM: IArticleFormData = {
  externalApiId: {
    id: "",
    name: "",
    logo: "",
    url: "",
  },
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
  status: "DRAFT",
};

function buildFormFromArticle(article: any): IArticleFormData {
  const str = (v: any) => (typeof v === "string" ? v : v?.en || "");
  const arr = (v: any) => (Array.isArray(v) ? v : []);

  return {
    externalApiId: article?.externalApiId?.id || "",
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

function getTagsField(lang: Language): keyof IArticleFormData {
  if (lang === "en") return "tags";
  if (lang === "he") return "tagsHe";
  return "tagsAr";
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
    // { number: 2, title: t("translation"), icon: LanguagesIcon },
    { number: 2, title: t("media"), icon: ImageIcon },
    { number: 3, title: t("seo"), icon: Section },
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
              alt:
                getLngWiseStr(
                  language,
                  existingArticle.title,
                  existingArticle.titleHe,
                  existingArticle.titleAr,
                ) || "",
              isPrimary: img.isPrimary,
            }));
            updateBlog({
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
      tagsHe: prev.tagsHe.includes(tag) ? prev.tagsHe : [...prev.tagsHe, tag],
      tagsAr: prev.tagsAr.includes(tag) ? prev.tagsAr : [...prev.tagsAr, tag],
    }));

    setTagInput("");
  };

  const removeTag = (tag: string, lang: Language) => {
    const field = getTagsField(lang);
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((t) => t !== tag),
    }));
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      const processed = detectAndAssignLanguageFields(formData);
      setFormData(processed);
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
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
    if (
      (formData.shortDescription || "").length > 150 ||
      (formData.shortDescriptionHe || "").length > 150 ||
      (formData.shortDescriptionAr || "").length > 150
    ) {
      toast.error(tc("exceeds_char_limit", { limit: 150 }));
      return false;
    }

    return true;
  };

  // ─── SEO generation ───────────────────────────────────────────────────────────
  const handleGenerateSeo = async () => {
    try {
      // Get the first available language content
      const titleText = getLngWiseStr(
        language,
        formData.title,
        formData.titleHe,
        formData.titleAr,
      );
      const descText = getLngWiseStr(
        language,
        formData.shortDescription,
        formData.shortDescriptionHe,
        formData.shortDescriptionAr,
      );
      const contentText = getLngWiseStr(
        language,
        formData.content,
        formData.contentHe,
        formData.contentAr,
      );

      const result = await generateBlogSeo({
        title: titleText,
        shortDescription: descText,
        content: contentText,
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
      }));
      toast.success(t("seo_generated_success"));
    } catch (err: any) {
      toast.error(err?.data?.message || t("seo_generate_failed"));
    }
  };

  /**
   * Detects the language of non-empty fields and assigns them to the correct language-specific fields
   * Priority: title > shortDescription > content
   */
  const getActiveField = (base: string, lang: string): string => {
    if (lang === "en") return base;
    const suffix = lang.charAt(0).toUpperCase() + lang.slice(1);
    return `${base}${suffix}`; // "nameHe", "nameAr", etc.
  };

  const detectAndAssignLanguageFields = (data: any): any => {
    const updated = { ...data };

    const fieldGroups = [
      { base: "title", en: "title", he: "titleHe", ar: "titleAr" },
      {
        base: "shortDescription",
        en: "shortDescription",
        he: "shortDescriptionHe",
        ar: "shortDescriptionAr",
      },
      {
        base: "content",
        en: "content",
        he: "contentHe",
        ar: "contentAr",
      },
    ];

    fieldGroups.forEach(({ base, en, he, ar }) => {
      // Whichever field the user was actually typing into for THIS group,
      // based on the global language at the time of entry
      const activeField = getActiveField(base, language);
      const text = data[activeField]?.trim();
      if (!text) return;

      const detectedLang = detectLanguage(text); // "en" | "he" | "ar"

      // Clear all three first, then assign to wherever it actually belongs
      updated[en] = "";
      updated[he] = "";
      updated[ar] = "";

      if (detectedLang === "he") {
        updated[he] = text;
      } else if (detectedLang === "ar") {
        updated[ar] = text;
      } else {
        updated[en] = text;
      }
    });

    return updated;
  };

  const saveArticle = useCallback(
    async (isPublish: boolean = false, processedData?: IArticleFormData) => {
      if (!formData?.externalApiId) {
        toast.error(t("please_select_website"));
        return;
      }
      if (!validateArticle()) return;

      const dataToSave = processedData || formData;
      const mapped = galleryImages.map((img) => ({
        image: img.image,
        alt: dataToSave.title || dataToSave.titleHe || dataToSave.titleAr || "",
        isPrimary: img.isPrimary,
      }));

      const payload = {
        ...dataToSave,
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
      galleryImages,
      isEditMode,
      existingArticle,
      t,
      createBlog,
      updateBlog,
      onClose,
      validateArticle,
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
      // case 2:
      //   return (
      //     <ArticleTranslateButton
      //       formData={formData}
      //       syncKey={existingArticle?._id}
      //       onChange={handleChange}
      //     />
      //   );
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
      // Step 1: Detect language and assign to correct fields
      const processedFormData = detectAndAssignLanguageFields(formData);

      // Step 2: Save with processed data
      await saveArticle(true, processedFormData);
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
