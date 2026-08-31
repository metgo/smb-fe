import { useState, useCallback } from "react";
import {
  User,
  ClipboardList,
  MessageSquareText,
  Eye,
  Table,
  CheckCircle,
} from "lucide-react";
import { ModalWrapper } from "@/components/wrapper";
import { useCreateVoucherMutation } from "@/store/api/voucherMutationApi";

import { WizardFooter, WizardStepper } from "@/components/shared";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  VoucherConfigure,
  VoucherGreeting,
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

const totalSteps = 5;

const CreateVoucherWizard = ({ onClose, campaigns }: AddVoucherWizardProps) => {
  const { t } = useTranslation("vouchers");

  const { isDark, language } = useThemeClasses();

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasCreated, setHasCreated] = useState(false);

  const [formData, setFormData] = useState<IVoucherFormData>({
    // Purchaser
    purchaserName: "",
    purchaserEmail: "",
    purchaserPhone: "",
    purchaserCountryCode: "+972",

    // Configure
    purchaseType: "multiple",
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
      expireDate: a.expireDate
        ? new Date(a.expireDate).toISOString()
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
      sendEmail: true,
    }));
  }, [activeAssignees, formData, language]);

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const publishVouchers = useCallback(async (): Promise<boolean> => {
    try {
      const res = await createVoucher(buildPayload()).unwrap();
      setResponse(res);
      setHasCreated(true);
      toast.success(t("voucher_published"));
      return true;
    } catch (err: any) {
      toast.error(err?.data?.message || t("voucher_publish_failed"));
      return false;
    }
  }, [buildPayload, createVoucher, t]);

  // Is there anything worth warning about before a plain close/cancel?
  const isDirty =
    formData.purchaserName.trim() !== "" ||
    formData.greeting.trim() !== "" ||
    formData.assignees.some(
      (a) =>
        a.name.trim() ||
        a.email.trim() ||
        a.phone.trim() ||
        a.campaignId ||
        a.amount ||
        a.expireDate,
    );

  // Guarded close: if the user entered data but never created the vouchers,
  // confirm before discarding. Used for the X / drag-dismiss / cancel paths.
  const requestClose = () => {
    if (hasCreated || currentStep >= totalSteps || !isDirty) {
      onClose();
      return;
    }
    if (window.confirm(t("confirm_discard_voucher"))) onClose();
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.purchaserName.trim()) {
          newErrors.purchaserName = t("error_purchaser_name_required");
        }
        break;

      case 2: {
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const today = new Date().toISOString().split("T")[0];
        const allAssigneesValid =
          activeAssignees.length > 0 &&
          activeAssignees.every(
            (a) =>
              a.name.trim() &&
              emailRe.test(a.email.trim()) &&
              a.campaignId &&
              Number(a.amount) > 0 &&
              a.expireDate &&
              a.expireDate >= today,
          );
        if (!allAssigneesValid) {
          // Flag only — VoucherConfigure reads this to reveal the per-field
          // errors; no aggregate message is displayed.
          newErrors.assignees = "invalid";
        }
        break;
      }

      case 3:
        break;

      case 4:
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
    for (let i = 1; i <= 4; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i);
        toast.error(t("fill_all_fields"));
        return;
      }
    }

    setIsPublishing(true);
    const ok = await publishVouchers();
    setIsPublishing(false);
    // Only move to the success screen once the vouchers really exist.
    if (ok) setCurrentStep(totalSteps);
  };

  const handleNext = () => {
    if (currentStep <= 2 && !validateStep(currentStep)) {
      toast.error(t("fill_all_fields"));
      return;
    }
    // Step 4 → publish. handlePublish advances to the success step itself,
    // and only if the API call succeeds.
    if (currentStep === 4) {
      handlePublish();
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  // Step configuration
  const steps = [
    { number: 1, icon: User, title: t("purchaser_info") },
    { number: 2, icon: ClipboardList, title: t("assignee_information") },
    { number: 3, icon: MessageSquareText, title: t("greeting_message") },
    { number: 4, icon: Eye, title: t("review") },
    { number: 5, icon: Table, title: t("success") },
  ];

  const onSuccessStep = currentStep >= totalSteps;

  return (
    <ModalWrapper onClose={requestClose} showSpinner={isCreating}>
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
        <div className="flex items-center gap-2 shrink-0">
          {!onSuccessStep && (
            <button
              onClick={requestClose}
              className={`px-3 py-1.5 sm:px-5 sm:py-2 rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                  : "border-gray-300 hover:bg-gray-100 text-gray-700"
              }`}
            >
              {t("cancel")}
            </button>
          )}
          <button
            onClick={onSuccessStep ? handleDone : handlePublish}
            disabled={isPublishing || isCreating}
            className="px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="hidden sm:inline">
              {onSuccessStep ? t("done") : t("create_vouchers")}
            </span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {currentStep <= totalSteps && (
        <div
          className={`px-4 md:px-6 pb-2 border-b ${
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
      <div className="flex-1 overflow-y-auto  p-2">
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
          <VoucherGreeting formData={formData} setFormData={setFormData} t={t} />
        )}
        {currentStep === 4 && (
          <VoucherReview formData={formData} campaigns={campaigns} t={t} />
        )}
        {currentStep === 5 && <VoucherSuccess response={response} t={t} />}
      </div>

      <WizardFooter
        currentStep={currentStep}
        totalSteps={totalSteps}
        isSaving={isCreating}
        isPublishing={isPublishing}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onDone={handleDone}
        onPublish={() => {}}
        isPublishButton={false}
      />
    </ModalWrapper>
  );
};
export default CreateVoucherWizard;
