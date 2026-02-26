import clsx from "clsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Check,
  Image as ImageIcon,
  Package,
  Truck,
  Eye,
  CreditCard,
  FileText,
} from "lucide-react";
import {
  ProductBasicInfo,
  ProductMedia,
  ProductPricingAvailability,
  ProductReviewSubmit,
} from "./sub-components";
import { WizardFooter } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useInitProductCreateMutation,
  useUpdateProductMutation,
} from "@/store/api/productMutationApi";

import { useImagesUpload } from "@/hooks/useImagesUpload";
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
import { modelTitle, removeNulls } from "@/helpers";
import { ItemStatus } from "@/enums/status.types";
import { useUserRoles } from "@/hooks/useUserRoles";
import { IOpMode } from "@/enums/operation.types";
import { routes } from "@/lib/routes";

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

  const [searchParams] = useSearchParams();
  const { isTraveller } = useUserRoles();
  const { dmoId, authorityId } = useAppSelector((state) => state.auth);

  const productId = searchParams?.get("productId");
  const bzIdForProdCreate = searchParams?.get("businessId");
  const businessName = searchParams?.get("businessName");

  const {
    language,
    bgTertiary,
    textPrimary,
    textTertiary,
    textSecondary,
    borderColor,
  } = useThemeClasses();

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

    setFormData({
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
    });

    setAccessiblitiesId(removeNulls(product?.accessibilitiesId));
    setGroupTypesId(removeNulls(product?.groupTypesId));

    if (opMode === IOpMode.EDIT) {
      setGalleryImages(product?.images);
    } else {
      setGalleryImages([]);
    }
  }, [productId, product]);

  const [initProductCreate, { isLoading: isCreating }] =
    useInitProductCreateMutation();
  const [updateProduct, { isLoading: isSaving }] = useUpdateProductMutation();

  const steps = [
    { number: 1, title: t("product_basic_info"), icon: FileText },
    { number: 2, title: t("product_segmentation"), icon: Package },
    { number: 3, title: t("product_pricing"), icon: CreditCard },
    { number: 4, title: t("product_media"), icon: ImageIcon },
    { number: 5, title: t("product_delivery_service"), icon: Truck },
    { number: 6, title: t("product_review"), icon: Eye },
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
    await uploadAll();
    await saveDraft(false);
  };

  const handleNext = async () => {
    if (currentStep === 4) {
      await uploadAll();
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handlePublish = async () => {
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

    await saveDraft(true);
    setIsPublishing(false);
  };

  // Draft Save Payload per Step
  const stepPayloadMap = {
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

  const saveDraft = async (isPublish = false) => {
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
      const payload = stepPayloadMap;
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
          <Attributes
            name={formData.nameEn || formData.nameHe || formData.nameAr}
            description={
              formData.fullDescriptionHe ||
              formData.fullDescriptionEn ||
              formData.fullDescriptionAr
            }
            productId={productId}
            {...commonProps}
            selectedAccessiblitiesId={selectedAccessiblitiesId}
            setAccessiblitiesId={setAccessiblitiesId}
            selectedGroupTypesId={selectedGroupTypesId}
            setGroupTypesId={setGroupTypesId}
          />
        );
      case 3:
        return <ProductPricingAvailability {...commonProps} />;
      case 4:
        return <ProductMedia {...mediaProps} {...commonProps} />;
      case 5:
        return (
          <DeliveryPolicyOption
            isProduct
            formData={formData}
            setFormData={setFormData}
            isSameAsBusiness={isSameAsBusiness}
            setIsSameAsBusiness={setIsSameAsBusiness}
          />
        );
      case 6:
        return <ProductReviewSubmit {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <ModalWrapper onClose={onClose} showSpinner={isCreating || isSaving}>
      <div
        className={`p-6 border-b ${borderColor} flex items-center justify-between`}
      >
        <div>
          <h2 className={`text-2xl ${textPrimary} mb-1`}>
            {modelTitle(opMode, t)} {t("product")}
          </h2>
          <p className={`text-sm ${textTertiary}`}>
            {t("step")} {currentStep} {t("of")} 6:{" "}
            {steps[currentStep - 1]?.title}
          </p>
        </div>

        {/* Right content */}
        <PublishButton onClick={handlePublish} isLoading={isPublishing} />
      </div>

      {/* Progress Bar */}
      <div className={`px-6 pt-4 pb-2 border-b ${borderColor}`}>
        <div className="flex items-start justify-between">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <div
                key={step.number}
                className="flex-1 cursor-pointer"
                onClick={() => setCurrentStep(step.number)}
              >
                <div className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                      ${
                        isActive
                          ? "bg-teal-500 text-white"
                          : isCompleted
                            ? "bg-green-500 text-white"
                            : `${bgTertiary} ${textTertiary}`
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>

                    {/* Title below icon */}
                    <span
                      className={clsx(
                        "mt-2 text-sm text-center",
                        textSecondary,
                      )}
                    >
                      {step.title}
                    </span>
                  </div>

                  {/* Connector line */}
                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        isCompleted ? "bg-green-500" : bgTertiary
                      }`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">{renderStepContent()}</div>

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
    </ModalWrapper>
  );
}
