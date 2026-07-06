import clsx from "clsx";
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
import { ModalWrapper } from "@/components/wrapper";
import { PublishButton } from "@/components/btns";
import Media from "@/components/details-sections/Media";
import ProductTranslateButton from "@/pages/products-mgmt/components/sub-components/ProductTranslateButton";
import { EventBasicInformation } from "../sub-components";
import { useEventWizardState } from "./useEventWizardState";
import DateTimeStep from "./steps/DateTimeStep";
import RegistrationStep from "./steps/RegistrationStep";
import TicketsStep from "./steps/TicketsStep";
import MessagingStep from "./steps/MessagingStep";
import ReviewStep from "./steps/ReviewStep";

interface CreateEventWizardNewProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
  refetch?: () => void;
  eventDataRefetch?: () => void;
}

export default function CreateEventWizardNew({
  isOpen,
  onClose,
  editData,
  refetch,
  eventDataRefetch,
}: CreateEventWizardNewProps) {
  const { t } = useTranslation("events");
  const { t: tc } = useTranslation("toast");
  const { textPrimary, textTertiary, isDark } = useThemeClasses();

  const wizard = useEventWizardState({
    isOpen,
    onClose,
    editData,
    refetch,
    eventDataRefetch,
  });

  const steps: IWizardStep[] = [
    { number: 1, icon: FileText, title: t("step_1_basic_information") },
    { number: 2, icon: Languages, title: t("translation") },
    { number: 3, icon: Calendar, title: t("step_2_date_time") },
    { number: 4, icon: Users, title: t("step_3_registration") },
    { number: 5, icon: Ticket, title: t("step_4_tickets") },
    { number: 6, icon: Mail, title: t("messaging") },
    { number: 7, icon: Image, title: t("step_5_media") },
    { number: 8, icon: CheckCircle, title: t("step_6_review") },
  ];

  if (!isOpen) return null;

  const isBusy =
    wizard.isEventCreating ||
    wizard.isEventUpdating ||
    wizard.isWebsiteAccessItemCreating;

  return (
    <ModalWrapper onClose={wizard.handleClose} showSpinner={isBusy}>
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div
        className={clsx(
          "flex items-center justify-between p-6 border-b w-full",
          isDark ? "border-gray-800" : "border-gray-200",
        )}
      >
        <div>
          <h2 className={`text-2xl ${textPrimary}`}>
            {wizard.editId ? t("edit_event") : t("create_new_event")}
          </h2>
          <p className={`text-sm mt-1 ${textTertiary}`}>
            {t("step")} {wizard.currentStep} {t("step_of")} {steps.length}:{" "}
            {steps[wizard.currentStep - 1].title}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {wizard.lastSaved && (
            <span className={`text-xs ${textTertiary}`}>
              {wizard.isEventCreating || wizard.isEventUpdating ? (
                <span className="flex items-center gap-1">
                  <Loader className="w-3 h-3 animate-spin" />
                  {t("saving")}
                </span>
              ) : (
                `${t("saved")} ${wizard.lastSaved.toLocaleTimeString()}`
              )}
            </span>
          )}
          <PublishButton
            onClick={wizard.handlePublish}
            isLoading={wizard.isPublishing}
          />
        </div>
      </div>

      {/* ── Stepper ───────────────────────────────────────────────────── */}
      <div className="w-full px-4">
        <WizardStepper
          steps={steps}
          currentStep={wizard.currentStep}
          totalSteps={steps.length}
          onStepClick={wizard.handleSpecificStepJump}
        />
      </div>

      {/* ── Step Content ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">
        {wizard.currentStep === 1 && (
          <EventBasicInformation
            formData={wizard.translationFormData}
            onChange={wizard.handleTranslateChange}
            searchBusiness={wizard.searchBusiness}
            eventId={wizard.eventId}
            markDirty={wizard.handleMarkDirty}
            internalNotes={wizard.internalNotes}
            setInternalNotes={wizard.setInternalNotes}
            errors={wizard.errors}
            selectedDmoId={wizard.selectedDmoId}
            setSelectDmoId={wizard.setSelectDmoId}
            selectedAuthorityId={wizard.selectedAuthorityId}
            setSelectAuthorityId={wizard.setSelectAuthorityId}
            selectedAccessiblitiesId={wizard.selectedAccessiblitiesId}
            setAccessiblitiesId={wizard.setAccessiblitiesId}
            selectedGroupTypesId={wizard.selectedGroupTypesId}
            setGroupTypesId={wizard.setGroupTypesId}
            selectedSubCategoriesId={wizard.selectedSubCategoriesId}
            setSubCategoriesId={wizard.setSubCategoriesId}
            websiteVisibilityIds={wizard.websiteVisibilityIds}
            setWebsiteVisibilityIds={wizard.setWebsiteVisibilityIds}
            eventAssociatedWebsites={wizard.editAssociatedWebsites}
            selectedBusinessId={wizard.selectedBusinessId}
            setSelectedBusinessId={wizard.setSelectedBusinessId}
            businesses={wizard.businesses}
            isBusinessLoading={
              wizard.isBusinessesLoading || wizard.isBusinessSearching
            }
          />
        )}

        {wizard.currentStep === 2 && (
          <ProductTranslateButton
            formData={wizard.translationFormData}
            onChange={wizard.handleTranslateChange}
          />
        )}

        {wizard.currentStep === 3 && (
          <DateTimeStep
            geo={wizard.geo}
            setGeo={wizard.setGeo}
            isMultiDay={wizard.isMultiDay}
            setIsMultiDay={wizard.setIsMultiDay}
            startDate={wizard.startDate}
            setStartDate={wizard.setStartDate}
            eventDays={wizard.eventDays}
            setEventDays={wizard.setEventDays}
            eventFormat={wizard.eventFormat}
            setEventFormat={wizard.setEventFormat}
            address={wizard.address}
            setAddress={wizard.setAddress}
            onlineLink={wizard.onlineLink}
            setOnlineLink={wizard.setOnlineLink}
            errors={wizard.errors}
            addEventDay={wizard.addEventDay}
            removeEventDay={wizard.removeEventDay}
            isRecurring={wizard.isRecurring}
            setIsRecurring={wizard.setIsRecurring}
            recurrencePattern={wizard.recurrencePattern}
            setRecurrencePattern={wizard.setRecurrencePattern}
            toggleWeekday={wizard.toggleWeekday}
            selectedWeekdays={wizard.selectedWeekdays}
            monthlyType={wizard.monthlyType}
            setMonthlyType={wizard.setMonthlyType}
            recurrenceEndCount={wizard.recurrenceEndCount}
            setRecurrenceEndCount={wizard.setRecurrenceEndCount}
            recurrenceEndDate={wizard.recurrenceEndDate}
            setRecurrenceEndDate={wizard.setRecurrenceEndDate}
            recurrenceEndType={wizard.recurrenceEndType}
            setRecurrenceEndType={wizard.setRecurrenceEndType}
            specificDate={wizard.specificDate}
            setSpecificDate={wizard.setSpecificDate}
            relativeDate={wizard.relativeDate}
            setRelativeDate={wizard.setRelativeDate}
            relativeDay={wizard.relativeDay}
            setRelativeDay={wizard.setRelativeDay}
            customInterval={wizard.customInterval}
            setCustomInterval={wizard.setCustomInterval}
            customUnit={wizard.customUnit}
            setCustomUnit={wizard.setCustomUnit}
            markDirty={wizard.handleMarkDirty}
          />
        )}

        {wizard.currentStep === 4 && (
          <RegistrationStep
            markDirty={wizard.handleMarkDirty}
            registrationRequired={wizard.registrationRequired}
            setRegistrationRequired={wizard.setRegistrationRequired}
            capacityType={wizard.capacityType}
            setCapacityType={wizard.setCapacityType}
            capacity={wizard.capacity}
            setCapacity={wizard.setCapacity}
            customQuestions={wizard.customQuestions}
            setCustomQuestions={wizard.setCustomQuestions}
            addCustomQuestion={wizard.addCustomQuestion}
            errors={wizard.errors}
          />
        )}

        {wizard.currentStep === 5 && (
          <TicketsStep
            tickets={wizard.localTickets}
            eventId={wizard.eventId}
            setEventId={wizard.setEventId}
            initEventCreate={() =>
              wizard.initEventCreate({ businessId: wizard.selectedBusinessId })
            }
            showTicketModal={wizard.showTicketModal}
            setShowTicketModal={wizard.setShowTicketModal}
            errors={wizard.errors}
            refetch={wizard.ticketRefetch}
            eventDays={wizard.eventDaysForTickets}
          />
        )}

        {wizard.currentStep === 6 && (
          <MessagingStep
            markDirty={wizard.handleMarkDirty}
            notifications={wizard.notifications}
            setNotifications={wizard.setNotifications}
            editingNotification={wizard.editingNotification}
            setEditingNotification={wizard.setEditingNotification}
            showNotificationForm={wizard.showNotificationForm}
            setShowNotificationForm={wizard.setShowNotificationForm}
            eventLanguage={wizard.eventLanguage}
            eventName={wizard.translationFormData.name}
            startDate={wizard.startDate}
            eventDays={wizard.eventDays}
            address={wizard.address}
            capacity={wizard.capacity}
          />
        )}

        {wizard.currentStep === 7 && (
          <Media
            images={wizard.images}
            imagesRef={wizard.imagesRef}
            setPrimaryImage={wizard.setPrimaryImage}
            handleImageUpload={wizard.handleImageUpload}
            primaryImageIndex={wizard.primaryImageIndex}
            deleteTarget={wizard.deleteTarget}
            setDeleteTarget={wizard.setDeleteTarget}
            confirmDelete={wizard.confirmDelete}
            handleDeleteImage={wizard.handleDeleteImage}
            isImageDeleting={wizard.isImageDeleting}
          />
        )}

        {wizard.currentStep === 8 && (
          <ReviewStep
            images={wizard.images}
            setCurrentStep={wizard.setCurrentStep}
            eventName={wizard.translationFormData.name}
            shortDescription={wizard.translationFormData.shortDescription}
            eventLanguage={wizard.eventLanguage}
            eventStatus={wizard.eventStatus}
            isMultiDay={wizard.isMultiDay}
            startDate={wizard.startDate}
            eventFormat={wizard.eventFormat}
            address={wizard.address}
            onlineLink={wizard.onlineLink}
            registrationRequired={wizard.registrationRequired}
            capacityType={wizard.capacityType}
            capacity={wizard.capacity}
            customQuestions={wizard.customQuestions}
            tickets={wizard.localTickets}
          />
        )}
      </div>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <WizardFooter
        currentStep={wizard.currentStep}
        totalSteps={steps.length}
        isSaving={wizard.isEventUpdating}
        isPublishing={wizard.isPublishing}
        onPrevious={wizard.handlePrevious}
        onNext={wizard.handleNext}
        onSaveDraft={wizard.handleSaveDraft}
        onPublish={wizard.handlePublish}
      />

      {/* ── Unsaved changes dialog ────────────────────────────────────── */}
      <ConfirmDialog
        open={wizard.showClosePopup}
        title={tc("unsaved_changes")}
        message={tc("close_without_saving")}
        confirmText={tc("close")}
        variant="danger"
        onCancel={() => wizard.setShowClosePopup(false)}
        onConfirm={() => {
          wizard.setShowClosePopup(false);
          onClose();
        }}
      />
    </ModalWrapper>
  );
}
