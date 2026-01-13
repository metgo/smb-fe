import { toast } from 'sonner';
import { useState, useEffect, Activity } from 'react';
import {
  X, Check, Calendar,
  Users, Ticket, Image, FileText, CheckCircle, Loader,
  Mail
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks/hooks';

import EventMedia from './sub-components/EventMedia';
import { useThemeClasses } from '@/hooks/useThemeClasses';
import CreateTicketWizard from './sub-components/CreateTicketWizard';
import NotificationsTimeline from './sub-components/NotificationsTimeline';
import EventDateTimeFormat from './sub-components/EventDateTimeFormat';
import EventRegistrationCapacity from './sub-components/EventRegistrationCapacity';
import EventTickets from './sub-components/EventTickets';
import EventReviewPublish from './sub-components/EventReviewPublish';
import EventBasicInformation from './sub-components/EventBasicInformation';
import { WizardFooter } from '@/components/shared';
import { useCreateEventStep1Mutation } from '@/store/api/eventsApi';

interface CreateEventWizardProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  mode?: 'create' | 'edit' | 'duplicate';
  existingEvent?: any;
}

export default function CreateEventWizard({
  isOpen,
  onClose,
  theme,
  mode = 'create',
  existingEvent
}: CreateEventWizardProps) {
  const { t } = useTranslation('events');
  const { isRTL } = useAppSelector((state) => state.settings)
  const { cardClasses, textPrimary, textTertiary } = useThemeClasses();

  const [createEventStep1, { isLoading }] = useCreateEventStep1Mutation()

  const [currentStep, setCurrentStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Step 1: Basic Information
  const [eventName, setEventName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [eventLanguage, setEventLanguage] = useState<Language>('en');
  const [slug, setSlug] = useState('');
  const [eventStatus, setEventStatus] = useState<'draft' | 'pending' | 'approved'>('draft');
  const [internalNotes, setInternalNotes] = useState('');
  const [selectedSubCategoriesId, setSubCategoriesId] = useState<string[]>([])
  const [selectedGroupTypesId, setGroupTypesId] = useState<string[]>([])
  const [selectedAccessiblitiesId, setAccessiblitiesId] = useState<string[]>([])


  // Step 2: Date, Time & Format
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eventDays, setEventDays] = useState<EventDay[]>([
    { id: '1', date: '', startTime: '09:00', endTime: '17:00', description: '' }
  ]);
  const [eventFormat, setEventFormat] = useState<'physical' | 'online' | 'hybrid'>('physical');
  const [address, setAddress] = useState('');
  const [onlineLink, setOnlineLink] = useState('');

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('weekly');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1); // For custom "every X days"
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1]); // 0=Sun, 1=Mon, etc.
  const [monthlyType, setMonthlyType] = useState<MonthlyType>('date'); // By date or by day
  const [monthlyOrdinal, setMonthlyOrdinal] = useState<MonthlyOrdinal>('1st');
  const [monthlyWeekday, setMonthlyWeekday] = useState(1); // 0=Sun, 1=Mon, etc.
  const [recurrenceEndType, setRecurrenceEndType] = useState<RecurrenceEndType>('count');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [recurrenceEndCount, setRecurrenceEndCount] = useState(10);
  const [showRecurrenceEditModal, setShowRecurrenceEditModal] = useState(false);
  const [recurrenceEditScope, setRecurrenceEditScope] = useState<'this' | 'future' | 'all'>('this');


  // Step 3: Registration & Capacity
  const [registrationRequired, setRegistrationRequired] = useState(true);
  const [capacityType, setCapacityType] = useState<'unlimited' | 'limited'>('limited');
  const [capacity, setCapacity] = useState(100);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

  // Step 4: Tickets
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketData | null>(null);

  // Step 5: Messaging
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState<NotificationData | null>(null);

  // Step 6: Media
  const [images, setImages] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

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
    if (isOpen && mode === 'create') {
      // Reset to initial state
      setCurrentStep(1);
      setEventName('');
      setShortDescription('');
      setFullDescription('');
      setEventLanguage('en');
      setSlug('');
      setEventStatus('draft');
      setInternalNotes('');
      setIsMultiDay(false);
      setStartDate('');
      setEndDate('');
      setEventDays([{ id: '1', date: '', startTime: '09:00', endTime: '17:00', description: '' }]);
      setEventFormat('physical');
      setAddress('');
      setOnlineLink('');
      setRegistrationRequired(true);
      setCapacityType('limited');
      setCapacity(100);
      setCustomQuestions([]);
      setTickets([]);
      setImages([]);
      setPrimaryImageIndex(0);
      setErrors({});
      setLastSaved(null);
    }
  }, [isOpen, mode]);

  // Auto-generate slug from event name
  useEffect(() => {
    if (eventName && !slug) {
      const generatedSlug = eventName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  }, [eventName, slug]);

  // Auto-save functionality
  useEffect(() => {
    if (isOpen && eventName) {
      const timer = setTimeout(() => {
        handleAutoSave();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [eventName, shortDescription, fullDescription, isOpen]);




  const handleAutoSave = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setLastSaved(new Date());
  };

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
        if (tickets.length === 0 && registrationRequired) {
          newErrors.tickets = t('at_least_one_ticket_required');
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 7));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const payload: EventPayload = {
    name: eventName,
    description: fullDescription,
    shortDescription: shortDescription,
    authorityId: undefined,
    dmoId: undefined,
    status: eventStatus.toUpperCase(),
    groupTypesId: selectedGroupTypesId,
    accessibilitiesId: selectedAccessiblitiesId,
    subCategoriesId: selectedSubCategoriesId,
    internalNotes: internalNotes,
    dayDescription: eventDays?.map(item => ({
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime
    })),
    eventType: eventFormat.toUpperCase(),
    address: {
      country: "",
      city: "",
      location: "",
      additional_information: "",
    },
    onlineLink: onlineLink,
    registration: {
      isRegistration: registrationRequired,
      noOfPeople: capacity,
      isUnlimited: capacityType === "limited" ? false : true,
    },
    customQuestions: customQuestions,
    // images: 
    // rejected_reason
    geoLocation: { lat: "", long: "" },
    // recurringEventRule: {

    // }

  }

  const handleSaveDraft = async () => {
    const data = await createEventStep1(payload).unwrap()
    if (data?.message) {
      toast.success(data?.message)
    }
    toast.success(t('event_saved_as_draft'));
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

  const addTicket = () => {
    setEditingTicket({
      id: Date.now().toString(),
      name: '',
      description: '',
      type: 'free',
      markedPrice: 0,
      sellingPrice: 0,
      quantity: 100,
      perUserLimit: 5,
      saleStart: '',
      saleEnd: '',
      visibility: 'public',
      assignedDays: []
    });
    setShowTicketModal(true);
  };

  const deleteTicket = (id: string) => {
    if (confirm(t('delete_ticket_confirm'))) {
      setTickets(tickets.filter(t => t.id !== id));
    }
  };
  const toggleWeekday = (day: number) => {
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
              {mode === 'create' ? t('create_new_event') : mode === 'edit' ? t('edit_event') : t('duplicate_event')}
            </h2>
            <p className={`text-sm mt-1 ${textTertiary}`}>
              {t('step')} {currentStep} {t('step_of')} {steps.length}: {steps[currentStep - 1].label}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className={`text-xs ${textTertiary}`}>
                {isLoading ? (
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
              <div key={step.id} className="flex items-center flex-1">
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
              monthlyOrdinal={monthlyOrdinal}
              setMonthlyOrdinal={setMonthlyOrdinal}
              monthlyWeekday={monthlyWeekday}
              setMonthlyWeekday={setMonthlyWeekday}
              recurrenceEndCount={recurrenceEndCount}
              setRecurrenceEndCount={setRecurrenceEndCount}
              recurrenceEndDate={recurrenceEndDate}
              setRecurrenceEndDate={setRecurrenceEndDate}
              recurrenceEndType={recurrenceEndType}
              setRecurrenceEndType={setRecurrenceEndType}
              recurrenceInterval={recurrenceInterval}
              setRecurrenceInterval={setRecurrenceInterval}
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
              currentStep={currentStep}
              tickets={tickets}
              setTickets={setTickets}
              editingTicket={editingTicket}
              setEditingTicket={setEditingTicket}
              showTicketModal={showTicketModal}
              setShowTicketModal={setShowTicketModal}
              errors={errors}
              addTicket={addTicket}
              deleteTicket={deleteTicket}
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
              currentStep={currentStep}
              images={images}
              setImages={setImages}
              primaryImageIndex={primaryImageIndex}
              setPrimaryImageIndex={setPrimaryImageIndex}
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
          isSaving={isLoading}
          isPublishing={isPublishing}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
        />
      </div>

      <Activity mode={(showTicketModal && editingTicket ? "visible" : "hidden")}>
        <CreateTicketWizard
          theme={theme}
          editingTicket={editingTicket}
          tickets={tickets}
          setTickets={setTickets}
          setShowTicketModal={setShowTicketModal}
          setEditingTicket={setEditingTicket}
        />
      </Activity>
    </div>
  );
}