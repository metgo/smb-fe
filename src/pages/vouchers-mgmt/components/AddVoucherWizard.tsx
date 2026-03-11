import { useState, useRef, useEffect } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
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
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Simulate voucher creation
    const mockVouchers: CreatedVoucher[] = [];
    const count =
      formData.creationType === "single"
        ? 1
        : formData.creationType === "bulk"
          ? formData.bulkCount
          : xlsValidation?.valid || 0;

    for (let i = 0; i < count; i++) {
      mockVouchers.push({
        code: `VCH-${String(Math.floor(Math.random() * 1000000)).padStart(6, "0")}`,
        assigneeName:
          formData.creationType === "single"
            ? formData.assigneeName
            : `Customer ${i + 1}`,
        email:
          formData.creationType === "single"
            ? formData.assigneeEmail
            : `customer${i + 1}@example.com`,
        amount: formData.amount,
        status: "Created",
      });
    }

    setCreatedVouchers(mockVouchers);
    setCurrentStep(5); // Success step
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.websites.length > 0 && formData.amount > 0;
      case 2:
        return formData.creationType !== null;
      case 3:
        if (formData.creationType === "single") {
          return (
            formData.assigneeName &&
            formData.assigneeEmail &&
            formData.assigneePhone
          );
        } else if (formData.creationType === "bulk") {
          const bulkCountValid =
            formData.bulkCount > 0 && formData.bulkCount <= 1000;
          if (formData.bulkCreateAssigned) {
            return (
              bulkCountValid &&
              formData.assigneeName &&
              formData.assigneeEmail &&
              formData.assigneePhone
            );
          }
          return bulkCountValid;
        } else if (formData.creationType === "upload") {
          return (
            formData.xlsFile !== null &&
            xlsValidation !== null &&
            xlsValidation.valid > 0
          );
        }
        return false;
      case 4:
        return true;
      default:
        return false;
    }
  };

  // Step configuration
  const steps = [
    { id: 1, icon: FileText, label: "Details" },
    { id: 2, icon: Users, label: "Type" },
    { id: 3, icon: ClipboardList, label: "Configure" },
    { id: 4, icon: Eye, label: "Review" },
  ];

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-3">
          Select Websites (multi-select)
        </label>
        <div className="relative" ref={websiteDropdownRef}>
          <button
            type="button"
            onClick={() => setIsWebsiteDropdownOpen(!isWebsiteDropdownOpen)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none flex items-center justify-between"
          >
            <span className="text-sm">
              {formData.websites.length === 0
                ? "Select websites..."
                : `${formData.websites.length} website${formData.websites.length !== 1 ? "s" : ""} selected`}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isWebsiteDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isWebsiteDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {websites.map((website) => (
                <label
                  key={website.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.websites.includes(website.id)}
                    onChange={() => handleWebsiteToggle(website.id)}
                    className="rounded border-gray-300 dark:border-gray-600 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {website.name}
                  </span>
                  {formData.websites.includes(website.id) && (
                    <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 ml-auto" />
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
          Select Campaign (optional)
        </label>
        <select
          value={formData.campaign}
          onChange={(e) => handleCampaignChange(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none"
        >
          <option value="">No campaign</option>
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.name} (₪{campaign.defaultAmount})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
          Voucher Amount
        </label>
        <div className="space-y-3">
          {formData.campaign && !formData.customAmount && (
            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">
              <p className="text-sm text-teal-900 dark:text-teal-100">
                Campaign default: ₪
                {
                  campaigns.find((c) => c.id === formData.campaign)
                    ?.defaultAmount
                }
              </p>
            </div>
          )}
          <input
            type="number"
            value={formData.amount}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                amount: Number(e.target.value),
                customAmount: true,
              }))
            }
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none"
            min="1"
            placeholder="Enter amount"
          />
          {formData.campaign && formData.customAmount && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Custom amount override enabled
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
          Expiration Date
        </label>
        <input
          type="date"
          value={formData.expirationDate}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, expirationDate: e.target.value }))
          }
          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none"
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      {/* Purchaser Details Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-sm text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
          <User className="w-4 h-4" />
          Purchaser Details (optional)
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <div className="relative" ref={purchaserDropdownRef}>
              <input
                type="email"
                value={formData.purchaserEmail}
                onChange={(e) => handlePurchaserEmailChange(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="purchaser@example.com"
              />

              {showPurchaserSuggestions && purchaserSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {purchaserSuggestions.map((user, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handlePurchaserSelect(user)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                          <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {user.name}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                        <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Start typing to search existing users
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.purchaserName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  purchaserName: e.target.value,
                }))
              }
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Enter purchaser name"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.purchaserPhone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  purchaserPhone: e.target.value,
                }))
              }
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="+972-XX-XXXXXXX"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-sm text-gray-700 dark:text-gray-300 mb-4">
        Choose creation type
      </h3>

      <label className="flex items-start gap-4 p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-teal-500 dark:hover:border-teal-500 cursor-pointer transition-colors">
        <input
          type="radio"
          name="creationType"
          checked={formData.creationType === "single"}
          onChange={() =>
            setFormData((prev) => ({ ...prev, creationType: "single" }))
          }
          className="mt-1 text-teal-600 focus:ring-teal-500"
        />
        <div className="flex-1">
          <div className="text-gray-900 dark:text-gray-100 mb-1">
            Single Voucher
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create one voucher for a specific person
          </p>
        </div>
      </label>

      <label className="flex items-start gap-4 p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-teal-500 dark:hover:border-teal-500 cursor-pointer transition-colors">
        <input
          type="radio"
          name="creationType"
          checked={formData.creationType === "bulk"}
          onChange={() =>
            setFormData((prev) => ({ ...prev, creationType: "bulk" }))
          }
          className="mt-1 text-teal-600 focus:ring-teal-500"
        />
        <div className="flex-1">
          <div className="text-gray-900 dark:text-gray-100 mb-1">
            Bulk Creation
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create multiple unassigned vouchers at once
          </p>
        </div>
      </label>

      <label className="flex items-start gap-4 p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-teal-500 dark:hover:border-teal-500 cursor-pointer transition-colors">
        <input
          type="radio"
          name="creationType"
          checked={formData.creationType === "upload"}
          onChange={() =>
            setFormData((prev) => ({ ...prev, creationType: "upload" }))
          }
          className="mt-1 text-teal-600 focus:ring-teal-500"
        />
        <div className="flex-1">
          <div className="text-gray-900 dark:text-gray-100 mb-1">
            Upload XLS
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload a spreadsheet with voucher details
          </p>
        </div>
      </label>
    </div>
  );

  const renderStep3 = () => {
    if (formData.creationType === "single") {
      return (
        <div className="space-y-4">
          <h3 className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            Assignee Details
          </h3>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.assigneeName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  assigneeName: e.target.value,
                }))
              }
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Enter assignee name"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.assigneeEmail}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  assigneeEmail: e.target.value,
                }))
              }
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Phone *
            </label>
            <input
              type="tel"
              value={formData.assigneePhone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  assigneePhone: e.target.value,
                }))
              }
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="+972-XX-XXXXXXX"
            />
          </div>
        </div>
      );
    } else if (formData.creationType === "bulk") {
      return (
        <div className="space-y-4">
          <h3 className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            Bulk Creation Settings
          </h3>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Number of Vouchers (max 1000)
            </label>
            <input
              type="number"
              value={formData.bulkCount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  bulkCount: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none"
              min="1"
              max="1000"
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.bulkCreateAssigned}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bulkCreateAssigned: e.target.checked,
                    assigneeName: e.target.checked ? prev.assigneeName : "",
                    assigneeEmail: e.target.checked ? prev.assigneeEmail : "",
                    assigneePhone: e.target.checked ? prev.assigneePhone : "",
                  }))
                }
                className="rounded border-gray-300 dark:border-gray-600 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Create Assigned Voucher
              </span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-500 ml-7 mt-1">
              Assign all vouchers to a specific person
            </p>
          </div>

          {formData.bulkCreateAssigned && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.assigneeName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      assigneeName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Enter assignee name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.assigneeEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      assigneeEmail: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.assigneePhone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      assigneePhone: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="+972-XX-XXXXXXX"
                />
              </div>
            </div>
          )}

          {!formData.bulkCreateAssigned && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                {formData.bulkCount} vouchers will be created as unassigned. You
                can assign them later from the vouchers list.
              </p>
            </div>
          )}

          {formData.bulkCreateAssigned && (
            <div className="p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">
              <p className="text-sm text-teal-900 dark:text-teal-100">
                {formData.bulkCount} vouchers will be assigned to{" "}
                {formData.assigneeName || "the specified person"}.
              </p>
            </div>
          )}
        </div>
      );
    } else if (formData.creationType === "upload") {
      return (
        <div className="space-y-4">
          <h3 className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            Upload XLS File
          </h3>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg">
            <button className="flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-sm">
              <Download className="w-4 h-4" />
              Download Sample XLS Template
            </button>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Use this template to ensure your file has the correct format
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Upload File
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-teal-500 dark:hover:border-teal-500 transition-colors">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <label className="cursor-pointer">
                <span className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300">
                  Click to upload
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {" "}
                  or drag and drop
                </span>
                <input
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                XLS or XLSX files only
              </p>
            </div>
          </div>

          {formData.xlsFile && (
            <div className="p-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg">
              <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">
                File: {formData.xlsFile.name}
              </p>
              {xlsValidation && (
                <div className="space-y-2 mt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600 dark:text-green-400">
                      ✓ Valid rows: {xlsValidation.valid}
                    </span>
                    <span className="text-red-600 dark:text-red-400">
                      ✗ Invalid rows: {xlsValidation.invalid}
                    </span>
                  </div>
                  {xlsValidation.invalid > 0 && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
                        <span className="text-sm text-red-900 dark:text-red-100">
                          Validation Errors:
                        </span>
                      </div>
                      <ul className="text-xs text-red-800 dark:text-red-200 space-y-1 ml-6">
                        {xlsValidation.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                      <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                        Only valid rows will be processed. Invalid rows will be
                        rejected.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
  };

  const renderStep4 = () => {
    const selectedWebsites = websites.filter((w) =>
      formData.websites.includes(w.id),
    );
    const selectedCampaign = campaigns.find((c) => c.id === formData.campaign);

    return (
      <div className="space-y-6">
        <h3 className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          Review & Confirm
        </h3>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
              Websites
            </label>
            <div className="text-gray-900 dark:text-gray-100">
              {selectedWebsites.map((w) => w.name).join(", ")}
            </div>
          </div>

          {selectedCampaign && (
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                Campaign
              </label>
              <div className="text-gray-900 dark:text-gray-100">
                {selectedCampaign.name}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
              Amount per Voucher
            </label>
            <div className="text-gray-900 dark:text-gray-100">
              ₪{formData.amount}
            </div>
          </div>

          {formData.expirationDate && (
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                Expiration Date
              </label>
              <div className="text-gray-900 dark:text-gray-100">
                {formData.expirationDate}
              </div>
            </div>
          )}

          {(formData.purchaserEmail ||
            formData.purchaserName ||
            formData.purchaserPhone) && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                Purchaser Details
              </label>
              <div className="text-gray-900 dark:text-gray-100">
                {formData.purchaserName && (
                  <>
                    {formData.purchaserName}
                    <br />
                  </>
                )}
                {formData.purchaserEmail && (
                  <>
                    {formData.purchaserEmail}
                    <br />
                  </>
                )}
                {formData.purchaserPhone && <>{formData.purchaserPhone}</>}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
              Creation Type
            </label>
            <div className="text-gray-900 dark:text-gray-100 capitalize">
              {formData.creationType}
            </div>
          </div>

          {formData.creationType === "single" && (
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                Assignee
              </label>
              <div className="text-gray-900 dark:text-gray-100">
                {formData.assigneeName}
                <br />
                {formData.assigneeEmail}
                <br />
                {formData.assigneePhone}
              </div>
            </div>
          )}

          {formData.creationType === "bulk" && (
            <>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                  Quantity
                </label>
                <div className="text-gray-900 dark:text-gray-100">
                  {formData.bulkCount} vouchers
                </div>
              </div>
              {formData.bulkCreateAssigned && (
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                    Assignee
                  </label>
                  <div className="text-gray-900 dark:text-gray-100">
                    {formData.assigneeName}
                    <br />
                    {formData.assigneeEmail}
                    <br />
                    {formData.assigneePhone}
                  </div>
                </div>
              )}
            </>
          )}

          {formData.creationType === "upload" &&
            formData.xlsFile &&
            xlsValidation && (
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                  Upload Results
                </label>
                <div className="text-gray-900 dark:text-gray-100">
                  {xlsValidation.valid} valid vouchers will be created
                </div>
              </div>
            )}
        </div>

        <div className="p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">
          <p className="text-sm text-teal-900 dark:text-teal-100">
            Click "Create Vouchers" to proceed with voucher creation.
          </p>
        </div>
      </div>
    );
  };

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl text-gray-900 dark:text-gray-100 mb-2">
          Vouchers Created Successfully!
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {createdVouchers.length} voucher
          {createdVouchers.length !== 1 ? "s" : ""}{" "}
          {createdVouchers.length !== 1 ? "have" : "has"} been created
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-600 dark:text-gray-400">
                  Voucher Code
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-600 dark:text-gray-400">
                  Assignee
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-600 dark:text-gray-400">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-600 dark:text-gray-400">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-600 dark:text-gray-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {createdVouchers.map((voucher, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {voucher.code}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {voucher.assigneeName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {voucher.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    ₪{voucher.amount}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      {voucher.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          Download Results
        </button>
        <button
          onClick={onVoucherCreated}
          className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl text-gray-900 dark:text-gray-100">
              {currentStep === 5 ? "Success" : "Add Voucher"}
            </h2>
            {currentStep < 5 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Step {currentStep} of 4
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Progress Bar */}
        {currentStep < 5 && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                    // className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    //   currentStep > step.id
                    //     ? 'bg-green-500 text-white'
                    //     : currentStep === step.id
                    //     ? 'bg-teal-500 text-white'
                    //     // : theme === 'dark'
                    //     // ? 'bg-gray-800 text-gray-500'
                    //     // : 'bg-gray-200 text-gray-400'
                    // }`}
                    >
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5" />
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
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </div>

        {/* Footer */}
        {currentStep < 5 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === 4 ? "Create Vouchers" : "Next"}
              {currentStep < 4 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
