import { useState, useEffect, useRef } from "react";
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
  useInitBusinessCreateMutation,
  useUpdateBusinessMutation,
} from "@/store/api/businessMutationApi";
import type { OperatingHours, OpeningHrPayload } from "@/types/openinghours";

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
  // onSave,
}: CreateBusinessWizardProps) {
  const { t } = useTranslation("businesses");
  const { theme, isRTL } = useAppSelector((state) => state.settings);
  const [isPublishing, setIsPublishing] = useState(false);
  const [updateBusiness] = useUpdateBusinessMutation();
  const [initBusinessCreate] = useInitBusinessCreateMutation();
  const [currentStep, setCurrentStep] = useState(1);
  const [editData, _setEditData] = useState<any>();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [selectedDmoId, setSelectDmoId] = useState<string>("");
  const [selectedAuthorityId, setSelectAuthorityId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [_businessId, setBusinessId] = useState<string | null>(null);
  const businessIdRef = useRef<string | null>(null);
  const [selectedGroupTypesId, setGroupTypesId] = useState<string[]>([]);
  const [selectedAccessiblitiesId, setAccessiblitiesId] = useState<string[]>(
    [],
  );
  const [geo, setGeo] = useState<Geo>({ lat: "", lng: "" });
  const [address, setAddress] = useState("");

  console.log("address", address);

  const parseAddress = (address: any) => {
    const parts = address.split(",");

    return {
      location: parts[0]?.trim(), // David HaMelech St 35
      city: parts[1]?.trim(), // Be'er Sheva
      country: parts[2]?.trim(), // Israel
    };
  };

  const addr = parseAddress(address);

  //timedate range
  const transformOperatingHoursToPayload = (
    operatingHours: OperatingHours,
  ): OpeningHrPayload[] => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    return Object.entries(operatingHours).flatMap(
      ([day, ranges]): OpeningHrPayload[] => {
        // Holiday (closed)
        if (ranges.length === 0) {
          return [
            {
              days: day,
              open: `${today}T00:00:00.000Z`,
              close: `${today}T00:00:00.000Z`,
              isHoliday: true,
            },
          ];
        }

        // Open hours
        return ranges.map((range: any) => ({
          days: day,
          open: `${today}T${range.open}:00.000Z`,
          close: `${today}T${range.close}:00.000Z`,
          isHoliday: false,
        }));
      },
    );
  };
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
    // onlinePresence: {
    //   website: "",
    //   facebook: "",
    //   instagram: "",
    //   youtube: "",
    //   tiktok: "",
    // },
    socialMedia: [],
  });

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
      authorityId: formData.authority,
      name: formData.nameEn,
      shortDescription: formData.shortDescriptionEn,
      description: formData.fullDescriptionEn,
      internalNotes: formData.internalNotes,
    },
    2: {
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
    },
    3: {
      address: {
        country: addr.country,
        city: addr.city,
        location: addr.location,
      },
      geoLocation: geo,
    },
    4: {
      primaryCategoryId: formData.primaryCategory,
      // subcategories: formData.subcategories,
      tags: formData.tags,
      accessibilitiesId: selectedAccessiblitiesId,
      groupTypesId: selectedGroupTypesId,
      // serviceType: formData.serviceType,
    },
    5: {
      logo: formData.logo,
      images: formData.images,
    },
    6: {
      openingHrs: transformOperatingHoursToPayload(formData.operatingHours),
    },
    7: {
      // vendorDelivers: formData.vendorDelivers,
      isPickUpAvailable: formData.pickupAvailable,
      deliveryArea: formData.deliveryAreas,
      deliveryAdditionalInfo: formData.deliveryAdditionalInfo,
      deliveryReturnExchange: formData.deliveryReturnExchange,
      deliverySpecificSellerInfo: formData.deliverySpecificSellerInfo,
    },
    8: {
      socialMedia: formData.socialMedia,
    },
  };
  console.log("address", stepPayloadMap[3]);
  // Auto-save draft
  const handleSaveDraft = async () => {
    try {
      let currentBusinessId = businessIdRef.current;
      if (!currentBusinessId) {
        const initRes = await initBusinessCreate().unwrap();
        console.log("Business ID", currentBusinessId);
        if (!initRes?.id) return;

        currentBusinessId = initRes.id;
        businessIdRef.current = initRes.id;

        setBusinessId(currentBusinessId);
      }
      const payload = stepPayloadMap[currentStep];
      console.log("PATCH payload", payload);

      if (!payload) return;
      // Update business
      const res = await updateBusiness({
        body: payload,
        businessId: currentBusinessId!,
      }).unwrap();
      setIsSaving(false);
      setLastSaved(new Date());

      toast.success(res?.message ?? t("business_saved_as_draft"));
    } catch (error: any) {
      toast.error(error?.message || t("something_went_wrong"));
    }
  };
  console.log("form data busienss", formData);
  const handleNext = async () => {
    await handleSaveDraft();
    handleSaveDraft();
    if (currentStep < totalSteps) setCurrentStep((prev) => prev + 1);
  };
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.nameEn.trim()) newErrors.nameEn = t("required_field");
        if (!formData.shortDescriptionEn.trim())
          newErrors.shortDescriptionEn = t("required_field");
        if (!formData.fullDescriptionEn.trim())
          newErrors.fullDescriptionEn = t("required_field");
        if (formData.nameEn.length < 3) newErrors.nameEn = t("field_too_short");
        break;
      case 2:
        if (!formData.email.trim()) newErrors.email = t("required_field");
        if (!formData.phone.trim()) newErrors.phone = t("required_field");
        break;
      case 3:
        if (!formData.geoLocation)
          newErrors.geoLocation = "Gelocation is required";
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
  const handlePublish = async () => {
    setIsPublishing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsPublishing(false);
    toast.success(t("business created succesfully"));
    onClose();
  };
  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // const handleSubmit = () => {
  //   // Here you can validate all steps before final submit
  //   onSave({ ...formData, status: "pending" });
  // };

  const renderStep = () => {
    const commonProps = { theme, isRTL, t, formData, errors, setFormData };
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
          isPublishing={isPublishing}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
        />
      </div>
    </div>
  );
}
