import clsx from "clsx";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";
import { useSearchParams } from "react-router-dom";

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
  ProductAttributes,
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

import { useGetProductbyIdQuery } from "@/store/api/productQueryApi";
import { useImagesUpload } from "@/hooks/useImagesUpload";
import { ModalWrapper } from "@/components/wrapper";
import { PublishButton } from "@/components/btns";
import {
  useGetBusinessForProductQuery,
  useLazyGetBusinessDeliveryInfoByIdQuery,
  useLazyGetBusinessForProductQuery,
} from "@/store/api/businessQueryApi";
import { DeliveryPolicyOption } from "@/components/details-sections";
import { useAppSelector } from "@/hooks/hooks";
import { useRemoteSelectData } from "@/hooks/useRemoteSelectData";

interface ProductWizardProps {
  onClose: () => void;
  editingProduct?: ProductFormData | null;
  selectedProduct?: any;
  isOpen?: boolean;
  product?: any;
  refetch?: any;
}

export default function CreateProductWizard({
  onClose,
  refetch,
  product,
}: ProductWizardProps) {
  const { t } = useTranslation("products");
  const [searchParams] = useSearchParams();
  const { dmoId, authorityId } = useAppSelector((state) => state.auth);

  const productId = searchParams?.get("productId");

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
      !product?.businessId
        ? {
            locale: language,
            limit: 20,
            dmoId,
            authorityId,
          }
        : skipToken,
    );

  const [getBusinessList] = useLazyGetBusinessForProductQuery();

  const {
    items: businesses,
    search: searchBusiness,
    isSearching,
  } = useRemoteSelectData({
    initialData: product?.businessId
      ? [product?.businessId]
      : businessData?.data,
    debounceMs: 400,
    searchParams: {
      locale: language,
      dmoId,
      authorityId,
    },
    lazySearch: async (params) => {
      const res = await getBusinessList(params).unwrap();
      return { data: res.data };
    },
  });

  const [getBusinessDelivery] = useLazyGetBusinessDeliveryInfoByIdQuery();

  // const { data: product } = useGetProductbyIdQuery(
  //   productId ? { productId: productId } : skipToken,
  // );

  const [businessId, setBusinessId] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSameAsBusiness, setIsSameAsBusiness] = useState(false);
  const [galleryImages, setGalleryImages] = useState<TImages>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFormLanguage, setSelectedFormLanguage] =
    useState<Language>("en");

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
  }, [isSameAsBusiness, businessId]);

  useEffect(() => {
    if (!productId || !product) return;

    setFormData({
      // setp-1: basic info
      businessId: product?.businessId?._id || "",
      name: product.name || "",
      nameHe: product.nameHe || "",
      nameAr: product.nameAr || "",

      shortDescription: product.shortDescription || "",
      shortDescriptionHe: product.shortDescriptionHe || "",
      shortDescriptionAr: product.shortDescriptionAr || "",

      fullDescription: product.fullDescription || "",
      fullDescriptionHe: product.fullDescriptionHe || "",
      fullDescriptionAr: product.fullDescriptionAr || "",

      // step-2: Attributes
      categories: product.categories || [],
      subCategories: product.subCategories || [],

      //step-3: pricing, stock & dates
      markedPrice: product.price?.markedPrice || "",
      sellingPrice: product.price?.sellingPrice || "",
      quantity: product.quantity?.remaining || "",
      isUnlimited: product.quantity?.isUnlimited || false,

      startDate: product.startDate || "",
      endDate: product.endDate || "",

      // setp-4: images
      images: product?.images || null,
      additionalImages: product.additionalImages || [],

      // setp-5:  delivery / service
      enableHomeDelivery: product.enableHomeDelivery || false,
      enableStorePickup: product.enableStorePickup || false,
      serviceDuration: product.serviceDuration || "",

      vendorDelivers: product?.vendorDelivers ?? false,
      pickupAvailable: product?.isPickUpAvailable ?? false,
      deliveryArea: product?.deliveryArea ?? [],
      deliveryReturnExchange: product?.deliveryReturnExchange ?? [],
      deliveryAdditionalInfo: product?.deliveryAdditionalInfo ?? "",
      deliverySpecificSellerInfo: product?.deliverySpecificSellerInfo ?? [],
    });
    setGalleryImages(product?.images);
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
        if (!formData.name) newErrors.nameEn = t("field_required");
        if (!formData.shortDescription)
          newErrors.shortDescEn = t("field_required");
        break;
      case 2:
        if (formData.categories.length === 0)
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

    toast.success(t("Product created succesfully"));
    refetch();
    onClose();
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

    categories: formData.categories,
    subCategories: formData?.subCategories,

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
      if (!productId) {
        const res = await initProductCreate({ businessId }).unwrap();
        internalProductId = res?.id;
      }

      // Only send payload for the current step
      const payload = stepPayloadMap;
      if (!payload || !Object.keys(payload).length) return;

      // 4️⃣ Update product
      const res = await updateProduct({
        productId: internalProductId || productId!,
        body: payload,
      }).unwrap();

      toast.success(
        res?.message ?? (isPublish ? "Product published" : "Draft saved"),
      );
    } catch (error: any) {
      // setIsSaving(false);
      toast.error(error?.message || t("something_went_wrong"));
    }
  };

  const renderStepContent = () => {
    const commonProps = {
      t,
      formData,
      setFormData,
      errors,
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
          <ProductBasicInfo {...commonProps} setBusinessId={setBusinessId} />
        );
      case 2:
        return <ProductAttributes {...commonProps} />;
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
            {productId ? t("edit_product") : t("create_product")}
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
