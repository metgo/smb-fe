import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Check,
  Upload,
  Download,
  AlertCircle,
  ChevronDown,
  FileText,
  Users,
  ClipboardList,
  Eye,
  CheckCircle,
  User,
} from "lucide-react";
import { ModalWrapper } from "@/components/wrapper";
import {
  useInitVoucherCreateMutation,
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
  // language: Language;
  // theme: Theme;
  onClose: () => void;
  onVoucherCreated: () => void;
}

type CreationType = "single" | "bulk" | "upload";

interface VoucherFormData {
  websites: string[];
  campaign: string;
  amount: number;
  customAmount: boolean;
  creationType: CreationType;
  bulkCount: number;
  bulkCreateAssigned: boolean;
  assigneeName: string;
  assigneeEmail: string;
  assigneePhone: string;
  purchaserName: string;
  purchaserEmail: string;
  purchaserPhone: string;
  expirationDate: string;
  xlsFile: File | null;
}

interface CreatedVoucher {
  code: string;
  assigneeName: string;
  email: string;
  amount: number;
  status: string;
}

// Mock database of existing users for autocomplete
const existingUsers = [
  {
    name: "Sarah Cohen",
    email: "sarah.cohen@example.com",
    phone: "+972-50-1234567",
  },
  {
    name: "David Levi",
    email: "david.levi@example.com",
    phone: "+972-52-2345678",
  },
  {
    name: "Rachel Mizrahi",
    email: "rachel.m@example.com",
    phone: "+972-54-3456789",
  },
  {
    name: "Yosef Katz",
    email: "yosef.katz@example.com",
    phone: "+972-53-4567890",
  },
  {
    name: "Miriam Stein",
    email: "miriam.stein@example.com",
    phone: "+972-50-5678901",
  },
  {
    name: "Daniel Shapiro",
    email: "d.shapiro@example.com",
    phone: "+972-52-6789012",
  },
  {
    name: "Tamar Ben-David",
    email: "tamar.bd@example.com",
    phone: "+972-54-7890123",
  },
  {
    name: "Michael Rosenberg",
    email: "michael.r@example.com",
    phone: "+972-53-8901234",
  },
];

export function AddVoucherWizard({
  // language,
  // theme,
  onClose,
  onVoucherCreated,
}: AddVoucherWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { isDark } = useThemeClasses();
  const totalSteps = 4;
  const { t } = useTranslation("businesses");
  const [formData, setFormData] = useState<VoucherFormData>({
    websites: [],
    campaign: "",
    amount: 100,
    customAmount: false,
    creationType: "single",
    bulkCount: 10,
    bulkCreateAssigned: false,
    assigneeName: "",
    assigneeEmail: "",
    assigneePhone: "",
    purchaserName: "",
    purchaserEmail: "",
    purchaserPhone: "",
    expirationDate: "",
    xlsFile: null,
  });
  console.log("🚀 ~ AddVoucherWizard ~ formData:", formData);
  const stepPayloadMap = {
    websites: formData.websites,
    campaign: formData.campaign,

    amount: formData.amount,
    customAmount: formData.customAmount,

    creationType: formData.creationType,
    bulkCount: formData.bulkCount,
    bulkCreateAssigned: formData.bulkCreateAssigned,

    assigneeName: formData.assigneeName,
    assigneeEmail: formData.assigneeEmail,
    assigneePhone: formData.assigneePhone,

    purchaserName: formData.purchaserName,
    purchaserEmail: formData.purchaserEmail,
    purchaserPhone: formData.purchaserPhone,

    expirationDate: formData.expirationDate,

    xlsFile: formData.xlsFile,
  };
  const [voucherId, setVoucherId] = useState("");
  const [updateVoucher, { isLoading: isSaving }] = useUpdateVoucherMutation();
  const [initVoucherCreate, { isLoading: isCreating }] =
    useInitVoucherCreateMutation();
  const [isPublishing, setIsPublishing] = useState(false);
  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };
  const [isPublishBtnClicked, setIsPublishBtnClicked] = useState(false);
  const [isDraftBtnClicked, setIsDraftBtnClicked] = useState(false);
  const saveDraft = useCallback(async (isPublish = false) => {
    try {
      let internalvoucherId;

      // 1️⃣ Initialize if not created yet
      if (!voucherId) {
        const res = await initVoucherCreate().unwrap();
        internalvoucherId = res?.id;
        setVoucherId(res?.id);
      }
      // 2️⃣ Build base payload
      let payload = stepPayloadMap;

      if (isPublish) {
        payload = {
          ...payload,
        };
      }

      if (!Object.keys(payload).length) return;

      // 4️⃣ Update event
      await updateVoucher({
        voucherId: internalvoucherId || voucherId!,
        body: payload,
      }).unwrap();

      onClose();
      toast.success(isPublish ? t("business_published") : t("draft_saved"));
    } catch (err: any) {
      toast.error(err?.data?.message || t("draft_failed"));
    }
  });
  const handleSaveDraft = async () => {
    setIsDraftBtnClicked(true);

    await saveDraft(false);
  };
  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (formData.websites.length === 0) {
          newErrors.websites = "Please select at least one website";
        }
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

        if (formData.creationType === "upload") {
          if (!formData.xlsFile) {
            newErrors.xlsFile = "Please upload an Excel file";
          }

          if (!xlsValidation || xlsValidation.valid === 0) {
            newErrors.xlsValidation = "Uploaded file has no valid rows";
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
  const [createdVouchers, setCreatedVouchers] = useState<CreatedVoucher[]>([]);
  const [xlsValidation, setXlsValidation] = useState<{
    valid: number;
    invalid: number;
    errors: string[];
  } | null>(null);
  const [isWebsiteDropdownOpen, setIsWebsiteDropdownOpen] = useState(false);
  const [showPurchaserSuggestions, setShowPurchaserSuggestions] =
    useState(false);
  const [purchaserSuggestions, setPurchaserSuggestions] = useState<
    typeof existingUsers
  >([]);
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

  const campaigns = [
    { id: "summer-2024", name: "Summer Sale 2024", defaultAmount: 200 },
    { id: "newyear-2026", name: "New Year Promo", defaultAmount: 300 },
    { id: "spring-fest", name: "Spring Festival", defaultAmount: 150 },
    { id: "holiday-special", name: "Holiday Special", defaultAmount: 500 },
    { id: "vip-members", name: "VIP Members", defaultAmount: 1000 },
    { id: "welcome-bonus", name: "Welcome Bonus", defaultAmount: 100 },
  ];

  const websites = [
    { id: "visitnegev", name: "visitnegev.com" },
    { id: "negevtourism", name: "negevtourism.org" },
    { id: "explorenegev", name: "explorenegev.il" },
    { id: "negev-adventures", name: "negev-adventures.com" },
  ];

  const handleWebsiteToggle = (websiteId: string) => {
    setFormData((prev) => ({
      ...prev,
      websites: prev.websites.includes(websiteId)
        ? prev.websites.filter((id) => id !== websiteId)
        : [...prev.websites, websiteId],
    }));
  };

  const handleCampaignChange = (campaignId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    setFormData((prev) => ({
      ...prev,
      campaign: campaignId,
      amount: campaign?.defaultAmount || prev.amount,
      customAmount: false,
    }));
  };

  const handlePurchaserEmailChange = (email: string) => {
    setFormData((prev) => ({ ...prev, purchaserEmail: email }));

    // Filter suggestions based on email input
    if (email.length > 0) {
      const filtered = existingUsers.filter(
        (user) =>
          user.email.toLowerCase().includes(email.toLowerCase()) ||
          user.name.toLowerCase().includes(email.toLowerCase()),
      );
      setPurchaserSuggestions(filtered);
      setShowPurchaserSuggestions(filtered.length > 0);
    } else {
      setPurchaserSuggestions([]);
      setShowPurchaserSuggestions(false);
    }
  };

  const handlePurchaserSelect = (user: (typeof existingUsers)[0]) => {
    setFormData((prev) => ({
      ...prev,
      purchaserName: user.name,
      purchaserEmail: user.email,
      purchaserPhone: user.phone,
    }));
    setShowPurchaserSuggestions(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, xlsFile: file }));
      // Simulate validation
      setTimeout(() => {
        setXlsValidation({
          valid: 45,
          invalid: 5,
          errors: [
            "Row 12: Invalid email format",
            "Row 23: Missing phone number",
            "Row 34: Duplicate email address",
            "Row 41: Invalid amount",
            "Row 48: Missing assignee name",
          ],
        });
      }, 1000);
    }
  };

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  // const handleSubmit = () => {
  //   // Simulate voucher creation
  //   const mockVouchers: CreatedVoucher[] = [];
  //   const count =
  //     formData.creationType === "single"
  //       ? 1
  //       : formData.creationType === "bulk"
  //         ? formData.bulkCount
  //         : xlsValidation?.valid || 0;

  //   for (let i = 0; i < count; i++) {
  //     mockVouchers.push({
  //       code: `VCH-${String(Math.floor(Math.random() * 1000000)).padStart(6, "0")}`,
  //       assigneeName:
  //         formData.creationType === "single"
  //           ? formData.assigneeName
  //           : `Customer ${i + 1}`,
  //       email:
  //         formData.creationType === "single"
  //           ? formData.assigneeEmail
  //           : `customer${i + 1}@example.com`,
  //       amount: formData.amount,
  //       status: "Created",
  //     });
  //   }

  //   setCreatedVouchers(mockVouchers);
  // };

  // Step configuration
  const steps = [
    { id: 1, icon: FileText, label: "Details" },
    { id: 2, icon: Users, label: "Type" },
    { id: 3, icon: ClipboardList, label: "Configure" },
    { id: 4, icon: Eye, label: "Review" },
  ];

  return (
    <ModalWrapper onClose={onClose} showSpinner={isCreating || isSaving}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl text-gray-900 dark:text-gray-100">
            {currentStep === 5 ? "Success" : "Add Voucher"}
          </h2>
          {currentStep < 5 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
              Step {currentStep} of 4 :{" "}
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
            websites={websites}
            campaigns={campaigns}
            handleWebsiteToggle={handleWebsiteToggle}
            handleCampaignChange={handleCampaignChange}
            isWebsiteDropdownOpen={isWebsiteDropdownOpen}
            setIsWebsiteDropdownOpen={setIsWebsiteDropdownOpen}
            websiteDropdownRef={websiteDropdownRef}
            purchaserDropdownRef={purchaserDropdownRef}
            purchaserSuggestions={purchaserSuggestions}
            showPurchaserSuggestions={showPurchaserSuggestions}
            handlePurchaserEmailChange={handlePurchaserEmailChange}
            handlePurchaserSelect={handlePurchaserSelect}
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
            handleFileUpload={handleFileUpload}
            xlsValidation={xlsValidation}
          />
        )}{" "}
        {currentStep === 4 && (
          <VoucherReview
            formData={formData}
            websites={websites}
            campaigns={campaigns}
            xlsValidation={xlsValidation}
            t={t}
          />
        )}{" "}
        {/* {currentStep === 5 && (
          <VoucherSuccess
            createdVouchers={createdVouchers}
            onVoucherCreated={handlePublish}
            t={t}
          />
        )}{" "} */}
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
