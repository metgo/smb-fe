import { useState, useEffect } from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Save,
  Eye,
  Upload,
  Copy,
  Download,
  CheckCircle,
  XCircle,
  Building2,
  Image as ImageIcon,
  DollarSign,
  Ticket,
  Home,
  Briefcase,
  Globe,
  List,
  Grid,
  Search,
  Accessibility,
  Monitor,
  Smartphone,
  Send,
  Clock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface MinisiteCreateWizardProps {
  onClose: () => void;
  onSubmit: (data: any, status: "draft" | "active") => void;
  editingMiniSite?: any;
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
  onSubmit,
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

  // Step 1: Website & Purchaser Info
  const [selectedWebsite, setSelectedWebsite] = useState("");
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
      setStartDate(editingMiniSite.startDate || "");
      setEndDate(editingMiniSite.endDate || "");
    }
  }, [editingMiniSite]);

  const steps = [
    { number: 1, name: t.websitePurchaserInfo || "Website & Purchaser Info" },
    { number: 2, name: t.selectProducts || "Select Products" },
    { number: 3, name: t.miniSitePreview || "Mini-Site Preview" },
    { number: 4, name: t.voucherCreation || "Voucher Creation" },
    { number: 5, name: t.results || "Results" },
  ];

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

  const handleSaveDraft = () => {
    const data = {
      selectedWebsite,
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
      deliveryArea,
      contentTitle,
      contentSubtitle,
      contentGreeting,
      selectedProducts,
      primaryProducts,
    };
    onSubmit(data, "draft");
  };

  const handlePublish = () => {
    const data = {
      selectedWebsite,
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
      deliveryArea,
      contentTitle,
      contentSubtitle,
      contentGreeting,
      selectedProducts,
      primaryProducts,
      voucherResults,
    };
    onSubmit(data, "active");
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`${bgPrimary} rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] my-8 flex flex-col border-2 ${borderColor} overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-3 border-b ${borderColor}`}
        >
          <div>
            <h2
              className={`text-xl bg-linear-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent`}
            >
              {editingMiniSite
                ? t.editMiniSite || "Edit Mini-Site"
                : t.createMiniSite || "Create Mini-Site"}
            </h2>
            <p className={`text-xs ${textTertiary} mt-0.5`}>
              {t.step || "Step"} {currentStep} {t.of || "of"} {steps.length}
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
              {t.miniSiteStatistics || "Mini-Site Statistics"}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Page Views */}
              <div
                className={`p-2 rounded-lg border ${borderColor} ${bgPrimary} hover:shadow-lg transition-all`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Eye className="w-4 h-4 text-purple-600" />
                  <span className={`text-xs ${textTertiary}`}>
                    {t.pageViews || "Page Views"}
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
                    {t.uniqueVisitors || "Unique Visitors"}
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
                    {t.vouchersUsed || "Vouchers Used"}
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
                    {t.productsPurchased || "Products Purchased"}
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
                    {t.conversionRate || "Conversion Rate"}
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
                    {t.totalRevenue || "Total Revenue"}
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
            <div className="space-y-6">
              {/* Website Selection */}
              <div>
                <h3
                  className={`text-lg ${textPrimary} mb-4 flex items-center gap-2`}
                >
                  <Globe className="w-5 h-5" />
                  {t.websiteSelection || "Website Selection"}
                </h3>
                <select
                  value={selectedWebsite}
                  onChange={(e) => setSelectedWebsite(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  <option value="">
                    {t.selectWebsite || "Select Website"}
                  </option>
                  {websites.map((site) => (
                    <option key={site} value={site}>
                      {site}
                    </option>
                  ))}
                </select>
              </div>

              {/* Purchaser Info */}
              <div>
                <h3
                  className={`text-lg ${textPrimary} mb-4 flex items-center gap-2`}
                >
                  <Building2 className="w-5 h-5" />
                  {t.purchaserInfo || "Purchaser (Company) - Required"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-2`}>
                      {t.companyName || "Company Name"}
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
                      {t.contactName || "Contact Name"}
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
                      {t.email || "Email"}
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
                      {t.phone || "Phone"}
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={phoneCountryCode}
                        onChange={(e) => setPhoneCountryCode(e.target.value)}
                        className={`px-3 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      >
                        <option value="+972">🇮🇱 +972</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
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
                      {t.officeAddress || "Office Address"}
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
                      {t.companyLogo || "Company Logo"}
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
                        {t.uploadLogo || "Upload Logo"}
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
                  {t.campaignInfo || "Campaign Info - Required"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-2`}>
                      {t.campaignName || "Campaign Name"}
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
                      {t.campaignCode || "Campaign Code"}
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
                      {t.voucherAmount || "Voucher Amount (₪)"}
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
                      {t.totalVouchers || "Total Number of Vouchers"}
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
                      {t.startDate || "Start Date"}
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
                      {t.endDate || "End Date"} ({t.optional || "Optional"})
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

              {/* Delivery Area */}
              <div>
                <h3 className={`text-lg ${textPrimary} mb-4`}>
                  {t.deliveryArea || "Delivery Area"}
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
                    <span className={textSecondary}>{t.home || "Home"}</span>
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
                    <span className={textSecondary}>
                      {t.office || "Office"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Content (Multi-Language) */}
              <div>
                <h3
                  className={`text-lg ${textPrimary} mb-4 flex items-center gap-2`}
                >
                  <Globe className="w-5 h-5" />
                  {t.content || "Content"} (
                  {t.multiLanguage || "Multi-Language"})
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
                      {t.title || "Title"}
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
                      {t.subtitle || "Sub-title"}
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
                      {t.greeting || "Greeting"}
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
            </div>
          )}

          {/* Step 2: Select Products */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className={`text-lg ${textPrimary} mb-4`}>
                {t.selectProducts || "Select Products"}
              </h3>

              {/* Filters */}
              <div className={`${bgSecondary} rounded-lg p-4 space-y-4`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-2`}>
                      {t.search || "Search"}
                    </label>
                    <div className="relative">
                      <Search
                        className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textTertiary}`}
                      />
                      <input
                        type="text"
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        placeholder={t.searchProducts || "Search products..."}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm ${textSecondary} mb-2`}>
                      {t.category || "Category"}
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    >
                      <option value="all">
                        {t.allCategories || "All Categories"}
                      </option>
                      <option value="Wellness">Wellness</option>
                      <option value="Tours">Tours</option>
                      <option value="Accommodation">Accommodation</option>
                      <option value="Dining">Dining</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      onClick={() => setProductViewMode("grid")}
                      className={`p-2 rounded-lg ${productViewMode === "grid" ? "bg-purple-600 text-white" : `${bgPrimary} ${textSecondary}`}`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setProductViewMode("list")}
                      className={`p-2 rounded-lg ${productViewMode === "list" ? "bg-purple-600 text-white" : `${bgPrimary} ${textSecondary}`}`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Products */}
              {productViewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`${bgSecondary} rounded-lg p-4 border-2 transition-all cursor-pointer ${
                        selectedProducts.includes(product.id)
                          ? "border-purple-500"
                          : borderColor
                      }`}
                      onClick={() => toggleProductSelection(product.id)}
                    >
                      <div
                        className={`w-full h-32 ${bgTertiary} rounded-lg mb-3 flex items-center justify-center`}
                      >
                        <ImageIcon className={`w-12 h-12 ${textTertiary}`} />
                      </div>
                      <h4 className={`${textPrimary} mb-1`}>{product.name}</h4>
                      <p className={`text-sm ${textTertiary} mb-2`}>
                        {product.businessName}
                      </p>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`${textPrimary}`}>
                          ₪{product.price}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${bgTertiary} ${textSecondary}`}
                        >
                          {product.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {product.accessibility.map((acc) => (
                          <Accessibility
                            key={acc}
                            className={`w-4 h-4 ${textTertiary}`}
                          />
                        ))}
                      </div>
                      {selectedProducts.includes(product.id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePrimaryProduct(product.id);
                          }}
                          className={`w-full mt-2 px-3 py-1 rounded-lg text-sm ${
                            primaryProducts.includes(product.id)
                              ? "bg-linear-to-r from-purple-500 to-pink-600 text-white"
                              : `${bgTertiary} ${textSecondary}`
                          }`}
                        >
                          {primaryProducts.includes(product.id)
                            ? "★ Primary"
                            : "Mark as Primary"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`${bgSecondary} rounded-lg p-4 border-2 transition-all cursor-pointer flex items-center gap-4 ${
                        selectedProducts.includes(product.id)
                          ? "border-purple-500"
                          : borderColor
                      }`}
                      onClick={() => toggleProductSelection(product.id)}
                    >
                      <div
                        className={`w-16 h-16 ${bgTertiary} rounded-lg flex items-center justify-center flex-shrink-0`}
                      >
                        <ImageIcon className={`w-8 h-8 ${textTertiary}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`${textPrimary}`}>{product.name}</h4>
                        <p className={`text-sm ${textTertiary}`}>
                          {product.businessName} • {product.category}
                        </p>
                      </div>
                      <div className={`${textPrimary}`}>₪{product.price}</div>
                      {selectedProducts.includes(product.id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePrimaryProduct(product.id);
                          }}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            primaryProducts.includes(product.id)
                              ? "bg-linear-to-r from-purple-500 to-pink-600 text-white"
                              : `${bgTertiary} ${textSecondary}`
                          }`}
                        >
                          {primaryProducts.includes(product.id)
                            ? "★ Primary"
                            : "Mark Primary"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className={`${bgSecondary} rounded-lg p-4`}>
                <p className={textSecondary}>
                  {selectedProducts.length}{" "}
                  {t.productsSelected || "products selected"}
                  {primaryProducts.length > 0 &&
                    ` • ${primaryProducts.length} ${t.markedAsPrimary || "marked as primary"}`}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Mini-Site Preview */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className={`text-lg ${textPrimary}`}>
                  {t.miniSitePreview || "Mini-Site Preview"}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewMode("desktop")}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${previewMode === "desktop" ? "bg-purple-600 text-white" : `${bgSecondary} ${textSecondary}`}`}
                  >
                    <Monitor className="w-4 h-4" />
                    Desktop
                  </button>
                  <button
                    onClick={() => setPreviewMode("mobile")}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${previewMode === "mobile" ? "bg-purple-600 text-white" : `${bgSecondary} ${textSecondary}`}`}
                  >
                    <Smartphone className="w-4 h-4" />
                    Mobile
                  </button>
                </div>
              </div>

              {/* Preview Frame */}
              <div
                className={`${bgSecondary} rounded-lg p-8 flex justify-center`}
              >
                <div
                  className={`${bgPrimary} rounded-lg shadow-2xl overflow-hidden ${
                    previewMode === "desktop" ? "w-full max-w-4xl" : "w-80"
                  }`}
                  style={{
                    height: previewMode === "desktop" ? "600px" : "667px",
                  }}
                >
                  <div className="p-6 space-y-6">
                    {/* Title */}
                    <h1 className={`text-2xl ${textPrimary} text-center`}>
                      {contentTitle[contentLanguage] || "Campaign Title"}
                    </h1>

                    {/* Subtitle */}
                    <p className={`${textSecondary} text-center`}>
                      {contentSubtitle[contentLanguage] || "Campaign subtitle"}
                    </p>

                    {/* Product Carousel */}
                    <div className={`${bgSecondary} rounded-lg p-4`}>
                      <h3 className={`text-sm ${textTertiary} mb-3`}>
                        {t.featuredProducts || "Featured Products"}
                      </h3>
                      <div className="space-y-2">
                        {selectedProducts.slice(0, 3).map((productId) => {
                          const product = mockProducts.find(
                            (p) => p.id === productId,
                          );
                          return product ? (
                            <div
                              key={product.id}
                              className={`${bgTertiary} rounded p-3 flex items-center gap-3`}
                            >
                              <div
                                className={`w-12 h-12 ${bgSecondary} rounded flex-shrink-0`}
                              ></div>
                              <div className="flex-1">
                                <p className={`text-sm ${textPrimary}`}>
                                  {product.name}
                                </p>
                                <p className={`text-xs ${textTertiary}`}>
                                  ₪{product.price}
                                </p>
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>

                    {/* Greeting */}
                    <div className={`${bgSecondary} rounded-lg p-4`}>
                      <p className={`text-sm ${textSecondary}`}>
                        {contentGreeting[contentLanguage] ||
                          "Greeting message will appear here"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Copy URL */}
              <div className={`${bgSecondary} rounded-lg p-4`}>
                <label className={`block text-sm ${textSecondary} mb-2`}>
                  {t.miniSiteUrl || "Mini-Site URL"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://tav-8.co.il/mini-site?campCode=${campaignCode}&voucherId=65c3874cd753aecdd6cb85ae&customerEmail=${email}`}
                    className={`flex-1 px-4 py-2 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary} text-sm`}
                  />
                  <button
                    onClick={copyMiniSiteUrl}
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    {t.copy || "Copy"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Voucher Creation & Distribution */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className={`text-lg ${textPrimary} mb-4`}>
                {t.voucherCreation || "Voucher Creation & Distribution"}
              </h3>

              {/* Voucher Sender Info */}
              <div className={`${bgSecondary} rounded-lg p-4`}>
                <h4 className={`${textPrimary} mb-3`}>
                  {t.voucherSenderInfo || "Voucher Sender Info"}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm ${textTertiary} mb-1`}>
                      {t.name || "Name"}
                    </label>
                    <p className={textPrimary}>{contactName || "-"}</p>
                  </div>
                  <div>
                    <label className={`block text-sm ${textTertiary} mb-1`}>
                      {t.email || "Email"}
                    </label>
                    <p className={textPrimary}>{email || "-"}</p>
                  </div>
                  <div>
                    <label className={`block text-sm ${textTertiary} mb-1`}>
                      {t.phone || "Phone"}
                    </label>
                    <p className={textPrimary}>
                      {phoneCountryCode}
                      {phoneNumber || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scheduling */}
              <div>
                <h4 className={`${textPrimary} mb-3`}>
                  {t.scheduling || "Scheduling"}
                </h4>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={sendTiming === "immediate"}
                      onChange={() => setSendTiming("immediate")}
                      className="w-4 h-4 text-purple-600"
                    />
                    <Send className="w-4 h-4" />
                    <span className={textSecondary}>
                      {t.sendImmediately || "Send Immediately"}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={sendTiming === "scheduled"}
                      onChange={() => setSendTiming("scheduled")}
                      className="w-4 h-4 text-purple-600"
                    />
                    <Clock className="w-4 h-4" />
                    <span className={textSecondary}>
                      {t.scheduleForLater || "Schedule for Later"}
                    </span>
                  </label>
                </div>
                {sendTiming === "scheduled" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm ${textSecondary} mb-2`}>
                        {t.date || "Date"}
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
                        {t.time || "Time"}
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
              </div>

              {/* Voucher Assignment */}
              <div>
                <h4 className={`${textPrimary} mb-3`}>
                  {t.voucherAssignment || "Voucher Assignment"}
                </h4>

                {/* Download Sample */}
                <button
                  onClick={downloadSampleXLS}
                  className={`mb-4 px-4 py-2 rounded-lg ${bgSecondary} ${textSecondary} hover:${textPrimary} transition-colors flex items-center gap-2`}
                >
                  <Download className="w-4 h-4" />
                  {t.downloadSampleXLS || "Download Sample XLS"}
                </button>

                {/* Bulk Upload */}
                <div className={`${bgSecondary} rounded-lg p-4 mb-4`}>
                  <label className={`block text-sm ${textSecondary} mb-2`}>
                    {t.bulkUpload || "Bulk Upload (XLS)"}
                  </label>
                  <label
                    className={`px-4 py-2 rounded-lg border-2 border-dashed ${borderColor} ${textSecondary} cursor-pointer hover:${textPrimary} transition-colors flex items-center justify-center gap-2 h-24`}
                  >
                    <Upload className="w-5 h-5" />
                    <span>
                      {uploadedFile
                        ? uploadedFile.name
                        : t.uploadXLS || "Click to upload XLS file"}
                    </span>
                    <input
                      type="file"
                      accept=".xls,.xlsx,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Instance Voucher Creation */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={allowInstanceCreation}
                      onChange={(e) =>
                        setAllowInstanceCreation(e.target.checked)
                      }
                      className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className={textSecondary}>
                      {t.allowInstanceCreation ||
                        "Allow Instance Voucher Creation"}
                    </span>
                  </label>

                  {allowInstanceCreation && (
                    <div className={`${bgSecondary} rounded-lg p-4`}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <input
                            type="text"
                            value={instanceName}
                            onChange={(e) => setInstanceName(e.target.value)}
                            placeholder={t.name || "Name"}
                            className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          />
                        </div>
                        <div>
                          <input
                            type="email"
                            value={instanceEmail}
                            onChange={(e) => setInstanceEmail(e.target.value)}
                            placeholder={t.email || "Email"}
                            className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          />
                        </div>
                        <div>
                          <input
                            type="tel"
                            value={instancePhone}
                            onChange={(e) => setInstancePhone(e.target.value)}
                            placeholder={t.phone || "Phone"}
                            className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleInstanceVoucherAdd}
                        className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                      >
                        {t.addVoucher || "Add Voucher"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Results */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className={`text-lg ${textPrimary} mb-4`}>
                {t.voucherGenerationResults || "Voucher Generation Results"}
              </h3>

              {voucherResults.length > 0 ? (
                <>
                  <div className={`${bgSecondary} rounded-lg overflow-hidden`}>
                    <table className="w-full">
                      <thead
                        className={`${bgTertiary} border-b ${borderColor}`}
                      >
                        <tr>
                          <th
                            className={`px-4 py-3 text-left text-sm ${textSecondary}`}
                          >
                            {t.assigneeName || "Assignee Name"}
                          </th>
                          <th
                            className={`px-4 py-3 text-left text-sm ${textSecondary}`}
                          >
                            {t.email || "Email"}
                          </th>
                          <th
                            className={`px-4 py-3 text-left text-sm ${textSecondary}`}
                          >
                            {t.phone || "Phone"}
                          </th>
                          <th
                            className={`px-4 py-3 text-center text-sm ${textSecondary}`}
                          >
                            {t.emailSent || "Email Sent"}
                          </th>
                          <th
                            className={`px-4 py-3 text-center text-sm ${textSecondary}`}
                          >
                            {t.smsSent || "SMS Sent"}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {voucherResults.map((recipient, index) => (
                          <tr key={index} className={`border-b ${borderColor}`}>
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

                  <div className="flex gap-3">
                    <button
                      onClick={downloadSampleXLS}
                      className={`px-4 py-2 rounded-lg ${bgSecondary} ${textSecondary} hover:${textPrimary} transition-colors flex items-center gap-2`}
                    >
                      <Download className="w-4 h-4" />
                      {t.downloadResults || "Download Results"}
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      {t.retryFailed || "Retry Failed Sends"}
                    </button>
                  </div>
                </>
              ) : (
                <div className={`${bgSecondary} rounded-lg p-8 text-center`}>
                  <p className={textTertiary}>
                    {t.noVouchersCreated ||
                      "No vouchers have been created yet. Go back to Step 4 to create vouchers."}
                  </p>
                </div>
              )}
            </div>
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
            {t.previous || "Previous"}
          </button>

          <div className="flex gap-2">
            {currentStep < 5 && (
              <button
                onClick={handleSaveDraft}
                className={`px-3 py-1.5 rounded-lg ${bgSecondary} ${textSecondary} hover:${textPrimary} transition-colors flex items-center gap-2 text-sm`}
              >
                <Save className="w-4 h-4" />
                {t.saveDraft || "Save Draft"}
              </button>
            )}

            {currentStep === steps.length ? (
              <button
                onClick={handlePublish}
                className="px-4 py-1.5 rounded-lg bg-linear-to-r from-purple-500 to-pink-600 text-white hover:shadow-lg transition-all flex items-center gap-2 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                {t.complete || "Complete"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-4 py-1.5 rounded-lg bg-linear-to-r from-purple-500 to-pink-600 text-white hover:shadow-lg transition-all flex items-center gap-2 text-sm"
              >
                {t.next || "Next"}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
