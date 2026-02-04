import { useState, useEffect, useRef } from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Save,
  Upload,
  Copy,
  Download,
  CheckCircle,
  XCircle,
  Building2,
  DollarSign,
  Ticket,
  Home,
  Briefcase,
  Globe,
  Send,
  Clock,
  ChevronDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { websites } from "@/constants/data";

interface MiniCampaignWizardProps {
  theme: Theme;
  onClose: () => void;
  onSubmit: (data: any, status: "draft" | "active") => void;
  editingMiniSite?: any;
}

interface VoucherRecipient {
  name: string;
  email: string;
  phone: string;
  emailSent: boolean;
  smsSent: boolean;
}

export default function MiniCampaignWizard({
  theme,
  onClose,
  onSubmit,
  editingMiniSite,
}: MiniCampaignWizardProps) {
  const { t } = useTranslation("mini_campaign");
  const [currentStep, setCurrentStep] = useState(1);

  // NEW: Create Mini Site checkbox
  const [createMiniSite, setCreateMiniSite] = useState(false);

  // Step 1: Website & Purchaser Info
  const [selectedWebsite, setSelectedWebsite] = useState<string[]>([]);
  const [websiteDropdownOpen, setWebsiteDropdownOpen] = useState(false);
  const websiteDropdownRef = useRef<HTMLDivElement>(null);
  const [campaignType, setCampaignType] = useState<"cash-back" | "cash-in">(
    "cash-back",
  );
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+972");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [campaignName, setCampaignName] = useState("");
  const [campaignCode, setCampaignCode] = useState("");
  const [voucherAmount, setVoucherAmount] = useState("");
  const [totalVouchers, setTotalVouchers] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deliveryArea, setDeliveryArea] = useState<"home" | "office">("office");
  const [contentTitle, setContentTitle] = useState({ en: "", he: "", ar: "" });
  const [contentSubtitle, setContentSubtitle] = useState({
    en: "",
    he: "",
    ar: "",
  });
  const [contentGreeting, setContentGreeting] = useState({
    en: "",
    he: "",
    ar: "",
  });
  const [contentLanguage, setContentLanguage] = useState<"en" | "he" | "ar">(
    "en",
  );

  // Step 2: Select Products
  const [selectedProducts] = useState<string[]>([]);
  const [primaryProducts] = useState<string[]>([]);

  // Step 3: Preview
  // Preview mode can be added here if needed

  // Step 4: Voucher Creation
  const [sendTiming, setSendTiming] = useState<"immediate" | "scheduled">(
    "immediate",
  );
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [allowInstanceCreation, setAllowInstanceCreation] = useState(false);
  const [instanceName, setInstanceName] = useState("");
  const [instanceEmail, setInstanceEmail] = useState("");
  const [instancePhone, setInstancePhone] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Step 5: Results
  const [voucherResults, setVoucherResults] = useState<VoucherRecipient[]>([]);

  const bgPrimary = theme === "dark" ? "bg-gray-950" : "bg-white";
  const bgSecondary = theme === "dark" ? "bg-gray-900" : "bg-gray-50";
  const bgTertiary = theme === "dark" ? "bg-gray-800" : "bg-gray-100";
  const textPrimary = theme === "dark" ? "text-white" : "text-gray-900";
  const textSecondary = theme === "dark" ? "text-gray-300" : "text-gray-700";
  const textTertiary = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const borderColor = theme === "dark" ? "border-gray-800" : "border-gray-200";

  // Auto-generate campaign code
  useEffect(() => {
    if (!campaignCode && campaignName) {
      const code = Math.random().toString(36).substring(2, 6).toUpperCase();
      setCampaignCode(code);
    }
  }, [campaignName, campaignCode]);

  // Populate fields when editing
  useEffect(() => {
    if (editingMiniSite) {
      const websites = editingMiniSite.website
        ? typeof editingMiniSite.website === "string"
          ? editingMiniSite.website.split(",")
          : editingMiniSite.website
        : [];
      setSelectedWebsite(websites);
      setCompanyName(editingMiniSite.companyName || "");
      setCampaignName(editingMiniSite.campaignName || "");
      setCampaignCode(editingMiniSite.campaignCode || "");
      setVoucherAmount(editingMiniSite.voucherAmount?.toString() || "");
      setTotalVouchers(editingMiniSite.totalVouchers?.toString() || "");
      setStartDate(editingMiniSite.startDate || "");
      setEndDate(editingMiniSite.endDate || "");
    }
  }, [editingMiniSite]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        websiteDropdownRef.current &&
        !websiteDropdownRef.current.contains(event.target as Node)
      ) {
        setWebsiteDropdownOpen(false);
      }
    };

    if (websiteDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [websiteDropdownOpen]);

  // Dynamic steps based on createMiniSite checkbox
  const allSteps = [
    {
      number: 1,
      name: t("website_purchaser_info") || "Website & Purchaser Info",
    },
    { number: 2, name: t("select_products") || "Select Products" },
    { number: 3, name: t("mini_site_preview") || "Mini-Site Preview" },
    { number: 4, name: t("voucher_creation") || "Voucher Creation" },
    { number: 5, name: t("results") || "Results" },
  ];

  const steps = createMiniSite
    ? allSteps
    : [allSteps[0], allSteps[3], allSteps[4]]; // Skip steps 2 and 3 when createMiniSite is unchecked

  // Map actual step numbers to display steps
  const getActualStepNumber = (displayStep: number) => {
    if (createMiniSite) {
      return displayStep;
    } else {
      // Map: 1 -> 1, 2 -> 4, 3 -> 5
      if (displayStep === 1) return 1;
      if (displayStep === 2) return 4;
      if (displayStep === 3) return 5;
      return displayStep;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyMiniSiteUrl = () => {
    const url = `https://tav-8.co.il/mini-site?campCode=${campaignCode}&voucherId=65c3874cd753aecdd6cb85ae&customerEmail=${email}`;
    navigator.clipboard.writeText(url);
  };

  const downloadSampleXLS = () => {
    const csvContent =
      "Name,Email,Phone\nJohn Doe,john@example.com,+972501234567\nJane Smith,jane@example.com,+972501234568";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "voucher-template.csv";
    link.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Mock parsing results
      setVoucherResults([
        {
          name: "John Doe",
          email: "john@example.com",
          phone: "+972501234567",
          emailSent: true,
          smsSent: true,
        },
        {
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "+972501234568",
          emailSent: true,
          smsSent: false,
        },
        {
          name: "Bob Johnson",
          email: "bob@example.com",
          phone: "+972501234569",
          emailSent: false,
          smsSent: false,
        },
      ]);
    }
  };

  const handleInstanceVoucherAdd = () => {
    if (instanceName && instanceEmail && instancePhone) {
      setVoucherResults((prev) => [
        ...prev,
        {
          name: instanceName,
          email: instanceEmail,
          phone: instancePhone,
          emailSent: false,
          smsSent: false,
        },
      ]);
      setInstanceName("");
      setInstanceEmail("");
      setInstancePhone("");
    }
  };

  const handleSaveDraft = () => {
    const data = {
      selectedWebsite,
      campaignType,
      companyName,
      contactName,
      email,
      phone: phoneCountryCode + phoneNumber,
      officeAddress,
      campaignName,
      campaignCode,
      voucherAmount,
      totalVouchers,
      startDate,
      endDate,
      deliveryArea: createMiniSite ? deliveryArea : undefined,
      contentTitle,
      contentSubtitle,
      contentGreeting,
      selectedProducts: createMiniSite ? selectedProducts : [],
      primaryProducts: createMiniSite ? primaryProducts : [],
      createMiniSite,
    };
    onSubmit(data, "draft");
  };

  const handlePublish = () => {
    const data = {
      selectedWebsite,
      campaignType,
      companyName,
      contactName,
      email,
      phone: phoneCountryCode + phoneNumber,
      officeAddress,
      campaignName,
      campaignCode,
      voucherAmount,
      totalVouchers,
      startDate,
      endDate,
      deliveryArea: createMiniSite ? deliveryArea : undefined,
      contentTitle,
      contentSubtitle,
      contentGreeting,
      selectedProducts: createMiniSite ? selectedProducts : [],
      primaryProducts: createMiniSite ? primaryProducts : [],
      voucherResults,
      createMiniSite,
    };
    onSubmit(data, "active");
  };

  const actualStepNumber = getActualStepNumber(currentStep);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div
        className={`${bgPrimary} rounded-2xl shadow-2xl w-full max-w-6xl my-8 flex flex-col border-2 ${borderColor}`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${borderColor}`}
        >
          <div>
            <h2
              className={`text-2xl bg-linear-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent`}
            >
              {editingMiniSite
                ? t("edit_mini_campaign")
                : t("create_mini_campaign")}
            </h2>
            <p className={`text-sm ${textTertiary} mt-1`}>
              {t("step")} {currentStep} {t("of")} {steps.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`${textTertiary} hover:${textPrimary} transition-colors`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className={`px-6 py-4 border-b ${borderColor} ${bgSecondary}`}>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      currentStep >= index + 1
                        ? "bg-linear-to-r from-purple-500 to-pink-600 text-white"
                        : `${bgPrimary} border-2 ${borderColor} ${textTertiary}`
                    }`}
                  >
                    {index + 1}
                  </div>
                  <p
                    className={`text-xs mt-2 text-center ${currentStep >= index + 1 ? textPrimary : textTertiary}`}
                  >
                    {step.name}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${currentStep > index + 1 ? "bg-linear-to-r from-purple-500 to-pink-600" : borderColor} mx-2`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[60vh]">
          {/* Step 1: Website & Purchaser Info */}
          {actualStepNumber === 1 && (
            <div className="space-y-6">
              {/* Create Mini Site Checkbox & Campaign Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Create Mini Site */}
                <div
                  className={`${bgSecondary} rounded-lg p-4 border-2 border-dashed ${borderColor}`}
                >
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createMiniSite}
                      onChange={(e) => setCreateMiniSite(e.target.checked)}
                      className="w-5 h-5 text-purple-600 focus:ring-2 focus:ring-purple-500 rounded"
                    />
                    <div>
                      <span className={`${textPrimary}`}>
                        {t("create_mini_site")}
                      </span>
                      <p className={`text-xs ${textTertiary} mt-1`}>
                        {t("create_mini_site_desc")}
                      </p>
                    </div>
                  </label>
                </div>

                {/* Campaign Type */}
                <div
                  className={`${bgSecondary} rounded-lg p-4 border ${borderColor}`}
                >
                  <h3
                    className={`text-sm ${textPrimary} mb-3 flex items-center gap-2`}
                  >
                    <DollarSign className="w-4 h-4" />
                    {t("campaign_type")}
                  </h3>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="campaignType"
                        checked={campaignType === "cash-back"}
                        onChange={() => setCampaignType("cash-back")}
                        className="w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <span className={`text-sm ${textPrimary}`}>
                          {t("cash_back")}
                        </span>
                        <p className={`text-xs ${textTertiary}`}>
                          {t("cash_back_desc")}
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="campaignType"
                        checked={campaignType === "cash-in"}
                        onChange={() => setCampaignType("cash-in")}
                        className="w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <span className={`text-sm ${textPrimary}`}>
                          {t("cash_in")}
                        </span>
                        <p className={`text-xs ${textTertiary}`}>
                          {t("cash_in_desc")}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Website Selection */}
              <div>
                <h3
                  className={`text-lg ${textPrimary} mb-4 flex items-center gap-2`}
                >
                  <Globe className="w-5 h-5" />
                  {t("website_selection")}
                </h3>
                <div className="relative" ref={websiteDropdownRef}>
                  <div
                    className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} cursor-pointer transition-all ${websiteDropdownOpen ? "ring-2 ring-purple-500" : ""}`}
                    onClick={() => setWebsiteDropdownOpen(!websiteDropdownOpen)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        {selectedWebsite.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedWebsite.map((site) => (
                              <span
                                key={site}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm"
                              >
                                {site}
                                <X
                                  className="w-3 h-3 cursor-pointer hover:text-purple-900 dark:hover:text-purple-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedWebsite((prev) =>
                                      prev.filter((s) => s !== site),
                                    );
                                  }}
                                />
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className={textTertiary}>
                            {t("select_website")}
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${websiteDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                  </div>
                  {websiteDropdownOpen && (
                    <div
                      className={`absolute top-full left-0 right-0 mt-2 ${bgPrimary} shadow-lg border ${borderColor} rounded-lg max-h-60 overflow-y-auto z-20`}
                    >
                      <div className="p-2 space-y-1">
                        {websites.map((site) => (
                          <label
                            key={site}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:${bgSecondary}`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedWebsite.includes(site)}
                              onChange={(e) => {
                                e.stopPropagation();
                                if (e.target.checked) {
                                  setSelectedWebsite((prev) => [...prev, site]);
                                } else {
                                  setSelectedWebsite((prev) =>
                                    prev.filter((s) => s !== site),
                                  );
                                }
                              }}
                              className="w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500 rounded"
                            />
                            <span className={textPrimary}>{site}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Purchaser Info */}
              <div>
                <h3
                  className={`text-lg ${textPrimary} mb-4 flex items-center gap-2`}
                >
                  <Building2 className="w-5 h-5" />
                  {t("purchaser_info")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-2`}>
                      {t("company_name")}
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      placeholder="Acme Corporation"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-2`}>
                      {t("contact_name")}
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-2`}>
                      {t("email")}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-2`}>
                      {t("phone")}
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={phoneCountryCode}
                        onChange={(e) => setPhoneCountryCode(e.target.value)}
                        className={`px-3 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      >
                        <option value="+972">+972</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                      </select>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className={`flex-1 px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        placeholder="501234567"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm ${textSecondary} mb-2`}>
                      {t("office_address")}
                    </label>
                    <input
                      type="text"
                      value={officeAddress}
                      onChange={(e) => setOfficeAddress(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      placeholder="123 Main St, Tel Aviv"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-2`}>
                      {t("company_logo")}
                    </label>
                    <div className="flex items-center gap-4">
                      {logoFile && (
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500">
                          <img
                            src={logoFile}
                            alt="Logo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <label
                        className={`px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textSecondary} cursor-pointer hover:${textPrimary} transition-colors flex items-center gap-2`}
                      >
                        <Upload className="w-4 h-4" />
                        {t("upload_logo")}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Info */}
              <div>
                <h3
                  className={`text-lg ${textPrimary} mb-4 flex items-center gap-2`}
                >
                  <Ticket className="w-5 h-5" />
                  {t("campaign_info")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-2`}>
                      {t("campaign_name")}
                    </label>
                    <input
                      type="text"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      placeholder="Summer Campaign 2024"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-2`}>
                      {t("campaign_code")}
                    </label>
                    <input
                      type="text"
                      value={campaignCode}
                      readOnly
                      className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgTertiary} ${textTertiary} cursor-not-allowed font-mono`}
                      placeholder="AUTO"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-2`}>
                      {t("voucher_amount")}
                    </label>
                    <input
                      type="number"
                      value={voucherAmount}
                      onChange={(e) => setVoucherAmount(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-2`}>
                      {t("total_vouchers")}
                    </label>
                    <input
                      type="number"
                      value={totalVouchers}
                      onChange={(e) => setTotalVouchers(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-2`}>
                      {t("start_date")}
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-2`}>
                      {t("end_date")} ({t("optional")})
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Area - Only show if createMiniSite is checked */}
              {createMiniSite && (
                <div>
                  <h3 className={`text-lg ${textPrimary} mb-4`}>
                    {t("delivery_area")}
                  </h3>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="deliveryArea"
                        checked={deliveryArea === "home"}
                        onChange={() => setDeliveryArea("home")}
                        className="w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
                      />
                      <Home className="w-4 h-4" />
                      <span className={textSecondary}>{t("home")}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="deliveryArea"
                        checked={deliveryArea === "office"}
                        onChange={() => setDeliveryArea("office")}
                        className="w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
                      />
                      <Briefcase className="w-4 h-4" />
                      <span className={textSecondary}>{t("office")}</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Content (Multi-Language) - Only show if createMiniSite is checked */}
              {createMiniSite && (
                <div>
                  <h3
                    className={`text-lg ${textPrimary} mb-4 flex items-center gap-2`}
                  >
                    <Globe className="w-5 h-5" />
                    {t("content")} ({t("multi_language")})
                  </h3>
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setContentLanguage("en")}
                        className={`px-4 py-2 rounded-lg ${contentLanguage === "en" ? "bg-purple-600 text-white" : `${bgSecondary} ${textSecondary}`}`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setContentLanguage("he")}
                        className={`px-4 py-2 rounded-lg ${contentLanguage === "he" ? "bg-purple-600 text-white" : `${bgSecondary} ${textSecondary}`}`}
                      >
                        עברית
                      </button>
                      <button
                        onClick={() => setContentLanguage("ar")}
                        className={`px-4 py-2 rounded-lg ${contentLanguage === "ar" ? "bg-purple-600 text-white" : `${bgSecondary} ${textSecondary}`}`}
                      >
                        العربية
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm ${textSecondary} mb-2`}>
                        {t("title")}
                      </label>
                      <input
                        type="text"
                        value={contentTitle[contentLanguage]}
                        onChange={(e) =>
                          setContentTitle({
                            ...contentTitle,
                            [contentLanguage]: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        placeholder={
                          contentLanguage === "en"
                            ? "Welcome to our campaign"
                            : contentLanguage === "he"
                              ? "ברוכים הבאים למבצע שלנו"
                              : "مرحبا بكم في حملتنا"
                        }
                      />
                    </div>
                    <div>
                      <label className={`block text-sm ${textSecondary} mb-2`}>
                        {t("subtitle")}
                      </label>
                      <input
                        type="text"
                        value={contentSubtitle[contentLanguage]}
                        onChange={(e) =>
                          setContentSubtitle({
                            ...contentSubtitle,
                            [contentLanguage]: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        placeholder={
                          contentLanguage === "en"
                            ? "Enjoy exclusive offers"
                            : contentLanguage === "he"
                              ? "נהנו מהצעות בלעדיות"
                              : "استمتع بالعروض الحصرية"
                        }
                      />
                    </div>
                    <div>
                      <label className={`block text-sm ${textSecondary} mb-2`}>
                        {t("greeting")}
                      </label>
                      <textarea
                        value={contentGreeting[contentLanguage]}
                        onChange={(e) =>
                          setContentGreeting({
                            ...contentGreeting,
                            [contentLanguage]: e.target.value,
                          })
                        }
                        rows={4}
                        className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        placeholder={
                          contentLanguage === "en"
                            ? "Thank you for participating..."
                            : contentLanguage === "he"
                              ? "תודה על ההשתתפות..."
                              : "شكرا لمشاركتك..."
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Voucher Creation (mapped from actualStepNumber) */}
          {actualStepNumber === 4 && (
            <div className="space-y-6">
              <h3
                className={`text-lg ${textPrimary} mb-4 flex items-center gap-2`}
              >
                <Send className="w-5 h-5" />
                {t("voucher_creation")}
              </h3>

              {/* Send Timing */}
              <div>
                <label className={`block text-sm ${textSecondary} mb-3`}>
                  {t("send_timing")}
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sendTiming"
                      checked={sendTiming === "immediate"}
                      onChange={() => setSendTiming("immediate")}
                      className="w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
                    />
                    <span className={textSecondary}>{t("immediately")}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sendTiming"
                      checked={sendTiming === "scheduled"}
                      onChange={() => setSendTiming("scheduled")}
                      className="w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
                    />
                    <Clock className="w-4 h-4" />
                    <span className={textSecondary}>{t("scheduled")}</span>
                  </label>
                </div>
              </div>

              {sendTiming === "scheduled" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-2`}>
                      {t("date")}
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-2`}>
                      {t("time")}
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    />
                  </div>
                </div>
              )}

              {/* File Upload */}
              <div
                className={`${bgSecondary} rounded-lg p-6 border-2 border-dashed ${borderColor}`}
              >
                <h4 className={`${textPrimary} mb-3 flex items-center gap-2`}>
                  <Upload className="w-5 h-5" />
                  {t("upload_recipients")}
                </h4>
                <p className={`text-sm ${textTertiary} mb-4`}>
                  {t("upload_recipients_desc")}
                </p>
                <div className="flex gap-3">
                  <label
                    className={`px-4 py-2 rounded-lg bg-purple-600 text-white cursor-pointer hover:bg-purple-700 transition-colors flex items-center gap-2`}
                  >
                    <Upload className="w-4 h-4" />
                    {uploadedFile ? uploadedFile.name : t("choose_file")}
                    <input
                      type="file"
                      accept=".csv,.xls,.xlsx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={downloadSampleXLS}
                    className={`px-4 py-2 rounded-lg border ${borderColor} ${textSecondary} hover:${textPrimary} transition-colors flex items-center gap-2`}
                  >
                    <Download className="w-4 h-4" />
                    {t("download_sample")}
                  </button>
                </div>
              </div>

              {/* Instance Voucher Creation */}
              <div
                className={`${bgSecondary} rounded-lg p-6 border ${borderColor}`}
              >
                <label className="flex items-center gap-3 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowInstanceCreation}
                    onChange={(e) => setAllowInstanceCreation(e.target.checked)}
                    className="w-5 h-5 text-purple-600 focus:ring-2 focus:ring-purple-500 rounded"
                  />
                  <span className={textPrimary}>
                    {t("allow_instance_creation")}
                  </span>
                </label>

                {allowInstanceCreation && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={instanceName}
                        onChange={(e) => setInstanceName(e.target.value)}
                        placeholder={t("name")}
                        className={`px-4 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      />
                      <input
                        type="email"
                        value={instanceEmail}
                        onChange={(e) => setInstanceEmail(e.target.value)}
                        placeholder={t("email")}
                        className={`px-4 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      />
                      <input
                        type="tel"
                        value={instancePhone}
                        onChange={(e) => setInstancePhone(e.target.value)}
                        placeholder={t("phone")}
                        className={`px-4 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      />
                    </div>
                    <button
                      onClick={handleInstanceVoucherAdd}
                      className={`w-full px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors`}
                    >
                      {t("add_recipient")}
                    </button>
                  </div>
                )}
              </div>

              {/* Copy Mini-Site URL */}
              {createMiniSite && (
                <div
                  className={`${bgSecondary} rounded-lg p-4 border ${borderColor}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <p className={`text-sm ${textTertiary} mb-1`}>
                        {t("mini_site_url")}
                      </p>
                      <p
                        className={`text-sm ${textPrimary} font-mono truncate`}
                      >
                        https://tav-8.co.il/mini-site?campCode={campaignCode}
                      </p>
                    </div>
                    <button
                      onClick={copyMiniSiteUrl}
                      className={`px-4 py-2 rounded-lg border ${borderColor} ${textSecondary} hover:${textPrimary} transition-colors flex items-center gap-2 flex-shrink-0`}
                    >
                      <Copy className="w-4 h-4" />
                      {t("copy")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Results */}
          {actualStepNumber === 5 && (
            <div className="space-y-6">
              <h3 className={`text-lg ${textPrimary} mb-4`}>
                {t("voucher_results")}
              </h3>

              {voucherResults.length === 0 ? (
                <div className={`${bgSecondary} rounded-lg p-8 text-center`}>
                  <p className={textTertiary}>{t("no_results")}</p>
                </div>
              ) : (
                <div
                  className={`${bgSecondary} rounded-lg overflow-hidden border ${borderColor}`}
                >
                  <table className="w-full">
                    <thead className={bgTertiary}>
                      <tr>
                        <th
                          className={`px-4 py-3 text-left text-sm ${textSecondary}`}
                        >
                          {t("name")}
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-sm ${textSecondary}`}
                        >
                          {t("email")}
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-sm ${textSecondary}`}
                        >
                          {t("phone")}
                        </th>
                        <th
                          className={`px-4 py-3 text-center text-sm ${textSecondary}`}
                        >
                          {t("email_status")}
                        </th>
                        <th
                          className={`px-4 py-3 text-center text-sm ${textSecondary}`}
                        >
                          {t("sms_status")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {voucherResults.map((recipient, index) => (
                        <tr key={index} className={`border-t ${borderColor}`}>
                          <td className={`px-4 py-3 ${textPrimary}`}>
                            {recipient.name}
                          </td>
                          <td className={`px-4 py-3 ${textSecondary}`}>
                            {recipient.email}
                          </td>
                          <td className={`px-4 py-3 ${textSecondary}`}>
                            {recipient.phone}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {recipient.emailSent ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {recipient.smsSent ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div
                  className={`${bgSecondary} rounded-lg p-4 border ${borderColor} text-center`}
                >
                  <p className={`text-2xl ${textPrimary} mb-1`}>
                    {voucherResults.length}
                  </p>
                  <p className={`text-sm ${textTertiary}`}>
                    {t("total_recipients")}
                  </p>
                </div>
                <div
                  className={`${bgSecondary} rounded-lg p-4 border ${borderColor} text-center`}
                >
                  <p className={`text-2xl text-green-500 mb-1`}>
                    {voucherResults.filter((r) => r.emailSent).length}
                  </p>
                  <p className={`text-sm ${textTertiary}`}>
                    {t("emails_sent")}
                  </p>
                </div>
                <div
                  className={`${bgSecondary} rounded-lg p-4 border ${borderColor} text-center`}
                >
                  <p className={`text-2xl text-green-500 mb-1`}>
                    {voucherResults.filter((r) => r.smsSent).length}
                  </p>
                  <p className={`text-sm ${textTertiary}`}>{t("sms_sent")}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className={`flex items-center justify-between p-6 border-t ${borderColor}`}
        >
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg border ${borderColor} ${textSecondary} hover:${textPrimary} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <ArrowLeft className="w-4 h-4" />
            {t("previous")}
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleSaveDraft}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg border ${borderColor} ${textSecondary} hover:${textPrimary} transition-colors`}
            >
              <Save className="w-4 h-4" />
              {t("save_draft")}
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-linear-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-colors"
              >
                {t("next")}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handlePublish}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-linear-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                {t("publish")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
