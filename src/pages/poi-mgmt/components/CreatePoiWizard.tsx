import clsx from "clsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle,
  MapPin,
  Image as ImageIcon,
  Tag,
  FileText,
  Users,
  LanguagesIcon,
  // Languages as LanguagesIcon,
} from "lucide-react";

import { useAppSelector } from "@/hooks/hooks";
import {
  useInitPoiCreateMutation,
  useUpdatePoiMutation,
} from "@/store/api/poiMutationApi";

import {
  PoiBasicInfo,
  PoiLocation,
  PoiReviewSubmit,
  PoiAttributes,
  PoiContactInfo,
  PoiMedia,
  // PoiTranslateButton,
  PoiContentForm,
  // PoiTranslateButton,
} from "./sub-components";
import {
  ConfirmDialog,
  WizardFooter,
  WizardStepper,
} from "@/components/shared";
import { ModalWrapper } from "@/components/wrapper";
import { useFilesUpload } from "@/hooks/useFilesUpload";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { usePoiDraftSaver } from "../hooks/usePoiDraftSaver";
import { detectLanguage, parseAddress } from "@/helpers";
import { useCreateWebsiteAccessItemMutation } from "@/store/api/commonMutationApi";
import PublishButton from "@/components/btns/PublishButton";
import { IOpMode } from "@/enums/operation.types";

interface CreatePoiWizardProps {
  onClose: () => void;
  editData?: any;
  refetch?: any;
  poiDataRefetch?: any;
  opMode?: TOpMode;
}

export default function CreatePoiWizard({
  onClose,
  editData,
  refetch,
  poiDataRefetch,
  opMode = IOpMode.CREATE,
}: CreatePoiWizardProps) {
  const { t } = useTranslation("poi");
  const { t: tt } = useTranslation("toast");
  const { t: tc } = useTranslation("common");

  const { textPrimary, theme, language } = useThemeClasses();
  const [createWebsiteAccessItem] = useCreateWebsiteAccessItemMutation();

  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublishBtnClicked, setIsPublishBtnClicked] = useState(false);
  const [isDraftBtnClicked, setIsDraftBtnClicked] = useState(false);
  const [showClosePopup, setShowClosePopup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [selectedFormLanguage, setSelectedFormLanguage] =
    useState<Language>("he");
  const [selectedDmoId, setSelectedDmoId] = useState<string>("");
  const [selectedAuthorityId, setSelectAuthorityId] = useState<string>("");
  const [poiId, setPoiId] = useState<string>("");
  const [geo, setGeo] = useState<Geo>({ lat: "", long: "" });
  const [address, setAddress] = useState("");
  const [galleryImages, setGalleryImages] = useState<TImages>([]);
  const [websiteVisibilityIds, setWebsiteVisibilityIds] = useState({
    allBlacklistIds: [] as string[],
    selectedBlacklistIds: [] as string[],
    allWhitelistIds: [] as string[],
    selectedWhitelistIds: [] as string[],
  });
  const [deleteTargetLogo, setDeleteTargetLogo] = useState<string | null>(null);

  const [formData, setFormData] = useState<any>({
    title: "",
    titleHe: "",
    titleAr: "",
    shortDescription: "",
    shortDescriptionHe: "",
    shortDescriptionAr: "",
    content: "",
    contentHe: "",
    contentAr: "",
    internalNotes: "",
    tags: [],
    email: "",
    phone: "",
    website: "",
    videoUrl: "",
    virtualTourUrl: "",
  });

  const { userRole, dmoId, authorityId } = useAppSelector(
    (state) => state.auth,
  );

  const initialFormData = useRef(formData);

  const isFormDirty = () =>
    JSON.stringify(formData) !== JSON.stringify(initialFormData.current);

  const logoUpload = useFileUpload({
    initialUrl: opMode !== IOpMode.CREATE ? editData?.logo || "" : "",
  });

  const logoImage: IImageUpload | null = logoUpload.previewUrl
    ? {
        id: 0,
        previewUrl: logoUpload.previewUrl,
        gcsURL: logoUpload.gcsUrl,
        progress: logoUpload.progress,
        status: logoUpload.status as any,
      }
    : null;

  const handleDeleteLogoImage = (img: IImageUpload) => {
    setDeleteTargetLogo(img.previewUrl);
  };

  const confirmDeleteLogo = async () => {
    await logoUpload.deleteFile();
    setDeleteTargetLogo(null);
  };

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
  });

  const [updatePoi, { isLoading: isSaving }] = useUpdatePoiMutation();
  const [initPoiCreate, { isLoading: isCreating }] = useInitPoiCreateMutation();

  const totalSteps = 7;

  const completionPercent = useMemo(() => {
    const checks = [
      {
        weight: 15,
        filled: !!(
          formData.title?.trim() ||
          formData.titleHe?.trim() ||
          formData.titleAr?.trim()
        ),
      },
      {
        weight: 15,
        filled: !!(
          formData.shortDescription?.trim() ||
          formData.shortDescriptionHe?.trim() ||
          formData.shortDescriptionAr?.trim()
        ),
      },
      {
        weight: 15,
        filled: !!(
          formData.content?.trim() ||
          formData.contentHe?.trim() ||
          formData.contentAr?.trim()
        ),
      },
      { weight: 20, filled: !!address?.trim() },
      { weight: 15, filled: !!logoUpload.gcsUrl },
      { weight: 20, filled: (images?.length ?? 0) > 0 },
    ];
    const total = checks.reduce((sum, c) => sum + c.weight, 0);
    const earned = checks.reduce(
      (sum, c) => sum + (c.filled ? c.weight : 0),
      0,
    );
    return Math.round((earned / total) * 100);
  }, [formData, address, images, logoUpload.gcsUrl]);

  useEffect(() => {
    if (userRole === "authority") {
      setSelectAuthorityId(authorityId);
      setSelectedDmoId(dmoId);
    }
  }, []);

  useEffect(() => {
    if (poiId === "" || opMode === IOpMode.CREATE) return;
    if (editData && poiId) {
      const loaded = {
        title:
          opMode === IOpMode.DUPLICATE
            ? `${editData?.name || ""} (Duplicate)`
            : editData?.name || "",
        titleHe:
          opMode === IOpMode.DUPLICATE
            ? `${editData?.nameHe || ""} (שכפל)`
            : editData?.nameHe || "",
        titleAr:
          opMode === IOpMode.DUPLICATE
            ? `${editData?.nameAr || ""} (נسخ)`
            : editData?.nameAr || "",
        primaryCategory: editData?.primaryCategoryId || "",

        shortDescription: editData?.shortDescription || "",
        shortDescriptionHe: editData?.shortDescriptionHe || "",
        shortDescriptionAr: editData?.shortDescriptionAr || "",
        content: editData?.description || "",
        contentHe: editData?.descriptionHe || "",
        contentAr: editData?.descriptionAr || "",
        internalNotes: editData?.internalNotes || "",
        tags: editData?.tagsId || [],
        email: editData?.busiEmail || "",
        phone: editData?.phoneNumber || "",
        website: editData?.website || "",
        videoUrl: editData?.videoUrl || "",
        virtualTourUrl: editData?.virtualTourUrl || "",
      };
      setFormData(loaded);
      initialFormData.current = loaded;

      if (editData?.geoLocation) {
        setGeo({
          lat: String(editData.geoLocation.lat),
          long: String(editData.geoLocation.long),
        });
      }
      if (editData?.address) {
        setAddress(
          [
            editData.address.location,
            editData.address.city,
            editData.address.country,
          ]
            .filter(Boolean)
            .join(", "),
        );
      }
      setSelectAuthorityId(editData?.authorityId?._id || "");
      setSelectedDmoId(editData?.dmoId?._id || "");
      // Detect primary language from edit data
      if (
        editData?.nameHe ||
        editData?.shortDescriptionHe ||
        editData?.descriptionHe
      ) {
        setSelectedFormLanguage("he");
      } else if (
        editData?.nameAr ||
        editData?.shortDescriptionAr ||
        editData?.descriptionAr
      ) {
        setSelectedFormLanguage("ar");
      } else {
        setSelectedFormLanguage("en");
      }

      if (opMode === IOpMode.EDIT) {
        setGalleryImages(editData?.images || []);
      }
    }
  }, [editData, opMode, poiId]);

  useEffect(() => {
    if (opMode !== IOpMode.CREATE) {
      setPoiId(editData?._id);
    }
  }, [opMode]);

  const steps = [
    { number: 1, title: t("step_basic_info"), icon: FileText },
    { number: 2, title: t("step_translation"), icon: LanguagesIcon },
    { number: 3, title: t("step_contact_info"), icon: Users },
    { number: 4, title: t("step_media"), icon: ImageIcon },
    { number: 5, title: t("step_attributes"), icon: Tag },
    { number: 6, title: t("step_location"), icon: MapPin },
    { number: 7, title: t("step_review_submit"), icon: CheckCircle },
  ];

  const addr = parseAddress(address);

  const stepPayloadMap = {
    authorityId: selectedAuthorityId,
    dmoId: selectedDmoId,
    name: formData.title,
    nameHe: formData.titleHe,
    nameAr: formData.titleAr,
    shortDescription: formData.shortDescription,
    shortDescriptionHe: formData.shortDescriptionHe,
    shortDescriptionAr: formData.shortDescriptionAr,
    description: formData.content,
    descriptionHe: formData.contentHe,
    descriptionAr: formData.contentAr,
    internalNotes: formData.internalNotes,
    primaryCategoryId: "6566e256a77d2a477266d2c0",

    address: {
      country: addr.country,
      city: addr.city,
      location: addr.location,
    },
    geoLocation: { lat: geo.lat, long: geo.long },
    tagsId: formData.tags?.map((tag: any) => ({
      en: tag.en,
      he: tag.he,
      ar: tag.ar,
    })),
    busiEmail: formData.email,
    phoneNumber: formData.phone,
    website: formData.website,
    videoUrl: formData.videoUrl,
    virtualTourUrl: formData.virtualTourUrl,
    logo: logoUpload.gcsUrl,
    images: galleryImages,
    completionPercent,
  };

  const { markDirty, saveDraft } = usePoiDraftSaver({
    opMode,
    onClose,
    refetch,
    poiDataRefetch,
    currentStep,
    poiId,
    setPoiId,
    initPoiCreate,
    updatePoi,
    stepPayloadMap,
  });

  const websiteAccessItemPayload = {
    blacklist: {
      allItems: websiteVisibilityIds.allBlacklistIds,
      // Send websites that are UNCHECKED (to add to blacklist/hide)
      // In this section: CHECK = show, UNCHECK = hide
      selectedItems: websiteVisibilityIds.allBlacklistIds.filter(
        (id: string) => !websiteVisibilityIds.selectedBlacklistIds.includes(id),
      ),
    },
    whitelist: {
      allItems: websiteVisibilityIds.allWhitelistIds,
      // Send ONLY explicitly checked websites from unassociated section
      // Associated section manages visibility via blacklist only
      selectedItems: websiteVisibilityIds.selectedWhitelistIds,
    },
    purpose: "poi",
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    switch (step) {
      case 1:
        if (
          !formData.title?.trim() &&
          !formData.titleAr?.trim() &&
          !formData.titleHe?.trim()
        )
          newErrors.name = t("required_field");
        if (
          !formData.shortDescription?.trim() &&
          !formData.shortDescriptionAr?.trim() &&
          !formData.shortDescriptionHe?.trim()
        )
          newErrors.shortDescription = t("required_field");
        if (
          !formData.content?.trim() &&
          !formData.contentAr?.trim() &&
          !formData.contentHe?.trim()
        )
          newErrors.fullDescription = t("required_field");
        if (!selectedDmoId) newErrors.dmo = t("required_field");
        if (!selectedAuthorityId) newErrors.authority = t("required_field");

        break;

      case 6:
        if (!addr.location) newErrors.address = t("required_field");
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    if (isFormDirty() && !isPublishBtnClicked && !isDraftBtnClicked) {
      setShowClosePopup(true);
      return;
    }
    onClose();
  };

  const handleNext = async () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSaveDraft = async () => {
    setIsDraftBtnClicked(true);
    const resolvedPoiId = await saveDraft(false);
    if (resolvedPoiId) {
      await createWebsiteAccessItem({
        body: websiteAccessItemPayload,
        itemId: resolvedPoiId,
      });
      refetch?.();
    }
  };
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
  const handlePublish = async () => {
    setIsPublishBtnClicked(true);

    if (
      (formData.shortDescription || "").length > 150 ||
      (formData.shortDescriptionHe || "").length > 150 ||
      (formData.shortDescriptionAr || "").length > 150
    ) {
      setCurrentStep(1);
      toast.error(tc("exceeds_char_limit", { limit: 150 }));
      return;
    }
    if (
      (formData.content || "").length > 500 ||
      (formData.contentHe || "").length > 500 ||
      (formData.contentAr || "").length > 500
    ) {
      setCurrentStep(1);
      toast.error(tc("exceeds_char_limit", { limit: 500 }));
      return;
    }

    let allValid = true;
    for (let i = 1; i <= 6; i++) {
      if (!validateStep(i)) {
        allValid = false;
        setCurrentStep(i);
        break;
      }
    }
    if (!allValid) {
      toast.error(tt("fill_all_fields"));
      return;
    }
    setIsPublishing(true);
    const processedFormData = detectAndAssignLanguageFields(stepPayloadMap);

    const resolvedPoiId = await saveDraft(true, processedFormData);
    if (resolvedPoiId) {
      await createWebsiteAccessItem({
        body: websiteAccessItemPayload,
        itemId: resolvedPoiId,
      });
      await Promise.all([poiDataRefetch?.(), refetch?.()]);
    }
    setIsPublishing(false);
  };

  const renderStep = () => {
    const commonProps = {
      t,
      formData,
      errors,
      setFormData,
      address,
      geo,
      markDirty,
    };

    switch (currentStep) {
      case 1:
        return (
          <div>
            <PoiBasicInfo
              {...commonProps}
              poiId={poiId}
              selectedDmoId={selectedDmoId}
              setSelectDmoId={setSelectedDmoId}
              selectedAuthorityId={selectedAuthorityId}
              setSelectAuthorityId={setSelectAuthorityId}
              websiteVisibilityIds={websiteVisibilityIds}
              setWebsiteVisibilityIds={setWebsiteVisibilityIds}
              poiAssociatedWebsites={editData?.associatedWebsites ?? []}
            />
            <PoiContentForm formData={formData} setFormData={setFormData} />
          </div>
        );
      // case 2:
      //   return (
      //     <PoiTranslateButton formData={formData} onChange={handleChange} />
      //   );
      case 3:
        return (
          <PoiContactInfo
            t={t}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            markDirty={markDirty}
          />
        );
      case 4:
        return (
          <PoiMedia
            markDirty={markDirty}
            logoImage={logoImage}
            deleteTargetLogo={deleteTargetLogo}
            setDeleteTargetLogo={setDeleteTargetLogo}
            isLogoImageDeleting={logoUpload.isDeleting}
            handleDeleteLogoImage={handleDeleteLogoImage}
            confirmDeleteLogo={confirmDeleteLogo}
            images={images}
            imagesRef={imagesRef}
            primaryImageIndex={primaryImageIndex}
            setPrimaryImage={setPrimaryImage}
            handleImageUpload={handleImageUpload}
            deleteTarget={deleteTarget}
            setDeleteTarget={setDeleteTarget}
            confirmDelete={confirmDelete}
            isImageDeleting={isImageDeleting}
            handleDeleteImage={handleDeleteImage}
            videoUrl={formData.videoUrl}
            setVideoUrl={(v: string) =>
              setFormData((prev: any) => ({ ...prev, videoUrl: v }))
            }
            virtualTourUrl={formData.virtualTourUrl}
            setVirtualTourUrl={(v: string) =>
              setFormData((prev: any) => ({ ...prev, virtualTourUrl: v }))
            }
          />
        );
      case 5:
        return (
          <PoiAttributes
            formData={formData}
            setFormData={setFormData}
            name={formData.title || formData.titleHe || formData.titleAr}
            description={
              formData.shortDescription ||
              formData.shortDescriptionHe ||
              formData.shortDescriptionAr
            }
          />
        );
      case 6:
        return (
          <PoiLocation
            t={t}
            geo={geo}
            setGeo={setGeo}
            address={address}
            setAddress={setAddress}
          />
        );
      case 7:
        return (
          <PoiReviewSubmit
            t={t}
            formData={formData}
            address={address}
            images={images}
            setCurrentStep={setCurrentStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ModalWrapper onClose={handleClose} showSpinner={isCreating || isSaving}>
      {/* Header */}
      <div className={clsx("px-4 py-3 md:px-6 md:py-4 border-b", textPrimary)}>
        <div className="flex items-center justify-between gap-3 mb-3 md:mb-4">
          <div className="min-w-0">
            <h2 className={clsx("text-lg md:text-2xl truncate", textPrimary)}>
              {opMode === IOpMode.EDIT ? t("edit_poi") : t("create_poi")}
            </h2>
            <p
              className={`text-xs md:text-sm truncate ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
            >
              {t("step")} {currentStep} {t("of")} {totalSteps}:{" "}
              {steps[currentStep - 1].title}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {/* Completion circle */}
            <div className="relative w-10 h-10 md:w-14 md:h-14">
              <svg
                className="w-10 h-10 md:w-14 md:h-14 -rotate-90"
                viewBox="0 0 56 56"
              >
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  fill="none"
                  strokeWidth="5"
                  className={
                    theme === "dark" ? "stroke-gray-700" : "stroke-gray-200"
                  }
                />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  fill="none"
                  strokeWidth="5"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  strokeDashoffset={`${2 * Math.PI * 22 * (1 - completionPercent / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                  stroke={
                    completionPercent >= 70
                      ? "#16a34a"
                      : completionPercent >= 40
                        ? "#f59e0b"
                        : "#ef4444"
                  }
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={clsx(
                    "text-[10px] md:text-xs font-bold",
                    completionPercent >= 70
                      ? "text-green-600"
                      : completionPercent >= 40
                        ? "text-amber-500"
                        : "text-red-500",
                  )}
                >
                  {completionPercent}%
                </span>
              </div>
            </div>
            <PublishButton onClick={handlePublish} isLoading={isPublishing} />
          </div>
        </div>

        {/* Step progress */}
        <WizardStepper
          steps={steps}
          currentStep={currentStep}
          totalSteps={steps.length}
          onStepClick={setCurrentStep}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">{renderStep()}</div>

      <WizardFooter
        currentStep={currentStep}
        totalSteps={totalSteps}
        isSaving={isSaving || isCreating}
        isPublishing={isPublishing}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />

      <ConfirmDialog
        open={showClosePopup}
        title={tt("unsaved_changes")}
        message={tt("close_without_saving")}
        confirmText={tt("close")}
        variant="danger"
        onCancel={() => setShowClosePopup(false)}
        onConfirm={() => {
          setShowClosePopup(false);
          onClose();
        }}
      />
    </ModalWrapper>
  );
}
