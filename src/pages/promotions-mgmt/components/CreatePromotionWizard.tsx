import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Eye, Layers } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useFileUpload } from "@/hooks/useFileUpload";
import { WizardFooter } from "@/components/shared";
import { ModalWrapper } from "@/components/wrapper";
import {
  PromoStepIndicator,
  PlacementStep,
  ContentStep,
  ReviewStep,
} from "./sub-components";
import { ReactSelect } from "@/components/form-fields";
import { useAppSelector } from "@/hooks/hooks";
import {
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
} from "@/store/api/promotionsApi";

interface CreatePromotionWizardProps {
  onClose: () => void;
  existingPromotion?: IPromotionsRes;
}

const availablePlacements = [
  "home_page_hero",
  "secondary_banner",
  "footer_spotlight",
];

export default function CreatePromotionWizard({
  onClose,
  existingPromotion,
}: CreatePromotionWizardProps) {
  const { t } = useTranslation("promotions");
  const { t: tToast } = useTranslation("toast");
  const { associatedWebsite } = useAppSelector((state) => state.auth);

  const [createPromotion, { isLoading: isCreating }] =
    useCreatePromotionMutation();
  const [updatePromotion, { isLoading: isUpdating }] =
    useUpdatePromotionMutation();
  const isPublishing = isCreating || isUpdating;

  const STEPS = [
    {
      key: "placement",
      label: t("step_placement"),
      sublabel: t("step_placement_sublabel"),
      icon: Layers,
    },
    {
      key: "content",
      label: t("step_content"),
      sublabel: t("step_content_sublabel"),
      icon: FileText,
    },
    {
      key: "review",
      label: t("step_review"),
      sublabel: t("step_review_sublabel"),
      icon: Eye,
    },
  ];
  const totalSteps = STEPS.length;
  const { borderColor, textPrimary, textSecondary } = useThemeClasses();

  const [currentStep, setCurrentStep] = useState(0);
  const [editingLang, setEditingLang] = useState<Language>("en");
  const [externalApiId, setExternalApiId] = useState<string | undefined>("");

  /* ── Media URL inputs ───────────────────────────────────────────── */
  const [desktopUrlValue, setDesktopUrlValue] = useState("");
  const [mobileUrlValue, setMobileUrlValue] = useState("");
  const [desktopDragOver, setDesktopDragOver] = useState(false);
  const [mobileDragOver, setMobileDragOver] = useState(false);

  /* ── Media type (must be declared before upload hooks) ─────────── */
  const [mediaType, setMediaType] = useState<"image" | "video">(
    (existingPromotion?.mediaType || "image") as "image" | "video",
  );

  /* ── GCP upload hooks ───────────────────────────────────────────── */
  const desktopUpload = useFileUpload({
    initialUrl: existingPromotion?.mediaUrl?.desktop,
    mediaType,
  });

  const mobileUpload = useFileUpload({
    initialUrl: existingPromotion?.mediaUrl?.mobile,
    mediaType,
  });

  /* ── Form data ──────────────────────────────────────────────────── */
  const [formData, setFormData] = useState({
    placement: existingPromotion?.placement || availablePlacements[0] || "",
    active: existingPromotion?.isActive ?? true,
    mediaType,
    title: existingPromotion
      ? {
          en: existingPromotion.titleEn,
          he: existingPromotion.titleHe,
          ar: existingPromotion.titleAr,
        }
      : { en: "", he: "", ar: "" },
    content: existingPromotion
      ? {
          en: existingPromotion.descriptionEn,
          he: existingPromotion.descriptionHe,
          ar: existingPromotion.descriptionAr,
        }
      : { en: "", he: "", ar: "" },
    linkUrl: existingPromotion?.linkUrl || "",
  });

  useEffect(() => {
    if (existingPromotion) {
      setExternalApiId(existingPromotion.externalApiId);
    }
  }, [existingPromotion]);

  const patch = (fields: Partial<typeof formData>) =>
    setFormData((prev) => ({ ...prev, ...fields }));

  /* ── Navigation ─────────────────────────────────────────────────── */
  const handleNext = () =>
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));

  const handlePrevious = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  /* ── Drag handlers ──────────────────────────────────────────────── */
  const handleDropDesktop = (e: React.DragEvent) => {
    e.preventDefault();
    setDesktopDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) desktopUpload.handleFileSelect(file);
  };

  const handleDropMobile = (e: React.DragEvent) => {
    e.preventDefault();
    setMobileDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) mobileUpload.handleFileSelect(file);
  };

  /* ── Misc ───────────────────────────────────────────────────────── */
  const langComplete = (lang: Language) =>
    formData?.title?.[lang]?.length > 0 &&
    formData?.content?.[lang]?.length > 0;

  const handlePublish = async (isActive: boolean) => {
    if (!externalApiId) {
      toast.error(tToast("promotion_select_website"));
      return;
    }

    if (
      desktopUpload.status === "uploading" ||
      mobileUpload.status === "uploading"
    ) {
      toast.error(tToast("promotion_media_uploading"));
      return;
    }

    if (!desktopUpload.gcsUrl || !mobileUpload.gcsUrl) {
      toast.error(tToast("promotion_media_required"));
      return;
    }

    const payload: IPromotionFromData = {
      externalApiId: externalApiId!,
      placement: formData.placement,
      mediaType: formData.mediaType,
      mediaUrl: {
        desktop: desktopUpload.gcsUrl,
        mobile: mobileUpload.gcsUrl,
      },
      title: formData.title,
      description: formData.content,
      linkUrl: formData.linkUrl,
      isActive,
    };

    try {
      if (existingPromotion) {
        const { externalApiId: _, ...updatePayload } = payload;
        await updatePromotion({
          promotionId: existingPromotion._id,
          body: updatePayload,
        }).unwrap();
        toast.success(tToast("promotion_updated_success"));
      } else {
        await createPromotion(payload).unwrap();
        toast.success(tToast("promotion_created_success"));
      }
      onClose();
    } catch {
      toast.error(
        tToast(
          existingPromotion
            ? "promotion_update_failed"
            : "promotion_create_failed",
        ),
      );
    }
  };

  /* ── Render ─────────────────────────────────────────────────────── */
  const renderStep = () => {
    switch (STEPS[currentStep]?.key) {
      case "placement":
        return (
          <PlacementStep
            availablePlacements={availablePlacements}
            placement={formData.placement}
            mediaType={formData.mediaType}
            /* Desktop */
            desktopMediaUrl={desktopUpload.previewUrl}
            desktopUploadStatus={desktopUpload.status}
            desktopUploadProgress={desktopUpload.progress}
            desktopDragOver={desktopDragOver}
            desktopUrlValue={desktopUrlValue}
            setDesktopDragOver={setDesktopDragOver}
            onDesktopFileSelect={desktopUpload.handleFileSelect}
            onDesktopUrlChange={(url) => {
              setDesktopUrlValue(url);
              desktopUpload.setExternalUrl(url);
            }}
            onDesktopDelete={desktopUpload.deleteFile}
            onDragOverDesktop={(e) => {
              e.preventDefault();
              setDesktopDragOver(true);
            }}
            onDropDesktop={handleDropDesktop}
            /* Mobile */
            mobileMediaUrl={mobileUpload.previewUrl}
            mobileUploadStatus={mobileUpload.status}
            mobileUploadProgress={mobileUpload.progress}
            mobileDragOver={mobileDragOver}
            mobileUrlValue={mobileUrlValue}
            setMobileDragOver={setMobileDragOver}
            onMobileFileSelect={mobileUpload.handleFileSelect}
            onMobileUrlChange={(url) => {
              setMobileUrlValue(url);
              mobileUpload.setExternalUrl(url);
            }}
            onMobileDelete={mobileUpload.deleteFile}
            onDragOverMobile={(e) => {
              e.preventDefault();
              setMobileDragOver(true);
            }}
            onDropMobile={handleDropMobile}
            onPlacementChange={(p) => patch({ placement: p })}
            onMediaTypeChange={(type) => {
              setMediaType(type);
              patch({ mediaType: type });
            }}
          />
        );
      case "content":
        return (
          <ContentStep
            editingLang={editingLang}
            setEditingLang={setEditingLang}
            title={formData.title}
            content={formData.content}
            linkUrl={formData.linkUrl}
            langComplete={langComplete}
            onTitleChange={(lang, value) =>
              patch({ title: { ...formData.title, [lang]: value } })
            }
            onContentChange={(lang, value) =>
              patch({ content: { ...formData.content, [lang]: value } })
            }
            onLinkUrlChange={(v) => patch({ linkUrl: v })}
          />
        );
      case "review":
        return (
          <ReviewStep
            placement={formData.placement}
            active={formData.active}
            mediaType={formData.mediaType}
            desktopMediaUrl={desktopUpload.gcsUrl}
            title={formData.title}
            content={formData.content}
            linkUrl={formData.linkUrl}
            langComplete={langComplete}
          />
        );
      default:
        return null;
    }
  };

  const step = STEPS[currentStep];

  return (
    <ModalWrapper onClose={onClose} maxWidth="max-w-4xl">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${borderColor}`}
        >
          <div>
            <h2 className={`text-lg font-bold ${textPrimary}`}>
              {existingPromotion ? t("edit_promotion") : t("new_promotion")}
            </h2>
            <p className={`text-xs ${textSecondary} mt-0.5`}>
              Step {currentStep + 1} of {STEPS.length} — {step?.sublabel}
            </p>
          </div>
          <ReactSelect
            minWidth={180}
            isDisabled={!!existingPromotion}
            value={externalApiId}
            items={associatedWebsite}
            onChange={(value) => setExternalApiId(value)}
            placeholder={t("select_website")}
          />
        </div>

        {/* Step indicator */}
        <PromoStepIndicator
          STEPS={STEPS}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 pb-3">{renderStep()}</div>

        {/* Footer */}
        <WizardFooter
          currentStep={currentStep + 1}
          totalSteps={totalSteps}
          onPrevious={handlePrevious}
          onNext={handleNext}
          isSaving={isPublishing}
          isPublishing={isPublishing}
          onSaveDraft={() => handlePublish(false)}
          onPublish={() => handlePublish(true)}
        />
      </div>
    </ModalWrapper>
  );
}
