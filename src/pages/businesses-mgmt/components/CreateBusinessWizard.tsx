import { useState, useEffect } from "react";
import {
  CheckCircle,
  X,
  MapPin,
  Image as ImageIcon,
  Clock,
  Globe,
  Tag,
  FileText,
  Users,
  Truck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/hooks/hooks";
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
import { toast } from "sonner";

interface CreateBusinessWizardProps {
  onClose: () => void;
  onSave: (data: any) => void;
}

// const USER_ROLE = "admin";

export default function CreateBusinessWizard({
  onClose,
  onSave,
}: CreateBusinessWizardProps) {
  const { t } = useTranslation("businesses");
  const { theme, isRTL } = useAppSelector((state) => state.settings);

  const [currentStep, setCurrentStep] = useState(1);
  const [editData, _setEditData] = useState<any>();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Form State
  const [formData, setFormData] = useState<any>({
    // Step 1
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
    slug: "",
    internalNotes: "",
    categories: [] as string[],

    // Step 2
    email: "",
    phone: "",
    website: "",
    contactPerson: { name: "", email: "", phone: "" },
    preferredChannel: "email",
    collaborators: [] as any[],

    // Step 3
    address: "",
    coordinates: { lat: 31.2518, lng: 34.7913 },

    // Step 4
    primaryCategory: "",
    subcategories: [] as string[],
    tags: [] as string[],
    accessibility: [] as string[],
    groupTypes: [] as string[],
    serviceType: "",

    // Step 5
    logo: null as string | null,
    images: [] as string[],

    // Step 6
    operatingHours: {
      sunday: [{ open: "09:00", close: "18:00" }],
      monday: [{ open: "09:00", close: "18:00" }],
      tuesday: [{ open: "09:00", close: "18:00" }],
      wednesday: [{ open: "09:00", close: "18:00" }],
      thursday: [{ open: "09:00", close: "18:00" }],
      friday: [{ open: "09:00", close: "14:00" }],
      saturday: [] as { open: string; close: string }[],
    },
    vendorDelivers: false,
    pickupAvailable: false,
    deliveryAreas: [] as any[],
    deliveryAdditionalInfo: "",
    deliveryReturnExchange: [] as string[],
    deliverySpecificSellerInfo: [] as string[],

    // Step 8
    onlinePresence: {
      website: "",
      facebook: "",
      instagram: "",
      youtube: "",
      tiktok: "",
    },
  });

  const [errors, _setErrors] = useState<Record<string, string>>({});

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

  // Auto-generate slug
  useEffect(() => {
    if (formData.nameEn && !editData) {
      const slug = formData.nameEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev: any) => ({ ...prev, slug }));
    }
  }, [formData.nameEn, editData]);

  // Draft Save Payload per Step
  const stepPayloadMap: Record<number, any> = {
    1: {
      authority: formData.authority,
      nameEn: formData.nameEn,
      nameHe: formData.nameHe,
      nameAr: formData.nameAr,
      shortDescriptionEn: formData.shortDescriptionEn,
      shortDescriptionHe: formData.shortDescriptionHe,
      shortDescriptionAr: formData.shortDescriptionAr,
      fullDescriptionEn: formData.fullDescriptionEn,
      fullDescriptionHe: formData.fullDescriptionHe,
      fullDescriptionAr: formData.fullDescriptionAr,
      slug: formData.slug,
      internalNotes: formData.internalNotes,
      categories: formData.categories,
    },
    2: {
      email: formData.email,
      phone: formData.phone,
      website: formData.website,
      contactPerson: formData.contactPerson,
      preferredChannel: formData.preferredChannel,
      collaborators: formData.collaborators,
    },
    3: {
      address: formData.address,
      coordinates: formData.coordinates,
    },
    4: {
      primaryCategory: formData.primaryCategory,
      subcategories: formData.subcategories,
      tags: formData.tags,
      accessibility: formData.accessibility,
      groupTypes: formData.groupTypes,
      serviceType: formData.serviceType,
    },
    5: {
      logo: formData.logo,
      images: formData.images,
    },
    6: {
      operatingHours: formData.operatingHours,
    },
    7: {
      vendorDelivers: formData.vendorDelivers,
      pickupAvailable: formData.pickupAvailable,
      deliveryAreas: formData.deliveryAreas,
      deliveryAdditionalInfo: formData.deliveryAdditionalInfo,
      deliveryReturnExchange: formData.deliveryReturnExchange,
      deliverySpecificSellerInfo: formData.deliverySpecificSellerInfo,
    },
    8: {
      onlinePresence: formData.onlinePresence,
    },
  };

  // Auto-save draft
  const handleSaveDraft = async () => {
    try {
      const payload = stepPayloadMap[currentStep];
      if (!payload) return;

      // Simulate API call
      setIsSaving(true);
      setIsSaving(false);
      setLastSaved(new Date());

      toast.success(t("business_saved_as_draft"));
    } catch (error: any) {
      toast.error(error?.message || t("something_went_wrong"));
    }
  };

  const handleNext = () => {
    handleSaveDraft();
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    // Here you can validate all steps before final submit
    onSave({ ...formData, status: "pending" });
  };

  const renderStep = () => {
    const commonProps = { theme, isRTL, t, formData, errors, setFormData };
    switch (currentStep) {
      case 1:
        return <BusinessBasicInfos {...commonProps} canApprove />;
      case 2:
        return <BusinessContactOwership {...commonProps} />;
      case 3:
        return <BusinessLocation {...commonProps} />;
      case 4:
        return <BusinessAttributes {...commonProps} />;
      case 5:
        return <BusinessMedia {...commonProps} />;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className={`w-full max-w-4xl max-h-[90vh] rounded-lg shadow-2xl flex flex-col ${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className={`text-2xl ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}
            >
              {editData ? t("edit_business") : t("create_new_business")}
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === "dark"
                  ? "hover:bg-gray-800 text-gray-400"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 mb-2">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  onClick={() => setCurrentStep(step.number)}
                  className="flex-1 flex items-center gap-2 cursor-pointer"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
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
              );
            })}
          </div>

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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{renderStep()}</div>

        {/* Footer */}
        <WizardFooter
          currentStep={currentStep}
          totalSteps={totalSteps}
          isSaving={isSaving}
          isPublishing={isSaving}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSaveDraft={handleSaveDraft}
          onPublish={handleSubmit}
        />
      </div>
    </div>
  );
}
