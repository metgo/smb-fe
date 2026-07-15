import clsx from "clsx";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FileText,
  MapPin,
  CalendarClock,
  Image as ImageIcon,
  CheckCircle,
} from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ModalWrapper } from "@/components/wrapper";
import { WizardFooter, WizardStepper } from "@/components/shared";
import { useTrip } from "../hooks/useTrip";
import {
  TripBasicInfo,
  TripImageSelection,
  TripItenary,
  TripPreview,
  TripStationsSelection,
} from "./sub-components";

interface CreateTripWizardProps {
  onClose: () => void;
}

const CreateTripWizard = ({ onClose }: CreateTripWizardProps) => {
  const { t } = useTranslation("trips");
  const { textPrimary, theme } = useThemeClasses();

  const [currentStep, setCurrentStep] = useState(1);

  const {
    handleSubmit,
    handleInputChange,
    formData,
    description,
    setDescription,
    shortDescription,
    setshortDescription,
    selectedImages,
    setSelectedImages,
    selectedStationDetails,
    stationsData,
    activeCategoryIds,
    setClickedStation,
    schedules,
    setSchedules,
    isSubmitting,

    selectedDmoId,
    setSelectedDmoId,
    selectedAuthorityId,
    setSelectAuthorityId,
    websiteVisibilityIds,
    setWebsiteVisibilityIds,
  } = useTrip();

  const steps = [
    { number: 1, title: t("step_basic_info"), icon: FileText },
    { number: 2, title: t("step_stations"), icon: MapPin },
    { number: 3, title: t("step_itenary"), icon: CalendarClock },
    { number: 4, title: t("step_media"), icon: ImageIcon },
    { number: 5, title: t("step_review_submit"), icon: CheckCircle },
  ];
  const totalSteps = steps.length;

  const handleNext = () =>
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  const handlePrevious = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handlePublish = () => {
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <TripBasicInfo
            t={t}
            isEdit={false}
            formData={formData}
            errors={{}}
            handleInputChange={handleInputChange}
            description={description}
            setDescription={setDescription}
            shortDescription={shortDescription}
            setshortDescription={setshortDescription}

            setErrors={() => {}}
            selectedDmoId={selectedDmoId}
            setSelectDmoId={setSelectedDmoId}
            selectedAuthorityId={selectedAuthorityId}
            setSelectAuthorityId={setSelectAuthorityId}
            websiteVisibilityIds={websiteVisibilityIds}
            setWebsiteVisibilityIds={setWebsiteVisibilityIds}
            associatedWebsiteIds={[]}
          />
        );
      case 2:
        return (
          <TripStationsSelection
            t={t}
            businesses={stationsData?.data ?? []}
            selectedStationDetails={selectedStationDetails}
            activeCategoryIds={activeCategoryIds}
            setClickedStation={setClickedStation}
          />
        );
      case 3:
        return (
          <TripItenary
            t={t}
            schedules={schedules}
            setSchedules={setSchedules}
          />
        );
      case 4:
        return (
          <TripImageSelection
            t={t}
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
          />
        );
      case 5:
        return (
          <TripPreview
            t={t}
            formData={formData}
            description={description}
            shortDescription={shortDescription}
            selectedImages={selectedImages}
            selectedStationDetails={selectedStationDetails}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ModalWrapper onClose={onClose} showSpinner={isSubmitting}>
      <div className={clsx("px-4 pt-3 md:px-6 border-b", textPrimary)}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className={clsx("text-lg md:text-2xl truncate", textPrimary)}>
              {t("create_trip")}
            </h2>
            <p
              className={`text-xs md:text-sm truncate ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
            >
              {t("step")} {currentStep} {t("of")} {totalSteps}:{" "}
              {steps[currentStep - 1]?.title}
            </p>
          </div>
        </div>

        <WizardStepper
          steps={steps}
          currentStep={currentStep}
          totalSteps={steps.length}
          onStepClick={setCurrentStep}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">{renderStep()}</div>

      <WizardFooter
        currentStep={currentStep}
        totalSteps={totalSteps}
        isSaving={false}
        isPublishing={isSubmitting}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onPublish={handlePublish}
      />
    </ModalWrapper>
  );
};

export default CreateTripWizard;
