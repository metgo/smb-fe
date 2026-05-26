import { useState, useCallback } from "react";
import {
  FileText,
  Users,
  ClipboardList,
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
  VoucherInformation,
  VoucherReview,
  VoucherSuccess,
  VoucherType,
} from "./sub-components";

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

  const { isDark } = useThemeClasses();

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [parsedData, setParsedData] = useState<ParsedData[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const [formData, setFormData] = useState<IVoucherFormData>({
    campaign: "",

    amount: 1000,
    customAmount: false,

    creationType: "bulk",
    bulkCount: 1,
    bulkCreateAssigned: false,

    // Purchaser fields
    purchaserName: "",
    purchaserEmail: "",
    purchaserPhone: "",
    purchaserCountryCode: "",

    // Assignee fields
    assigneeName: "",
    assigneeEmail: "",
    assigneePhone: "",
    assigneeCountryCode: "",

    // Message / notification fields
    message: "",
    smsMessage: "",
    sendEmail: true,

    // Expiration & bulk file
    expirationDate: "",
    xlsFile: null,
  });
  const [response, setResponse] = useState([]);

  const stepPayloadMap =
    formData?.creationType === "upload"
      ? parsedData?.map((item) => ({
          campaignId: formData.campaign,
          amount: formData.amount,
          noOfVoucher: item.noOfVoucher,
          languagePreference: "en",

          // Purchaser stays from formData (same person placing the order)
          purchaserName: formData.purchaserName,
          purchaserEmail: formData.purchaserEmail,
          purchaserPhone: formData.purchaserPhone,
          purchaserCountryCode: formData.purchaserCountryCode,

          // Assignee comes from each row in the uploaded file
          assigneeName: item.assigneeName,
          assigneeEmail: item.assigneeEmail,
          assigneePhone: item.assigneePhone,
          assigneeCountryCode: item.assigneeCountryCode,

          message: formData.message || "",
          smsMessage: formData.smsMessage || "",
          sendEmail: formData.sendEmail ?? true,
          expireDate: formData.expirationDate,
        }))
      : [
          {
            campaignId: formData.campaign,
            amount: formData.amount,
            noOfVoucher:
              formData?.creationType === "single" ? 1 : formData.bulkCount,
            languagePreference: "en",

            purchaserName: formData.purchaserName,
            purchaserEmail: formData.purchaserEmail,
            purchaserPhone: formData.purchaserPhone,
            purchaserCountryCode: formData.purchaserCountryCode,

            assigneeName: formData.assigneeName,
            assigneeEmail: formData.assigneeEmail,
            assigneePhone: formData.assigneePhone,
            assigneeCountryCode: formData.assigneeCountryCode,

            message: formData.message || "",
            smsMessage: formData.smsMessage || "",
            sendEmail: formData.sendEmail ?? true,
            expireDate: formData.expirationDate,
          },
        ];

  const [createVoucher, { isLoading: isCreating }] = useCreateVoucherMutation();

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };
  const [_isPublishBtnClicked, setIsPublishBtnClicked] = useState(false);
  const [_isDraftBtnClicked, setIsDraftBtnClicked] = useState(false);

  const saveDraft = useCallback(
    async (isPublish = false) => {
      try {
        const payload = stepPayloadMap;
        const res = await createVoucher(payload).unwrap();
        setResponse(res);

        toast.success(isPublish ? t("voucher_published") : t("draft_saved"));
      } catch (err: any) {
        toast.error(err?.data?.message || t("draft_failed"));
      }
    },
    [stepPayloadMap, createVoucher, onClose, t],
  );

  const handleSaveDraft = async () => {
    setIsDraftBtnClicked(true);

    await saveDraft(false);
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (formData.amount <= 0) {
          newErrors.amount = "Amount must be greater than 0";
        }
        break;

      case 2:
        if (!formData.creationType) {
          newErrors.creationType = "Please select creation type";
        }
        break;

      case 3:
        if (formData.creationType === "single") {
          if (!formData.assigneeName) {
            newErrors.assigneeName = "Assignee name is required";
          }
          if (!formData.assigneeEmail) {
            newErrors.assigneeEmail = "Assignee email is required";
          }
          if (!formData.assigneePhone) {
            newErrors.assigneePhone = "Assignee phone is required";
          }
        }

        if (formData.creationType === "bulk") {
          if (formData.bulkCount <= 0 || formData.bulkCount > 1000) {
            newErrors.bulkCount = "Bulk count must be between 1 and 1000";
          }

          if (formData.bulkCreateAssigned) {
            if (!formData.assigneeName) {
              newErrors.assigneeName = "Assignee name is required";
            }
            if (!formData.assigneeEmail) {
              newErrors.assigneeEmail = "Assignee email is required";
            }
            if (!formData.assigneePhone) {
              newErrors.assigneePhone = "Assignee phone is required";
            }
          }
        }

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
    setIsPublishBtnClicked(true);
    // Validate all steps
    let allValid = true;
    for (let i = 1; i <= 4; i++) {
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

  const [xlsValidation] = useState<{
    valid: number;
    invalid: number;
    errors: string[];
  } | null>(null);

  const handleCampaignChange = (campaignId: string) => {
    setFormData((prev) => ({
      ...prev,
      campaign: campaignId,
    }));
  };

  const handlePurchaserEmailChange = (email: string) => {
    setFormData((prev) => ({ ...prev, purchaserEmail: email }));
  };

  const handleNext = () => {
    if (currentStep === 4) {
      handlePublish();
    }
    setCurrentStep((prev) => prev + 1);
  };

  // Step configuration
  const steps = [
    { number: 1, icon: FileText, title: t("details") },
    { number: 2, icon: Users, title: t("type") },
    { number: 3, icon: ClipboardList, title: t("configure") },
    { number: 4, icon: Eye, title: t("review") },
    { number: 5, icon: Table, title: t("success") },
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
          {currentStep < 6 && (
            <p
              className={`mt-0.5 flex items-center gap-1 text-xs md:text-sm truncate ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {t("step_of_total", { current: currentStep, total: 5 })}
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
      {currentStep < 6 && (
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
            campaigns={campaigns}
            handleCampaignChange={handleCampaignChange}
            handlePurchaserEmailChange={handlePurchaserEmailChange}
          />
        )}
        {currentStep === 2 && (
          <VoucherType
            t={t}
            errors={errors}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {currentStep === 3 && (
          <VoucherConfigure
            t={t}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            parsedData={parsedData}
            setParsedData={setParsedData}
          />
        )}
        {currentStep === 4 && (
          <VoucherReview
            formData={formData}
            campaigns={campaigns}
            xlsValidation={xlsValidation}
            t={t}
          />
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
        onSaveDraft={handleSaveDraft}
        onDone={handleDone}
        onPublish={() => {}}
        isPublishButton={false}
      />
    </ModalWrapper>
  );
};
export default CreateVoucherWizard;
