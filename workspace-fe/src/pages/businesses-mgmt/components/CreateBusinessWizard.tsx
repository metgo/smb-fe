import clsx from "clsx";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle,
  MapPin,
  Image as ImageIcon,
  Clock,
  Compass,
  Globe,
  Tag,
  FileText,
  Users,
  Truck,
} from "lucide-react";

import { TourProvider, TourPortal, useTour } from "@/components/tour";
import type { TourStep } from "@/components/tour";

import { useAppSelector } from "@/hooks/hooks";
import { useCommon } from "@/hooks/useCommon";
import {
  dbCategoryIdForGroup,
  emptySelection,
  groupOfKey,
  selectionFromSaved,
  selectionToBusinessFields,
  type CategorySelection,
} from "@/pages/onboarding/categorySelection";
import {
  useInitBusinessCreateMutation,
  useUpdateBusinessMutation,
} from "@/store/api/businessMutationApi";

import {
  BusinessBasicInfos,
  BusinessContactOwership,
  BusinessLocation,
  BusinessOnlinePresence,
  BusinessOpeningHours,
  BusinessReviewSubmit,
} from "./sub-components";
import {
  ConfirmDialog,
  WizardFooter,
  WizardStepper,
} from "@/components/shared";
import { ModalWrapper } from "@/components/wrapper";
import { useFilesUpload } from "@/hooks/useFilesUpload";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useBusinessDraftSaver } from "../hooks/useBusinessDraftSaver";
import { modelTitle, removeNulls, type ParsedAddressParts } from "@/helpers";
import PublishButton from "@/components/btns/PublishButton";
import {
  Attributes,
  DeliveryPolicyOption,
} from "@/components/details-sections";
import { IOpMode } from "@/enums/operation.types";
import Media from "@/components/details-sections/Media";
import { getPlainText } from "@/components/shared/RichTextEditor";

interface CreateBusinessWizardProps {
  onClose: () => void;
  editData?: any;
  refetch?: any;
  businessDataRefetch?: any;
  opMode?: TOpMode;
  missingFields?: string[];
}

function CreateBusinessWizardInner({
  onClose,
  editData,
  refetch,
  businessDataRefetch,
  opMode = IOpMode.CREATE,
  missingFields = [],
}: CreateBusinessWizardProps) {
  const { t } = useTranslation("businesses");
  const { t: tt } = useTranslation("toast");
  const { t: tc } = useTranslation("common");
  const { t: tr } = useTranslation("tour");
  const [selectedFormLanguage, _setSelectedFormLanguage] =
    useState<Language>("he");
  const { textPrimary, isRTL, isDark, language } = useThemeClasses();

  // ─── Tour ─────────────────────────────────────────────────────────────
  const { startTour } = useTour();

  const buildTourSteps = useCallback(
    (): TourStep[] => [
      {
        id: "welcome",
        placement: "center",
        title: "business_wizard.welcome.title",
        desc: "business_wizard.welcome.desc",
      },
      {
        id: "header",
        target: '[data-tour="wizard-header"]',
        placement: "bottom",
        title: "business_wizard.header.title",
        desc: "business_wizard.header.desc",
      },
      {
        id: "stepper",
        target: '[data-tour="wizard-stepper"]',
        placement: "bottom",
        title: "business_wizard.stepper.title",
        desc: "business_wizard.stepper.desc",
      },
      {
        id: "completion",
        target: '[data-tour="wizard-completion"]',
        placement: "left",
        title: "business_wizard.completion.title",
        desc: "business_wizard.completion.desc",
      },
      {
        id: "content",
        target: '[data-tour="wizard-content"]',
        placement: "top",
        title: "business_wizard.content.title",
        desc: "business_wizard.content.desc",
      },
      {
        id: "footer",
        target: '[data-tour="wizard-footer"]',
        placement: "top",
        title: "business_wizard.footer.title",
        desc: "business_wizard.footer.desc",
      },
    ],
    [],
  );

  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublishBtnClicked, setIsPublishBtnClicked] = useState(false);
  const [isDraftBtnClicked, setIsDraftBtnClicked] = useState(false);
  const [showClosePopup, setShowClosePopup] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<
    "available" | "unavailable" | null
  >(null);

  // When opened from email link with missingFields, start on the step of the first missing field
  const getStepForField = (field: string): number => {
    const stepMap: Record<string, number> = {
      name: 1,
      shortDescription: 1,
      description: 1,
      busiEmail: 3,
      phoneNumber: 3,
      contactDetails: 3,
      contactName: 3,
      address: 4,
      primaryCategoryId: 5,
      tags: 5,
      logo: 6,
      images: 6,
      openingHrs: 7,
      socialMedia: 9,
    };
    return stepMap[field] ?? 1;
  };
  const initialStep =
    missingFields.length > 0 ? getStepForField(missingFields[0]) : 1;

  // Set of step numbers that have missing fields — used to highlight them in the step indicator
  const stepsWithMissingFields = new Set(missingFields.map(getStepForField));

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [lastSaved, _setLastSaved] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [selectedDmoId, setSelectedDmoId] = useState<string>("");
  const [selectedAuthorityId, setSelectAuthorityId] = useState<string>("");
  const [businessId, setBusinessId] = useState<string>("");
  const [selectedGroupTypesId, setGroupTypesId] = useState<string[]>([]);
  const [selectedAccessiblitiesId, setAccessiblitiesId] = useState<string[]>(
    [],
  );
  const [geo, setGeo] = useState<Geo>({ lat: "", long: "" });
  const [address, setAddress] = useState("");
  const [addressParts, setAddressParts] = useState<ParsedAddressParts>({
    location: "",
    city: "",
    country: "",
  });

  // Business Media States
  const [galleryImages, setGalleryImages] = useState<TImages>([]);
  const [deleteTargetLogo, setDeleteTargetLogo] = useState<string | null>(null);
  const [websiteVisibilityIds, setWebsiteVisibilityIds] = useState<string[]>(
    [],
  );
  const { userRole, dmoId, authorityId } = useAppSelector(
    (state) => state.auth,
  );

  const { allWebsites, categories } = useCommon();
  const hasAssociatedWebsites = useMemo(
    () =>
      (allWebsites ?? []).some(
        (site: IWebsite) =>
          (selectedDmoId && site.dmoIds?.includes(selectedDmoId)) ||
          (selectedAuthorityId &&
            site.authorityIds?.includes(selectedAuthorityId)),
      ),
    [allWebsites, selectedDmoId, selectedAuthorityId],
  );

  // Form State
  const [formData, setFormData] = useState<any>({
    // Step 1
    id: "",
    authority: "",
    name: "",
    shortDescription: "",
    fullDescription: "",
    internalNotes: "",
    categories: [] as string[],
    markedAsSupplier: false,

    providesDiscount: false,
    discountConfigType: "" as "" | "DISCOUNT" | "GIFT",
    discountBoxes: [] as string[],

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
    // Areas, subcategories and the main one (two-step taxonomy picker).
    // `tags` then holds only the tags that are not subcategories.
    categorySelection: emptySelection(),
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
    globalDelivery: false,
    deliveryArea: [] as any[],
    vendorDeliveryArea: [] as any[],
    globalDeliveryArea: [] as any[],
    deliveryAdditionalInfo: "",
    deliveryReturnExchange: [] as string[],
    deliverySpecificSellerInfo: [] as string[],

    // Step 8
    socialMedia: [],
  });
  const nameForGen = formData.name;
  const descriptionForGen = formData.fullDescription;

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
  const [updateBusiness, { isLoading: isSaving }] = useUpdateBusinessMutation();
  const [initBusinessCreate, { isLoading: isCreating }] =
    useInitBusinessCreateMutation();

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
      opMode === IOpMode.EDIT
        ? (updatedImages) => {
            const effectiveId = businessId || editData?._id;
            if (effectiveId) {
              updateBusiness({
                language,
                businessId: effectiveId,
                body: { images: updatedImages },
              });
            }
          }
        : undefined,
  });

  const {
    previewUrl: logoPreviewUrl,
    gcsUrl: logoGcsUrl,
    progress: logoProgress,
    status: logoStatus,
    isDeleting: isLogoImageDeleting,
    handleFileSelect: handleLogoImageSelect,
    deleteFile: deleteLogoFile,
    reset: resetLogo,
  } = useFileUpload({
    initialUrl: opMode === IOpMode.EDIT ? editData?.logo?.image : undefined,
    onLogoChange:
      opMode === IOpMode.EDIT
        ? (logoData) => {
            const effectiveId = businessId || editData?._id;
            if (effectiveId) {
              updateBusiness({
                language,
                businessId: effectiveId,
                body: { logo: logoData },
              });
            }
          }
        : undefined,
  });

  const logoImage: IImageUpload | null = logoPreviewUrl
    ? {
        id: 0,
        previewUrl: logoPreviewUrl,
        gcsURL: logoGcsUrl,
        progress: logoProgress,
        status: logoStatus as IImageUpload["status"],
      }
    : null;

  const handleDeleteLogoImage = (img: IImageUpload) => {
    if (img.status !== "success") {
      resetLogo();
      return;
    }
    if (img.gcsURL) setDeleteTargetLogo(img.gcsURL);
  };

  const confirmDeleteLogo = async () => {
    await deleteLogoFile();
    setDeleteTargetLogo(null);
  };

  const addr = addressParts;

  const totalSteps = 9;

  const completionPercent = useMemo(() => {
    const checks = [
      // Basic Info (30%)
      {
        weight: 10,
        filled: !!formData.name?.trim(),
      },
      {
        weight: 10,
        filled: !!formData.shortDescription?.trim(),
      },
      {
        weight: 10,
        filled: !!formData.fullDescription?.trim(),
      },
      // Contact (15%)
      { weight: 8, filled: !!formData.email?.trim() },
      { weight: 7, filled: !!formData.phone?.trim() },
      // Location (15%)
      { weight: 15, filled: !!address?.trim() },
      // Attributes (15%)
      { weight: 10, filled: !!formData.primaryCategory?.trim() },
      { weight: 5, filled: formData.tags?.length > 0 },
      // Media (10%)
      { weight: 5, filled: !!logoPreviewUrl },
      { weight: 5, filled: (images?.length ?? 0) > 0 },
      // Operating Hours (5%)
      { weight: 5, filled: formData.operatingHours?.length > 0 },
      // Online Presence (5%)
      { weight: 5, filled: formData.socialMedia?.length > 0 },
      // Delivery (5%)
      { weight: 5, filled: formData.deliveryArea?.length > 0 },
    ];

    const total = checks.reduce((sum, c) => sum + c.weight, 0);
    const earned = checks.reduce(
      (sum, c) => sum + (c.filled ? c.weight : 0),
      0,
    );
    return Math.round((earned / total) * 100);
  }, [formData, address, images, logoPreviewUrl]);

  useEffect(() => {
    if (userRole === "authority") {
      setSelectAuthorityId(authorityId);
      setSelectedDmoId(dmoId);
    }
  }, []);

  useEffect(() => {
    // For CREATE mode, we don't load from editData
    if (opMode === IOpMode.CREATE) return;

    // Wait until we have both the data and the ID (either from state or from prop)
    const effectiveId = businessId || editData?._id;
    if (editData && effectiveId) {
      const loadedFormData = {
        //basic info
        name:
          opMode === IOpMode.DUPLICATE
            ? `${editData?.nameEn || editData?.name || ""} (Duplicate)`
            : editData?.nameEn || editData?.name || "",

        shortDescription:
          editData?.shortDescriptionEn || editData?.shortDescription || "",
        fullDescription: editData?.descriptionEn || editData?.description || "",
        internalNotes: editData?.internalNotes || "",
        providesDiscount: editData?.providesDiscount ?? false,
        discountConfigType: editData?.discountConfigType ?? "",
        discountBoxes: editData?.discountBoxes ?? [],
        markedAsSupplier: editData?.markedAsSupplier ?? false,
        slug: editData?.slug || "",
        //images
        logo: opMode === IOpMode.EDIT ? editData?.logo?.image : "",
        images: opMode === IOpMode.EDIT ? editData?.images : [],
        //location
        type: "BUSINESS",
        vendorDelivers: editData.vendorDelivers ?? false,
        pickupAvailable: editData.isPickUpAvailable ?? false,
        globalDelivery: editData.globalDelivery ?? false,
        deliveryArea: editData?.deliveryArea ?? [],
        vendorDeliveryArea: editData?.vendorDeliveryArea ?? [],
        globalDeliveryArea: editData?.globalDeliveryArea ?? [],
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
        operatingHours: (() => {
          const dayNormMap: Record<string, string> = {
            sun: "SUN",
            mon: "MON",
            tue: "TUE",
            tues: "TUE",
            wed: "WED",
            thu: "THU",
            thurs: "THU",
            fri: "FRI",
            sat: "SAT",
          };
          const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
          return days.map((day) => {
            const entries = (editData?.openingHrs ?? []).filter((h: any) => {
              const d = (h.day || h.days || "").toLowerCase().trim();
              return dayNormMap[d] === day;
            });
            const first = entries[0];
            const isHoliday = first?.isHoliday || false;
            const byAppointment = first?.byAppointment || false;
            const slots =
              entries.length > 0 && !isHoliday
                ? entries.map((e: any) => ({
                    open: e.open || "",
                    close: e.close || "",
                  }))
                : [{ open: "10:00", close: "17:00" }];
            return { day, slots, isHoliday, byAppointment };
          });
        })(),
        //attributes
        primaryCategory: editData?.primaryCategoryId || "",
        tags: editData?.tagsId || [],
      };
      setFormData(loadedFormData);
      initialFormData.current = loadedFormData;
      const loadedAccessibilities = removeNulls(editData?.accessibilitiesId);
      const loadedGroupTypes = removeNulls(editData?.groupTypesId);
      setAccessiblitiesId(loadedAccessibilities);
      setGroupTypesId(loadedGroupTypes);
      initialAccessibilitiesId.current = loadedAccessibilities;
      initialGroupTypesId.current = loadedGroupTypes;

      // Set geo location
      if (editData?.geoLocation) {
        setGeo({
          lat: String(editData.geoLocation.lat),
          long: String(editData.geoLocation.long),
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
        setAddressParts({
          location: editData.address.location || "",
          city: editData.address.city || "",
          country: editData.address.country || "",
        });
      }

      if (editData?.geoLocation) {
        setGeo({
          lat: String(editData.geoLocation.lat),
          long: String(editData.geoLocation.long),
        });
      }
      setSelectAuthorityId(editData?.authorityId || "");
      setSelectedDmoId(editData?.dmoId || "");
      setWebsiteVisibilityIds(editData?.associatedWebsiteIds || []);

      if (opMode === IOpMode.EDIT) {
        setGalleryImages(editData?.images);
      } else {
        setGalleryImages([]);
      }
    }
  }, [editData, opMode, businessId]);

  // Rebuild the saved category choice once the database categories are in
  // (they may arrive after the business), then keep it until the business,
  // mode or id changes.
  const categoryList = useMemo(
    () => (Array.isArray(categories) ? categories : []),
    [categories],
  );
  const selectionLoadedFor = useRef<unknown[] | null>(null);
  useEffect(() => {
    if (!editData || !categoryList.length) return;
    const key = [editData, opMode, businessId];
    const prev = selectionLoadedFor.current;
    if (prev && prev.every((v, i) => v === key[i])) return;
    selectionLoadedFor.current = key;
    const { selection, otherTags } = selectionFromSaved(
      {
        primaryCategoryId: editData?.primaryCategoryId,
        categoryIds: editData?.bussCategoriesId,
        tags: editData?.tagsId,
      },
      categoryList,
    );
    const patch = { categorySelection: selection, tags: otherTags };
    setFormData((p: any) => ({ ...p, ...patch }));
    if (initialFormData.current) {
      initialFormData.current = { ...initialFormData.current, ...patch };
    }
  }, [editData, opMode, businessId, categoryList]);

  const setCategorySelection = (next: CategorySelection) =>
    setFormData((p: any) => ({
      ...p,
      categorySelection: next,
      primaryCategory:
        dbCategoryIdForGroup(
          groupOfKey(next, next.mainCategory),
          categoryList,
        ) ??
        dbCategoryIdForGroup(next.categoryGroups[0], categoryList) ??
        "",
    }));

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
    dmoId: selectedDmoId,
    associatedWebsiteIds: websiteVisibilityIds,
    name: formData.name,
    shortDescription: formData.shortDescription,
    description: formData.fullDescription,
    internalNotes: formData.internalNotes,
    providesDiscount: formData.providesDiscount,
    ...(formData.providesDiscount &&
      formData.discountConfigType != null && {
        discountConfigType: formData.discountConfigType,
      }),
    ...(formData.providesDiscount &&
      formData.discountBoxes != null && {
        discountBoxes: formData.discountBoxes,
      }),
    // "Mark as supplier" is a superadmin toggle, independent of providesDiscount.
    markedAsSupplier: !!formData.markedAsSupplier,

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
    // Areas -> primaryCategoryId + bussCategoriesId, subcategories -> tags
    // (main first), as the onboarding saves them.
    ...(formData.categorySelection?.categoryGroups?.length
      ? selectionToBusinessFields(
          formData.categorySelection,
          formData.tags ?? [],
          categoryList,
        )
      : { primaryCategoryId: formData.primaryCategory, tagsId: formData.tags }),
    accessibilitiesId: removeNulls(selectedAccessiblitiesId),
    groupTypesId: removeNulls(selectedGroupTypesId),
    // subcategories: formData.subcategories,
    // serviceType: formData.serviceType,
    //  step 5
    logo: { image: logoGcsUrl },
    images: galleryImages,
    //  step 6
    openingHrs: (formData.operatingHours ?? []).flatMap(
      ({ day, slots, isHoliday, byAppointment }: any) =>
        isHoliday || !slots?.length
          ? [{ day, open: "", close: "", isHoliday, byAppointment }]
          : slots.map((slot: any) => ({
              day,
              open: slot.open,
              close: slot.close,
              isHoliday: false,
              byAppointment,
            })),
    ),
    // step 7
    vendorDelivers: formData.vendorDelivers,
    isPickUpAvailable: formData.pickupAvailable,
    globalDelivery: formData.globalDelivery,
    deliveryArea: formData.deliveryArea,
    vendorDeliveryArea: formData.vendorDelivers
      ? formData.vendorDeliveryArea
      : [],
    globalDeliveryArea: formData.globalDelivery
      ? formData.globalDeliveryArea
      : [],
    deliveryAdditionalInfo: formData.deliveryAdditionalInfo,
    deliveryReturnExchange: formData.deliveryReturnExchange,
    deliverySpecificSellerInfo: formData.deliverySpecificSellerInfo,
    // step 8
    socialMedia: formData.socialMedia,
    completionPercent: completionPercent,
  };

  const { markDirty, saveDraft } = useBusinessDraftSaver({
    opMode,
    onClose,
    // refetch,
    currentStep,
    businessId,
    setBusinessId,
    initBusinessCreate,
    updateBusiness,
    stepPayloadMap,
  });

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

  // Validate the optional traveller discount/gift config. Returns an i18n key
  // when invalid, or null when it's fine / disabled.
  const getDiscountError = (): string | null => {
    if (!formData.providesDiscount) return null;

    const { discountConfigType, discountBoxes } = formData;

    if (discountConfigType !== "DISCOUNT" && discountConfigType !== "GIFT") {
      return "traveller_discount_type_required";
    }

    const boxes: string[] = discountBoxes ?? [];

    if (boxes.length !== 6 || boxes.some((box) => !String(box ?? "").trim())) {
      return "traveller_discount_required";
    }

    if (discountConfigType === "DISCOUNT") {
      const hasInvalidRange = boxes.some((box) => {
        const value = Number(box);

        return Number.isNaN(value) || value < 1 || value > 100;
      });

      if (hasInvalidRange) {
        return "traveller_discount_range_invalid";
      }
    }

    if (discountConfigType === "GIFT") {
      const hasMoreThanTwoWords = boxes.some((box) => {
        const words = String(box ?? "")
          .trim()
          .split(/\s+/);

        return words.length > 2;
      });

      if (hasMoreThanTwoWords) {
        return "traveller_gift_max_two_words";
      }
    }

    const normalized = boxes.map((box) =>
      String(box ?? "")
        .trim()
        .toLowerCase(),
    );

    const hasDuplicates = normalized.some(
      (value, index) => normalized.indexOf(value) !== index,
    );

    if (hasDuplicates) {
      return "traveller_discount_duplicate_value";
    }

    return null;
  };

  const handleSaveDraft = async () => {
    if (!formData.name?.trim()) {
      toast.error(tt("name_required"));
      return;
    }
    const draftDiscountError = getDiscountError();
    if (draftDiscountError) {
      setCurrentStep(1);
      toast.error(t(draftDiscountError));
      return;
    }
    if (!formData.shortDescription?.trim()) {
      toast.error(tt("short_description_required"));
      return;
    }
    if (!formData.fullDescription?.trim()) {
      toast.error(tt("full_description_required"));
      return;
    }
    if (hasAssociatedWebsites && !websiteVisibilityIds?.length) {
      setCurrentStep(1);
      setErrors((prev) => ({
        ...prev,
        websiteVisibilityIds: tc("website_visibility_required"),
      }));
      toast.error(tc("website_visibility_required"));
      return;
    }
    setIsDraftBtnClicked(true);
    const resolvedBusinessId = await saveDraft(false);
    if (resolvedBusinessId) {
      // Refetch after save draft completes
      // Don't await to prevent blocking the UI
      if (businessDataRefetch) {
        businessDataRefetch();
      }
    }
  };

  const handlePublish = async () => {
    setIsPublishBtnClicked(true);

    const publishDiscountError = getDiscountError();
    if (publishDiscountError) {
      setCurrentStep(1);
      toast.error(t(publishDiscountError));
      return;
    }

    if ((formData.shortDescription || "").length > 150) {
      setCurrentStep(1);
      toast.error(tc("exceeds_char_limit", { limit: 150 }));
      return;
    }
    if (getPlainText(formData.fullDescription || "").length > 500) {
      setCurrentStep(1);
      toast.error(tc("exceeds_char_limit", { limit: 500 }));
      return;
    }

    if (hasAssociatedWebsites && !websiteVisibilityIds?.length) {
      setCurrentStep(1);
      setErrors((prev) => ({
        ...prev,
        websiteVisibilityIds: tc("website_visibility_required"),
      }));
      toast.error(tc("website_visibility_required"));
      return;
    }

    setIsPublishing(true);
    const resolvedBusinessId = await saveDraft(true, stepPayloadMap);
    if (resolvedBusinessId) {
      await Promise.all([refetch?.(), businessDataRefetch?.()]);
    }
    setIsPublishing(false);
  };

  useEffect(() => {
    if (opMode !== IOpMode.CREATE && editData?._id && businessId === "") {
      setBusinessId(editData._id);
    }
  }, [opMode, editData?._id, businessId]);

  const renderStep = () => {
    const commonProps = {
      isRTL,
      t,
      formData,
      errors,
      setErrors,
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
            setBusinessId={setBusinessId}
            selectedDmoId={selectedDmoId}
            setSelectDmoId={setSelectedDmoId}
            selectedAuthorityId={selectedAuthorityId}
            setSelectAuthorityId={setSelectAuthorityId}
            websiteVisibilityIds={websiteVisibilityIds}
            setWebsiteVisibilityIds={setWebsiteVisibilityIds}
            isEditMode={opMode === IOpMode.EDIT}
            onAvailabilityStatusChange={setAvailabilityStatus}
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
            onAddressParts={setAddressParts}
          />
        );

      case 4:
        return (
          <Attributes
            selectedFormLanguage={selectedFormLanguage}
            editData={editData}
            {...commonProps}
            formData={formData}
            opMode={opMode}
            selectedAccessiblitiesId={selectedAccessiblitiesId}
            setAccessiblitiesId={setAccessiblitiesId}
            selectedGroupTypesId={selectedGroupTypesId}
            setGroupTypesId={setGroupTypesId}
            nameForGen={nameForGen}
            descriptionForGen={descriptionForGen}
            categorySelection={formData.categorySelection ?? emptySelection()}
            onCategorySelectionChange={setCategorySelection}
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
      <div
        data-tour="wizard-header"
        className={clsx("px-4 sm:px-6 py-3 sm:py-4 border-b", textPrimary)}
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h2 className={clsx("text-lg sm:text-2xl truncate", textPrimary)}>
              {modelTitle(opMode, tc)} {t("business")}
            </h2>
            <p
              className={`hidden sm:block text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              {t("step")} {currentStep} {t("of")} {totalSteps}:{" "}
              {steps[currentStep - 1]?.title}
            </p>

            {lastSaved && (
              <p
                className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                {t("saved")} {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Completion ring */}
            <div
              data-tour="wizard-completion"
              className="relative w-10 h-10 sm:w-14 sm:h-14"
            >
              <svg
                className="w-10 h-10 sm:w-14 sm:h-14 -rotate-90"
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
            {/* Tour trigger */}
            <button
              onClick={() => startTour(buildTourSteps())}
              title={tr("start_tour")}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? "border-gray-700 hover:bg-gray-800 text-gray-400 hover:text-teal-400"
                  : "border-gray-300 hover:bg-gray-100 text-gray-500 hover:text-teal-600"
              }`}
            >
              <Compass className="w-4 h-4" />
            </button>
            {availabilityStatus !== "unavailable" && (
              <PublishButton onClick={handlePublish} isLoading={isPublishing} />
            )}
          </div>
        </div>

        <div data-tour="wizard-stepper">
          <WizardStepper
            steps={steps}
            currentStep={currentStep}
            totalSteps={totalSteps}
            stepsWithMissingFields={stepsWithMissingFields}
            onStepClick={setCurrentStep}
          />
        </div>
      </div>

      {/* Missing fields banner — shown when opened via no-auth email link */}
      {missingFields.length > 0 && (
        <div className="px-6 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-sm">
          <span className="font-medium">⚠️ Missing fields: </span>
          {missingFields.join(", ")}
        </div>
      )}

      {/* Content */}
      <div
        data-tour="wizard-content"
        className="flex-1 overflow-y-auto overflow-x-auto p-6"
      >
        {renderStep()}
      </div>

      {/* Footer */}
      <div data-tour="wizard-footer">
        <WizardFooter
          currentStep={currentStep}
          totalSteps={totalSteps}
          isSaving={isSaving || isCreating}
          isPublishing={isPublishing}
          isDisabled={availabilityStatus === "unavailable"}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
        />
      </div>

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

      <TourPortal />
    </ModalWrapper>
  );
}

// ─── Exported component (wraps with its own TourProvider) ─────────────────────

export default function CreateBusinessWizard(props: CreateBusinessWizardProps) {
  return (
    <TourProvider>
      <CreateBusinessWizardInner {...props} />
    </TourProvider>
  );
}
