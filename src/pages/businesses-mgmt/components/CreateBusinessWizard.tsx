import clsx from "clsx";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
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
  BusinessBasicInfos,
  BusinessContactOwership,
  BusinessLocation,
  // BusinessMedia,
  BusinessOnlinePresence,
  BusinessOpeningHours,
  BusinessReviewSubmit,
} from "./sub-components";
import { ConfirmDialog, WizardFooter } from "@/components/shared";
import { ModalWrapper } from "@/components/wrapper";
import { useImagesUpload } from "@/hooks/useImagesUpload";
import { useSingleImageUpload } from "@/hooks/useSingleImageUpload";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useBusinessDraftSaver } from "../hooks/useBusinessDraftSaver";
import { modelTitle, parseAddress, removeNulls } from "@/helpers";
import { useCreateWebsiteAccessItemMutation } from "@/store/api/commonMutationApi";
import PublishButton from "@/components/btns/PublishButton";
import {
  Attributes,
  DeliveryPolicyOption,
} from "@/components/details-sections";
import { IOpMode } from "@/enums/operation.types";
import Media from "@/components/details-sections/Media";

interface CreateBusinessWizardProps {
  onClose: () => void;
  editData?: any;
  refetch?: any;
  opMode?: TOpMode;
}

export default function CreateBusinessWizard({
  onClose,
  editData,
  refetch,
  opMode = IOpMode.CREATE,
}: CreateBusinessWizardProps) {
  const { t } = useTranslation("businesses");
  const { t: tt } = useTranslation("toast");
  const { t: tc } = useTranslation("common");

  const { theme, isRTL } = useAppSelector((state) => state.settings);
  const { textPrimary, textTertiary } = useThemeClasses();
  const [createWebsiteAccessItem] = useCreateWebsiteAccessItemMutation();

  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublishBtnClicked, setIsPublishBtnClicked] = useState(false);
  const [isDraftBtnClicked, setIsDraftBtnClicked] = useState(false);
  const [showClosePopup, setShowClosePopup] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [lastSaved, _setLastSaved] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [selectedDmoId, setSelectedDmoId] = useState<string>("");
  const [selectedAuthorityId, setSelectAuthorityId] = useState<string>("");
  const [businessId, setBusinessId] = useState<string>("");
  const [selectedGroupTypesId, setGroupTypesId] = useState<string[]>([]);
  const [selectedAccessiblitiesId, setAccessiblitiesId] = useState<string[]>(
    [],
  );
  const [geo, setGeo] = useState<Geo>({ lat: "", lng: "" });
  const [address, setAddress] = useState("");

  // Business Media States
  const [galleryImages, setGalleryImages] = useState<TImages>([]);
  const [logoGcsUrl, setLogoGcsUrl] = useState<string>("");
  const [businessLogoImage, setBusinessLogoImage] = useState<IImage | null>(
    null,
  );
  const [websiteVisibilityIds, setWebsiteVisibilityIds] = useState({
    allBlacklistIds: [] as string[],
    selectedBlacklistIds: [] as string[],
    allWhitelistIds: [] as string[],
    selectedWhitelistIds: [] as string[],
  });
  const { userRole, dmoId, authorityId } = useAppSelector(
    (state) => state.auth,
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
    tags: [],
    accessibility: [] as string[],
    groupTypes: [] as string[],
    // subcategories: [] as string[],
    // serviceType: "",

    // Step 5
    logo: null as IImage | null,
    images: null as TImages | null,

    // Step 6
    type: "BUSINESS",
    operatingHours: [],
    vendorDelivers: false,
    pickupAvailable: false,
    deliveryArea: [] as any[],
    deliveryAdditionalInfo: "",
    deliveryReturnExchange: [] as string[],
    deliverySpecificSellerInfo: [] as string[],

    // Step 8
    socialMedia: [],
  });
  const initialFormData = useRef(formData);
  const isFormDirty = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData.current);
  };
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
    initialImage: businessLogoImage?.image,
    onChange: setBusinessLogoImage,
  });

  const [updateBusiness, { isLoading: isSaving }] = useUpdateBusinessMutation();
  const [initBusinessCreate, { isLoading: isCreating }] =
    useInitBusinessCreateMutation();

  const addr = parseAddress(address);

  const totalSteps = 9;

  useEffect(() => {
    if (userRole === "authority") {
      setSelectAuthorityId(authorityId);
      setSelectedDmoId(dmoId);
    }
  }, []);
  useEffect(() => {
    if (businessId === "" || opMode === IOpMode.CREATE) return;

    if (editData && businessId) {
      setFormData({
        //basic info
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
        shortDescriptionHe: editData?.shortDescriptionAr || "",
        shortDescriptionAr: editData?.shortDescriptionHe || "",
        fullDescriptionEn: editData?.description || "",
        fullDescriptionHe: editData?.descriptionAr || "",
        fullDescriptionAr: editData?.descriptionHe || "",
        internalNotes: editData?.internalNotes || "",
        slug: editData?.slug || "",
        //images
        logo: opMode === IOpMode.EDIT ? editData?.logo?.image : "",
        images: opMode === IOpMode.EDIT ? editData?.images : [],
        //location
        type: "BUSINESS",
        vendorDelivers: editData.vendorDelivers ?? false,
        pickupAvailable: editData.isPickUpAvailable ?? false,
        deliveryArea: editData?.deliveryArea ?? [],
        deliveryReturnExchange: editData.deliveryReturnExchange ?? [],
        deliveryAdditionalInfo: editData.deliveryAdditionalInfo ?? "",
        deliverySpecificSellerInfo: editData.deliverySpecificSellerInfo ?? [],
        //contact
        email: editData.busiEmail || "",
        phone: editData.phoneNumber || "",
        contactDetails: {
          name: editData.contactDetails?.name,
          countryCode: editData.contactDetails?.countryCode,
          phone: editData.contactDetails?.phone,
          address: editData.contactDetails?.address,
          email: editData.contactDetails?.email,
          whatsAppCountryCode: editData?.contactDetails?.whatsAppCountryCode,
          whatsAppNumber: editData?.contactDetails?.whatsAppNumber,
          prefferedChannel: editData?.contactDetails?.prefferedChannel,
        },
        operatingHours: editData?.openingHrs,
        //attributes
        primaryCategory: editData?.primaryCategoryId || "",
        tags: editData?.tagsId || [],
      });
      setAccessiblitiesId(removeNulls(editData?.accessibilitiesId));
      setGroupTypesId(removeNulls(editData?.groupTypesId));

      // Set geo location
      if (editData?.geoLocation) {
        setGeo({
          lat: String(editData.geoLocation.lat),
          lng: String(editData.geoLocation.lng),
        });
      }

      // Set formatted address
      if (editData?.address) {
        const formatted = [
          editData.address.location,
          editData.address.city,
          editData.address.country,
        ]
          .filter(Boolean)
          .join(", ");

        setAddress(formatted);
      }

      setSelectAuthorityId(editData?.authorityId?._id || "");
      setSelectedDmoId(editData?.dmoId?._id || "");

      if (opMode === IOpMode.EDIT) {
        setGalleryImages(editData?.images);
        setBusinessLogoImage({ image: editData?.logo?.image });
      } else {
        setGalleryImages([]);
        setBusinessLogoImage(null);
      }
    }
  }, [editData, opMode, businessId]);

  const steps = [
    { number: 1, title: t("step_basic_info"), icon: FileText },
    { number: 2, title: t("step_contact_ownership"), icon: Users },
    { number: 3, title: t("step_location"), icon: MapPin },
    { number: 4, title: t("step_attributes"), icon: Tag },
    { number: 5, title: t("step_media"), icon: ImageIcon },
    { number: 6, title: t("step_operating_hours"), icon: Clock },
    { number: 7, title: t("step_delivery_policy"), icon: Truck },
    { number: 8, title: t("step_online_info"), icon: Globe },
    { number: 9, title: t("step_review_submit"), icon: CheckCircle },
  ];

  // Draft Save Payload per Step
  const stepPayloadMap = {
    // step 1:
    authorityId: selectedAuthorityId,
    // dmoId: selectedDmoId,
    name: formData.nameEn,
    nameAr: formData.nameAr,
    nameHe: formData.nameHe,
    shortDescription: formData.shortDescriptionEn,
    shortDescriptionAr: formData.shortDescriptionAr,
    shortDescriptionHe: formData.shortDescriptionHe,
    description: formData.fullDescriptionEn,
    descriptionAr: formData.fullDescriptionAr,
    descriptionHe: formData.fullDescriptionHe,
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
    tagsId: formData.tags.map((tag: any) => ({
      en: tag.en,
      he: tag.he,
      ar: tag.ar,
    })),
    accessibilitiesId: removeNulls(selectedAccessiblitiesId),
    groupTypesId: removeNulls(selectedGroupTypesId),
    // subcategories: formData.subcategories,
    // serviceType: formData.serviceType,
    //  step 5
    logo: editData ? businessLogoImage : { image: logoGcsUrl },
    images: galleryImages,
    //  step 6
    openingHrs: formData.operatingHours,
    // step 7
    // vendorDelivers: formData.vendorDelivers,
    isPickUpAvailable: formData.pickupAvailable,
    deliveryArea: formData.deliveryArea,
    deliveryAdditionalInfo: formData.deliveryAdditionalInfo,
    deliveryReturnExchange: formData.deliveryReturnExchange,
    deliverySpecificSellerInfo: formData.deliverySpecificSellerInfo,
    // step 8
    socialMedia: formData.socialMedia,
  };

  const { markDirty, saveDraft } = useBusinessDraftSaver({
    opMode,
    onClose,
    refetch,
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
      case 2: {
        if (formData.email?.trim() === "") {
          newErrors.email = t("required_field");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (formData.email && !emailRegex.test(formData.email.trim())) {
          newErrors.email = t("invalid_email_format");
        }
        if (formData.phone?.trim() === "")
          newErrors.phone = t("required_field");
        break;
      }

      case 3:
        if (!addr.location) {
          newErrors.address = t("required_field");
        }
        break;

      case 4:
        if (formData.primaryCategory?.trim() === "") {
          newErrors.primaryCategory = t("primary_category_required");
        }
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
    // if (!validateStep(currentStep) && isPublishBtnClicked) return;
    if (currentStep === 5) {
      const logoUrl = await uploadLogoImage();
      setLogoGcsUrl(logoUrl);
      await uploadAll();
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSaveDraft = async () => {
    setIsDraftBtnClicked(true);
    const logoUrl = await uploadLogoImage();
    setLogoGcsUrl(logoUrl);
    await uploadAll();
    await saveDraft(false);
    if (businessId) {
      await createWebsiteAccessItem({
        body: websiteAccessItemPayload,
        itemId: businessId,
      });
    }
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
    if (!allValid) {
      toast.error(tt("fill_all_fields"));
      return;
    }

    setIsPublishing(true);
    if (businessId) {
      await createWebsiteAccessItem({
        body: websiteAccessItemPayload,
        itemId: businessId,
      });
    }
    await saveDraft(true);
    setIsPublishing(false);
  };

  useEffect(() => {
    if (opMode !== IOpMode.CREATE) {
      setBusinessId(editData?._id);
    }
  }, [opMode, businessId]);

  const websiteAccessItemPayload = {
    blacklist: {
      allItems: websiteVisibilityIds.allBlacklistIds,
      selectedItems: websiteVisibilityIds.selectedBlacklistIds,
    },
    whitelist: {
      allItems: websiteVisibilityIds.allWhitelistIds,
      selectedItems: websiteVisibilityIds.selectedWhitelistIds,
    },
    purpose: "business",
  };
  const renderStep = () => {
    const commonProps = {
      theme,
      isRTL,
      t,
      formData,
      errors,
      setCurrentStep,
      address,
      geo,
      setFormData,
      markDirty,
      images,
      business: editData,
      opMode,
    };
    const mediaProps = {
      theme,
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
            businessId={businessId}
            selectedDmoId={selectedDmoId}
            setSelectDmoId={setSelectedDmoId}
            selectedAuthorityId={selectedAuthorityId}
            setSelectAuthorityId={setSelectAuthorityId}
            websiteVisibilityIds={websiteVisibilityIds}
            setWebsiteVisibilityIds={setWebsiteVisibilityIds}
            businessAssociatedWebsites={editData?.associatedWebsites ?? []}
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
          <Attributes
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
      case 5:
        return <Media {...mediaProps} business={editData} isBusiness={true} />;
      case 6:
        return <BusinessOpeningHours {...commonProps} />;
      case 7:
        return <DeliveryPolicyOption {...commonProps} />;
      case 8:
        return <BusinessOnlinePresence {...commonProps} />;
      case 9:
        return (
          <BusinessReviewSubmit
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
      {/* Header */}
      <div className={clsx("px-6 py-4 border-b", textPrimary)}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={clsx("text-2xl", textPrimary)}>
              {modelTitle(opMode, tc)} {t("business")}
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

      <ConfirmDialog
        open={showClosePopup}
        title={tt("unsaved_changes")}
        message={tt("close_without_saving")}
        confirmText={tt("close")}
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
