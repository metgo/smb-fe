import clsx from "clsx";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Calendar,
  Users,
  Ticket,
  Image,
  FileText,
  CheckCircle,
  Loader,
  Mail,
  Languages,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  ConfirmDialog,
  WizardFooter,
  WizardStepper,
} from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";

import {
  useInitEventCreateMutation,
  useUpdateEventMutation,
} from "@/store/api/eventMutationApi";
import {
  EventBasicInformation,
  EventDateTimeFormat,
  EventRegistrationCapacity,
  EventReviewPublish,
  EventTickets,
  NotificationsTimeline,
} from "./sub-components";
import { ModalWrapper } from "@/components/wrapper";
import { useEventDraftSaver } from "../hooks/useEventDraftSaver";
import ProductTranslateButton from "@/pages/products-mgmt/components/sub-components/ProductTranslateButton";
import { useFilesUpload } from "@/hooks/useFilesUpload";
import { PublishButton } from "@/components/btns";
import { formatToBackendTemplate } from "@/helpers/formatter";
import { useCreateWebsiteAccessItemMutation } from "@/store/api/commonMutationApi";
import { useGetAllTicketQuery } from "@/store/api/eventQueryApi";
import {
  useGetBusinessForProductQuery,
  useLazyGetBusinessForProductQuery,
} from "@/store/api/businessQueryApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useAppSelector } from "@/hooks/hooks";
import { useRemoteSelectData } from "@/hooks/useRemoteSelectData";
import Media from "@/components/details-sections/Media";

interface CreateEventWizardProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
  refetch?: () => void;
  eventDataRefetch?: () => void;
}

export default function CreateEventWizard({
  isOpen,
  onClose,
  editData,
  refetch,
  eventDataRefetch,
}: CreateEventWizardProps) {
  const { t } = useTranslation("events");
  const { t: tc } = useTranslation("toast");
  const { t: tp } = useTranslation("common");

  const [searchParams] = useSearchParams();
  const { textPrimary, textTertiary, isDark, language } = useThemeClasses();
  const { userRole, dmoId, authorityId } = useAppSelector(
    (state) => state.auth,
  );

  const editId = searchParams.get("eventId");
  const [eventId, setEventId] = useState<string>(editId || "");
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");

  const { data: initialBusinessData, isLoading: isBusinessesLoading } =
    useGetBusinessForProductQuery({
      locale: language,
      limit: 20,
      dmoId,
      authorityId,
    });

  const [getBusinessList] = useLazyGetBusinessForProductQuery();

  const list = initialBusinessData?.data || [];
  const initialBusinesses = (() => {
    if (editData?.businessId) {
      const editBiz = {
        _id: editData.businessId._id,
        name: editData.businessId.name ?? "",
        slug: "",
      };
      const alreadyInList = list.some((b: any) => b._id === editBiz._id);
      return alreadyInList ? list : [editBiz, ...list];
    }
    return list;
  })();

  const {
    items: businesses,
    search: searchBusiness,
    isSearching: isBusinessSearching,
  } = useRemoteSelectData({
    initialData: initialBusinesses,
    debounceMs: 400,
    searchParams: { dmoId, locale: language, authorityId },
    lazySearch: async (params) => {
      const res = await getBusinessList(params).unwrap();
      return { data: res.data };
    },
  });

  const { data: tickets, refetch: ticketRefetch } = useGetAllTicketQuery(
    eventId ? { eventId } : skipToken,
  );
  const [updateEvent, { isLoading: isEventUpdating }] =
    useUpdateEventMutation();
  const [initEventCreate, { isLoading: isEventCreating }] =
    useInitEventCreateMutation();
  const [createWebsiteAccessItem, { isLoading: isWebsiteAccessItemCreating }] =
    useCreateWebsiteAccessItemMutation();

  const [currentStep, setCurrentStep] = useState(1);

  const [isPublishBtnClicked, setIsPublishBtnClicked] = useState(false);
  const [isDraftBtnClicked, setIsDraftBtnClicked] = useState(false);
  const [showClosePopup, setShowClosePopup] = useState(false);
  const [hasFormChanges, setHasFormChanges] = useState(false);
  const initialImagesCountRef = useRef(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [eventDaysForTickets, setEventDaysForTickets] = useState<EventDay[]>(
    [],
  );
  const [localTickets, setLocalTickets] = useState([]);

  // Step 1: Basic Information
  const [selectedDmoId, setSelectDmoId] = useState<string>("");
  const [selectedAuthorityId, setSelectAuthorityId] = useState<string>("");
  const [eventName, setEventName] = useState("");
  const [eventNameHe, setEventNameHe] = useState("");
  const [eventNameAr, setEventNameAr] = useState("");

  const [shortDescription, setShortDescription] = useState("");
  const [shortDescriptionHe, setShortDescriptionHe] = useState("");
  const [shortDescriptionAr, setShortDescriptionAr] = useState("");

  const [fullDescription, setFullDescription] = useState("<p></p>");
  const [fullDescriptionHe, setFullDescriptionHe] = useState("<p></p>");
  const [fullDescriptionAr, setFullDescriptionAr] = useState("<p></p>");

  const [eventLanguage, setEventLanguage] = useState<Language>("en");
  const [eventStatus, setEventStatus] = useState<EventStatus>("draft");
  const [internalNotes, setInternalNotes] = useState("");
  const [selectedSubCategoriesId, setSubCategoriesId] = useState<string[]>([]);
  const [selectedGroupTypesId, setGroupTypesId] = useState<string[]>([]);
  const [selectedAccessiblitiesId, setAccessiblitiesId] = useState<string[]>(
    [],
  );
  const [websiteVisibilityIds, setWebsiteVisibilityIds] = useState({
    allBlacklistIds: [] as string[],
    selectedBlacklistIds: [] as string[],
    allWhitelistIds: [] as string[],
    selectedWhitelistIds: [] as string[],
  });

  // Step 2: Date, Time & Format
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [eventDays, setEventDays] = useState<EventDay[]>([
    { id: "", date: "", startTime: "9:30", endTime: "14:30", description: "" },
  ]);
  const [eventFormat, setEventFormat] = useState<
    "physical" | "online" | "hybrid"
  >("physical");
  const [address, setAddress] = useState("");
  const [onlineLink, setOnlineLink] = useState("");
  const [geo, setGeo] = useState<Geo>({ lat: "", long: "" });

  const [isRecurring, setIsRecurring] = useState(false);

  const [recurrencePattern, setRecurrencePattern] =
    useState<RecurrencePattern>("weekly");
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]); // 0=Sun, 1=Mon, etc.
  const [monthlyType, setMonthlyType] = useState<TMonthlyType>("SPECIFIC_DATE"); // By date or by day
  const [recurrenceEndType, setRecurrenceEndType] =
    useState<RecurrenceEndType>("count");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
  const [recurrenceEndCount, setRecurrenceEndCount] = useState(10);
  const [specificDate, setSpecificDate] = useState<number>(1);
  const [relativeDate, setRelativeDate] = useState<number>(1);
  const [relativeDay, setRelativeDay] = useState<string>("sun");
  const [customInterval, setCustomInterval] = useState<number>(1);
  const [customUnit, setCustomUnit] = useState<string>("day");

  // Step 3: Registration & Capacity
  const [registrationRequired, setRegistrationRequired] = useState(true);
  const [capacityType, setCapacityType] = useState<"unlimited" | "limited">(
    "limited",
  );
  const [capacity, setCapacity] = useState(100);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

  // Step 4: Tickets
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Step 5: Messaging
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [editingNotification, setEditingNotification] =
    useState<NotificationData | null>(null);

  // Step 6: Media
  const [eventImages, setEventImages] = useState<TImages>([]);
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
    initialImages: eventImages,
    onChange: setEventImages,
    onImagesChange: eventId
      ? (updatedImages) => {
          updateEvent({ eventId, body: { images: updatedImages } as any });
        }
      : undefined,
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps: IWizardStep[] = [
    { number: 1, icon: FileText, title: t("step_1_basic_information") },
    { number: 2, icon: Languages, title: tp("translation") },
    { number: 3, icon: Calendar, title: t("step_2_date_time") },
    { number: 4, icon: Users, title: t("step_3_registration") },
    { number: 5, icon: Ticket, title: t("step_4_tickets") },
    { number: 6, icon: Mail, title: t("messaging") },
    { number: 7, icon: Image, title: t("step_5_media") },
    { number: 8, icon: CheckCircle, title: t("step_6_review") },
  ];

  useEffect(() => {
    if (userRole === "authority") {
      setSelectAuthorityId(authorityId);
      setSelectDmoId(dmoId);
    }
  }, []);

  useEffect(() => {
    if (tickets && (eventId || editId)) setLocalTickets(tickets);
  }, [tickets, editData, eventId, editId]);

  // Reset all state when wizard closes or opens in create mode
  useEffect(() => {
    if (isOpen && !editId) {
      // Reset to initial state
      setEventId("");
      setCurrentStep(1);
      setEventName("");
      setEventNameHe("");
      setEventNameAr("");
      setIsPublishBtnClicked(false);
      setShortDescription("");
      setShortDescriptionHe("");
      setShortDescriptionAr("");
      setFullDescription("");
      setFullDescriptionHe("");
      setFullDescriptionAr("");
      setSelectedBusinessId("");
      setEventLanguage("en");
      setEventStatus("draft");
      setInternalNotes("");
      setIsMultiDay(false);
      setStartDate("");
      setSelectedWeekdays([]);
      setEventDays([
        {
          id: "1",
          date: "",
          startTime: "09:00",
          endTime: "17:00",
          description: "",
        },
      ]);
      setEventFormat("physical");
      setAddress("");
      setOnlineLink("");
      setRegistrationRequired(true);
      setCapacityType("limited");
      setCapacity(100);
      setCustomQuestions([]);
      setErrors({});
      setLastSaved(null);
      // setSelectAuthorityId("");
      // setSelectDmoId("");
      setSubCategoriesId([]);
      setGroupTypesId([]);
      setAccessiblitiesId([]);
      setEventImages([]);
      setNotifications([]);
      setLocalTickets([]);
      setHasFormChanges(false);
      initialImagesCountRef.current = 0;
    }
  }, [isOpen, editId]);

  useEffect(() => {
    if (editData && editId) {
      setHasFormChanges(false);
      initialImagesCountRef.current = editData?.images?.length ?? 0;

      // Basic information
      setEventName(editData?.name);
      setEventNameHe(editData?.nameHe);
      setEventNameAr(editData?.nameAr);
      setShortDescription(editData?.shortDescription);
      setShortDescriptionHe(editData?.shortDescriptionHe);
      setShortDescriptionAr(editData?.shortDescriptionAr);

      setFullDescription(editData?.description);
      setFullDescriptionHe(editData?.descriptionHe);
      setFullDescriptionAr(editData?.descriptionAr);
      setSelectedBusinessId(editData?.businessId?._id);
      setEventStatus(editData?.status.toLowerCase());
      setAccessiblitiesId(editData?.accessibilitiesId);
      setGroupTypesId(editData?.groupTypesId);
      setSubCategoriesId(editData?.subCategoriesId);
      setInternalNotes(editData?.internalNotes);
      setSelectAuthorityId(editData?.authorityId || "");
      setSelectDmoId(editData?.dmoId || "");
      setSelectedBusinessId(editData?.businessId?._id || "");

      // Date & Time
      setIsMultiDay(editData?.dayDescription?.length > 1);
      setEventDays(editData?.dayDescription);
      setStartDate(editData?.dayDescription?.[0]?.date || "");
      setGeo({
        lat: editData?.geoLocation?.lat,
        long: editData?.geoLocation?.long,
      });
      setEventFormat(editData?.eventType?.toLowerCase());
      setRecurrencePattern(
        editData?.recurringEventRuleId?.pattern?.toLowerCase() || "weekly",
      );
      setSelectedWeekdays(editData?.recurringEventRuleId?.daysOfWeek || []);
      setMonthlyType(editData?.recurringEventRuleId?.monthlyType);
      setSpecificDate(editData?.recurringEventRuleId?.specificDate || 1);
      setRelativeDate(editData?.recurringEventRuleId?.relativeDate || 1);
      setRelativeDay(editData?.recurringEventRuleId?.relativeDay || "sun");
      setCustomInterval(editData?.recurringEventRuleId?.customInterval || 1);
      setCustomUnit(
        editData?.recurringEventRuleId?.customUnit?.toLowerCase() || "day",
      );
      setRecurrenceEndDate(editData?.recurringEventRuleId?.endDate || "");
      setRecurrenceEndCount(
        editData?.recurringEventRuleId?.occurrenceLimit || 10,
      );
      setAddress(editData?.address?.location || "");
      setOnlineLink(editData?.onlineLink || "");

      // Registration
      setRegistrationRequired(editData?.registration?.isRegistration);
      setCapacity(editData?.registration?.capacity);
      setCapacityType(
        editData?.registration?.isUnlimited ? "unlimited" : "limited",
      );
      setCustomQuestions(editData?.customQuestions);

      // Media
      setEventImages(editData?.images);

      // Message shedule nofitications
      const notification = editData?.scheduledNotificationId?.map(
        (item: any, index: number) => ({
          _id: item?._id,
          index,
          channels: {
            email: item?.channels?.includes("EMAIL"),
            sms: item?.channels?.includes("SMS"),
            whatsapp: item?.channels?.includes("WHATSAPP"),
          },
          hoursBeforeEvent: item?.sendHoursBefore,
          language: item?.language,
          template: item?.template,
          subject: item?.customTemplate?.subject,
          message: item?.customTemplate?.body,
          enabled: item.status === "ACTIVE" ? true : false,
        }),
      );
      setNotifications(notification);
    }
  }, [editData, editId]);

  useEffect(() => {
    if (isMultiDay) {
      setEventDaysForTickets(eventDays);
    } else {
      setEventDaysForTickets([
        {
          id: "1",
          date: startDate,
          startTime: eventDays[0]?.startTime,
          endTime: eventDays[0]?.endTime,
          description: "",
        },
      ]);
    }
  }, [startDate, eventDays, isMultiDay]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!selectedDmoId?.trim()) newErrors.dmoId = t("required_field");
        if (
          !eventName?.trim() &&
          !eventNameHe?.trim() &&
          !eventNameAr?.trim()
        ) {
          newErrors.eventName = t("required_field");
        }

        if (
          !shortDescription?.trim() &&
          !shortDescriptionHe?.trim() &&
          !shortDescriptionAr?.trim()
        ) {
          newErrors.shortDescription = t("required_field");
        }
        break;
      case 3:
        if (!isMultiDay && !startDate)
          newErrors.startDate = t("required_field");
        if (isMultiDay && eventDays?.some((d) => !d.date))
          newErrors.dates = "All dates required";
        if (eventFormat !== "online" && !address)
          newErrors.address = t("required_field");
        if (eventFormat !== "physical" && !onlineLink)
          newErrors.onlineLink = t("required_field");
        break;
      case 4:
        if (capacityType === "limited" && capacity <= 0)
          newErrors.capacity = "Must be greater than 0";
        break;
      case 5:
        if (localTickets?.length === 0 && registrationRequired) {
          newErrors.tickets = t("at_least_one_ticket_required");
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const websiteAccessItemPayload = {
    blacklist: {
      allItems: websiteVisibilityIds.allBlacklistIds,
      // Send websites that are UNCHECKED (to add to blacklist/hide)
      // In this section: CHECK = show, UNCHECK = hide
      selectedItems: websiteVisibilityIds.allBlacklistIds.filter(
        (id: string) => !websiteVisibilityIds.selectedBlacklistIds.includes(id),
      ),
    },
    whitelist: {
      allItems: websiteVisibilityIds.allWhitelistIds,
      // Send ONLY explicitly checked websites from unassociated section
      // Associated section manages visibility via blacklist only
      selectedItems: websiteVisibilityIds.selectedWhitelistIds,
    },
    purpose: "event",
  };

  const eventBasicInfoPayload = {
    name: eventName,
    nameHe: eventNameHe,
    nameAr: eventNameAr,

    // Short Description
    shortDescription: shortDescription,
    shortDescriptionHe: shortDescriptionHe,
    shortDescriptionAr: shortDescriptionAr,

    // Full Description
    description: fullDescription,
    descriptionHe: fullDescriptionHe,
    descriptionAr: fullDescriptionAr,
    authorityId: selectedAuthorityId,
    dmoId: selectedDmoId,
    businessId: selectedBusinessId,
    status: eventStatus?.toUpperCase(),
    groupTypesId: selectedGroupTypesId,
    accessibilitiesId: selectedAccessiblitiesId,
    subCategoriesId: selectedSubCategoriesId,
    internalNotes: internalNotes,
  };

  const eventDateTimePayload = {
    dayDescription: eventDays?.map((item) => ({
      date: isMultiDay ? item.date : startDate,
      startTime: item.startTime,
      endTime: item.endTime,
    })),
    geoLocation: { lat: geo.lat, long: geo.long },
    recurringEventRule: {
      pattern: recurrencePattern?.toUpperCase(),
      daysOfWeek: selectedWeekdays,
      monthlyType: monthlyType?.toUpperCase(),
      specificDate,
      relativeDate,
      relativeDay,
      customInterval,
      customUnit: customUnit?.toUpperCase(),
      endType: "END_DATE",
      occurrenceLimit: recurrenceEndCount,
      endDate: recurrenceEndDate,
    },
    eventType: eventFormat?.toUpperCase(),
    address: {
      country: "",
      city: "",
      location: address,
      additional_information: "",
    },
    onlineLink: onlineLink,
  };
  const eventRegistrationPayload = {
    registration: {
      isRegistration: registrationRequired,
      noOfPeople: capacity,
      isUnlimited: capacityType === "limited" ? false : true,
    },
    customQuestions: customQuestions,
  };

  const eventMsgSchedulePayload = {
    scheduledNotifications: notifications?.map((item) => {
      const base = {
        ...(!item.index ? { _id: item._id } : {}),

        sendHoursBefore: item.hoursBeforeEvent,

        channels: [
          item.channels?.email && "EMAIL",
          item.channels?.sms && "SMS",
          item.channels?.whatsapp && "WHATSAPP",
        ].filter(Boolean) as ("EMAIL" | "SMS" | "WHATSAPP")[],

        language: item.language,
        template: item.template,
        status: item.enabled ? "ACTIVE" : "INACTIVE",
      };

      if (item.template === "custom") {
        return {
          ...base,
          customTemplate: {
            subject: item.subject,
            body: formatToBackendTemplate(item.message),
          },
        };
      } else {
        return base;
      }
    }),
  };

  const eventMediaPayload = {
    images: eventImages,
  };

  const stepPayloadMap = {
    1: () => eventBasicInfoPayload,
    2: () => eventBasicInfoPayload,
    3: () => eventDateTimePayload,
    4: () => eventRegistrationPayload,
    6: () => eventMsgSchedulePayload,
    7: () => eventMediaPayload,
  };
  const { markDirty, saveDraft } = useEventDraftSaver({
    currentStep,
    eventId,
    setEventId,
    initEventCreate,
    updateEvent,
    stepPayloadMap,
    businessId: selectedBusinessId,
  });

  const handleMarkDirty = useCallback(
    (step: number) => {
      setHasFormChanges(true);
      markDirty(step);
    },
    [markDirty],
  );

  useEffect(() => {
    if (images.length) {
      handleMarkDirty(7);
    }
  }, [images, handleMarkDirty]);

  const translationFormData = {
    name: eventName,
    nameHe: eventNameHe,
    nameAr: eventNameAr,
    shortDescription,
    shortDescriptionHe,
    shortDescriptionAr,
    fullDescription,
    fullDescriptionHe,
    fullDescriptionAr,
  };

  const handleTranslateChange = useCallback(
    (updates: Record<string, any>) => {
      if ("name" in updates) setEventName(updates.name);
      if ("nameHe" in updates) setEventNameHe(updates.nameHe);
      if ("nameAr" in updates) setEventNameAr(updates.nameAr);
      if ("shortDescription" in updates)
        setShortDescription(updates.shortDescription);
      if ("shortDescriptionHe" in updates)
        setShortDescriptionHe(updates.shortDescriptionHe);
      if ("shortDescriptionAr" in updates)
        setShortDescriptionAr(updates.shortDescriptionAr);
      if ("fullDescription" in updates)
        setFullDescription(updates.fullDescription);
      if ("fullDescriptionHe" in updates)
        setFullDescriptionHe(updates.fullDescriptionHe);
      if ("fullDescriptionAr" in updates)
        setFullDescriptionAr(updates.fullDescriptionAr);
      handleMarkDirty(2);
    },
    [handleMarkDirty],
  );

  const handleClose = () => {
    const hasImageChanges = images.length !== initialImagesCountRef.current;
    if (
      (hasFormChanges || hasImageChanges) &&
      !isPublishBtnClicked &&
      !isDraftBtnClicked
    ) {
      setShowClosePopup(true);
      return;
    }

    onClose();
  };
  const handleNext = async () => {
    if (!validateStep(currentStep) && isPublishBtnClicked) return;
    setCurrentStep((prev) => prev + 1);
  };

  const handleSaveDraft = async () => {
    if (!eventName?.trim() && !eventNameHe?.trim() && !eventNameAr?.trim()) {
      toast.error(tc("name_required"));
      return;
    }

    setIsDraftBtnClicked(true);
    const resolvedEventId = await saveDraft(false);
    if (resolvedEventId) {
      await createWebsiteAccessItem({
        body: websiteAccessItemPayload,
        itemId: resolvedEventId,
      });
    }
    if (refetch) {
      refetch();
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handlePublish = async () => {
    let allValid = true;
    setIsPublishBtnClicked(true);
    for (let i = 1; i <= 8; i++) {
      if (!validateStep(i)) {
        allValid = false;
        setCurrentStep(i);
        break;
      }
    }

    if (!allValid) {
      toast.error(tc("fill_all_fields"));
      return;
    }
    setIsPublishing(true);
    const resolvedEventId = await saveDraft(true);
    if (resolvedEventId) {
      await createWebsiteAccessItem({
        body: websiteAccessItemPayload,
        itemId: resolvedEventId,
      });
      await Promise.all([refetch?.(), eventDataRefetch?.()]);
    }
    setIsPublishing(false);
    toast.success(tc("event_published"));
    onClose();
  };

  const addEventDay = () => {
    setEventDays([
      ...eventDays,
      {
        id: Date.now().toString(),
        date: "",
        startTime: "09:00",
        endTime: "17:00",
        description: "",
      },
    ]);
  };

  const removeEventDay = (id: string) => {
    setEventDays(eventDays.filter((d) => d.id !== id));
  };

  const handleSpecificStepJump = (stepId: number) => {
    if (stepId !== 7) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
    setCurrentStep(stepId);
  };

  const addCustomQuestion = () => {
    setCustomQuestions([
      ...customQuestions,
      {
        id: Date.now().toString(),
        label: "",
        type: "text",
        required: false,
      },
    ]);
  };

  const toggleWeekday = (day: string) => {
    if (selectedWeekdays.includes(day)) {
      setSelectedWeekdays(selectedWeekdays.filter((d) => d !== day));
    } else {
      setSelectedWeekdays([...selectedWeekdays, day].sort());
    }
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper
      onClose={handleClose}
      showSpinner={
        isEventCreating || isEventCreating || isWebsiteAccessItemCreating
      }
    >
      {/* Header */}
      <div
        className={clsx(
          "flex items-center justify-between p-6 border-b w-full",
          isDark ? "border-gray-800" : "border-gray-200",
        )}
      >
        {/* Title */}
        <div className="">
          <h2 className={`text-2xl ${textPrimary}`}>
            {editId ? t("edit_event") : t("create_new_event")}
          </h2>
          <p className={`text-sm mt-1 ${textTertiary}`}>
            {t("step")} {currentStep} {t("step_of")} {steps?.length}:{" "}
            {steps[currentStep - 1].title}
          </p>
        </div>

        {/* Publish button */}
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className={`text-xs ${textTertiary}`}>
              {isEventCreating || isEventUpdating ? (
                <span className="flex items-center gap-1">
                  <Loader className="w-3 h-3 animate-spin" />
                  {t("saving")}
                </span>
              ) : (
                `${t("saved")} ${lastSaved.toLocaleTimeString()}`
              )}
            </span>
          )}
          <PublishButton onClick={handlePublish} isLoading={isPublishing} />
        </div>
      </div>

      <div className=" w-full px-4">
        <WizardStepper
          steps={steps}
          currentStep={currentStep}
          totalSteps={steps.length}
          onStepClick={handleSpecificStepJump}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {currentStep === 2 && (
          <ProductTranslateButton
            formData={translationFormData}
            onChange={handleTranslateChange}
          />
        )}
        {currentStep === 1 && (
          <EventBasicInformation
            formData={translationFormData}
            onChange={handleTranslateChange}
            searchBusiness={searchBusiness}
            eventId={eventId}
            markDirty={handleMarkDirty}
            internalNotes={internalNotes}
            setInternalNotes={setInternalNotes}
            errors={errors}
            selectedDmoId={selectedDmoId}
            setSelectDmoId={setSelectDmoId}
            selectedAuthorityId={selectedAuthorityId}
            setSelectAuthorityId={setSelectAuthorityId}
            selectedAccessiblitiesId={selectedAccessiblitiesId}
            setAccessiblitiesId={setAccessiblitiesId}
            selectedGroupTypesId={selectedGroupTypesId}
            setGroupTypesId={setGroupTypesId}
            selectedSubCategoriesId={selectedSubCategoriesId}
            setSubCategoriesId={setSubCategoriesId}
            websiteVisibilityIds={websiteVisibilityIds}
            setWebsiteVisibilityIds={setWebsiteVisibilityIds}
            eventAssociatedWebsites={editData?.associatedWebsites ?? []}
            selectedBusinessId={selectedBusinessId}
            setSelectedBusinessId={setSelectedBusinessId}
            businesses={businesses}
            isBusinessLoading={isBusinessesLoading || isBusinessSearching}
          />
        )}
        {currentStep === 3 && (
          <EventDateTimeFormat
            geo={geo}
            setGeo={setGeo}
            isMultiDay={isMultiDay}
            setIsMultiDay={setIsMultiDay}
            startDate={startDate}
            setStartDate={setStartDate}
            eventDays={eventDays}
            setEventDays={setEventDays}
            eventFormat={eventFormat}
            setEventFormat={setEventFormat}
            address={address}
            setAddress={setAddress}
            onlineLink={onlineLink}
            setOnlineLink={setOnlineLink}
            errors={errors}
            addEventDay={addEventDay}
            removeEventDay={removeEventDay}
            isRecurring={isRecurring}
            setIsRecurring={setIsRecurring}
            recurrencePattern={recurrencePattern}
            setRecurrencePattern={setRecurrencePattern}
            toggleWeekday={toggleWeekday}
            selectedWeekdays={selectedWeekdays}
            monthlyType={monthlyType}
            setMonthlyType={setMonthlyType}
            recurrenceEndCount={recurrenceEndCount}
            setRecurrenceEndCount={setRecurrenceEndCount}
            recurrenceEndDate={recurrenceEndDate}
            setRecurrenceEndDate={setRecurrenceEndDate}
            recurrenceEndType={recurrenceEndType}
            setRecurrenceEndType={setRecurrenceEndType}
            setSpecificDate={setSpecificDate}
            specificDate={specificDate}
            relativeDate={relativeDate}
            setRelativeDate={setRelativeDate}
            relativeDay={relativeDay}
            setRelativeDay={setRelativeDay}
            customInterval={customInterval}
            setCustomInterval={setCustomInterval}
            customUnit={customUnit}
            setCustomUnit={setCustomUnit}
            markDirty={handleMarkDirty}
          />
        )}

        {currentStep === 4 && (
          <EventRegistrationCapacity
            markDirty={handleMarkDirty}
            currentStep={currentStep}
            registrationRequired={registrationRequired}
            setRegistrationRequired={setRegistrationRequired}
            capacityType={capacityType}
            setCapacityType={setCapacityType}
            capacity={capacity}
            setCapacity={setCapacity}
            customQuestions={customQuestions}
            setCustomQuestions={setCustomQuestions}
            addCustomQuestion={addCustomQuestion}
          />
        )}

        {currentStep === 5 && (
          <EventTickets
            tickets={localTickets}
            eventId={eventId}
            setEventId={setEventId}
            initEventCreate={() =>
              initEventCreate({ businessId: selectedBusinessId })
            }
            showTicketModal={showTicketModal}
            setShowTicketModal={setShowTicketModal}
            errors={errors}
            refetch={ticketRefetch}
            eventDays={eventDaysForTickets}
          />
        )}

        {currentStep === 6 && (
          <NotificationsTimeline
            markDirty={handleMarkDirty}
            notifications={notifications}
            setNotifications={setNotifications}
            editingNotification={editingNotification}
            setEditingNotification={setEditingNotification}
            showNotificationForm={showNotificationForm}
            setShowNotificationForm={setShowNotificationForm}
            eventLanguage={eventLanguage}
            eventName={eventName}
            startDate={startDate}
            eventDays={eventDays}
            address={address}
            capacity={capacity}
          />
        )}
        {currentStep === 7 && (
          <Media
            images={images}
            imagesRef={imagesRef}
            setPrimaryImage={setPrimaryImage}
            handleImageUpload={handleImageUpload}
            primaryImageIndex={primaryImageIndex}
            deleteTarget={deleteTarget}
            setDeleteTarget={setDeleteTarget}
            confirmDelete={confirmDelete}
            handleDeleteImage={handleDeleteImage}
            isImageDeleting={isImageDeleting}
          />
        )}

        {currentStep === 8 && (
          <EventReviewPublish
            images={images}
            setCurrentStep={setCurrentStep}
            eventName={eventName}
            shortDescription={shortDescription}
            eventLanguage={eventLanguage}
            eventStatus={eventStatus}
            isMultiDay={isMultiDay}
            startDate={startDate}
            eventFormat={eventFormat}
            address={address}
            onlineLink={onlineLink}
            registrationRequired={registrationRequired}
            capacityType={capacityType}
            capacity={capacity}
            customQuestions={customQuestions}
            tickets={localTickets}
          />
        )}
      </div>

      <WizardFooter
        currentStep={currentStep}
        totalSteps={steps?.length}
        isSaving={isEventUpdating}
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
