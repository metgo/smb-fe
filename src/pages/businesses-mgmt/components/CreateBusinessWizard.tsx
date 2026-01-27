import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle,
  MapPin,
  Image as ImageIcon,
  Clock,
  Globe,
  Tag,
  FileText,
  Users,
  Truck,
} from "lucide-react";

import { useAppSelector } from "@/hooks/hooks";
import {
  useInitBusinessCreateMutation,
  useUpdateBusinessMutation,
} from "@/store/api/businessMutationApi";

import {
  BusinessAttributes,
  BusinessBasicInfos,
  BusinessContactOwership,
  BusinessDeliveryPolicy,
  BusinessLocation,
  BusinessMedia,
  BusinessOnlinePresence,
  BusinessOpeningHours,
  BusinessReviewSubmit,
} from "./sub-components";
import { WizardFooter } from "@/components/shared";
import { ModalWrapper } from "@/components/wrapper";
import { useImagesUpload } from "@/hooks/useImagesUpload";
import { useSingleImageUpload } from "@/hooks/useSingleImageUpload";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import clsx from "clsx";
import { PublishButton } from "@/components/btns";
import { useBusinessDraftSaver } from "../hooks/useBusinessDraftSaver";
import { useGetbusinessBySlugQuery } from "@/store/api/businessQueryApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useSearchParams } from "react-router-dom";
type View = "list" | "details" | "create" | "edit" | undefined;

interface CreateBusinessWizardProps {
  onClose: () => void;
  currentView?: View;
  selectedBusiness?: any;
}

export default function CreateBusinessWizard({
  onClose,
  currentView,
}: CreateBusinessWizardProps) {
  const { t } = useTranslation("businesses");
  const { theme, isRTL } = useAppSelector((state) => state.settings);
  const { textPrimary, textTertiary } = useThemeClasses();
  const [searchParams] = useSearchParams();

  const businessSlug = searchParams.get("businessSlug");
  const { data: business } = useGetbusinessBySlugQuery(
    businessSlug ? { slug: businessSlug } : skipToken,
  );
  // Form State
  const [formData, setFormData] = useState<any>({
    // Step 1
    id: "",
    authority: "",
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
    categories: [] as string[],

    // Step 2
    email: "",
    phone: "",
    contactDetails: { name: "", email: "", phone: "" },
    preferredChannel: "email",
    collaborators: [] as any[],

    // Step 3
    address: "",
    coordinates: { lat: "", lng: "" },

    // Step 4
    primaryCategory: "",
    // subcategories: [] as string[],
    tags: [] as string[],
    accessibility: [] as string[],
    groupTypes: [] as string[],
    // serviceType: "",

    // Step 5
    logo: null as IImage | null,
    images: null as TImages | null,

    // Step 6
    operatingHours: [
      { day: "sunday", open: "09:00", close: "18:00" },
      { day: "monday", open: "09:00", close: "18:00" },
      { day: "tuesday", open: "09:00", close: "18:00" },
      { day: "wednesday", open: "09:00", close: "18:00" },
      { day: "thursday", open: "09:00", close: "18:00" },
      { day: "friday", open: "09:00", close: "14:00" },
    ],
    vendorDelivers: false,
    pickupAvailable: false,
    deliveryAreas: [] as any[],
    deliveryAdditionalInfo: "",
    deliveryReturnExchange: [] as string[],
    deliverySpecificSellerInfo: [] as string[],

    // Step 8
    socialMedia: [],
  });

  useEffect(() => {
    if (currentView === "edit") {
      setFormData({
        logo: business?.logo?.image,
        images: business?.images,
      });
    }
  }, [business]);
  console.log("formdata iages", formData.images);
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
    initialImages: formData.images,
    onChange: (images) =>
      setFormData((prev: any) => ({
        ...prev,
        images,
      })),
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
    initialImage: formData?.logo,
    onChange: (img) => {
      setFormData((prev: any) => ({
        ...prev,
        logo: img,
      }));
    },
  });
  const [updateBusiness, { isLoading: isSaving }] = useUpdateBusinessMutation();
  const [initBusinessCreate, { isLoading: isCreating }] =
    useInitBusinessCreateMutation();

  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublishBtnClicked, setIsPublishBtnClicked] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  // const [editData, _setEditData] = useState<any>();
  const [lastSaved, _setLastSaved] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [selectedDmoId, setSelectDmoId] = useState<string>("");
  const [selectedAuthorityId, setSelectAuthorityId] = useState<string>("");
  const [businessId, setBusinessId] = useState<string>("");
  const [selectedGroupTypesId, setGroupTypesId] = useState<string[]>([]);
  const [selectedAccessiblitiesId, setAccessiblitiesId] = useState<string[]>(
    [],
  );
  const [geo, setGeo] = useState<Geo>({ lat: "", lng: "" });
  const [address, setAddress] = useState("");

  const parseAddress = (address: any) => {
    const parts = address.split(",");

    return {
      location: parts[0]?.trim(), // David HaMelech St 35
      city: parts[1]?.trim(), // Be'er Sheva
      country: parts[2]?.trim(), // Israel
    };
  };

  const addr = parseAddress(address);

  const totalSteps = 9;

  const steps = [
    { number: 1, title: t("step_basic_info"), icon: FileText },
    { number: 2, title: t("step_contact_ownership"), icon: Users },
    { number: 3, title: t("step_location"), icon: MapPin },
    { number: 4, title: t("step_categories_attributes"), icon: Tag },
    { number: 5, title: t("step_media"), icon: ImageIcon },
    { number: 6, title: t("step_operating_hours"), icon: Clock },
    { number: 7, title: t("step_delivery_policy"), icon: Truck },
    { number: 8, title: t("step_online_info"), icon: Globe },
    { number: 9, title: t("step_review_submit"), icon: CheckCircle },
  ];

  // Draft Save Payload per Step
  const stepPayloadMap = {
    // step 1:
    authorityId: formData.authority,
    name: formData.nameEn,
    shortDescription: formData.shortDescriptionEn,
    description: formData.fullDescriptionEn,
    internalNotes: formData.internalNotes,
    // step 2
    busiEmail: formData.email,
    phoneNumber: formData.phone,
    contactDetails: {
      name: formData.contactDetails?.name,
      countryCode: formData.contactDetails?.countryCode,
      phone: formData.contactDetails?.phone,
      address: formData.contactDetails?.address,
      email: formData.contactDetails?.email,
      whatsAppCountryCode: formData.contactDetails?.whatsAppCountryCode,
      whatsAppNumber: formData.contactDetails?.whatsAppNumber,
      prefferedChannel: formData.contactDetails?.prefferedChannel,
    },
    //  step 3
    address: {
      country: addr.country,
      city: addr.city,
      location: addr.location,
    },
    geoLocation: geo,
    //  step 4
    primaryCategoryId: formData.primaryCategory,
    // subcategories: formData.subcategories,
    tags: formData.tags,
    accessibilitiesId: selectedAccessiblitiesId,
    groupTypesId: selectedGroupTypesId,
    // serviceType: formData.serviceType,
    //  step 5
    logo: formData.logo,
    images: formData.images,
    //  step 6
    openingHrs: formData.operatingHours,
    // step 7
    // vendorDelivers: formData.vendorDelivers,
    isPickUpAvailable: formData.pickupAvailable,
    deliveryArea: formData.deliveryAreas,
    deliveryAdditionalInfo: formData.deliveryAdditionalInfo,
    deliveryReturnExchange: formData.deliveryReturnExchange,
    deliverySpecificSellerInfo: formData.deliverySpecificSellerInfo,
    // step 8
    socialMedia: formData.socialMedia,
  };

  const { markDirty, saveDraft } = useBusinessDraftSaver({
    currentStep,
    businessId,
    setBusinessId,
    initBusinessCreate,
    updateBusiness,
    stepPayloadMap,
  });

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.nameEn?.trim()) newErrors.nameEn = t("required_field");
        if (!formData.shortDescriptionEn?.trim())
          newErrors.shortDescriptionEn = t("required_field");
        if (!formData.fullDescriptionEn?.trim())
          newErrors.fullDescriptionEn = t("required_field");
        if (formData.nameEn?.length < 3)
          newErrors.nameEn = t("field_too_short");
        break;
      case 2:
        if (!formData.email?.trim()) newErrors.email = t("required_field");
        if (!formData.phone?.trim()) newErrors.phone = t("required_field");
        break;
      case 3:
        if (addr?.city === undefined) {
          newErrors.address = t("required_field");
        }
        break;
      case 4:
        if (!formData.primaryCategory) {
          newErrors.primaryCategory = t("primary_category_required");
        }
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep) && isPublishBtnClicked) return;
    if (currentStep === 5) {
      await uploadLogoImage();
      await uploadAll();
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSaveDraft = async () => {
    await uploadLogoImage();
    await uploadAll();
    saveDraft(false);
  };

  const handlePublish = async () => {
    setIsPublishBtnClicked(true);
    // Validate all steps
    let allValid = true;
    for (let i = 1; i <= 5; i++) {
      if (!validateStep(i)) {
        allValid = false;
        setCurrentStep(i);
        break;
      }
    }
    if (currentView !== "edit") {
      if (!allValid) {
        toast.error(t("fix_errors_before_proceeding"));
        return;
      }
    }

    setIsPublishing(true);
    saveDraft(true);
    setIsPublishing(false);
    toast.success(t("business created succesfully"));
    onClose();
  };

  useEffect(() => {
    if (currentView === "edit") {
      setBusinessId(business?._id);
    }
  }, [currentView]);

  const renderStep = () => {
    const commonProps = {
      theme,
      isRTL,
      t,
      formData,
      errors,
      setFormData,
      markDirty,
      business,
      currentView,
    };
    const mediaProps = {
      theme,
      t,
      errors,
      markDirty,
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
          <BusinessBasicInfos
            {...commonProps}
            canApprove
            selectedDmoId={selectedDmoId}
            setSelectDmoId={setSelectDmoId}
            selectedAuthorityId={selectedAuthorityId}
            setSelectAuthorityId={setSelectAuthorityId}
          />
        );
      case 2:
        return <BusinessContactOwership {...commonProps} />;
      case 3:
        return (
          <BusinessLocation
            {...commonProps}
            geo={geo}
            setGeo={setGeo}
            address={address}
            setAddress={setAddress}
          />
        );
      case 4:
        return (
          <BusinessAttributes
            {...commonProps}
            selectedAccessiblitiesId={selectedAccessiblitiesId}
            setAccessiblitiesId={setAccessiblitiesId}
            selectedGroupTypesId={selectedGroupTypesId}
            setGroupTypesId={setGroupTypesId}
          />
        );
      case 5:
        return <BusinessMedia {...mediaProps} business={business} />;
      case 6:
        return <BusinessOpeningHours {...commonProps} />;
      case 7:
        return <BusinessDeliveryPolicy {...commonProps} />;
      case 8:
        return <BusinessOnlinePresence {...commonProps} />;
      case 9:
        return <BusinessReviewSubmit {...commonProps} errors={errors} />;
      default:
        return null;
    }
  };

  return (
    <ModalWrapper onClose={onClose} showSpinner={!isCreating || isSaving}>
      {/* Header */}
      <div className={clsx("px-6 py-4 border-b", textPrimary)}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={clsx("text-2xl", textPrimary)}>
              {currentView === "edit"
                ? t("edit_business")
                : t("create_new_business")}
            </h2>
            <p
              className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
            >
              {t("step")} {currentStep} {t("of")} {totalSteps}:{" "}
              {steps[currentStep - 1].title}
            </p>

            {lastSaved && (
              <p
                className={`text-xs mt-2 ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}
              >
                {t("saved")} {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>
          <PublishButton onClick={handlePublish} isLoading={isPublishing} />
        </div>

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
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
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

                  {/* Connecting Line */}
                  {step.number < totalSteps && (
                    <div
                      className={`flex-1 h-1 rounded ${
                        step.number < currentStep
                          ? "bg-green-600"
                          : theme === "dark"
                            ? "bg-gray-800"
                            : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>

                {/* Step Title Below */}
                <div className="mt-1">
                  <span
                    className={`text-xs block text-center md:block text-nowrap overflow-hidden ${textTertiary}`}
                  >
                    {step.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">{renderStep()}</div>

      {/* Footer */}
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
    </ModalWrapper>
  );
}
