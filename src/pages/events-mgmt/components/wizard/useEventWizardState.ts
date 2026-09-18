import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "@/hooks/hooks";
import { useCommon } from "@/hooks/useCommon";
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
import { detectLanguage, type ParsedAddressParts } from "@/helpers";

interface UseEventWizardStateProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: IEventDetailsRes;
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
  // const [isNotSaved, setIsNotSaved] = useState(false)
  const initialImagesCountRef = useRef(0);
  // Snapshot of the step payloads exactly as hydrated from the server, used to
  // diff on save so only genuinely-changed fields are sent in edit mode.
  const hydratedPayloadRef = useRef<Record<string, any> | null>(null);
  const payloadSnapshotTakenRef = useRef(false);
  const sawStaleBuildersRef = useRef(false);

  // ─── IDs ─────────────────────────────────────────────────────────────
  const [eventId, setEventId] = useState<string>(editId || "");
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [selectedDmoId, setSelectDmoId] = useState<string>("");
  const [selectedAuthorityId, setSelectAuthorityId] = useState<string>("");
  const [selectAssociatedWebsiteIds, setSelectAssociatedWebsiteIds] = useState<
    string[]
  >([]);

  const { allWebsites } = useCommon();
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
  const [eventDays, setEventDays] = useState<IEventDay[]>([
    {
      id: "1",
      date: "",
      startTime: "09:00",
      endTime: "17:00",
      description: "",
    },
  ]);
  const [eventFormat, setEventFormat] = useState<TEventFormat>("physical");
  const [address, setAddress] = useState("");
  const [addressParts, setAddressParts] = useState<ParsedAddressParts>({
    location: "",
    city: "",
    country: "",
  });
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

  // ─── Step 6: Messaging ───────────────────────────────────────────────
  const [notifications, setNotifications] = useState<INotificationData[]>([]);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [editingNotification, setEditingNotification] =
    useState<INotificationData | null>(null);

  // ─── Step 8: Media ───────────────────────────────────────────────────
  const [eventImages, setEventImages] = useState<TImages>([]);

  // ─── API: Mutations ──────────────────────────────────────────────────
  const [updateEvent, { isLoading: isEventUpdating }] =
    useUpdateEventMutation();
  const [initEventCreate, { isLoading: isEventCreating }] =
    useInitEventCreateMutation();

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
      associatedWebsiteIds: selectAssociatedWebsiteIds,
      businessId: selectedBusinessId,
      status: eventStatus?.toUpperCase(),
      groupTypesId: selectedGroupTypesId,
      accessibilitiesId: selectedAccessiblitiesId,
      subCategoriesId: selectedSubCategoriesId,
      internalNotes,
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
      selectAssociatedWebsiteIds,
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
        country: addressParts.country,
        city: addressParts.city,
        location: addressParts.location,
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
      addressParts,
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
      customQuestions: customQuestions
        .filter((q) => q.label.trim() !== "")
        .map((q) => ({
          question: q.label,
          isRequired: q.required,
        })),
    }),
    [registrationRequired, capacity, capacityType, customQuestions],
  );

  const buildMessagingPayload = useCallback(
    () => ({
      scheduledNotifications: notifications.map((item) => {
        const base = {
          ...(!item.index ? { _id: item._id } : {}),
          channels: item.channels ?? [],
          status: item.enabled ? "ACTIVE" : "INACTIVE",
          subject: item.subject,
          // The picker holds a naive local datetime; convert in the browser
          // (which knows the admin's timezone) so the pick means the admin's
          // own wall-clock and the cron fires at that instant everywhere.
          scheduleDateTime: item.scheduleDateTime,
          // Offset-based scheduling: send N hours before/after the event
          // instead of at a fixed wall-clock time. sendTiming (before/after
          // the event) only applies to relative mode (when sendHoursOffset is set).
          ...(item.sendHoursOffset != null
            ? {
                sendHoursOffset: item.sendHoursOffset,
                sendTiming: item.sendTiming ?? "PRE_EVENT",
              }
            : {}),
          body: formatToBackendTemplate(item.message),
        };
        return base;
      }),
    }),
    [notifications],
  );

  const stepPayloadMap = useMemo(
    () => ({
      1: buildBasicInfoPayload,
      2: buildDateTimePayload,
      3: buildRegistrationPayload,
      4: buildMessagingPayload,
      5: () => ({ images: eventImages }),
    }),
    [
      buildBasicInfoPayload,
      buildDateTimePayload,
      buildRegistrationPayload,
      buildMessagingPayload,
      eventImages,
    ],
  );

  // ─── Snapshot hydrated payloads for edit-mode field diffing ──────────
  // The hydration effect above fires the state setters, but the builders in
  // `stepPayloadMap` only see those values on the *next* render. So we skip
  // the render that resets the flag and capture on the following pass, once
  // the builders reflect the server data. That snapshot is what
  // buildPayload() diffs against so unchanged fields are never sent.
  useEffect(() => {
    if (!editData || !editId || payloadSnapshotTakenRef.current) return;
    if (!sawStaleBuildersRef.current) {
      sawStaleBuildersRef.current = true;
      return;
    }
    const snapshot: Record<string, any> = {};
    Object.values(stepPayloadMap).forEach((builder) => {
      Object.assign(snapshot, builder());
    });
    hydratedPayloadRef.current = snapshot;
    payloadSnapshotTakenRef.current = true;
  }, [editData, editId, stepPayloadMap]);

  // ─── Draft saver ─────────────────────────────────────────────────────
  const { markDirty, saveDraft } = useEventDraftSaver({
    currentStep,
    eventId: editId || eventId,
    setEventId,
    initEventCreate,
    updateEvent,
    stepPayloadMap,
    hydratedPayloadRef,
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

  // ─── Effects: Mark media dirty when images change ────────────────────
  useEffect(() => {
    if (images.length) handleMarkDirty(5);
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
    setAddressParts({ location: "", city: "", country: "" });
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
    initialImagesCountRef.current = 0;
  }, [isOpen, editId]);

  // ─── Effects: Populate state from editData ────────────────────────────
  useEffect(() => {
    if (!editData || !editId) return;

    setHasFormChanges(false);
    payloadSnapshotTakenRef.current = false;
    sawStaleBuildersRef.current = false;
    hydratedPayloadRef.current = null;
    initialImagesCountRef.current = editData?.images?.length ?? 0;

    setEventName(editData.name ?? "");
    setEventNameHe(editData.nameHe ?? "");
    setEventNameAr(editData.nameAr ?? "");
    setShortDescription(editData.shortDescription ?? "");
    setShortDescriptionHe(editData.shortDescriptionHe ?? "");
    setShortDescriptionAr(editData.shortDescriptionAr ?? "");
    setFullDescription(editData.description ?? "");
    setFullDescriptionHe(editData.descriptionHe ?? "");
    setFullDescriptionAr(editData.descriptionAr ?? "");
    setSelectedBusinessId(editData.businessId?._id ?? "");
    setEventStatus((editData.status?.toLowerCase() as EventStatus) ?? "draft");
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
    setEventFormat(
      (editData.eventType?.toLowerCase() as TEventFormat) ?? "physical",
    );
    setRecurrencePattern(
      (editData.recurringEventRuleId?.pattern?.toLowerCase() as RecurrencePattern) ??
        "weekly",
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
    setAddress(
      [
        editData.address?.location,
        editData.address?.city,
        editData.address?.country,
      ]
        .filter(Boolean)
        .join(", "),
    );
    setAddressParts({
      location: editData.address?.location || "",
      city: editData.address?.city || "",
      country: editData.address?.country || "",
    });
    setOnlineLink(editData.onlineLink ?? "");

    setRegistrationRequired(editData.registration?.isRegistration ?? true);
    setCapacity(editData.registration?.capacity ?? 100);
    setCapacityType(
      editData.registration?.isUnlimited ? "unlimited" : "limited",
    );
    setCustomQuestions(
      (editData.customQuestions ?? []).map((q: any, index: number) => ({
        id: q._id ?? q.id ?? `${Date.now()}-${index}`,
        label: q.question ?? q.label ?? "",
        type: "text" as const,
        required: q.isRequired ?? q.required ?? false,
      })),
    );
    setSelectAssociatedWebsiteIds(editData?.associatedWebsiteIds);
    setEventImages(editData.images ?? []);

    const mappedNotifications: INotificationData[] = (
      editData.scheduledNotificationId ?? []
    ).map((item: any, index: number) => ({
      _id: item?._id,
      index,
      channels: item?.channels ?? [],
      subject: item?.subject ?? "",
      message: item?.body ?? "",
      // Both feed <input type="datetime-local">, which renders blank for a
      // UTC "…Z" string — use only the naive local form the backend returns
      // for the picker (scheduleDateTimeLocal), never the "…Z" scheduleDateTime.
      scheduleDateTime: item.scheduleDateTimeLocal ?? "",
      scheduleDateTimeLocal: item.scheduleDateTimeLocal ?? "",
      sendHoursOffset: item?.sendHoursOffset ?? undefined,
      sendTiming: item?.sendTiming ?? undefined,
      enabled: item?.status === "ACTIVE",
      status: item.status,
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
          if (hasAssociatedWebsites && !selectAssociatedWebsiteIds?.length)
            newErrors.websiteVisibilityIds = tc("website_visibility_required");
          break;
        case 2:
          if (!isMultiDay && !startDate)
            newErrors.startDate = tc("required_field");
          if (isMultiDay && eventDays.some((d) => !d.date))
            newErrors.dates = tc("all_dates_required");
          if (eventFormat !== "online" && !address)
            newErrors.address = tc("required_field");
          if (eventFormat !== "physical" && !onlineLink)
            newErrors.onlineLink = tc("required_field");
          break;
        case 3:
          if (capacityType === "limited" && capacity <= 0)
            newErrors.capacity = tc("must_be_greater_than_zero");
          break;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [
      selectedDmoId,
      selectedAuthorityId,
      selectAssociatedWebsiteIds,
      hasAssociatedWebsites,
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
    if (hasAssociatedWebsites && !selectAssociatedWebsiteIds?.length) {
      setCurrentStep(1);
      setErrors((prev) => ({
        ...prev,
        websiteVisibilityIds: tc("website_visibility_required"),
      }));
      toast.error(tc("website_visibility_required"));
      return;
    }
    setIsDraftBtnClicked(true);
    await saveDraft(false);
    refetch?.();
    eventDataRefetch?.();
  }, [
    eventName,
    eventNameHe,
    eventNameAr,
    hasAssociatedWebsites,
    selectAssociatedWebsiteIds,
    tc,
    saveDraft,
    buildWebsiteAccessPayload,
    refetch,
    eventDataRefetch,
  ]);
  const getActiveField = (base: string, lang: string): string => {
    if (lang === "en") return base;
    const suffix = lang.charAt(0).toUpperCase() + lang.slice(1);
    return `${base}${suffix}`; // "nameHe", "nameAr", etc.
  };

  const detectAndAssignLanguageFields = (data: any): any => {
    const updated = { ...data };

    const fieldGroups = [
      { base: "name", en: "name", he: "nameHe", ar: "nameAr" },
      {
        base: "shortDescription",
        en: "shortDescription",
        he: "shortDescriptionHe",
        ar: "shortDescriptionAr",
      },
      {
        base: "description",
        en: "description",
        he: "descriptionHe",
        ar: "descriptionAr",
      },
    ];

    fieldGroups.forEach(({ base, en, he, ar }) => {
      // Whichever field the user was actually typing into for THIS group,
      // based on the global language at the time of entry
      const activeField = getActiveField(base, language);
      const text = data[activeField]?.trim();
      if (!text) return;

      const detectedLang = detectLanguage(text); // "en" | "he" | "ar"

      // Clear all three first, then assign to wherever it actually belongs
      updated[en] = "";
      updated[he] = "";
      updated[ar] = "";

      if (detectedLang === "he") {
        updated[he] = text;
      } else if (detectedLang === "ar") {
        updated[ar] = text;
      } else {
        updated[en] = text;
      }
    });

    return updated;
  };
  const handlePublish = useCallback(async () => {
    setIsPublishBtnClicked(true);
    let allValid = true;
    for (let i = 1; i <= 6; i++) {
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
    const processed = detectAndAssignLanguageFields(buildBasicInfoPayload());
    setEventName(processed.name);
    setEventNameHe(processed.nameHe);
    setEventNameAr(processed.nameAr);
    setShortDescription(processed.shortDescription);
    setShortDescriptionHe(processed.shortDescriptionHe);
    setShortDescriptionAr(processed.shortDescriptionAr);
    setFullDescription(processed.description);
    setFullDescriptionHe(processed.descriptionHe);
    setFullDescriptionAr(processed.descriptionAr);
    handleMarkDirty(1);
    await saveDraft(true, processed);
    setIsPublishing(false);
    onClose();
    refetch?.();
    eventDataRefetch?.();
  }, [
    validateStep,
    saveDraft,
    tc,
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
    // Side effects (toast) must stay out of the setState updater below -
    // StrictMode double-invokes functional updaters in dev, which would
    // fire the toast twice for a single click.
    if (customQuestions.some((q) => !q.label.trim())) {
      toast.error(tc("complete_question_before_adding"));
      return;
    }
    setCustomQuestions((prev) => [
      { id: Date.now().toString(), label: "", type: "text", required: false },
      ...prev,
    ]);
  }, [customQuestions, tc]);

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
    setErrors,
    isPublishBtnClicked,

    // Loading
    isEventCreating,
    isEventUpdating,

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
    selectAssociatedWebsiteIds,
    setSelectAssociatedWebsiteIds,
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
    addressParts,
    setAddressParts,
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
