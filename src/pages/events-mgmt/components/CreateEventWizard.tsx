import { toast } from 'sonner';
import { skipToken } from '@reduxjs/toolkit/query';
import { useState, useEffect, Activity } from 'react';
import {
  X, Check, Calendar,
  Users, Ticket, Image, FileText, CheckCircle, Loader,
  Mail
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks/hooks';

import { WizardFooter } from '@/components/shared';
import { useThemeClasses } from '@/hooks/useThemeClasses';

import { useGetEventByIdQuery } from '@/store/api/eventQueryApi';
import { useInitEventCreateMutation, useUpdateEventMutation } from '@/store/api/eventMutationApi';
import { EventBasicInformation, EventDateTimeFormat, EventMedia, EventRegistrationCapacity, EventReviewPublish, EventTickets, NotificationsTimeline } from './sub-components';

interface CreateEventWizardProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  existingEvent?: any;
  editId?: string | null;
}

export default function CreateEventWizard({
  isOpen,
  onClose,
  theme,
  editId = null
}: CreateEventWizardProps) {
  const { t } = useTranslation('events');
  const { isRTL } = useAppSelector((state) => state.settings)
  const { cardClasses, textPrimary, textTertiary } = useThemeClasses();

  const [updateEvent, { isLoading: isEventUpdating }] = useUpdateEventMutation()
  const [initEventCreate, { isLoading: isEventCreating }] = useInitEventCreateMutation()
  const { data: editData, refetch } = useGetEventByIdQuery(editId ? { eventId: editId } : skipToken);

  useEffect(() => { if (editId) setEventId(editId) }, [editId])

  const [currentStep, setCurrentStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);

  // Step 1: Basic Information
  const [selectedDmoId, setSelectDmoId] = useState<string>("");
  const [selectedAuthorityId, setSelectAuthorityId] = useState<string>("");
  const [eventName, setEventName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [eventLanguage, setEventLanguage] = useState<Language>('en');
  const [eventStatus, setEventStatus] = useState<'draft' | 'pending' | 'approved'>('draft');
  const [internalNotes, setInternalNotes] = useState('');
  const [selectedSubCategoriesId, setSubCategoriesId] = useState<string[]>([])
  const [selectedGroupTypesId, setGroupTypesId] = useState<string[]>([])
  const [selectedAccessiblitiesId, setAccessiblitiesId] = useState<string[]>([])


  // Step 2: Date, Time & Format
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [eventDays, setEventDays] = useState<EventDay[]>([
    { id: '1', date: '', startTime: '09:00', endTime: '17:00', description: '' }
  ]);
  const [eventFormat, setEventFormat] = useState<'physical' | 'online' | 'hybrid'>('physical');
  const [address, setAddress] = useState('');
  const [onlineLink, setOnlineLink] = useState('');
  const [geo, setGeo] = useState<Geo>({ lat: "", lng: "" })

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('weekly');
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]); // 0=Sun, 1=Mon, etc.
  const [monthlyType, setMonthlyType] = useState<TMonthlyType>('SPECIFIC_DATE'); // By date or by day
  const [recurrenceEndType, setRecurrenceEndType] = useState<RecurrenceEndType>('count');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [recurrenceEndCount, setRecurrenceEndCount] = useState(10);
  const [specificDate, setSpecificDate] = useState<number>(1)
  const [relativeDate, setRelativeDate] = useState<number>(1)
  const [relativeDay, setRelativeDay] = useState<string>("sun")
  const [customInterval, setCustomInterval] = useState<number>(1)
  const [customUnit, setCustomUnit] = useState<string>("day")

  // Step 3: Registration & Capacity
  const [registrationRequired, setRegistrationRequired] = useState(true);
  const [capacityType, setCapacityType] = useState<'unlimited' | 'limited'>('limited');
  const [capacity, setCapacity] = useState(100);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

  // Step 4: Tickets
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [ticketCount, setTicketCount] = useState(0);
  console.log("🚀 ~ CreateEventWizard ~ ticketCount:", ticketCount)
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Step 5: Messaging
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState<NotificationData | null>(null);

  // Step 6: Media
  const [eventImages, setEventImages] = useState<TEventImages>([])

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { id: 1, icon: FileText, label: t('step_1_basic_information') },
    { id: 2, icon: Calendar, label: t('step_2_date_time') },
    { id: 3, icon: Users, label: t('step_3_registration') },
    { id: 4, icon: Ticket, label: t('step_4_tickets') },
    { id: 5, icon: Mail, label: t('messaging'), labelKey: 'step_5_messaging' },
    { id: 6, icon: Image, label: t('step_5_media') },
    { id: 7, icon: CheckCircle, label: t('step_6_review') },
  ];

  // Reset all state when wizard closes or opens in create mode
  useEffect(() => {
    if (isOpen && !editId) {
      // Reset to initial state
      setCurrentStep(1);
      setEventName('');
      setShortDescription('');
      setFullDescription('');
      setEventLanguage('en');
      setEventStatus('draft');
      setInternalNotes('');
      setIsMultiDay(false);
      setStartDate('');
      setEventDays([{ id: '1', date: '', startTime: '09:00', endTime: '17:00', description: '' }]);
      setEventFormat('physical');
      setAddress('');
      setOnlineLink('');
      setRegistrationRequired(true);
      setCapacityType('limited');
      setCapacity(100);
      setCustomQuestions([]);
      setTickets([]);
      setEventImages([]);
      setErrors({});
      setLastSaved(null);
      setSelectAuthorityId("");
      setSelectDmoId("");
      setSubCategoriesId([]);
      setGroupTypesId([]);
      setAccessiblitiesId([]);
      setEventId(null);
    }
  }, [isOpen,]);


  useEffect(() => {
    if (editData && editId) {
      // Basic information
      setEventName(editData?.name)
      setShortDescription(editData?.shortDescription)
      setFullDescription(editData?.description)
      setEventStatus(editData?.status.toLowerCase())
      setAccessiblitiesId(editData?.accessibilitiesId)
      setGroupTypesId(editData?.groupTypesId)
      setSubCategoriesId(editData?.subCategoriesId)
      setInternalNotes(editData?.internalNotes);
      setSelectAuthorityId(editData?.authorityId || "");
      setSelectDmoId(editData?.dmoId || "");

      // Date & Time
      setEventDays(editData?.dayDescription)
      setStartDate(editData?.dayDescription?.[0]?.date || '')
      setGeo({ lat: editData?.geoLocation?.lat, lng: editData?.geoLocation?.long })
      setEventFormat(editData?.eventType?.toLowerCase())
      setRecurrencePattern(editData?.recurringEventRuleId?.pattern?.toLowerCase() || 'weekly')
      setSelectedWeekdays(editData?.recurringEventRuleId?.daysOfWeek || [])
      setMonthlyType(editData?.recurringEventRuleId?.monthlyType)
      setSpecificDate(editData?.recurringEventRuleId?.specificDate || 1)
      setRelativeDate(editData?.recurringEventRuleId?.relativeDate || 1)
      setRelativeDay(editData?.recurringEventRuleId?.relativeDay || "sun")
      setCustomInterval(editData?.recurringEventRuleId?.customInterval || 1)
      setCustomUnit(editData?.recurringEventRuleId?.customUnit?.toLowerCase() || "day")
      setRecurrenceEndDate(editData?.recurringEventRuleId?.endDate || '')
      setRecurrenceEndCount(editData?.recurringEventRuleId?.occurrenceLimit || 10)
      setAddress(editData?.address?.location || '')

      // Registration
      setRegistrationRequired(editData?.registration?.isRegistration)
      setCapacity(editData?.registration?.capacity)
      setCapacityType(editData?.registration?.isUnlimited ? "unlimited" : "limited")
      setCustomQuestions(editData?.customQuestions)

      // Media
      setEventImages(editData?.images)

      // Message shedule nofitications
      const notification = editData?.scheduledNotificationId?.map((item: any) => ({
        id: item?._id,
        channels: {
          email: item?.channels?.includes('EMAIL'),
          sms: item?.channels?.includes('SMS'),
          whatsapp: item?.channels?.includes('WHATSAPP'),
        },
        hoursBeforeEvent: item?.sendHoursBefore,
        language: item?.language,
        template: item?.template,
        subject: item?.customTemplate?.subject,
        message: item?.customTemplate?.body,
        enabled: item.status === 'ACTIVE' ? true : false,
      }))
      setNotifications(notification)
    }
  }, [editData, editId])


  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!eventName.trim()) newErrors.eventName = t('required_field');
        if (!shortDescription.trim()) newErrors.shortDescription = t('required_field');
        if (eventName.length < 3) newErrors.eventName = t('field_too_short');
        break;
      case 2:
        if (!isMultiDay && !startDate) newErrors.startDate = t('required_field');
        if (isMultiDay && eventDays.some(d => !d.date)) newErrors.dates = 'All dates required';
        if (eventFormat !== 'online' && !address) newErrors.address = t('required_field');
        if (eventFormat !== 'physical' && !onlineLink) newErrors.onlineLink = t('required_field');
        break;
      case 3:
        if (capacityType === 'limited' && capacity <= 0) newErrors.capacity = 'Must be greater than 0';
        break;
      case 4:
        if (ticketCount && registrationRequired) {
          newErrors.tickets = t('at_least_one_ticket_required');
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    // setCurrentStep(prev => Math.min(prev + 1, 7));
    handleSaveDraft();
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const eventBasicInfoPayload = {
    name: eventName,
    description: fullDescription,
    shortDescription: shortDescription,
    authorityId: selectedAuthorityId,
    dmoId: selectedDmoId,
    status: eventStatus?.toUpperCase(),
    groupTypesId: selectedGroupTypesId,
    accessibilitiesId: selectedAccessiblitiesId,
    subCategoriesId: selectedSubCategoriesId,
    internalNotes: internalNotes,
  }

  const eventDateTimePayload = {
    dayDescription: eventDays?.map(item => ({
      date: isMultiDay ? item.date : startDate,
      startTime: item.startTime,
      endTime: item.endTime
    })),
    geoLocation: { lat: geo.lat, long: geo.lng },
    recurringEventRule: {
      pattern: recurrencePattern?.toUpperCase(),
      daysOfWeek: selectedWeekdays,
      monthlyType: monthlyType?.toUpperCase(),
      specificDate,
      relativeDate,
      relativeDay,
      customInterval,
      customUnit: customUnit?.toUpperCase(),
      endType: 'END_DATE',
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
  }

  const eventRegistrationPayload = {
    registration: {
      isRegistration: registrationRequired,
      noOfPeople: capacity,
      isUnlimited: capacityType === "limited" ? false : true,
    },
    customQuestions: customQuestions,
  }

  const eventMsgSchedulePayload = {
    scheduledNotifications: notifications?.map(item => ({
      sendHoursBefore: item.hoursBeforeEvent,
      channels: (
        [
          item?.channels?.email && 'EMAIL',
          item?.channels?.sms && 'SMS',
          item?.channels?.whatsapp && 'WHATSAPP',
        ].filter(Boolean) as ('EMAIL' | 'SMS' | 'WHATSAPP')[]
      ),
      language: item.language,
      template: item.template,
      status: item.enabled ? "ACTIVE" : "INACTIVE",
      customTemplate: {
        subject: item.subject,
        body: item.message,
      },
    })),
  };
  const eventMediaPayload = {
    images: eventImages
  }

  const reviewPublishPayload = {
    status: 'APPROVED'
  }

  const handleSaveDraft = async () => {
    try {
      let currentEventId = eventId;

      // 1️⃣ Init event if not created yet
      if (!currentEventId) {
        const initRes = await initEventCreate().unwrap();

        if (!initRes?.id) return;

        currentEventId = initRes.id;
        setEventId(currentEventId);
      }

      // 2️⃣ Step → Payload map
      const stepPayloadMap: Record<number, any> = {
        1: eventBasicInfoPayload,
        2: eventDateTimePayload,
        3: eventRegistrationPayload,
        5: eventMsgSchedulePayload,
        6: eventMediaPayload,
        7: reviewPublishPayload,
      };

      const payload = stepPayloadMap[currentStep];

      if (!payload) return;

      // 3️⃣ Update event
      const res = await updateEvent({ body: payload, eventId: currentEventId! }).unwrap();

      // 4️⃣ Success feedback
      toast.success(res?.message ?? t('event_saved_as_draft'));
      refetch()
      setCurrentStep(prev => prev + 1)
    } catch (error: any) {
      toast.error(error?.message || t('something_went_wrong'));
    }
  };




  const handlePublish = async () => {
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
      toast.error(t('fix_errors_before_proceeding'));
      return;
    }

    setIsPublishing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsPublishing(false);
    toast.success(t('event_published_success'));
    onClose();
  };

  const addEventDay = () => {
    setEventDays([
      ...eventDays,
      {
        id: Date.now().toString(),
        date: '',
        startTime: '09:00',
        endTime: '17:00',
        description: ''
      }
    ]);
  };

  const removeEventDay = (id: string) => {
    setEventDays(eventDays.filter(d => d.id !== id));
  };

  const addCustomQuestion = () => {
    setCustomQuestions([
      ...customQuestions,
      {
        id: Date.now().toString(),
        label: '',
        type: 'text',
        required: false
      }
    ]);
  };



  const toggleWeekday = (day: string) => {
    if (selectedWeekdays.includes(day)) {
      setSelectedWeekdays(selectedWeekdays.filter(d => d !== day));
    } else {
      setSelectedWeekdays([...selectedWeekdays, day].sort());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-5xl h-[90vh] rounded-xl flex flex-col ${cardClasses} ${isRTL ? 'rtl' : 'ltr'
          }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex-1">
            <h2 className={`text-2xl ${textPrimary}`}>
              {editId ? t('edit_event') : t('create_new_event')}
            </h2>
            <p className={`text-sm mt-1 ${textTertiary}`}>
              {t('step')} {currentStep} {t('step_of')} {steps.length}: {steps[currentStep - 1].label}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className={`text-xs ${textTertiary}`}>
                {(isEventCreating || isEventUpdating) ? (
                  <span className="flex items-center gap-1">
                    <Loader className="w-3 h-3 animate-spin" />
                    {t('saving')}
                  </span>
                ) : (
                  `${t('saved')} ${lastSaved.toLocaleTimeString()}`
                )}
              </span>
            )}
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
            >
              <X className={`w-6 h-6 ${textTertiary}`} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} `}>
          <div className="flex items-center justify-between ">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center flex-1 cursor-pointer"
                onClick={() => setCurrentStep(step.id)}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : currentStep === step.id
                        ? 'bg-teal-500 text-white'
                        : theme === 'dark'
                          ? 'bg-gray-800 text-gray-500'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-1 hidden md:block ${textTertiary}`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${currentStep > step.id
                      ? 'bg-green-500'
                      : theme === 'dark'
                        ? 'bg-gray-800'
                        : 'bg-gray-200'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Activity mode={currentStep === 1 ? "visible" : "hidden"}>
            <EventBasicInformation
              eventName={eventName}
              setEventName={setEventName}
              shortDescription={shortDescription}
              setShortDescription={setShortDescription}
              fullDescription={fullDescription}
              setFullDescription={setFullDescription}
              eventStatus={eventStatus}
              setEventStatus={setEventStatus}
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
            />
          </Activity>

          <Activity mode={currentStep === 2 ? "visible" : "hidden"}>
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
            />
          </Activity>

          <Activity mode={currentStep === 3 ? "visible" : "hidden"}>
            <EventRegistrationCapacity
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
          </Activity>
          <Activity mode={currentStep === 4 ? "visible" : "hidden"}>
            <EventTickets
              eventId={eventId}
              showTicketModal={showTicketModal}
              setShowTicketModal={setShowTicketModal}
              errors={errors}
              setTickets={setTickets}
            />
          </Activity>

          <Activity mode={currentStep === 5 ? "visible" : "hidden"}>
            <NotificationsTimeline
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
          </Activity>
          <Activity mode={currentStep === 6 ? "visible" : "hidden"}>
            <EventMedia
              t={t}
              theme={theme}
              eventImages={eventImages}
              setEventImages={setEventImages}
            />
          </Activity>

          <Activity mode={currentStep === 7 ? "visible" : "hidden"}>
            <EventReviewPublish
              currentStep={currentStep}
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
              tickets={tickets}
            />

          </Activity>
        </div>

        <WizardFooter
          currentStep={currentStep}
          totalSteps={7}
          isSaving={isEventUpdating}
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