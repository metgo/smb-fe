import { useState, useCallback } from "react";
import { User, ClipboardList, Eye, Table, CheckCircle } from "lucide-react";
import { ModalWrapper } from "@/components/wrapper";
import { useCreateVoucherMutation } from "@/store/api/voucherMutationApi";

import { WizardFooter, WizardStepper } from "@/components/shared";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  VoucherConfigure,
  VoucherInformation,
  VoucherReview,
  VoucherSuccess,
} from "./sub-components";
import { makeVoucherAssignee } from "./sub-components/VoucherConfigure";

interface Campaign {
  _id: string;
  name: string;
}
interface AddVoucherWizardProps {
  onClose: () => void;
  campaigns: {
    datas?: {
      data?: Campaign[];
    };
  };
}

const totalSteps = 4;

const CreateVoucherWizard = ({ onClose, campaigns }: AddVoucherWizardProps) => {
  const { t } = useTranslation("vouchers");

  const { isDark, language } = useThemeClasses();

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPublishing, setIsPublishing] = useState(false);

  const [formData, setFormData] = useState<IVoucherFormData>({
    // Purchaser
    purchaserName: "",
    purchaserEmail: "",
    purchaserPhone: "",
    purchaserCountryCode: "+972",

    // Configure
    purchaseType: "single",
    multiMode: "manual",
    assignees: [makeVoucherAssignee()],

    expirationDate: "",
    greeting: "",
  });
  const [response, setResponse] = useState([]);

  const [createVoucher, { isLoading: isCreating }] = useCreateVoucherMutation();

  const activeAssignees =
    formData.purchaseType === "single"
      ? formData.assignees.slice(0, 1)
      : formData.assignees;

  const buildPayload = useCallback(() => {
    const dialCode = (cc: string) => cc.replace(/^\+/, "");
    return activeAssignees.map((a) => ({
      campaignId: a.campaignId,
      amount: Number(a.amount),
      noOfVoucher: 1,
      expireDate: formData.expirationDate
        ? new Date(formData.expirationDate).toISOString()
        : undefined,

      purchaserName: formData.purchaserName,
      purchaserEmail: formData.purchaserEmail,
      purchaserCountryCode: dialCode(formData.purchaserCountryCode),
      purchaserPhone: formData.purchaserPhone,

      assigneeName: a.name,
      assigneeEmail: a.email,
      assigneeCountryCode: dialCode(a.countryCode),
      assigneePhone: a.phone,

      languagePreference: language || "en",
      message: formData.greeting || "",
      smsMessage: formData.greeting || "",
      sendEmail: true,
    }));
  }, [activeAssignees, formData, language]);

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const saveDraft = useCallback(
    async (isPublish = false) => {
      try {
        const res = await createVoucher(buildPayload()).unwrap();
        setResponse(res);

        toast.success(isPublish ? t("voucher_published") : t("draft_saved"));
      } catch (err: any) {
        toast.error(err?.data?.message || t("draft_failed"));
      }
    },
    [buildPayload, createVoucher, t],
  );

  const handleSaveDraft = async () => {
    await saveDraft(false);
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.purchaserName.trim()) {
          newErrors.purchaserName = t("error_purchaser_name_required");
        }
        break;

      case 2:
        if (!formData.expirationDate) {
          newErrors.expirationDate = t("error_expiration_required");
        }
        if (
          activeAssignees.length === 0 ||
          !activeAssignees.every(
            (a) => a.name.trim() && a.email.trim() && a.campaignId && a.amount,
          )
        ) {
          newErrors.assignees = t("error_complete_all_assignees");
        }
        break;

      case 3:
        break;

      default:
        return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDone = () => {
    onClose();
  };

  const handlePublish = async () => {
    let allValid = true;
    for (let i = 1; i <= 3; i++) {
      if (!validateStep(i)) {
        allValid = false;
        setCurrentStep(i);
        break;
      }
    }
    if (!allValid) {
      toast.error(t("fill_all_fields"));
      return;
    }

    setIsPublishing(true);
    await saveDraft(true);
    setIsPublishing(false);
  };

  const handleNext = () => {
    if (currentStep <= 2 && !validateStep(currentStep)) {
      toast.error(t("fill_all_fields"));
      return;
    }
    if (currentStep === 3) {
      handlePublish();
    }
    setCurrentStep((prev) => prev + 1);
  };

  // Step configuration
  const steps = [
    { number: 1, icon: User, title: t("purchaser_info") },
    { number: 2, icon: ClipboardList, title: t("configure") },
    { number: 3, icon: Eye, title: t("review") },
    { number: 4, icon: Table, title: t("success") },
  ];

  return (
    <ModalWrapper onClose={onClose} showSpinner={isCreating}>
      {/* Header */}
      <div
        className={`px-4 py-3 md:px-6 md:py-4 flex items-center justify-between gap-3 border-b ${
          isDark ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <div className="min-w-0">
          <h2
            className={`${isDark ? "text-gray-100" : "text-gray-900"} text-lg md:text-xl truncate`}
          >
            {t("add_voucher")}
          </h2>
          {currentStep <= totalSteps && (
            <p
              className={`mt-0.5 flex items-center gap-1 text-xs md:text-sm truncate ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {t("step_of_total", { current: currentStep, total: totalSteps })}
              <span>{steps[currentStep - 1].title}</span>
            </p>
          )}
        </div>
        <button
          onClick={handleDone}
          className="px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center gap-2 cursor-pointer shrink-0"
        >
          <CheckCircle className="w-4 h-4" />
          <span className="hidden sm:inline">{t("done")}</span>
        </button>
      </div>

      {/* Progress Bar */}
      {currentStep <= totalSteps && (
        <div
          className={`px-4 md:px-6 pt-3 md:pt-4 pb-2 border-b ${
            isDark ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <WizardStepper
            steps={steps}
            currentStep={currentStep}
            totalSteps={steps.length}
            onStepClick={setCurrentStep}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {currentStep === 1 && (
          <VoucherInformation
            t={t}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        )}
        {currentStep === 2 && (
          <VoucherConfigure
            t={t}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            campaigns={campaigns}
          />
        )}
        {currentStep === 3 && (
          <VoucherReview formData={formData} campaigns={campaigns} t={t} />
        )}
        {currentStep === 4 && <VoucherSuccess response={response} t={t} />}
      </div>

      <WizardFooter
        currentStep={currentStep}
        totalSteps={totalSteps}
        isSaving={isCreating}
        isPublishing={isPublishing}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        onDone={handleDone}
        onPublish={() => {}}
        isPublishButton={false}
      />
    </ModalWrapper>
  );
};
export default CreateVoucherWizard;
