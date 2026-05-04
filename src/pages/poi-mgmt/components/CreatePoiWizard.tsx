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
} from "lucide-react";

import { useAppSelector } from "@/hooks/hooks";
import {
  useInitPoiCreateMutation,
  useUpdatePoiMutation,
} from "@/store/api/poiMutationApi";

import { PoiBasicInfo, PoiLocation, PoiReviewSubmit } from "./sub-components";
import { ConfirmDialog, WizardFooter } from "@/components/shared";
import { ModalWrapper } from "@/components/wrapper";
import { useFilesUpload } from "@/hooks/useFilesUpload";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { usePoiDraftSaver } from "../hooks/usePoiDraftSaver";
import { parseAddress, removeNulls } from "@/helpers";
import { useCreateWebsiteAccessItemMutation } from "@/store/api/commonMutationApi";
import PublishButton from "@/components/btns/PublishButton";
import { Attributes } from "@/components/details-sections";
import { IOpMode } from "@/enums/operation.types";
import Media from "@/components/details-sections/Media";

interface CreatePoiWizardProps {
  onClose: () => void;
  editData?: any;
  refetch?: any;
  opMode?: TOpMode;
}

export default function CreatePoiWizard({
  onClose,
  editData,
  refetch,
  opMode = IOpMode.CREATE,
}: CreatePoiWizardProps) {
  const { t } = useTranslation("poi");
  const { t: tt } = useTranslation("toast");
  const { t: tc } = useTranslation("common");
  const [selectedFormLanguage, setSelectedFormLanguage] =
    useState<Language>("he");
  const { theme } = useAppSelector((state) => state.settings);
  const { textPrimary, textTertiary } = useThemeClasses();
  const [createWebsiteAccessItem] = useCreateWebsiteAccessItemMutation();

  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublishBtnClicked, setIsPublishBtnClicked] = useState(false);
  const [isDraftBtnClicked, setIsDraftBtnClicked] = useState(false);
  const [showClosePopup, setShowClosePopup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [selectedDmoId, setSelectedDmoId] = useState<string>("");
  const [selectedAuthorityId, setSelectAuthorityId] = useState<string>("");
  const [poiId, setPoiId] = useState<string>("");
  const [selectedGroupTypesId, setGroupTypesId] = useState<string[]>([]);
  const [selectedAccessiblitiesId, setAccessiblitiesId] = useState<string[]>(
    [],
  );
  const [geo, setGeo] = useState<Geo>({ lat: "", lng: "" });
  const [address, setAddress] = useState("");
  const [galleryImages, setGalleryImages] = useState<TImages>([]);
  const [websiteVisibilityIds, setWebsiteVisibilityIds] = useState({
    allBlacklistIds: [] as string[],
    selectedBlacklistIds: [] as string[],
    allWhitelistIds: [] as string[],
    selectedWhitelistIds: [] as string[],
  });

  const { userRole, dmoId, authorityId } = useAppSelector(
    (state) => state.auth,
  );

  const [formData, setFormData] = useState<any>({
    nameEn: "",
    nameHe: "",
    nameAr: "",
    shortDescriptionEn: "",
    shortDescriptionHe: "",
    shortDescriptionAr: "",
    fullDescriptionEn: "",
    fullDescriptionHe: "",
    fullDescriptionAr: "",
    internalNotes: "",
    primaryCategory: "",
    tags: [],
  });

  const initialFormData = useRef(formData);
  const initialAccessibilitiesId = useRef<string[]>([]);
  const initialGroupTypesId = useRef<string[]>([]);

  const isFormDirty = () =>
    JSON.stringify(formData) !== JSON.stringify(initialFormData.current) ||
    JSON.stringify(selectedAccessiblitiesId) !==
      JSON.stringify(initialAccessibilitiesId.current) ||
    JSON.stringify(selectedGroupTypesId) !==
      JSON.stringify(initialGroupTypesId.current);

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

  const totalSteps = 5;

  const completionPercent = useMemo(() => {
    const checks = [
      {
        weight: 15,
        filled: !!(
          formData.nameEn?.trim() ||
          formData.nameHe?.trim() ||
          formData.nameAr?.trim()
        ),
      },
      {
        weight: 15,
        filled: !!(
          formData.shortDescriptionEn?.trim() ||
          formData.shortDescriptionHe?.trim() ||
          formData.shortDescriptionAr?.trim()
        ),
      },
      {
        weight: 15,
        filled: !!(
          formData.fullDescriptionEn?.trim() ||
          formData.fullDescriptionHe?.trim() ||
          formData.fullDescriptionAr?.trim()
        ),
      },
      { weight: 20, filled: !!address?.trim() },
      { weight: 15, filled: !!formData.primaryCategory?.trim() },
      { weight: 20, filled: (images?.length ?? 0) > 0 },
    ];
    const total = checks.reduce((sum, c) => sum + c.weight, 0);
    const earned = checks.reduce(
      (sum, c) => sum + (c.filled ? c.weight : 0),
      0,
    );
    return Math.round((earned / total) * 100);
  }, [formData, address, images]);

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
        nameEn:
          opMode === IOpMode.DUPLICATE
            ? `${editData?.name || ""} (Duplicate)`
            : editData?.name || "",
        nameHe:
          opMode === IOpMode.DUPLICATE
            ? `${editData?.nameHe || ""} (שכפל)`
            : editData?.nameHe || "",
        nameAr:
          opMode === IOpMode.DUPLICATE
            ? `${editData?.nameAr || ""} (نسخ)`
            : editData?.nameAr || "",
        shortDescriptionEn: editData?.shortDescription || "",
        shortDescriptionHe: editData?.shortDescriptionHe || "",
        shortDescriptionAr: editData?.shortDescriptionAr || "",
        fullDescriptionEn: editData?.description || "",
        fullDescriptionHe: editData?.descriptionHe || "",
        fullDescriptionAr: editData?.descriptionAr || "",
        internalNotes: editData?.internalNotes || "",
        primaryCategory: editData?.primaryCategoryId || "",
        tags: editData?.tagsId || [],
      };
      setFormData(loaded);
      initialFormData.current = loaded;

      const loadedAccessibilities = removeNulls(editData?.accessibilitiesId);
      const loadedGroupTypes = removeNulls(editData?.groupTypesId);
      setAccessiblitiesId(loadedAccessibilities);
      setGroupTypesId(loadedGroupTypes);
      initialAccessibilitiesId.current = loadedAccessibilities;
      initialGroupTypesId.current = loadedGroupTypes;

      if (editData?.geoLocation) {
        setGeo({
          lat: String(editData.geoLocation.lat),
          lng: String(editData.geoLocation.lng),
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
    { number: 2, title: t("step_location"), icon: MapPin },
    { number: 3, title: t("step_attributes"), icon: Tag },
    { number: 4, title: t("step_media"), icon: ImageIcon },
    { number: 5, title: t("step_review_submit"), icon: CheckCircle },
  ];

  const addr = parseAddress(address);

  const stepPayloadMap = {
    authorityId: selectedAuthorityId,
    dmoId: selectedDmoId,
    name: formData.nameEn,
    nameHe: formData.nameHe,
    nameAr: formData.nameAr,
    shortDescription: formData.shortDescriptionEn,
    shortDescriptionHe: formData.shortDescriptionHe,
    shortDescriptionAr: formData.shortDescriptionAr,
    description: formData.fullDescriptionEn,
    descriptionHe: formData.fullDescriptionHe,
    descriptionAr: formData.fullDescriptionAr,
    internalNotes: formData.internalNotes,
    address: {
      country: addr.country,
      city: addr.city,
      location: addr.location,
    },
    geoLocation: geo,
    primaryCategoryId: formData.primaryCategory,
    tagsId: formData.tags?.map((tag: any) => ({
      en: tag.en,
      he: tag.he,
      ar: tag.ar,
    })),
    accessibilitiesId: removeNulls(selectedAccessiblitiesId),
    groupTypesId: removeNulls(selectedGroupTypesId),
    images: galleryImages,
    completionPercent,
  };

  const { markDirty, saveDraft } = usePoiDraftSaver({
    opMode,
    onClose,
    refetch,
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
      selectedItems: websiteVisibilityIds.selectedBlacklistIds,
    },
    whitelist: {
      allItems: websiteVisibilityIds.allWhitelistIds,
      selectedItems: websiteVisibilityIds.selectedWhitelistIds,
    },
    purpose: "poi",
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    switch (step) {
      case 1:
        if (
          !formData.nameEn?.trim() &&
          !formData.nameAr?.trim() &&
          !formData.nameHe?.trim()
        )
          newErrors.name = t("required_field");
        if (
          !formData.shortDescriptionEn?.trim() &&
          !formData.shortDescriptionAr?.trim() &&
          !formData.shortDescriptionHe?.trim()
        )
          newErrors.shortDescription = t("required_field");
        if (
          !formData.fullDescriptionEn?.trim() &&
          !formData.fullDescriptionAr?.trim() &&
          !formData.fullDescriptionHe?.trim()
        )
          newErrors.fullDescription = t("required_field");
        break;
      case 2:
        if (!addr.location) newErrors.address = t("required_field");
        break;
      case 3:
        if (!formData.primaryCategory?.trim())
          newErrors.primaryCategory = t("primary_category_required");
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
    await saveDraft(false);
    if (poiId) {
      await createWebsiteAccessItem({
        body: websiteAccessItemPayload,
        itemId: poiId,
      });
    }
  };

  const handlePublish = async () => {
    setIsPublishBtnClicked(true);
    let allValid = true;
    for (let i = 1; i <= 4; i++) {
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
    if (poiId) {
      await createWebsiteAccessItem({
        body: websiteAccessItemPayload,
        itemId: poiId,
      });
    }
    await saveDraft(true);
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
    const mediaProps = {
      theme,
      errors,
      markDirty,
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

    switch (currentStep) {
      case 1:
        return (
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
            selectedFormLanguage={selectedFormLanguage}
            setSelectedFormLanguage={setSelectedFormLanguage}
          />
        );
      case 2:
        return (
          <PoiLocation
            t={t}
            geo={geo}
            setGeo={setGeo}
            address={address}
            setAddress={setAddress}
          />
        );
      case 3:
        return (
          <Attributes
            selectedFormLanguage={selectedFormLanguage}
            editData={editData}
            {...commonProps}
            name={formData.nameEn || formData.nameHe || formData.nameAr}
            description={
              formData.fullDescriptionHe ||
              formData.fullDescriptionEn ||
              formData.fullDescriptionAr
            }
            opMode={opMode}
            selectedAccessiblitiesId={selectedAccessiblitiesId}
            setAccessiblitiesId={setAccessiblitiesId}
            selectedGroupTypesId={selectedGroupTypesId}
            setGroupTypesId={setGroupTypesId}
          />
        );
      case 4:
        return <Media {...mediaProps} />;
      case 5:
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
      <div className={clsx("px-6 py-4 border-b", textPrimary)}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={clsx("text-2xl", textPrimary)}>
              {opMode === IOpMode.EDIT ? t("edit_poi") : t("create_poi")}
            </h2>
            <p
              className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
            >
              {t("step")} {currentStep} {t("of")} {totalSteps}:{" "}
              {steps[currentStep - 1].title}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Completion circle */}
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
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
                    "text-xs font-bold",
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
        <div className="flex items-center gap-2 mb-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                onClick={() => setCurrentStep(step.number)}
                className="flex-1 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                      step.number === currentStep
                        ? "bg-teal-600 text-white"
                        : step.number < currentStep
                          ? "bg-green-600 text-white"
                          : theme === "dark"
                            ? "bg-gray-800 text-gray-500"
                            : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step.number < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  {step.number < totalSteps && (
                    <div
                      className={`flex-1 h-1 rounded ${step.number < currentStep ? "bg-green-600" : theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}
                    />
                  )}
                </div>
                <div className="mt-1">
                  <span
                    className={`text-xs block text-center text-nowrap overflow-hidden ${textTertiary}`}
                  >
                    {step.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">{renderStep()}</div>

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
