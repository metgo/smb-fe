import { useState, useRef, useEffect, useCallback } from "react";
import {
  Check,
  FileText,
  Users,
  ClipboardList,
  Eye,
  CupSoda,
} from "lucide-react";
import { ModalWrapper } from "@/components/wrapper";
import {
  useCreateVoucherMutation,
  useUpdateVoucherMutation,
} from "@/store/api/voucherMutationApi";

import { WizardFooter } from "@/components/shared";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { PublishButton } from "@/components/btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import VoucherInformation from "./sub-components/VoucherInformation";
import VoucherType from "./sub-components/VoucherType";
import VoucherConfigure from "./sub-components/VoucherConfigure";
import VoucherReview from "./sub-components/VoucherReview";
import VoucherSuccess from "./sub-components/VoucherSuccess";

interface AddVoucherWizardProps {
  onClose: () => void;
  onVoucherCreated?: () => void;
  campaigns: {
    datas?: {
      data?: any[];
    };
  };
}

interface VoucherFormData {
  campaign: string;

  amount: number;
  customAmount: boolean;

  creationType: string;
  bulkCount: number;
  bulkCreateAssigned: boolean;

  purchaserName: string;
  purchaserEmail: string;
  purchaserPhone: string;
  purchaserCountryCode: string;

  assigneeName: string;
  assigneeEmail: string;
  assigneePhone: string;
  assigneeCountryCode: string;

  message: string;
  smsMessage: string;
  sendEmail: boolean;

  expirationDate: string;
  xlsFile: File | null;
}

export function AddVoucherWizard({
  onClose,
  campaigns,
}: AddVoucherWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { isDark } = useThemeClasses();
  const totalSteps = 5;
  const { t } = useTranslation("vouchers");
  const [formData, setFormData] = useState<VoucherFormData>({
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

  const stepPayloadMap = [
    {
      campaignId: formData.campaign,

      amount: formData.amount,

      noOfVoucher: formData?.creationType === "single" ? 1 : formData.bulkCount,

      //  (person paying / ordering)
      purchaserName: formData.purchaserName,
      purchaserEmail: formData.purchaserEmail,
      purchaserPhone: formData.purchaserPhone,
      purchaserCountryCode: formData.purchaserCountryCode,

      //  (person who will receive / be responsible)
      assigneeName: formData.assigneeName,
      assigneeEmail: formData.assigneeEmail,
      assigneePhone: formData.assigneePhone,
      assigneeCountryCode: formData.assigneeCountryCode,

      // Message / communication
      message: formData.message || "",
      smsMessage: formData.smsMessage || "",
      sendEmail: formData.sendEmail ?? true,

      // Campaign / gift / voucher expiration
      expireDate: formData.expirationDate,
    },
  ];

  const [_updateVoucher, { isLoading: isSaving }] = useUpdateVoucherMutation();
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
        if (!Object.keys(stepPayloadMap).length) return;

        let payload = stepPayloadMap;
        console.log("🚀 ~ AddVoucherWizard ~ payload:", payload);

        if (isPublish) {
          payload = {
            ...payload,
          };
        }

        await createVoucher(payload).unwrap();

        onClose();

        toast.success(isPublish ? t("business_published") : t("draft_saved"));
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
  const [createdVouchers, setCreatedVouchers] = useState<any[]>([]);
  const [xlsValidation] = useState<{
    valid: number;
    invalid: number;
    errors: string[];
  } | null>(null);
  const [isWebsiteDropdownOpen, setIsWebsiteDropdownOpen] = useState(false);
  const [showPurchaserSuggestions, setShowPurchaserSuggestions] =
    useState(false);

  const websiteDropdownRef = useRef<HTMLDivElement>(null);
  const purchaserDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside handler for website dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        websiteDropdownRef.current &&
        !websiteDropdownRef.current.contains(event.target as Node)
      ) {
        setIsWebsiteDropdownOpen(false);
      }
    };

    if (isWebsiteDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isWebsiteDropdownOpen]);

  // Click outside handler for purchaser dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        purchaserDropdownRef.current &&
        !purchaserDropdownRef.current.contains(event.target as Node)
      ) {
        setShowPurchaserSuggestions(false);
      }
    };

    if (showPurchaserSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPurchaserSuggestions]);

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
      handleSubmit();
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleSubmit = () => {
    // Simulate voucher creation
    const Vouchers: any[] = [];
    const count =
      formData.creationType === "single"
        ? 1
        : formData.creationType === "bulk"
          ? formData.bulkCount
          : xlsValidation?.valid || 0;

    for (let i = 0; i < count; i++) {
      Vouchers.push({
        code: `VCH-${String(Math.floor(Math.random() * 1000000)).padStart(6, "0")}`,
        assigneeName:
          formData.creationType === "single"
            ? formData.assigneeName
            : formData.assigneeName,
        email:
          formData.creationType === "single"
            ? formData.assigneeEmail
            : formData.assigneeEmail,
        amount: formData.amount,
        status: "Created",
      });
    }

    setCreatedVouchers(Vouchers);
  };

  // Step configuration
  const steps = [
    { id: 1, icon: FileText, label: t("details") },
    { id: 2, icon: Users, label: t("type") },
    { id: 3, icon: ClipboardList, label: t("configure") },
    { id: 4, icon: Eye, label: t("review") },
    { id: 5, icon: CupSoda, label: t("success") },
  ];

  return (
    <ModalWrapper onClose={onClose} showSpinner={isCreating || isSaving}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl text-gray-900 dark:text-gray-100">
            {t("add_voucher")}
          </h2>
          {currentStep < 5 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
              {t("step_of_total", { current: currentStep, total: 4 })}
              <span className="flex items-center">
                {t(steps[currentStep - 1].label)}
              </span>
            </p>
          )}
        </div>
        <PublishButton onClick={handlePublish} isLoading={isPublishing} />
      </div>

      {/* Progress Bar */}
      {currentStep < 5 && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
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
                        ? "text-gray-900 dark:text-gray-100"
                        : "text-gray-500 dark:text-gray-500"
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
                        : // : theme === 'dark'
                          // ? 'bg-gray-800'
                          "bg-gray-200"
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
            purchaserDropdownRef={purchaserDropdownRef}
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
          />
        )}{" "}
        {currentStep === 4 && (
          <VoucherReview
            formData={formData}
            campaigns={campaigns}
            xlsValidation={xlsValidation}
            t={t}
          />
        )}{" "}
        {currentStep === 5 && (
          <VoucherSuccess
            createdVouchers={createdVouchers}
            onVoucherCreated={handlePublish}
            t={t}
          />
        )}{" "}
      </div>

      <WizardFooter
        currentStep={currentStep}
        totalSteps={totalSteps}
        isSaving={isSaving || isCreating}
        isPublishing={isPublishing}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />
    </ModalWrapper>
  );
}
