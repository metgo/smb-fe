import { useState, useEffect, useCallback } from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Save,
  Eye,
  CheckCircle,
  Building2,
  DollarSign,
  Ticket,
  Briefcase,
  Monitor,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ProductSelectionStep } from "./sub-components/ProductSelectionStep";
import ProductWebsiteAndInfo from "./sub-components/ProductWebsiteAndInfo";
import { MiniSitePreview } from "./sub-components/MinisitePreview";
import { MinisiteVoucherCreation } from "./sub-components/MinisiteVoucherCreation";
import { VoucherResultsStep } from "./sub-components/VoucherResultsStep";
import { toast } from "sonner";
import {
  useInitMiniSiteCreateMutation,
  useUpdateMiniSiteMutation,
} from "@/store/api/miniSiteMutation";

interface MinisiteCreateWizardProps {
  onClose: () => void;
  editingMiniSite?: any;
}

export interface FormData {
  // Step 1
  selectedWebsite: string;
  companyName: string;
  contactName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  officeAddress: string;
  logoFile: File | null;
  campaignName: string;
  campaignCode: string;
  voucherAmount: string;
  totalVouchers: string;
  startDate: string;
  endDate: string;
  deliveryArea: "home" | "office";
  contentLanguage: "en" | "he" | "ar";
  contentTitle: Record<"en" | "he" | "ar", string>;
  contentSubtitle: Record<"en" | "he" | "ar", string>;
  contentGreeting: Record<"en" | "he" | "ar", string>;

  // Step 2
  selectedProducts: string[];
  primaryProducts: string[];

  // Step 4
  sendTiming: "immediate" | "scheduled";
  scheduledDate: string;
  scheduledTime: string;
  allowInstanceCreation: boolean;
  instanceName: string;
  instanceEmail: string;
  instancePhone: string;
  uploadedFile: File | null;
}
interface Product {
  id: string;
  name: string;
  price: number;
  businessName: string;
  category: string;
  image: string;
  accessibility: string[];
}

interface VoucherRecipient {
  name: string;
  email: string;
  phone: string;
  emailSent: boolean;
  smsSent: boolean;
}

export default function MinisiteCreateWizard({
  onClose,
  editingMiniSite,
}: MinisiteCreateWizardProps) {
  const { t } = useTranslation("mini_site");
  const {
    bgPrimary,
    bgSecondary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    bgTertiary,
  } = useThemeClasses();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    // default values
    selectedWebsite: "",
    companyName: "",
    contactName: "",
    email: "",
    phoneCountryCode: "+972",
    phoneNumber: "",
    officeAddress: "",
    logoFile: null,
    campaignName: "",
    campaignCode: "",
    voucherAmount: "",
    totalVouchers: "",
    startDate: "",
    endDate: "",
    deliveryArea: "home",
    contentLanguage: "he",
    contentTitle: { en: "", he: "", ar: "" },
    contentSubtitle: { en: "", he: "", ar: "" },
    contentGreeting: { en: "", he: "", ar: "" },

    selectedProducts: [],
    primaryProducts: [],

    sendTiming: "immediate",
    scheduledDate: "",
    scheduledTime: "",
    allowInstanceCreation: false,
    instanceName: "",
    instanceEmail: "",
    instancePhone: "",
    uploadedFile: null,
  });
  const campaignPayloadMap = {
    // Basic campaign metadata (similar to step 1)
    name: formData.campaignName,
    code: formData.campaignCode,
    internalNotes: "", // ← add field to form if needed

    // Monetary / voucher details
    voucher: {
      amount: Number(formData.voucherAmount) || 0,
      totalVouchers: Number(formData.totalVouchers) || 0,
      currency: "ILS", // ← hard-code or add to formData if multi-currency
    },

    // Dates & timing (similar to opening hours / availability)
    validity: {
      startDate: formData.startDate, // should be ISO string "2025-04-10"
      endDate: formData.endDate,
    },
  };
  const [initMiniSiteCreate, { isLoading: _isCreating }] =
    useInitMiniSiteCreateMutation();
  const [updateMiniSite, { isLoading: _isSaving }] =
    useUpdateMiniSiteMutation();

  const [miniSiteId, setMiniSiteId] = useState("");
  const saveDraft = useCallback(
    async (isPublish = false) => {
      try {
        let currentMiniSiteId = miniSiteId; // from your state

        // 1. Create if not exists
        if (!currentMiniSiteId) {
          const res = await initMiniSiteCreate().unwrap();
          currentMiniSiteId = res?.id;
          setMiniSiteId(res?.id); // update local state
        }

        // 2. Prepare payload
        let payload = { ...campaignPayloadMap };

        if (isPublish) {
          payload = {
            ...payload,
          };
        }

        if (!Object.keys(payload).length) return;

        // 3. Update
        const res = await updateMiniSite({
          miniSiteId: currentMiniSiteId,
          body: payload,
        }).unwrap();

        toast.success(
          res?.message ?? (isPublish ? "Campaign published" : "Draft saved"),
        );
      } catch (err: any) {
        toast.error(err?.data?.message || err?.message || "Failed to save");
      }
    },
    [
      miniSiteId,
      setMiniSiteId,
      currentStep,
      campaignPayloadMap,
      initMiniSiteCreate,
      updateMiniSite,
    ],
  );
  console.log("~ formData:", formData);
  // Step 1: Website & Purchaser Info
  const [_selectedWebsite, setSelectedWebsite] = useState("");
  const [_companyName, setCompanyName] = useState("");
  const [contactName, _setContactName] = useState("");
  const [email] = useState("");
  const [phoneCountryCode] = useState("+972");
  const [phoneNumber] = useState("");
  // const [logoFile, setLogoFile] = useState<string | null>(null);
  const [campaignName, setCampaignName] = useState("");
  const [campaignCode, setCampaignCode] = useState("");
  const [voucherAmount, setVoucherAmount] = useState("");
  const [_totalVouchers, setTotalVouchers] = useState("");
  const retryFailedSends = async () => {
    // Filter failed recipients
    const failedRecipients = voucherResults.filter(
      (r) => !r.emailSent || !r.smsSent,
    );

    if (failedRecipients.length === 0) {
      // Optional: show toast "No failed sends to retry"
      console.log("No failed sends to retry");
      return;
    }

    // Optional: show loading state or disable button
    // setIsRetrying(true);

    try {
      // Example: simulate retry (replace with your real API call)
      const updatedResults = await Promise.all(
        voucherResults.map(async (recipient) => {
          if (recipient.emailSent && recipient.smsSent) {
            return recipient; // already successful → no change
          }

          try {
            // Replace this with your actual send-voucher API call
            // e.g. await api.resendVoucher(recipient.id, recipient.email, recipient.phone);

            // Simulate success for demo (random 70% success rate)
            const shouldSucceed = Math.random() > 0.3;

            return {
              ...recipient,
              emailSent: shouldSucceed ? true : recipient.emailSent,
              smsSent: shouldSucceed ? true : recipient.smsSent,
              // Optional: add error field if you want to show why it failed
              // error: shouldSucceed ? undefined : "Server timeout",
            };
          } catch (err) {
            console.error("Retry failed for:", recipient.email, err);
            return recipient; // keep original status on real error
          }
        }),
      );

      setVoucherResults(updatedResults);

      // Optional: toast success message
      const newSuccessCount = updatedResults.filter(
        (r) => r.emailSent && r.smsSent,
      ).length;
      console.log(`Retry complete. ${newSuccessCount} successful now.`);
    } catch (err) {
      console.error("Bulk retry failed:", err);
      // Show error toast
    } finally {
      // setIsRetrying(false);
    }
  };
  // const [ setStartDate] = useState("");
  // const [setEndDate] = useState("");
  // const [deliveryArea, setDeliveryArea] = useState<"home" | "office">("office");
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
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [primaryProducts, setPrimaryProducts] = useState<string[]>([]);
  const [productViewMode, setProductViewMode] = useState<"grid" | "list">(
    "grid",
  );
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Step 3: Preview
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop",
  );

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

  // Mock data
  const websites = ["Website 1", "Website 2", "Website 3"];
  const mockProducts: Product[] = [
    {
      id: "1",
      name: "Spa Package",
      price: 150,
      businessName: "Luxury Spa",
      category: "Wellness",
      image: "",
      accessibility: ["wheelchair", "parking"],
    },
    {
      id: "2",
      name: "Desert Tour",
      price: 200,
      businessName: "Adventure Co",
      category: "Tours",
      image: "",
      accessibility: ["wheelchair"],
    },
    {
      id: "3",
      name: "Hotel Room",
      price: 300,
      businessName: "Beach Hotel",
      category: "Accommodation",
      image: "",
      accessibility: ["wheelchair", "parking", "elevator"],
    },
    {
      id: "4",
      name: "Dining Experience",
      price: 120,
      businessName: "Fine Restaurant",
      category: "Dining",
      image: "",
      accessibility: ["parking"],
    },
  ];

  // Auto-generate campaign code
  useEffect(() => {
    if (!campaignCode && campaignName) {
      const code = Math.random().toString(36).substring(2, 6).toUpperCase();
      setCampaignCode(code);
    }
  }, [campaignName]);

  // Populate fields when editing
  useEffect(() => {
    if (editingMiniSite) {
      setSelectedWebsite(editingMiniSite.website || "");
      setCompanyName(editingMiniSite.companyName || "");
      setCampaignName(editingMiniSite.campaignName || "");
      setCampaignCode(editingMiniSite.campaignCode || "");
      setVoucherAmount(editingMiniSite.voucherAmount?.toString() || "");
      setTotalVouchers(editingMiniSite.totalVouchers?.toString() || "");
      // setStartDate(editingMiniSite.startDate || "");
      // setEndDate(editingMiniSite.endDate || "");
    }
  }, [editingMiniSite]);

  const steps = [
    {
      number: 1,
      name: t("website_purchaser_info") || "Website & Purchaser Info",
    },
    { number: 2, name: t("select_products") || "Select Products" },
    { number: 3, name: t("mini_site_preview") || "Mini-Site Preview" },
    { number: 4, name: t("voucher_creation") || "Voucher Creation" },
    { number: 5, name: t("results") || "Results" },
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // const handleLogoUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const previewUrl = URL.createObjectURL(file);

  //   setFormData((prev) => ({
  //     ...prev,
  //     logoFile: previewUrl,
  //     logoFileRaw: file, // optional: for backend upload
  //   }));
  // };

  const handleNext = async () => {
    await saveDraft();
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const togglePrimaryProduct = (productId: string) => {
    setPrimaryProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const copyMiniSiteUrl = () => {
    const url = `https://tav-8.co.il/mini-site?campCode=${campaignCode}&voucherId=65c3874cd753aecdd6cb85ae&customerEmail=${email}`;
    navigator.clipboard.writeText(url);
  };

  const downloadSampleXLS = () => {
    const csvContent =
      "Name,Email,Phone\\nJohn Doe,john@example.com,+972501234567\\nJane Smith,jane@example.com,+972501234568";
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

  const handlePublish = () => {
    console.log("hi");
  };

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(productSearchQuery.toLowerCase());
    const matchesPrice = voucherAmount
      ? product.price <= parseFloat(voucherAmount)
      : true;
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesPrice && matchesCategory;
  });

  // const commonProps = {
  //   t: t,
  //   bgPrimary: "bg-white dark:bg-gray-900",
  //   bgSecondary: "bg-gray-100 dark:bg-gray-800",
  //   bgTertiary: "bg-gray-200 dark:bg-gray-700",
  //   textPrimary: "text-gray-900 dark:text-gray-100",
  //   textSecondary: "text-gray-600 dark:text-gray-400",
  //   textTertiary: "text-gray-500 dark:text-gray-500",
  //   borderColor: "border-gray-300 dark:border-gray-600",
  // };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`${bgPrimary} rounded-2xl shadow-2xl w-full max-w-6xl max-h-[100vh] my-8 flex flex-col border-2 ${borderColor} overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-3 border-b ${borderColor}`}
        >
          <div>
            <h2
              className={`text-xl bg-linear-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent`}
            >
              {t("create_mini_site")}{" "}
            </h2>
            <p className={`text-xs ${textTertiary} mt-0.5`}>
              <p>
                {t("step")} {currentStep} {t("of")} {steps.length}
              </p>{" "}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`${textTertiary} hover:${textPrimary} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mini-Site Statistics - Only show when editing */}
        {editingMiniSite && (
          <div className={`px-6 py-3 border-b ${borderColor} ${bgSecondary}`}>
            <h3
              className={`text-sm mb-2 bg-linear-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent`}
            >
              {t("mini_site_statistics")}{" "}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Page Views */}
              <div
                className={`p-2 rounded-lg border ${borderColor} ${bgPrimary} hover:shadow-lg transition-all`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Eye className="w-4 h-4 text-purple-600" />
                  <span className={`text-xs ${textTertiary}`}>
                    {t("page_views")}
                  </span>
                </div>
                <p className={`text-lg ${textPrimary}`}>
                  {editingMiniSite?.analytics?.pageViews?.toLocaleString() ||
                    "12,458"}
                </p>
                <span className="text-xs text-green-600">+12%</span>
              </div>

              {/* Unique Visitors */}
              <div
                className={`p-2 rounded-lg border ${borderColor} ${bgPrimary} hover:shadow-lg transition-all`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Monitor className="w-4 h-4 text-blue-600" />
                  <span className={`text-xs ${textTertiary}`}>
                    {t("unique_visitors")}{" "}
                  </span>
                </div>
                <p className={`text-lg ${textPrimary}`}>
                  {editingMiniSite?.analytics?.uniqueVisitors?.toLocaleString() ||
                    "8,234"}
                </p>
                <span className="text-xs text-green-600">+8%</span>
              </div>

              {/* Vouchers Used */}
              <div
                className={`p-2 rounded-lg border ${borderColor} ${bgPrimary} hover:shadow-lg transition-all`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Ticket className="w-4 h-4 text-pink-600" />
                  <span className={`text-xs ${textTertiary}`}>
                    {t("vouchers_used")} {/* Vouchers Used */}{" "}
                  </span>
                </div>
                <p className={`text-lg ${textPrimary}`}>
                  {editingMiniSite?.analytics?.vouchersUsed?.toLocaleString() ||
                    "1,456"}
                </p>
                <span className={`text-xs ${textTertiary}`}>
                  / {editingMiniSite?.totalVouchers || "2,000"}
                </span>
              </div>

              {/* Products Purchased */}
              <div
                className={`p-2 rounded-lg border ${borderColor} ${bgPrimary} hover:shadow-lg transition-all`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Briefcase className="w-4 h-4 text-teal-600" />
                  <span className={`text-xs ${textTertiary}`}>
                    {t("products_purchased")}{" "}
                  </span>
                </div>
                <p className={`text-lg ${textPrimary}`}>
                  {editingMiniSite?.analytics?.productsPurchased?.toLocaleString() ||
                    "3,892"}
                </p>
                <span className="text-xs text-green-600">+15%</span>
              </div>

              {/* Conversion Rate */}
              <div
                className={`p-2 rounded-lg border ${borderColor} ${bgPrimary} hover:shadow-lg transition-all`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className={`text-xs ${textTertiary}`}>
                    {t("conversion_rate")}{" "}
                  </span>
                </div>
                <p className={`text-lg ${textPrimary}`}>
                  {editingMiniSite?.analytics?.conversionRate || "47.2"}%
                </p>
                <span className="text-xs text-green-600">+3.5%</span>
              </div>

              {/* Total Revenue */}
              <div
                className={`p-2 rounded-lg border ${borderColor} bg-linear-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:shadow-lg transition-all`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                  <span className={`text-xs ${textTertiary}`}>
                    {t("total_revenue")}{" "}
                  </span>
                </div>
                <p className={`text-lg ${textPrimary}`}>
                  ₪
                  {editingMiniSite?.analytics?.revenue?.toLocaleString() ||
                    "284,560"}
                </p>
                <span className="text-xs text-green-600">+22%</span>
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className={`px-6 py-2 border-b ${borderColor} ${bgSecondary}`}>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              // Map step numbers to icons
              const getStepIcon = (stepNumber: number) => {
                switch (stepNumber) {
                  case 1:
                    return <Building2 className="w-4 h-4" />;
                  case 2:
                    return <Briefcase className="w-4 h-4" />;
                  case 3:
                    return <Eye className="w-4 h-4" />;
                  case 4:
                    return <Ticket className="w-4 h-4" />;
                  case 5:
                    return <CheckCircle className="w-4 h-4" />;
                  default:
                    return step.number;
                }
              };

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        currentStep >= step.number
                          ? "bg-linear-to-r from-purple-500 to-pink-600 text-white"
                          : `${bgPrimary} border-2 ${borderColor} ${textTertiary}`
                      }`}
                    >
                      {getStepIcon(step.number)}
                    </div>
                    <p
                      className={`text-xs mt-1 text-center ${currentStep >= step.number ? textPrimary : textTertiary}`}
                    >
                      {step.name}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 ${currentStep > step.number ? "bg-linear-to-r from-purple-500 to-pink-600" : borderColor} mx-2`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="h-[40vh] overflow-y-auto p-4">
          {/* Step 1: Website & Purchaser Info */}
          {currentStep === 1 && (
            <ProductWebsiteAndInfo
              currentStep={currentStep}
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
              // handleLogoUpload={handleLogoUpload}
              websites={websites}
              contentLanguage={contentLanguage}
              setContentLanguage={setContentLanguage}
              contentTitle={contentTitle}
              setContentTitle={setContentTitle}
              contentSubtitle={contentSubtitle}
              setContentSubtitle={setContentSubtitle}
              contentGreeting={contentGreeting}
              setContentGreeting={setContentGreeting}
              t={t}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textTertiary={textTertiary}
              bgSecondary={bgSecondary}
              bgTertiary={bgTertiary}
              borderColor={borderColor}
            />
          )}

          {/* Step 2: Select Products */}
          {currentStep === 2 && (
            <ProductSelectionStep
              t={t}
              productSearchQuery={productSearchQuery}
              setProductSearchQuery={setProductSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              productViewMode={productViewMode}
              setProductViewMode={setProductViewMode}
              filteredProducts={filteredProducts}
              selectedProducts={selectedProducts}
              toggleProductSelection={toggleProductSelection}
              primaryProducts={primaryProducts}
              togglePrimaryProduct={togglePrimaryProduct}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textTertiary={textTertiary}
              bgPrimary={bgPrimary}
              bgSecondary={bgSecondary}
              bgTertiary={bgTertiary}
              borderColor={borderColor}
            />
          )}
          {/* Step 3: Mini-Site Preview */}
          {currentStep === 3 && (
            <MiniSitePreview
              t={t}
              previewMode={previewMode}
              setPreviewMode={setPreviewMode}
              contentTitle={contentTitle} // assuming these are states/objects you have
              contentSubtitle={contentSubtitle}
              contentGreeting={contentGreeting}
              contentLanguage={contentLanguage}
              selectedProducts={selectedProducts}
              mockProducts={mockProducts} // or products from context/store
              campaignCode={campaignCode}
              email={email} // or formData.email
              copyMiniSiteUrl={copyMiniSiteUrl}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textTertiary={textTertiary}
              bgPrimary={bgPrimary}
              bgSecondary={bgSecondary}
              bgTertiary={bgTertiary}
              borderColor={borderColor}
            />
          )}

          {/* Step 4: Voucher Creation & Distribution */}
          {currentStep === 4 && (
            <MinisiteVoucherCreation
              t={t}
              contactName={contactName} // or formData.contactDetails?.name
              email={email} // or formData.email
              phoneCountryCode={phoneCountryCode}
              phoneNumber={phoneNumber} // or formData.phone
              sendTiming={sendTiming}
              setSendTiming={setSendTiming}
              scheduledDate={scheduledDate}
              setScheduledDate={setScheduledDate}
              scheduledTime={scheduledTime}
              setScheduledTime={setScheduledTime}
              allowInstanceCreation={allowInstanceCreation}
              setAllowInstanceCreation={setAllowInstanceCreation}
              instanceName={instanceName}
              setInstanceName={setInstanceName}
              instanceEmail={instanceEmail}
              setInstanceEmail={setInstanceEmail}
              instancePhone={instancePhone}
              setInstancePhone={setInstancePhone}
              uploadedFile={uploadedFile}
              handleFileUpload={handleFileUpload}
              downloadSampleXLS={downloadSampleXLS}
              handleInstanceVoucherAdd={handleInstanceVoucherAdd}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textTertiary={textTertiary}
              bgPrimary={bgPrimary}
              bgSecondary={bgSecondary}
              borderColor={borderColor}
            />
          )}

          {/* Step 5: Results */}
          {currentStep === 5 && (
            <VoucherResultsStep
              t={t}
              voucherResults={voucherResults}
              downloadSampleXLS={downloadSampleXLS} //
              retryFailedSends={retryFailedSends} // implement/pass this function
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              textTertiary={textTertiary}
              bgSecondary={bgSecondary}
              bgTertiary={bgTertiary}
              borderColor={borderColor}
            />
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-between px-6 py-3 border-t ${borderColor}`}
        >
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${
              currentStep === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            } ${textSecondary} transition-colors text-sm`}
          >
            <ArrowLeft className="w-4 h-4" />
            {t("previous")}{" "}
          </button>

          <div className="flex gap-2">
            {currentStep < 5 && (
              <button
                // onClick={handleSaveDraft}
                className={`px-3 py-1.5 rounded-lg ${bgSecondary} ${textSecondary} hover:${textPrimary} transition-colors flex items-center gap-2 text-sm`}
              >
                <Save className="w-4 h-4" />
                {t("save_draft")}{" "}
              </button>
            )}

            {currentStep === steps.length ? (
              <button
                onClick={handlePublish}
                className="px-4 py-1.5 rounded-lg bg-linear-to-r from-purple-500 to-pink-600 text-white hover:shadow-lg transition-all flex items-center gap-2 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                {t("complete")}{" "}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-4 py-1.5 rounded-lg bg-linear-to-r from-purple-500 to-pink-600 text-white hover:shadow-lg transition-all flex items-center gap-2 text-sm"
              >
                {t("next")} <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
