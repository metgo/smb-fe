import { useEffect, useState } from "react";
import {
  X,
  Check,
  Image as ImageIcon,
  Globe,
  Package,
  Truck,
  Eye,
} from "lucide-react";
import {
  ProductAttributes,
  ProductBasicInfo,
  ProductDeliveryService,
  ProductMedia,
  ProductMultilingualContent,
  ProductPricingAvailability,
  ProductReviewSubmit,
} from "./sub-components";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/hooks/hooks";
import { WizardFooter } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { toast } from "sonner";
import {
  useInitProductCreateMutation,
  useUpdateProductMutation,
} from "@/store/api/productMutationApi";
import { skipToken } from "@reduxjs/toolkit/query";

import { useGetbusinessForProductQuery } from "@/store/api/businessQueryApi";
import { useSearchParams } from "react-router-dom";
import { useGetProductbyIdQuery } from "@/store/api/productQueryApi";
import { useImagesUpload } from "@/hooks/useImagesUpload";
import { ModalWrapper } from "@/components/wrapper";
import { useSingleImageUpload } from "@/hooks/useSingleImageUpload";

interface ProductWizardProps {
  onClose: () => void;
  editingProduct?: ProductFormData | null;
  preSelectedBusinessName?: string | null;
  productId: string;
  setProductId: (v: string) => void;
  selectedProduct?: any;
  currentView: string;
}

export default function CreateProductWizard({
  onClose,
  editingProduct,
  productId,
  setProductId,
  currentView,
}: ProductWizardProps) {
  const { t, i18n } = useTranslation("products");
  const { theme } = useAppSelector((state) => state.settings);

  const language = i18n.language as Language;

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFormLanguage, setSelectedFormLanguage] = useState<
    "en" | "he" | "ar"
  >("en");
  // const [isSaving, setIsSaving] = useState(false); // unused but kept
  const [isPublishing, _setIsPublishing] = useState(false); // unused but kept
  const [_isPublishBtnClicked, setIsPublishBtnClicked] = useState(false);
  //image
  const [galleryImages, setGalleryImages] = useState<TImages>([]);
  const [_logoGcsUrl, setLogoGcsUrl] = useState<string>("");
  const [productLogoImage, setProductLogoImage] = useState<IImage | null>(null);

  const { data: businessData, isLoading: isBusinessesLoading } =
    useGetbusinessForProductQuery({});
  const businesses = businessData?.data?.slice(0, 10);
  // const preSelectedBusinessId = preSelectedBusinessName
  //   ? businesses?.find((b) => b.name === preSelectedBusinessName)?.id || ""
  //   : "";
  const [searchParams] = useSearchParams();

  const productIdParam = searchParams.get("productId");
  const { data: product } = useGetProductbyIdQuery(
    productIdParam ? { productId: productId } : skipToken,
  );
  console.log("🚀 ~ CreateProductWizard ~ productId:", productId);

  console.log("🚀 ~ CreateProductWizard ~ product:", product);
  const [businessId, setBusinessId] = useState("");

  const {
    images,
    imagesRef,
    primaryImageIndex,
    handleImageUpload,
    uploadAll,
    setPrimaryImage,
    // setImages,
    deleteTarget,
    setDeleteTarget,
    confirmDelete,
    isImageDeleting,
    handleDeleteImage,
  } = useImagesUpload({
    initialImages: galleryImages,
    onChange: setGalleryImages,
  });
  const {
    image: logoImage,
    handleImageSelect: handleLogoImageSelect,
    uploadImage: uploadLogoImage,
    confirmDelete: confirmDeleteLogo,
    deleteTarget: deleteTargetLogo,
    setDeleteTarget: setDeleteTargetLogo,
    isImageDeleting: isLogoImageDeleting,
    handleDeleteImage: handleDeleteLogoImage,
  } = useSingleImageUpload({
    initialImage: productLogoImage?.image,
    onChange: setProductLogoImage,
  });
  const [formData, setFormData] = useState<any>(
    editingProduct || {
      businessId: businessId,
      name: "",
      nameHe: "",
      nameAr: "",
      shortDescription: "",
      shortDescriptionHe: "",
      shortDescriptionAr: "",
      fullDescription: "",
      type: "",
      categories: [],
      markedPrice: "",
      sellingPrice: "",
      quantity: "",
      isUnlimited: false,
      startDate: "",
      endDate: "",
      logo: null as IImage | null,
      images: null as TImages | null,
      additionalImages: [],
      enableHomeDelivery: false,
      enableStorePickup: false,
      deliveryFee: "",
      deliveryTime: "",
      serviceDuration: "",
      serviceLocation: "",
    },
  );

  useEffect(() => {
    if (!productId || currentView !== "edit" || !product) return;

    setFormData({
      // basic info
      businessId: product.businessId || "",
      name: product.name || "",
      nameHe: product.nameHe || "",
      nameAr: product.nameAr || "",

      shortDescription: product.shortDescription || "",
      shortDescriptionHe: product.shortDescriptionHe || "",
      shortDescriptionAr: product.shortDescriptionAr || "",
      fullDescription: product.fullDescription || "",

      type: product.productType || "",
      categories: product.categories || [],

      // pricing & stock
      markedPrice: product.price?.markedPrice || "",
      sellingPrice: product.price?.sellingPrice || "",
      quantity: product.quantity?.remaining || "",
      isUnlimited: product.quantity?.isUnlimited || false,

      // dates
      startDate: product.startDate || "",
      endDate: product.endDate || "",

      // images
      logo: product?.logo?.image,
      images: product?.images || null,
      additionalImages: product.additionalImages || [],

      // delivery / service
      enableHomeDelivery: product.enableHomeDelivery || false,
      enableStorePickup: product.enableStorePickup || false,
      deliveryFee: product.deliveryFee || "",
      deliveryTime: product.deliveryTime || "",
      serviceDuration: product.serviceDuration || "",
      serviceLocation: product.serviceLocation || "",
    });
    setGalleryImages(product?.images);
    setProductLogoImage({ image: product?.logo?.image });
  }, [currentView, productId, product]);

  console.log("edit form data", product?.images);
  const availableCategories = [
    "Food & Dining",
    "Accommodation",
    "Tours & Activities",
    "Shopping",
    "Wellness & Spa",
    "Entertainment",
  ];

  const {
    bgSecondary,
    bgTertiary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    hoverBg,
  } = useThemeClasses();

  const [initProductCreate, { isLoading: isCreating }] =
    useInitProductCreateMutation();
  const [updateProduct, { isLoading: isSaving }] = useUpdateProductMutation();
  const steps = [
    { number: 1, title: t("product_basic_info"), icon: Package },
    { number: 2, title: t("product_type_category"), icon: Package },
    { number: 3, title: t("product_pricing"), icon: Package },
    { number: 4, title: t("product_media"), icon: ImageIcon },
    { number: 5, title: t("product_multilingual"), icon: Globe },
    { number: 6, title: t("product_delivery_service"), icon: Truck },
    { number: 7, title: t("product_review"), icon: Eye },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    switch (step) {
      case 1:
        if (!formData.businessId) newErrors.businessId = t("field_required");
        if (!formData.name) newErrors.name = t("field_required");
        if (!formData.shortDescription)
          newErrors.shortDescEn = t("field_required");
        break;
      case 2:
        if (!formData.type) newErrors.type = t("field_required");
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
        if (!formData.images) newErrors.images = t("upload_at_least_one_image");
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSaveDraft = async () => {
    const logoUrl = await uploadLogoImage();
    setLogoGcsUrl(logoUrl);
    await uploadAll();
    await saveDraft(false);
  };

  const handleNext = async () => {
    if (currentStep === 4) {
      const logoUrl = await uploadLogoImage();
      setLogoGcsUrl(logoUrl);
      await uploadAll();
    }
    setCurrentStep((prev) => prev + 1);

    handleSaveDraft();
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handlePublish = async () => {
    setIsPublishBtnClicked(true);

    await saveDraft(true);
    toast.success(t("business created succesfully"));

    onClose();
  };
  // Last saved timestamp
  const [_lastSaved, setLastSaved] = useState<Date | null>(null);

  // Draft Save Payload per Step
  const stepPayloadMap: Record<number, any> = {
    1: {
      businessId: formData.businessId,
      name: formData.name,

      shortDescription: formData.shortDescription,
      description: formData.fullDescription,
    },
    2: {
      productType: formData.type,
      categories: formData.categories,
    },
    3: {
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
    },
    4: {
      // logo: { image: logoGcsUrl },
      images: galleryImages,
    },
    5: {
      nameHe: formData.nameHe,
      shortDescriptionHe: formData.shortDescriptionHe,

      nameAr: formData.nameAr,
      shortDescriptionAr: formData.shortDescriptionAr,
    },
    6: {
      // enableHomeDelivery: formData.enableHomeDelivery,
      // enableStorePickup: formData.enableStorePickup,
      // deliveryFee: formData.deliveryFee,
      // deliveryTime: formData.deliveryTime,
      // serviceDuration: formData.serviceDuration,
      // serviceLocation: formData.serviceLocation,
    },
  };
  console.log("formData product", formData);
  // Auto-save draft function
  const saveDraft = async (isPublish = false) => {
    try {
      let internalProductId;

      // 1️⃣ Initialize product if not created yet
      if (!productId) {
        const res = await initProductCreate({ businessId }).unwrap();
        internalProductId = res?.id;
        setProductId(res?.id);
      }

      // Only send payload for the current step
      const payload = stepPayloadMap[currentStep];
      if (!payload || !Object.keys(payload).length) return;

      // 4️⃣ Update product
      const res = await updateProduct({
        productId: internalProductId || productId!,
        body: payload,
      }).unwrap();
      console.log(" ~ saveDraft ~ payload:", payload);

      // setIsSaving(true);

      // setIsSaving(false);
      setLastSaved(new Date());

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
      theme,
      language,
      formData,
      setFormData,
      errors,
      selectedFormLanguage,
      setSelectedFormLanguage,
      handleImageUpload,
      availableCategories,
      businesses,
    };
    const mediaProps = {
      theme,
      t,
      errors,
      logoImage,
      handleLogoImageSelect,
      deleteTargetLogo,
      setDeleteTargetLogo,
      isLogoImageDeleting,
      confirmDeleteLogo,
      handleDeleteLogoImage,
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
            isBusinessesLoading={isBusinessesLoading}
          />
        );
      case 2:
        return <ProductAttributes {...commonProps} />;
      case 3:
        return <ProductPricingAvailability {...commonProps} />;
      case 4:
        return <ProductMedia {...mediaProps} {...commonProps} />;
      case 5:
        return <ProductMultilingualContent {...commonProps} />;
      case 6:
        return <ProductDeliveryService {...commonProps} />;
      case 7:
        return <ProductReviewSubmit {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <ModalWrapper onClose={onClose} showSpinner={isCreating || isSaving}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div
          className={`${bgSecondary} rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col`}
        >
          {/* Header */}
          <div
            className={`p-6 border-b ${borderColor} flex items-center justify-between`}
          >
            <div>
              <h2 className={`text-2xl ${textPrimary} mb-1`}>
                {currentView === "edit"
                  ? t("edit_product")
                  : t("create_product")}
              </h2>
              <p className={`text-sm ${textTertiary}`}>
                {t("step")} {currentStep} {t("of")} 7:{" "}
                {steps[currentStep - 1].title}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${hoverBg} ${textSecondary}`}
            >
              <X className="w-5 h-5" />
            </button>
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
                    {/* Icon + connector */}
                    <div className="flex items-center">
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
          <div className="flex-1 overflow-y-auto p-6">
            {renderStepContent()}
          </div>

          <WizardFooter
            currentStep={currentStep}
            totalSteps={7}
            isSaving={isSaving}
            isPublishing={isPublishing}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
          />
        </div>
      </div>
    </ModalWrapper>
  );
}
