import clsx from "clsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Image as ImageIcon,
  Package,
  Truck,
  Eye,
  CreditCard,
  FileText,
  LanguagesIcon,
} from "lucide-react";
import {
  ProductBasicInfo,
  ProductPricingAvailability,
  ProductReviewSubmit,
} from "./sub-components";
import {
  ConfirmDialog,
  WizardFooter,
  WizardStepper,
} from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useInitProductCreateMutation,
  useUpdateProductMutation,
} from "@/store/api/productMutationApi";

import { useFilesUpload } from "@/hooks/useFilesUpload";
import { ModalWrapper } from "@/components/wrapper";
import { PublishButton } from "@/components/btns";
import {
  useGetBusinessForProductQuery,
  useLazyGetBusinessDeliveryInfoByIdQuery,
  useLazyGetBusinessForProductQuery,
} from "@/store/api/businessQueryApi";
import {
  Attributes,
  DeliveryPolicyOption,
} from "@/components/details-sections";
import { useAppSelector } from "@/hooks/hooks";
import { useRemoteSelectData } from "@/hooks/useRemoteSelectData";
import { detectLanguage, modelTitle, removeNulls } from "@/helpers";
import { ItemStatus } from "@/enums/status.types";
import { useUserRoles } from "@/hooks/useUserRoles";
import { IOpMode } from "@/enums/operation.types";
import { routes } from "@/lib/routes";
import Media from "@/components/details-sections/Media";
import ProductTranslateButton from "./sub-components/ProductTranslateButton";

interface ProductWizardProps {
  onClose: () => void;
  opMode?: TOpMode;
  isOpen?: boolean;
  product?: any;
  refetch?: any;
}

export default function CreateProductWizard({
  onClose,
  refetch,
  product,
  opMode = IOpMode.CREATE,
}: ProductWizardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation("products");
  const { t: tc } = useTranslation("toast");

  const { t: tp } = useTranslation("common");
  const [_detecedLanguage, setDetectedLanguage] = useState("");

  const [searchParams] = useSearchParams();
  const { isTraveller } = useUserRoles();
  const { dmoId, authorityId } = useAppSelector((state) => state.auth);

  const productId = searchParams?.get("productId");
  const bzIdForProdCreate = searchParams?.get("businessId");
  const businessName = searchParams?.get("businessName");

  const { language, textPrimary, textTertiary, borderColor, isDark } =
    useThemeClasses();

  const { data: businessData, isLoading: _isBusinessesLoading } =
    useGetBusinessForProductQuery(
      !(product?.businessId || bzIdForProdCreate)
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
    if (product?.businessId || bzIdForProdCreate) {
      return [
        {
          _id: product?.businessId?._id ?? bzIdForProdCreate,
          name: product?.businessId?.name || businessName,
          slug: "",
        },
      ];
    }

    return businessData?.data || [];
  }, [
    product?.businessId,
    bzIdForProdCreate,
    businessName,
    businessData?.data,
  ]);

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

  const [getBusinessDelivery] = useLazyGetBusinessDeliveryInfoByIdQuery();

  const [businessId, setBusinessId] = useState(bzIdForProdCreate || "");
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublishBtnClicked, setIsPublishBtnClicked] = useState(false);
  const [isDraftBtnClicked, setIsDraftBtnClicked] = useState(false);
  const [showClosePopup, setShowClosePopup] = useState(false);
  const [isSameAsBusiness, setIsSameAsBusiness] = useState(false);
  const [galleryImages, setGalleryImages] = useState<TImages>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFormLanguage, setSelectedFormLanguage] =
    useState<Language>("he");
  const [selectedGroupTypesId, setGroupTypesId] = useState<string[]>([]);
  const [selectedAccessiblitiesId, setAccessiblitiesId] = useState<string[]>(
    [],
  );

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

  const [formData, setFormData] = useState<any>({
    businessId: businessId,
    name: "",
    nameHe: "",
    nameAr: "",
    shortDescription: "",
    shortDescriptionHe: "",
    shortDescriptionAr: "",
    fullDescription: "",
    fullDescriptionHe: "",
    fullDescriptionAr: "",
    type: "",
    categories: [],
    subCategories: [],
    markedPrice: "",
    sellingPrice: "",
    quantity: "",
    isUnlimited: false,
    startDate: "",
    endDate: "",
    logo: null as IImage | null,
    images: null as TImages | null,
    additionalImages: [],
    serviceDuration: "",
    vendorDelivers: false,
    pickupAvailable: false,
    deliveryArea: [] as any[],
    deliveryAdditionalInfo: "",
    deliveryReturnExchange: [] as string[],
    deliverySpecificSellerInfo: [] as string[],

    primaryCategory: "",
    tags: [],
    accessibility: [] as string[],
    groupTypes: [] as string[],
  });
  const handleChange = useCallback((updates: Partial<IArticleFormData>) => {
    setFormData((prev: any) => ({ ...prev, ...updates }));
  }, []);
  const initialFormData = useRef(formData);
  const initialAccessibilitiesId = useRef<string[]>([]);
  const initialGroupTypesId = useRef<string[]>([]);
  const isFormDirty = () => {
    return (
      JSON.stringify(formData) !== JSON.stringify(initialFormData.current) ||
      JSON.stringify(selectedAccessiblitiesId) !==
        JSON.stringify(initialAccessibilitiesId.current) ||
      JSON.stringify(selectedGroupTypesId) !==
        JSON.stringify(initialGroupTypesId.current)
    );
  };

  useEffect(() => {
    const fetchBusinessDelivery = async () => {
      if (isSameAsBusiness && businessId) {
        try {
          const { data } = await getBusinessDelivery({ businessId });

          setFormData((prev: any) => ({
            ...prev,
            vendorDelivers: data?.vendorDelivers ?? false,
            pickupAvailable: data?.isPickUpAvailable ?? false,
            deliveryArea: data?.deliveryArea ?? [],
            deliveryReturnExchange: data?.deliveryReturnExchange ?? [],
            deliveryAdditionalInfo: data?.deliveryAdditionalInfo ?? "",
            deliverySpecificSellerInfo: data?.deliverySpecificSellerInfo ?? [],
          }));
        } catch (error) {
          console.error("Failed to fetch business delivery:", error);
        }
      }
    };

    fetchBusinessDelivery();
  }, [isSameAsBusiness, businessId, getBusinessDelivery]);

  useEffect(() => {
    if (!productId || !product) return;

    const loadedFormData = {
      // setp-1: basic info
      businessId: product?.businessId?._id || "",
      name:
        opMode === IOpMode.DUPLICATE
          ? `${product?.name || ""} (Duplicate)`
          : product?.name || "",
      nameHe:
        opMode === IOpMode.DUPLICATE
          ? `${product?.nameHe || ""} (שכפל)`
          : product?.nameHe || "",
      nameAr:
        opMode === IOpMode.DUPLICATE
          ? `${product?.nameAr || ""} (نسخ)`
          : product?.nameAr || "",

      shortDescription: product?.shortDescription || "",
      shortDescriptionHe: product?.shortDescriptionHe || "",
      shortDescriptionAr: product?.shortDescriptionAr || "",

      fullDescription: product?.description || "",
      fullDescriptionHe: product?.descriptionHe || "",
      fullDescriptionAr: product?.descriptionAr || "",

      // step-2: Attributes
      categories: product?.categories || [],
      subCategories: product?.subCategories || [],
      primaryCategory: product?.primaryCategoryId || "",
      tags: product?.tagsId || [],

      //step-3: pricing, stock & dates
      markedPrice: product?.price?.markedPrice || "",
      sellingPrice: product?.price?.sellingPrice || "",
      quantity: product?.quantity?.remaining || "",
      isUnlimited: product?.quantity?.isUnlimited || false,

      startDate: product?.startDate || "",
      endDate: product?.endDate || "",

      // setp-4: images
      images: product?.images || null,
      additionalImages: product?.additionalImages || [],

      // setp-5:  delivery / service
      enableHomeDelivery: product?.enableHomeDelivery || false,
      enableStorePickup: product?.enableStorePickup || false,
      serviceDuration: product?.serviceDuration || "",

      vendorDelivers: product?.vendorDelivers ?? false,
      pickupAvailable: product?.isPickUpAvailable ?? false,
      deliveryArea: product?.deliveryArea ?? [],
      deliveryReturnExchange: product?.deliveryReturnExchange ?? [],
      deliveryAdditionalInfo: product?.deliveryAdditionalInfo ?? "",
      deliverySpecificSellerInfo: product?.deliverySpecificSellerInfo ?? [],
    };
    setFormData(loadedFormData);
    initialFormData.current = loadedFormData;

    const loadedAccessibilities = removeNulls(product?.accessibilitiesId);
    const loadedGroupTypes = removeNulls(product?.groupTypesId);
    setAccessiblitiesId(loadedAccessibilities);
    setGroupTypesId(loadedGroupTypes);
    initialAccessibilitiesId.current = loadedAccessibilities;
    initialGroupTypesId.current = loadedGroupTypes;

    if (opMode === IOpMode.EDIT) {
      setGalleryImages(product?.images);
    } else {
      setGalleryImages([]);
    }
  }, [productId, product]);

  const [initProductCreate, { isLoading: isCreating }] =
    useInitProductCreateMutation();
  const [updateProduct, { isLoading: isSaving }] = useUpdateProductMutation();

  const completionPercent = useMemo(() => {
    const checks = [
      // Basic Info (35%)
      {
        weight: 10,
        filled: !!(
          formData.name?.trim() ||
          formData.nameHe?.trim() ||
          formData.nameAr?.trim()
        ),
      },
      {
        weight: 8,
        filled: !!(
          formData.shortDescription?.trim() ||
          formData.shortDescriptionHe?.trim() ||
          formData.shortDescriptionAr?.trim()
        ),
      },
      {
        weight: 7,
        filled: !!(
          formData.fullDescription?.trim() ||
          formData.fullDescriptionHe?.trim() ||
          formData.fullDescriptionAr?.trim()
        ),
      },
      { weight: 10, filled: !!formData.businessId },
      // Attributes (15%)
      { weight: 10, filled: !!formData.primaryCategory?.trim() },
      { weight: 5, filled: formData.tags?.length > 0 },
      // Pricing (20%)
      {
        weight: 15,
        filled: !!(
          formData.sellingPrice && parseFloat(formData.sellingPrice) > 0
        ),
      },
      {
        weight: 5,
        filled: !!(
          formData.isUnlimited ||
          (formData.quantity && parseInt(formData.quantity) >= 0)
        ),
      },
      // Media (15%)
      { weight: 15, filled: (images?.length ?? 0) > 0 },
      // Delivery (15%)
      { weight: 15, filled: formData.deliveryArea?.length > 0 },
    ];

    const total = checks.reduce((sum, c) => sum + c.weight, 0);
    const earned = checks.reduce(
      (sum, c) => sum + (c.filled ? c.weight : 0),
      0,
    );
    return Math.round((earned / total) * 100);
  }, [formData, images]);

  const steps = [
    { number: 1, title: t("product_basic_info"), icon: FileText },
    { number: 2, title: tp("translation"), icon: LanguagesIcon },

    { number: 3, title: t("product_segmentation"), icon: Package },
    { number: 4, title: t("product_pricing"), icon: CreditCard },
    { number: 5, title: t("product_media"), icon: ImageIcon },
    { number: 6, title: t("product_delivery_service"), icon: Truck },
    { number: 7, title: t("product_review"), icon: Eye },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.businessId) newErrors.businessId = t("field_required");
        if (!formData.name && !formData.nameAr && !formData.nameHe)
          newErrors.nameEn = t("field_required");
        if (
          !formData.shortDescription &&
          !formData.shortDescriptionAr &&
          !formData.shortDescriptionHe
        )
          newErrors.shortDescEn = t("field_required");
        break;
      case 2:
        if (!formData.primaryCategory)
          newErrors.categories = t("select_at_least_one_category");
        break;
      case 3:
        if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) {
          newErrors.sellingPrice = t("invalid_price");
        }
        if (
          !formData.isUnlimited &&
          (!formData.quantity || parseInt(formData.quantity) < 0)
        ) {
          newErrors.quantity = t("invalid_quantity");
        }
        break;
      case 4:
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    if (
      !formData.name?.trim() &&
      !formData.nameHe?.trim() &&
      !formData.nameAr?.trim()
    ) {
      toast.error(tc("name_required"));
      return;
    }
    setIsDraftBtnClicked(true);
    await saveDraft(false);
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
    for (let i = 1; i <= 5; i++) {
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
    const processedFormData = detectAndAssignLanguageFields(stepPayloadMap);

    await saveDraft(true, processedFormData);
    setIsPublishing(false);
  };
  const detectAndAssignLanguageFields = (data: any): any => {
    const name = data.name?.trim() || "";
    const shortDescription = data.shortDescription?.trim() || "";
    const description = data.description?.trim() || "";

    // Prioritize title, then short desc, then content for detection
    const textToDetect = name || shortDescription || description;
    if (!textToDetect) return data;

    const detectedLang = detectLanguage(textToDetect);
    setDetectedLanguage(detectedLang);
    const updated = { ...data };

    if (detectedLang === "he") {
      // Move to Hebrew fields
      updated.nameHe = name || data.nameHe;
      updated.shortDescriptionHe = shortDescription || data.shortDescriptionHe;
      updated.descriptionHe = description || data.descriptionHe;

      // Clear English fields
      updated.name = "";
      updated.shortDescription = "";
      updated.description = "";
    } else if (detectedLang === "ar") {
      // Move to Arabic fields
      updated.nameAr = name || data.nameAr;
      updated.shortDescriptionAr = shortDescription || data.shortDescriptionAr;
      updated.descriptionAr = description || data.descriptionAr;

      // Clear English fields
      updated.name = "";
      updated.shortDescription = "";
      updated.description = "";
    }
    // else: remains in English fields (default)

    return updated;
  };
  // Draft Save Payload per Step
  const stepPayloadMap = {
    completionPercent: completionPercent,
    businessId: formData.businessId,

    name: formData.name,
    nameAr: formData.nameAr,
    nameHe: formData.nameHe,

    shortDescription: formData.shortDescription,
    shortDescriptionAr: formData.shortDescriptionAr,
    shortDescriptionHe: formData.shortDescriptionHe,

    description: formData.fullDescription,
    descriptionHe: formData.fullDescriptionHe,
    descriptionAr: formData.fullDescriptionAr,

    primaryCategoryId: formData.primaryCategory,
    tagsId: formData.tags.map((tag: any) => ({
      en: tag.en,
      he: tag.he,
      ar: tag.ar,
    })),
    accessibilitiesId: removeNulls(selectedAccessiblitiesId),
    groupTypesId: removeNulls(selectedGroupTypesId),

    price: {
      markedPrice: formData.markedPrice,
      sellingPrice: formData.sellingPrice,
    },
    quantity: {
      remaining: formData.quantity,
      isUnlimited: formData.isUnlimited,
    },
    activeStartDate: formData.startDate,
    activeEndDate: formData.endDate,

    images: galleryImages,

    serviceDuration: formData.serviceDuration,
    isPickUpAvailable: formData.pickupAvailable,
    deliveryArea: formData.deliveryArea,
    deliveryAdditionalInfo: formData.deliveryAdditionalInfo,
    deliveryReturnExchange: formData.deliveryReturnExchange,
    deliverySpecificSellerInfo: formData.deliverySpecificSellerInfo,
  };

  const saveDraft = async (isPublish = false, processedFormData?: any) => {
    try {
      let internalProductId;

      // 1️⃣ Initialize product if not created yet
      if (!productId || opMode !== IOpMode.EDIT) {
        const res = await initProductCreate({
          businessId: product?.businessId?._id || formData?.businessId,
        }).unwrap();
        internalProductId = res?.id;
      }

      // Only send payload for the current step
      const payload = processedFormData;
      if (!payload || !Object.keys(payload).length) return;

      // 4️⃣ Update product
      await updateProduct({
        productId: internalProductId || productId!,
        body: {
          ...payload,
          status: isPublish
            ? isTraveller
              ? ItemStatus.PENDING
              : ItemStatus.APPROVED
            : ItemStatus.DRAFT,
        },
      }).unwrap();
      if (opMode === IOpMode.DUPLICATE) {
        navigate(
          `${routes.productDetails}?productId=${internalProductId || productId}`,
        );
        window.location.reload();
      } else {
        refetch();
      }
      onClose();
      toast.success(isPublish ? tc("product_published") : tc("draft_saved"));
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

      selectedFormLanguage,
      setSelectedFormLanguage,
      handleImageUpload,
      setCurrentStep,
      businesses,
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
          <ProductBasicInfo
            {...commonProps}
            setBusinessId={setBusinessId}
            presetBusinessId={bzIdForProdCreate || product?.businessId?._id}
          />
        );
      case 2:
        return (
          <ProductTranslateButton formData={formData} onChange={handleChange} />
        );
      case 3:
        return (
          <Attributes
            name={formData.nameHe || formData.name || formData.nameAr}
            description={
              formData.fullDescriptionHe ||
              formData.fullDescription ||
              formData.fullDescriptionAr
            }
            {...commonProps}
            editData={product}
            selectedAccessiblitiesId={selectedAccessiblitiesId}
            opMode={opMode}
            setAccessiblitiesId={setAccessiblitiesId}
            selectedGroupTypesId={selectedGroupTypesId}
            setGroupTypesId={setGroupTypesId}
          />
        );
      case 4:
        return <ProductPricingAvailability {...commonProps} />;
      case 5:
        return <Media {...mediaProps} {...commonProps} />;
      case 6:
        return (
          <DeliveryPolicyOption
            isProduct
            formData={formData}
            setFormData={setFormData}
            isSameAsBusiness={isSameAsBusiness}
            setIsSameAsBusiness={setIsSameAsBusiness}
          />
        );
      case 7:
        return (
          <ProductReviewSubmit
            {...commonProps}
            selectedAccessiblitiesId={selectedAccessiblitiesId}
            selectedGroupTypesId={selectedGroupTypesId}
          />
        );
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
            {modelTitle(opMode, t)} {t("product")}
          </h2>
          <p className={`text-xs md:text-sm ${textTertiary} truncate`}>
            {t("step")} {currentStep} {t("of")} {steps.length}:{" "}
            {steps[currentStep - 1]?.title}
          </p>
        </div>

        {/* Right content */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {/* Impact Percent Indicator */}
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

      {/* Progress Bar */}
      <div className={`px-4 md:px-6 pt-3 md:pt-4 pb-2 border-b ${borderColor}`}>
        <WizardStepper
          steps={steps}
          currentStep={currentStep}
          totalSteps={steps.length}
          onStepClick={setCurrentStep}
        />
      </div>

      {/* Content */}
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
