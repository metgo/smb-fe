import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { skipToken } from "@reduxjs/toolkit/query";

import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useFilesUpload } from "@/hooks/useFilesUpload";
import { useRemoteSelectData } from "@/hooks/useRemoteSelectData";
import { formatToBackendTemplate } from "@/helpers/formatter";
import { useEventDraftSaver } from "../../hooks/useEventDraftSaver";
import {
  useInitEventCreateMutation,
  useUpdateEventMutation,
} from "@/store/api/eventMutationApi";
import {
  useGetBusinessForProductQuery,
  useLazyGetBusinessForProductQuery,
} from "@/store/api/businessQueryApi";
import { useCreateWebsiteAccessItemMutation } from "@/store/api/commonMutationApi";
import { useGetAllTicketQuery } from "@/store/api/eventQueryApi";

interface UseEventWizardStateProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
  refetch?: () => void;
  eventDataRefetch?: () => void;
}

export function useEventWizardState({
  isOpen,
  onClose,
  editData,
  refetch,
  eventDataRefetch,
}: UseEventWizardStateProps) {
  const { t: tc } = useTranslation("toast");
  const { language } = useThemeClasses();
  const { userRole, dmoId, authorityId } = useAppSelector(
    (state) => state.auth,
  );
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("eventId");

  // ─── Navigation ──────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);
  const [showClosePopup, setShowClosePopup] = useState(false);
  const [hasFormChanges, setHasFormChanges] = useState(false);
  const [isPublishBtnClicked, setIsPublishBtnClicked] = useState(false);
  const [isDraftBtnClicked, setIsDraftBtnClicked] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const initialImagesCountRef = useRef(0);

  // ─── IDs ─────────────────────────────────────────────────────────────
  const [eventId, setEventId] = useState<string>(editId || "");
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [selectedDmoId, setSelectDmoId] = useState<string>("");
  const [selectedAuthorityId, setSelectAuthorityId] = useState<string>("");

  // ─── Step 1: Basic Information ───────────────────────────────────────
  const [eventName, setEventName] = useState("");
  const [eventNameHe, setEventNameHe] = useState("");
  const [eventNameAr, setEventNameAr] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [shortDescriptionHe, setShortDescriptionHe] = useState("");
  const [shortDescriptionAr, setShortDescriptionAr] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [fullDescriptionHe, setFullDescriptionHe] = useState("");
  const [fullDescriptionAr, setFullDescriptionAr] = useState("");
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

  // ─── Step 3: Date & Time ─────────────────────────────────────────────
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [eventDays, setEventDays] = useState<EventDay[]>([
    {
      id: "1",
      date: "",
      startTime: "09:00",
      endTime: "17:00",
      description: "",
    },
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
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);
  const [monthlyType, setMonthlyType] = useState<TMonthlyType>("SPECIFIC_DATE");
  const [recurrenceEndType, setRecurrenceEndType] =
    useState<RecurrenceEndType>("count");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
  const [recurrenceEndCount, setRecurrenceEndCount] = useState(10);
  const [specificDate, setSpecificDate] = useState<number>(1);
  const [relativeDate, setRelativeDate] = useState<number>(1);
  const [relativeDay, setRelativeDay] = useState<string>("sun");
  const [customInterval, setCustomInterval] = useState<number>(1);
  const [customUnit, setCustomUnit] = useState<string>("day");

  // ─── Step 4: Registration & Capacity ─────────────────────────────────
  const [registrationRequired, setRegistrationRequired] = useState(true);
  const [capacityType, setCapacityType] = useState<"unlimited" | "limited">(
    "limited",
  );
  const [capacity, setCapacity] = useState(100);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

  // ─── Step 5: Tickets ─────────────────────────────────────────────────
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [localTickets, setLocalTickets] = useState<any[]>([]);
  const [ticketBuyLink, setTicketBuyLink] = useState<null | string>(null);
  const [hasExternalTicket, setHasExternalTicket] = useState<boolean>(false);

  // ─── Step 6: Messaging ───────────────────────────────────────────────
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [editingNotification, setEditingNotification] =
    useState<NotificationData | null>(null);

  // ─── Step 8: Media ───────────────────────────────────────────────────
  const [eventImages, setEventImages] = useState<TImages>([]);

  // ─── API: Mutations ──────────────────────────────────────────────────
  const [updateEvent, { isLoading: isEventUpdating }] =
    useUpdateEventMutation();
  const [initEventCreate, { isLoading: isEventCreating }] =
    useInitEventCreateMutation();
  const [createWebsiteAccessItem, { isLoading: isWebsiteAccessItemCreating }] =
    useCreateWebsiteAccessItemMutation();

  // ─── API: Business search ────────────────────────────────────────────
  const { data: initialBusinessData, isLoading: isBusinessesLoading } =
    useGetBusinessForProductQuery({
      locale: language,
      limit: 20,
      dmoId,
      authorityId,
    });
  const [getBusinessList] = useLazyGetBusinessForProductQuery();

  const initialBusinesses = useMemo(() => {
    const list = initialBusinessData?.data || [];
    if (editData?.businessId) {
      const editBiz = {
        _id: editData.businessId._id,
        name: editData.businessId.name ?? "",
        slug: "",
      };
      return list.some((b: any) => b._id === editBiz._id)
        ? list
        : [editBiz, ...list];
    }
    return list;
  }, [initialBusinessData, editData]);

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

  // ─── API: Tickets ────────────────────────────────────────────────────
  const { data: tickets, refetch: ticketRefetch } = useGetAllTicketQuery(
    eventId ? { eventId } : skipToken,
  );

  // ─── Media uploads ───────────────────────────────────────────────────
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
      ? (updatedImages) =>
          updateEvent({ eventId, body: { images: updatedImages } as any })
      : undefined,
  });

  // ─── Computed: derived values ─────────────────────────────────────────
  const eventDaysForTickets = useMemo<EventDay[]>(() => {
    if (isMultiDay) return eventDays;
    return [
      {
        id: "1",
        date: startDate,
        startTime: eventDays[0]?.startTime ?? "09:00",
        endTime: eventDays[0]?.endTime ?? "17:00",
        description: "",
      },
    ];
  }, [isMultiDay, eventDays, startDate]);

  const translationFormData = useMemo(
    () => ({
      name: eventName,
      nameHe: eventNameHe,
      nameAr: eventNameAr,
      shortDescription,
      shortDescriptionHe,
      shortDescriptionAr,
      fullDescription,
      fullDescriptionHe,
      fullDescriptionAr,
    }),
    [
      eventName,
      eventNameHe,
      eventNameAr,
      shortDescription,
      shortDescriptionHe,
      shortDescriptionAr,
      fullDescription,
      fullDescriptionHe,
      fullDescriptionAr,
    ],
  );

  // ─── Payload builders ────────────────────────────────────────────────
  const buildBasicInfoPayload = useCallback(
    () => ({
      name: eventName,
      nameHe: eventNameHe,
      nameAr: eventNameAr,
      shortDescription,
      shortDescriptionHe,
      shortDescriptionAr,
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
      internalNotes,
      hasExternalTicket,
      ticketBuyLink,
    }),
    [
      eventName,
      eventNameHe,
      eventNameAr,
      shortDescription,
      shortDescriptionHe,
      shortDescriptionAr,
      fullDescription,
      fullDescriptionHe,
      fullDescriptionAr,
      selectedAuthorityId,
      selectedDmoId,
      selectedBusinessId,
      eventStatus,
      selectedGroupTypesId,
      selectedAccessiblitiesId,
      selectedSubCategoriesId,
      internalNotes,
      hasExternalTicket,
      ticketBuyLink,
    ],
  );

  const buildDateTimePayload = useCallback(
    () => ({
      dayDescription: eventDays.map((item) => ({
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
      onlineLink,
    }),
    [
      eventDays,
      isMultiDay,
      startDate,
      geo,
      recurrencePattern,
      selectedWeekdays,
      monthlyType,
      specificDate,
      relativeDate,
      relativeDay,
      customInterval,
      customUnit,
      recurrenceEndCount,
      recurrenceEndDate,
      eventFormat,
      address,
      onlineLink,
    ],
  );

  const buildRegistrationPayload = useCallback(
    () => ({
      registration: {
        isRegistration: registrationRequired,
        noOfPeople: capacity,
        isUnlimited: capacityType === "unlimited",
      },
      customQuestions,
    }),
    [registrationRequired, capacity, capacityType, customQuestions],
  );

  const buildMessagingPayload = useCallback(
    () => ({
      scheduledNotifications: notifications.map((item) => {
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
        }
        return base;
      }),
    }),
    [notifications],
  );

  const stepPayloadMap = useMemo(
    () => ({
      1: buildBasicInfoPayload,
      2: buildBasicInfoPayload,
      3: buildDateTimePayload,
      4: buildRegistrationPayload,
      6: buildMessagingPayload,
      7: () => ({ images: eventImages }),
    }),
    [
      buildBasicInfoPayload,
      buildDateTimePayload,
      buildRegistrationPayload,
      buildMessagingPayload,
      eventImages,
    ],
  );

  // ─── Draft saver ─────────────────────────────────────────────────────
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

  // ─── Effects: Authority/DMO preset ───────────────────────────────────
  useEffect(() => {
    if (userRole === "authority") {
      setSelectAuthorityId(authorityId);
      setSelectDmoId(dmoId);
    }
  }, []);

  // ─── Effects: Sync tickets from API ──────────────────────────────────
  useEffect(() => {
    if (tickets && (eventId || editId)) setLocalTickets(tickets);
  }, [tickets, eventId, editId]);

  // ─── Effects: Mark media dirty when images change ────────────────────
  useEffect(() => {
    if (images.length) handleMarkDirty(7);
  }, [images, handleMarkDirty]);

  // ─── Effects: Reset state when wizard opens in create mode ───────────
  useEffect(() => {
    if (!isOpen || editId) return;

    setEventId("");
    setCurrentStep(1);
    setIsPublishBtnClicked(false);
    setIsDraftBtnClicked(false);
    setHasFormChanges(false);
    setLastSaved(null);
    setErrors({});
    setEventName("");
    setEventNameHe("");
    setEventNameAr("");
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
    setGeo({ lat: "", long: "" });
    setIsRecurring(false);
    setRegistrationRequired(true);
    setCapacityType("limited");
    setCapacity(100);
    setCustomQuestions([]);
    setSubCategoriesId([]);
    setGroupTypesId([]);
    setAccessiblitiesId([]);
    setEventImages([]);
    setNotifications([]);
    setLocalTickets([]);
    setHasExternalTicket(false);
    setTicketBuyLink(null);
    initialImagesCountRef.current = 0;
  }, [isOpen, editId]);

  // ─── Effects: Populate state from editData ────────────────────────────
  useEffect(() => {
    if (!editData || !editId) return;

    setHasFormChanges(false);
    initialImagesCountRef.current = editData?.images?.length ?? 0;

    setEventName(editData.name ?? "");
    setEventNameHe(editData.nameHe ?? "");
    setEventNameAr(editData.nameAr ?? "");
    setShortDescription(editData.shortDescription ?? "");
    setShortDescriptionHe(editData.shortDescriptionHe ?? "");
    setShortDescriptionAr(editData.shortDescriptionAr ?? "");
    setFullDescription(editData.description ?? "<p></p>");
    setFullDescriptionHe(editData.descriptionHe ?? "<p></p>");
    setFullDescriptionAr(editData.descriptionAr ?? "<p></p>");
    setSelectedBusinessId(editData.businessId?._id ?? "");
    setEventStatus(editData.status?.toLowerCase() ?? "draft");
    setAccessiblitiesId(editData.accessibilitiesId ?? []);
    setGroupTypesId(editData.groupTypesId ?? []);
    setSubCategoriesId(editData.subCategoriesId ?? []);
    setInternalNotes(editData.internalNotes ?? "");
    setSelectAuthorityId(editData.authorityId ?? "");
    setSelectDmoId(editData.dmoId ?? "");

    setIsMultiDay((editData.dayDescription?.length ?? 0) > 1);
    setEventDays(editData.dayDescription ?? []);
    setStartDate(editData.dayDescription?.[0]?.date ?? "");
    setGeo({
      lat: editData.geoLocation?.lat ?? "",
      long: editData.geoLocation?.long ?? "",
    });
    setEventFormat(editData.eventType?.toLowerCase() ?? "physical");
    setRecurrencePattern(
      editData.recurringEventRuleId?.pattern?.toLowerCase() ?? "weekly",
    );
    setSelectedWeekdays(editData.recurringEventRuleId?.daysOfWeek ?? []);
    setMonthlyType(
      editData.recurringEventRuleId?.monthlyType ?? "SPECIFIC_DATE",
    );
    setSpecificDate(editData.recurringEventRuleId?.specificDate ?? 1);
    setRelativeDate(editData.recurringEventRuleId?.relativeDate ?? 1);
    setRelativeDay(editData.recurringEventRuleId?.relativeDay ?? "sun");
    setCustomInterval(editData.recurringEventRuleId?.customInterval ?? 1);
    setCustomUnit(
      editData.recurringEventRuleId?.customUnit?.toLowerCase() ?? "day",
    );
    setRecurrenceEndDate(editData.recurringEventRuleId?.endDate ?? "");
    setRecurrenceEndCount(editData.recurringEventRuleId?.occurrenceLimit ?? 10);
    setAddress(editData.address?.location ?? "");
    setOnlineLink(editData.onlineLink ?? "");

    setHasExternalTicket(editData.hasExternalTicket ?? false);
    setTicketBuyLink(editData.ticketBuyLink ?? null);

    setRegistrationRequired(editData.registration?.isRegistration ?? true);
    setCapacity(editData.registration?.capacity ?? 100);
    setCapacityType(
      editData.registration?.isUnlimited ? "unlimited" : "limited",
    );
    setCustomQuestions(editData.customQuestions ?? []);

    setEventImages(editData.images ?? []);

    const mappedNotifications: NotificationData[] = (
      editData.scheduledNotificationId ?? []
    ).map((item: any, index: number) => ({
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
      subject: item?.customTemplate?.subject ?? "",
      message: item?.customTemplate?.body ?? "",
      enabled: item?.status === "ACTIVE",
    }));
    setNotifications(mappedNotifications);
  }, [editData, editId]);

  // ─── Validation ───────────────────────────────────────────────────────
  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: Record<string, string> = {};

      switch (step) {
        case 1:
          if (!selectedDmoId?.trim()) newErrors.dmoId = tc("required_field");
          if (
            !eventName?.trim() &&
            !eventNameHe?.trim() &&
            !eventNameAr?.trim()
          )
            newErrors.eventName = tc("required_field");
          if (
            !shortDescription?.trim() &&
            !shortDescriptionHe?.trim() &&
            !shortDescriptionAr?.trim()
          )
            newErrors.shortDescription = tc("required_field");
          break;
        case 3:
          if (!isMultiDay && !startDate)
            newErrors.startDate = tc("required_field");
          if (isMultiDay && eventDays.some((d) => !d.date))
            newErrors.dates = tc("all_dates_required");
          if (eventFormat !== "online" && !address)
            newErrors.address = tc("required_field");
          if (eventFormat !== "physical" && !onlineLink)
            newErrors.onlineLink = tc("required_field");
          break;
        case 4:
          if (capacityType === "limited" && capacity <= 0)
            newErrors.capacity = tc("must_be_greater_than_zero");
          break;
        case 5:
          if (localTickets.length === 0 && registrationRequired)
            newErrors.tickets = tc("at_least_one_ticket_required");
          break;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [
      selectedDmoId,
      eventName,
      eventNameHe,
      eventNameAr,
      shortDescription,
      shortDescriptionHe,
      shortDescriptionAr,
      isMultiDay,
      startDate,
      eventDays,
      eventFormat,
      address,
      onlineLink,
      capacityType,
      capacity,
      localTickets,
      registrationRequired,
      tc,
    ],
  );

  // ─── Website access item payload ──────────────────────────────────────
  const buildWebsiteAccessPayload = useCallback(
    () => ({
      blacklist: {
        allItems: websiteVisibilityIds.allBlacklistIds,
        selectedItems: websiteVisibilityIds.allBlacklistIds.filter(
          (id: string) =>
            !websiteVisibilityIds.selectedBlacklistIds.includes(id),
        ),
      },
      whitelist: {
        allItems: websiteVisibilityIds.allWhitelistIds,
        selectedItems: websiteVisibilityIds.selectedWhitelistIds,
      },
      purpose: "event",
    }),
    [websiteVisibilityIds],
  );

  // ─── Action handlers ──────────────────────────────────────────────────
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

  const handleNext = useCallback(async () => {
    if (!validateStep(currentStep) && isPublishBtnClicked) return;
    setCurrentStep((prev) => prev + 1);
  }, [validateStep, currentStep, isPublishBtnClicked]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleSpecificStepJump = useCallback((stepId: number) => {
    if (stepId !== 7) window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentStep(stepId);
  }, []);

  const handleClose = useCallback(() => {
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
  }, [
    hasFormChanges,
    images.length,
    isPublishBtnClicked,
    isDraftBtnClicked,
    onClose,
  ]);

  const handleSaveDraft = useCallback(async () => {
    if (!eventName?.trim() && !eventNameHe?.trim() && !eventNameAr?.trim()) {
      toast.error(tc("name_required"));
      return;
    }
    setIsDraftBtnClicked(true);
    const resolvedEventId = await saveDraft(false);
    if (resolvedEventId) {
      await createWebsiteAccessItem({
        body: buildWebsiteAccessPayload(),
        itemId: resolvedEventId,
      });
    }
    refetch?.();
    eventDataRefetch?.();
  }, [
    eventName,
    eventNameHe,
    eventNameAr,
    tc,
    saveDraft,
    createWebsiteAccessItem,
    buildWebsiteAccessPayload,
    refetch,
    eventDataRefetch,
  ]);

  const handlePublish = useCallback(async () => {
    setIsPublishBtnClicked(true);
    let allValid = true;
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
        body: buildWebsiteAccessPayload(),
        itemId: resolvedEventId,
      });
      await Promise.all([refetch?.(), eventDataRefetch?.()]);
    }
    setIsPublishing(false);
    onClose();
  }, [
    validateStep,
    saveDraft,
    tc,
    createWebsiteAccessItem,
    buildWebsiteAccessPayload,
    refetch,
    eventDataRefetch,
    onClose,
  ]);

  // ─── Multi-day helpers ────────────────────────────────────────────────
  const addEventDay = useCallback(() => {
    setEventDays((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        date: "",
        startTime: "09:00",
        endTime: "17:00",
        description: "",
      },
    ]);
  }, []);

  const removeEventDay = useCallback((id: string) => {
    setEventDays((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const toggleWeekday = useCallback((day: string) => {
    setSelectedWeekdays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort(),
    );
  }, []);

  const addCustomQuestion = useCallback(() => {
    setCustomQuestions((prev) => [
      ...prev,
      { id: Date.now().toString(), label: "", type: "text", required: false },
    ]);
  }, []);

  return {
    // Navigation
    currentStep,
    setCurrentStep,
    handleNext,
    handlePrevious,
    handleSpecificStepJump,
    handleClose,
    showClosePopup,
    setShowClosePopup,
    isPublishing,
    lastSaved,
    errors,
    isPublishBtnClicked,

    // Loading
    isEventCreating,
    isEventUpdating,
    isWebsiteAccessItemCreating,

    // Shared
    eventId,
    setEventId,
    editId,
    handleMarkDirty,

    // Step 1 — Basic Info
    translationFormData,
    handleTranslateChange,
    eventStatus,
    eventLanguage,
    internalNotes,
    setInternalNotes,
    selectedDmoId,
    setSelectDmoId,
    selectedAuthorityId,
    setSelectAuthorityId,
    selectedAccessiblitiesId,
    setAccessiblitiesId,
    selectedGroupTypesId,
    setGroupTypesId,
    selectedSubCategoriesId,
    setSubCategoriesId,
    websiteVisibilityIds,
    setWebsiteVisibilityIds,
    selectedBusinessId,
    setSelectedBusinessId,
    businesses,
    isBusinessesLoading,
    isBusinessSearching,
    searchBusiness,
    editAssociatedWebsites: editData?.associatedWebsites ?? [],

    // Step 3 — Date & Time
    isMultiDay,
    setIsMultiDay,
    startDate,
    setStartDate,
    eventDays,
    setEventDays,
    eventFormat,
    setEventFormat,
    address,
    setAddress,
    onlineLink,
    setOnlineLink,
    geo,
    setGeo,
    isRecurring,
    setIsRecurring,
    recurrencePattern,
    setRecurrencePattern,
    selectedWeekdays,
    monthlyType,
    setMonthlyType,
    recurrenceEndType,
    setRecurrenceEndType,
    recurrenceEndDate,
    setRecurrenceEndDate,
    recurrenceEndCount,
    setRecurrenceEndCount,
    specificDate,
    setSpecificDate,
    relativeDate,
    setRelativeDate,
    relativeDay,
    setRelativeDay,
    customInterval,
    setCustomInterval,
    customUnit,
    setCustomUnit,
    addEventDay,
    removeEventDay,
    toggleWeekday,

    // Step 4 — Registration
    registrationRequired,
    setRegistrationRequired,
    capacityType,
    setCapacityType,
    capacity,
    setCapacity,
    customQuestions,
    setCustomQuestions,
    addCustomQuestion,

    // Step 5 — Tickets
    localTickets,
    showTicketModal,
    setShowTicketModal,
    eventDaysForTickets,
    initEventCreate,
    ticketRefetch,
    hasExternalTicket,
    setHasExternalTicket,
    ticketBuyLink,
    setTicketBuyLink,

    // Step 6 — Messaging
    notifications,
    setNotifications,
    showNotificationForm,
    setShowNotificationForm,
    editingNotification,
    setEditingNotification,

    // Step 7 — Media
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

    // Actions
    handleSaveDraft,
    handlePublish,
  };
}
