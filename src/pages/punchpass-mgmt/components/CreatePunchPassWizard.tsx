import clsx from "clsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { Image as ImageIcon, Package, Eye, FileText } from "lucide-react";

import {
  PunchPassBasicInfo,
  PunchPassCatalogue,
  PunchPassReview,
} from "./sub-components";
import {
  ConfirmDialog,
  WizardFooter,
  WizardStepper,
} from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useCreatePunchPassMutation,
  useUpdatePunchPassMutation,
} from "@/store/api/punchPassApi";

import { useFilesUpload } from "@/hooks/useFilesUpload";
import { ModalWrapper } from "@/components/wrapper";
import { PublishButton } from "@/components/btns";
import {
  useGetBusinessForProductQuery,
  useLazyGetBusinessForProductQuery,
} from "@/store/api/businessQueryApi";
import { useAppSelector } from "@/hooks/hooks";
import { useRemoteSelectData } from "@/hooks/useRemoteSelectData";
import { modelTitle } from "@/helpers";
import { ItemStatus } from "@/enums/status.types";
import { useUserRoles } from "@/hooks/useUserRoles";
import { IOpMode } from "@/enums/operation.types";
import Media from "@/components/details-sections/Media";
import { toCataloguePayload } from "@/pages/punchpass-mgmt/utils";

interface PunchPassWizardProps {
  onClose: () => void;
  opMode?: TOpMode;
  isOpen?: boolean;
  punchPass?: any;
  refetch?: any;
}

const DUPLICATE_SUFFIX: Record<string, string> = {
  en: "(Duplicate)",
  he: "(שכפל)",
  ar: "(نسخ)",
};

const emptyFormData = (businessId = ""): IPunchPassPayload => ({
  businessId,
  name: "",
  description: "",
  catalogues: [
    {
      name: "",
      type: "PRODUCT",
      quantity: 1,
      dateTime: "",
      order: 0,
    },
  ],
  price: {
    markedPrice: 0,
    sellingPrice: 0,
    discountAmount: 0,
    discountPercent: 0,
  },
  quantity: {
    initial: 1,
    isUnlimited: false,
  },
  expiryDate: 60,
  images: [],
  status: ItemStatus.DRAFT,
});

export default function CreatePunchPassWizard({
  onClose,
  refetch,
  punchPass,
  opMode = IOpMode.CREATE,
}: PunchPassWizardProps) {
  const { t } = useTranslation("punch_pass");
  const { t: tc } = useTranslation("toast");

  const [searchParams] = useSearchParams();
  const { isTraveller } = useUserRoles();
  const { dmoId, authorityId } = useAppSelector((state) => state.auth);

  const punchPassId =
    searchParams?.get("punchPassId") || punchPass?._id || null;
  const businessName = searchParams?.get("businessName");
  const bzIdForCreate = businessName ? searchParams?.get("businessId") : null;

  const { language, textPrimary, textTertiary, borderColor, isDark } =
    useThemeClasses();

  const { data: businessData, isLoading: _isBusinessesLoading } =
    useGetBusinessForProductQuery(
      !(punchPass?.businessId || bzIdForCreate)
        ? {
            locale: language,
            limit: 20,
            dmoId,
            authorityId,
          }
        : skipToken,
    );

  const [getBusinessList] = useLazyGetBusinessForProductQuery();

  const initialBusinessData = useMemo(() => {
    if (punchPass?.businessId || bzIdForCreate) {
      const biz = punchPass?.businessId;
      return [
        {
          _id: biz?._id ?? bzIdForCreate,
          name: biz?.name || businessName,
          slug: biz?.slug || "",
        },
      ];
    }

    return businessData?.data || [];
  }, [punchPass?.businessId, bzIdForCreate, businessName, businessData?.data]);

  const {
    items: businesses,
    search: searchBusiness,
    isSearching,
  } = useRemoteSelectData({
    initialData: initialBusinessData,
    debounceMs: 400,
    searchParams: {
      dmoId,
      locale: language,
      authorityId,
    },
    lazySearch: async (params) => {
      const res = await getBusinessList(params).unwrap();
      return { data: res.data };
    },
  });

  const [isFree, setIsFree] = useState(false);
  const [businessId, setBusinessId] = useState(bzIdForCreate || "");
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublishBtnClicked, setIsPublishBtnClicked] = useState(false);
  const [isDraftBtnClicked, setIsDraftBtnClicked] = useState(false);
  const [showClosePopup, setShowClosePopup] = useState(false);
  const [formData, setFormData] = useState<IPunchPassPayload>(
    emptyFormData(businessId),
  );

  const [galleryImages, setGalleryImages] = useState<TImages>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [createPunchPass, { isLoading: isCreating }] =
    useCreatePunchPassMutation();
  const [updatePunchPass, { isLoading: isSaving }] =
    useUpdatePunchPassMutation();

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
      opMode === IOpMode.EDIT && punchPassId
        ? (updatedImages) => {
            updatePunchPass({
              punchPassId,
              language,
              body: { images: updatedImages },
            });
          }
        : undefined,
  });

  const initialFormData = useRef(formData);
  const isFormDirty = () =>
    JSON.stringify(formData) !== JSON.stringify(initialFormData.current);

  useEffect(() => {
    if (!punchPassId || !punchPass) return;

    const name = punchPass.name;
    const loadedFormData: IPunchPassPayload = {
      businessId: punchPass?.businessId?._id || "",
      name:
        opMode === IOpMode.DUPLICATE
          ? `${name} ${DUPLICATE_SUFFIX[language] ?? DUPLICATE_SUFFIX.en}`
          : name,
      description: punchPass?.description,

      catalogues: [...(punchPass?.catalogues || [])]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(({ nameHe, nameAr, ...item }, index) => ({
          ...item,
          name: item.name,
          order: index + 1,
        })),

      price: {
        markedPrice: punchPass?.price?.markedPrice || 0,
        sellingPrice: punchPass?.price?.sellingPrice || 0,
        discountAmount: punchPass?.price?.discountAmount || 0,
        discountPercent: punchPass?.price?.discountPercent || 0,
      },
      quantity: {
        initial: punchPass?.quantity?.initial ?? 1,
        isUnlimited: punchPass?.quantity?.isUnlimited || false,
      },
      expiryDate: punchPass?.expiryDate ?? 60,

      images: punchPass?.images || [],
      status: punchPass?.status || ItemStatus.DRAFT,
    };

    setFormData(loadedFormData);
    initialFormData.current = loadedFormData;
    setGalleryImages(punchPass?.images || []);
    if (punchPass?.price?.sellingPrice === 0) {
      setIsFree(true);
    }
  }, [punchPassId, punchPass]);

  const [createdPunchPassId, setCreatedPunchPassId] = useState<string | null>(
    null,
  );

  const steps = [
    { number: 1, title: t("punch_pass_basic_info"), icon: FileText },
    { number: 2, title: t("punch_pass_catalogues"), icon: Package },
    { number: 3, title: t("punch_pass_media"), icon: ImageIcon },
    { number: 4, title: t("punch_pass_review"), icon: Eye },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.businessId) newErrors.businessId = t("field_required");
        if (!formData.name?.trim()) newErrors.name = t("field_required");
        if (
          formData.price?.sellingPrice === undefined ||
          formData.price.sellingPrice === null ||
          formData.price.sellingPrice < 0
        )
          newErrors.sellingPrice = t("invalid_price");
        if (
          !formData.quantity?.isUnlimited &&
          (formData.quantity?.initial === undefined ||
            formData.quantity.initial < 0)
        )
          newErrors.quantity = t("invalid_quantity");
        break;
      case 2:
        if (!formData.catalogues?.length) {
          newErrors.catalogues = t("select_at_least_one_catalogue");
        } else if (formData.catalogues.some((item) => !item.name?.trim())) {
          newErrors.catalogues = t("all_items_need_name");
          newErrors.catalogueName = t("catalogue_name_missing");
        }
        break;
      case 3:
        if (!galleryImages?.length)
          newErrors.images = t("upload_at_least_one_image");
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Clear the media error once an image has finished uploading
  useEffect(() => {
    if (galleryImages?.length)
      setErrors((prev) => {
        if (!prev.images) return prev;
        const { images: _images, ...rest } = prev;
        return rest;
      });
  }, [galleryImages]);

  const completionPercent = useMemo(() => {
    const checks = [
      !!formData.businessId,
      !!formData.name?.trim(),
      !!formData.price?.sellingPrice,
      !!formData.catalogues?.length,
      !!galleryImages?.length,
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [formData, galleryImages]);

  const handleSaveDraft = async () => {
    if (!formData.name?.trim()) {
      toast.error(tc("name_required"));
      return;
    }
    setIsDraftBtnClicked(true);
    await saveDraft(false, stepPayloadMap);
  };

  const handleNext = async () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleClose = () => {
    if (isFormDirty() && !isPublishBtnClicked && !isDraftBtnClicked) {
      setShowClosePopup(true);
      return;
    }
    onClose();
  };

  const handlePublish = async () => {
    setIsPublishBtnClicked(true);

    let allValid = true;
    for (let i = 1; i <= 3; i++) {
      if (!validateStep(i)) {
        allValid = false;
        setCurrentStep(i);
        break;
      }
    }
    if (!allValid) {
      toast.error(t("fill_all_fields"));
      return;
    }

    setIsPublishing(true);
    await saveDraft(true, stepPayloadMap);
    setIsPublishing(false);
  };

  const stepPayloadMap = {
    businessId: formData.businessId,

    name: formData.name?.trim(),
    description: formData.description?.trim(),

    catalogues: toCataloguePayload(formData.catalogues),

    price: formData.price,
    quantity: formData.quantity,
    expiryDate: formData.expiryDate,
    images: galleryImages,
  };

  const saveDraft = async (isPublish = false, processedFormData?: any) => {
    try {
      const payload = processedFormData;
      if (!payload || !Object.keys(payload).length) return;

      const status = isPublish
        ? isTraveller
          ? ItemStatus.PENDING
          : ItemStatus.APPROVED
        : ItemStatus.DRAFT;

      const existingId = punchPassId || createdPunchPassId;

      if (!existingId || opMode === IOpMode.DUPLICATE) {
        const res: any = await createPunchPass({
          language,
          body: {
            ...payload,
            status,
          },
        }).unwrap();
        if (opMode !== IOpMode.DUPLICATE) {
          setCreatedPunchPassId(res?._id ?? res?.id ?? null);
        }
      } else {
        await updatePunchPass({
          language,
          punchPassId: existingId,
          body: {
            ...payload,
            status,
          },
        }).unwrap();
      }

      refetch?.();
      onClose();
      toast.success(isPublish ? tc("punch_pass_published") : tc("draft_saved"));
    } catch (error: any) {
      toast.error(error?.data?.message || tc("draft_failed"));
    }
  };

  const renderStepContent = () => {
    const commonProps = {
      t,
      formData,
      setFormData,
      errors,
      images,
      setCurrentStep,
      businesses,
      isFree,
      setIsFree,
      isLoading: isSearching || _isBusinessesLoading,
      searchBusiness,
    };

    const mediaProps = {
      t,
      errors,
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
          <PunchPassBasicInfo
            {...commonProps}
            setBusinessId={setBusinessId}
            presetBusinessId={bzIdForCreate || punchPass?.businessId?._id}
          />
        );
      case 2:
        return <PunchPassCatalogue {...commonProps} />;
      case 3:
        return <Media {...mediaProps} {...commonProps} />;
      case 4:
        return <PunchPassReview {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <ModalWrapper onClose={handleClose} showSpinner={isCreating || isSaving}>
      <div
        className={`px-4 py-3 md:p-6 border-b ${borderColor} flex items-center justify-between gap-3`}
      >
        <div className="min-w-0">
          <h2
            className={`text-lg md:text-2xl ${textPrimary} mb-0.5 md:mb-1 truncate`}
          >
            {modelTitle(opMode, t)} {t("punch_pass")}
          </h2>
          <p className={`text-xs md:text-sm ${textTertiary} truncate`}>
            {t("step")} {currentStep} {t("of")} {steps.length}:{" "}
            {steps[currentStep - 1]?.title}
          </p>
        </div>

        <div className="flex items-center gap-2 md:gap-4 shrink-0">
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
                className={isDark ? "stroke-gray-700" : "stroke-gray-200"}
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

      <div className={`px-4 md:px-6 pt-3 md:pt-4 pb-2 border-b ${borderColor}`}>
        <WizardStepper
          steps={steps}
          currentStep={currentStep}
          totalSteps={steps.length}
          onStepClick={setCurrentStep}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {renderStepContent()}
      </div>

      <WizardFooter
        currentStep={currentStep}
        totalSteps={steps?.length}
        isSaving={isSaving}
        isPublishing={isPublishing}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />
      <ConfirmDialog
        open={showClosePopup}
        title={tc("unsaved_changes")}
        message={tc("close_without_saving")}
        confirmText={tc("close")}
        variant="danger"
        onCancel={() => {
          setShowClosePopup(false);
        }}
        onConfirm={() => {
          setShowClosePopup(false);
          onClose();
        }}
      />
    </ModalWrapper>
  );
}
