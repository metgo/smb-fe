import { useState, useCallback } from "react";
import {
  Check,
  FileText,
  Users,
  ClipboardList,
  Eye,
  Table,
  CheckCircle,
} from "lucide-react";
import { ModalWrapper } from "@/components/wrapper";
import { useCreateVoucherMutation } from "@/store/api/voucherMutationApi";

import { WizardFooter } from "@/components/shared";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import VoucherInformation from "./sub-components/VoucherInformation";
import VoucherType from "./sub-components/VoucherType";
import VoucherConfigure from "./sub-components/VoucherConfigure";
import VoucherReview from "./sub-components/VoucherReview";
import VoucherSuccess from "./sub-components/VoucherSuccess";
interface Campaign {
  _id: string;
  name: string;
}
interface AddVoucherWizardProps {
  onClose: () => void;
  onVoucherCreated?: () => void;
  campaigns: {
    datas?: {
      data?: Campaign[];
    };
  };
}

export function AddVoucherWizard({
  onClose,
  campaigns,
}: AddVoucherWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [parsedData, setParsedData] = useState<ParsedData[]>([]);
  console.log("🚀 ~ AddVoucherWizard ~ parsedData:", parsedData);

  const { isDark } = useThemeClasses();
  const totalSteps = 5;
  const { t } = useTranslation("vouchers");
  const [formData, setFormData] = useState<IVoucherFormData>({
    campaign: "",

    amount: 1000,
    customAmount: false,

    creationType: "single",
    bulkCount: 10,
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
  console.log("🚀 ~ AddVoucherWizard ~ response:", response);
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
  console.log("🚀 ~ AddVoucherWizard ~ stepPayloadMap:", stepPayloadMap);

  const [createVoucher, { isLoading: isCreating }] = useCreateVoucherMutation();

  const [isPublishing, setIsPublishing] = useState(false);
  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };
  const [_isPublishBtnClicked, setIsPublishBtnClicked] = useState(false);
  const [_isDraftBtnClicked, setIsDraftBtnClicked] = useState(false);

  const saveDraft = useCallback(
    async (isPublish = false) => {
      try {
        // if (!Object.keys(stepPayloadMap).length) return;

        const payload = stepPayloadMap;
        console.log("🚀 ~ AddVoucherWizard ~ payload:", payload);

        // if (isPublish) {
        //   payload = {
        //     ...payload,
        //   };
        // }

        const res = await createVoucher(payload).unwrap();
        setResponse(res);
        // onClose();

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
    { id: 1, icon: FileText, label: t("details") },
    { id: 2, icon: Users, label: t("type") },
    { id: 3, icon: ClipboardList, label: t("configure") },
    { id: 4, icon: Eye, label: t("review") },
    { id: 5, icon: Table, label: t("success") },
  ];

  return (
    <ModalWrapper onClose={onClose} showSpinner={isCreating}>
      {/* Header */}
      <div
        className={`px-6 py-4 flex items-center justify-between border-b ${
          isDark ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <div>
          <h2
            className={`${isDark ? "text-gray-100" : "text-gray-900"} text-xl`}
          >
            {t("add_voucher")}
          </h2>
          {currentStep < 6 && (
            <p
              className={`mt-1 flex items-center gap-1 text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {t("step_of_total", { current: currentStep, total: 5 })}
              <span className="flex items-center">
                {t(steps[currentStep - 1].label)}
              </span>
            </p>
          )}
        </div>
        <button
          onClick={handleDone}
          className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center gap-2 cursor-pointer"
        >
          <CheckCircle className="w-4 h-4" />

          {t("done")}
        </button>
      </div>

      {/* Progress Bar */}
      {currentStep < 6 && (
        <div
          className={`px-6 py-4 border-b ${
            isDark ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center flex-1 cursor-pointer"
                onClick={() => setCurrentStep(step.id)}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      currentStep > step.id
                        ? "bg-green-500 text-white"
                        : currentStep === step.id
                          ? "bg-teal-500 text-white"
                          : isDark
                            ? "bg-gray-800 text-gray-500"
                            : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5 bg-green-500" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      currentStep >= step.id
                        ? isDark
                          ? "text-gray-100"
                          : "text-gray-900"
                        : isDark
                          ? "text-gray-500"
                          : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      currentStep > step.id
                        ? "bg-green-500"
                        : isDark
                          ? "bg-gray-800"
                          : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
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
            formData={formData}
            setFormData={setFormData}
            errors={errors}
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
}
