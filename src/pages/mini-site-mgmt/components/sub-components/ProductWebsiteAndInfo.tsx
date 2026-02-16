// Step1WebsiteAndInfo.tsx
import React, { useRef } from "react";
import {
  Globe,
  Building2,
  Ticket,
  Home,
  Briefcase,
  Upload,
} from "lucide-react"; // assuming you're using lucide-react icons
import { DmoAuthorityWebsiteSelector } from "@/components/shared";

interface Step1WebsiteAndInfoProps {
  miniSiteId: string | number;
  selectedDmoId: string | number | null;
  setSelectDmoId: React.Dispatch<React.SetStateAction<any>>;
  selectedAuthorityId: string | number | null;
  setSelectAuthorityId: React.Dispatch<React.SetStateAction<any>>;
  websiteVisibilityIds: any[];
  setWebsiteVisibilityIds: React.Dispatch<React.SetStateAction<any[]>>;

  currentStep: number;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  handleLogoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  websites: string[];

  contentLanguage: "en" | "he" | "ar";
  setContentLanguage: React.Dispatch<React.SetStateAction<"en" | "he" | "ar">>;
  contentTitle: Record<"en" | "he" | "ar", string>;
  setContentTitle: React.Dispatch<
    React.SetStateAction<Record<"en" | "he" | "ar", string>>
  >;
  contentSubtitle: Record<"en" | "he" | "ar", string>;
  setContentSubtitle: React.Dispatch<
    React.SetStateAction<Record<"en" | "he" | "ar", string>>
  >;
  contentGreeting: Record<"en" | "he" | "ar", string>;
  setContentGreeting: React.Dispatch<
    React.SetStateAction<Record<"en" | "he" | "ar", string>>
  >;

  t: any;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  bgSecondary: string;
  bgTertiary: string;
  borderColor: string;
  businessAssociatedWebsites: any;
}

export default function Step1WebsiteAndInfo({
  miniSiteId,
  selectedDmoId,
  setSelectDmoId,
  selectedAuthorityId,
  setSelectAuthorityId,
  websiteVisibilityIds,
  setWebsiteVisibilityIds,

  currentStep,
  formData,
  setFormData,
  handleChange,
  handleLogoUpload,
  websites,
  contentLanguage,
  setContentLanguage,
  contentTitle,
  setContentTitle,
  contentSubtitle,
  setContentSubtitle,
  contentGreeting,
  setContentGreeting,
  t,
  textPrimary,
  textSecondary,
  textTertiary,
  bgSecondary,
  bgTertiary,
  borderColor,
  businessAssociatedWebsites = [],
}: Step1WebsiteAndInfoProps) {
  if (currentStep !== 1) return null;
  // const dmoSectionRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="space-y-6">
      {/* Website Selection */}
      {/* <DmoAuthorityWebsiteSelector
        // errors={errors}
        isEdit={!!miniSiteId}
        selectedDmoId={selectedDmoId ?? ""}
        setSelectDmoId={setSelectDmoId}
        selectedAuthorityId={selectedAuthorityId ?? ""}
        setSelectAuthorityId={setSelectAuthorityId}
        dmoSectionRef={dmoSectionRef}
        websiteVisibilityIds={websiteVisibilityIds}
        setWebsiteVisibilityIds={setWebsiteVisibilityIds}
        itemAssociatedWebsites={businessAssociatedWebsites}
      /> */}

      {/* Purchaser Info */}
      <div>
        <h3 className={`text-lg ${textPrimary} mb-4 flex items-center gap-2`}>
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
              value={formData.companyName}
              name="companyName"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  companyName: e.target.value,
                }))
              }
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
              value={formData.contactName}
              name="contactName"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contactName: e.target.value,
                }))
              }
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
              value={formData.email}
              name="email"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
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
                name="phoneCountryCode"
                value={formData.phoneCountryCode}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phoneCountryCode: e.target.value,
                  }))
                }
                className={`px-3 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              >
                <option value="+972">🇮🇱 +972</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
              </select>
              <input
                type="tel"
                value={formData.phoneNumber}
                name="phoneNumber"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
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
              value={formData.officeAddress}
              name="officeAddress"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  officeAddress: e.target.value,
                }))
              }
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="123 Main St, Tel Aviv"
            />
          </div>

          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t.companyLogo || "Company Logo"}
            </label>
            <div className="flex items-center gap-4">
              {formData.logoFile && (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500">
                  <img
                    src={formData.logoFile}
                    alt="Company logo preview"
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
                  name="logoFile"
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Info */}
      <div>
        <h3 className={`text-lg ${textPrimary} mb-4 flex items-center gap-2`}>
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
              name="campaignName"
              value={formData.campaignName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }))
              }
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
              value={formData.campaignCode}
              name="campaignCode"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  campaignCode: e.target.value,
                }))
              }
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgTertiary} ${textTertiary} font-mono`}
              placeholder="Enter 4 or more digits"
            />
          </div>

          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t.voucherAmount || "Voucher Amount (₪)"}
            </label>
            <input
              type="number"
              name="voucherAmount"
              value={formData.voucherAmount}
              onChange={(e) =>
                setFormData({ ...formData, voucherAmount: e.target.value })
              }
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
              name="totalVouchers"
              value={formData.totalVouchers}
              onChange={(e) =>
                setFormData({ ...formData, totalVouchers: e.target.value })
              }
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
              name="startDate"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
          </div>

          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t.endDate || "End Date"} ({t.optional || "Optional"})
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              name="endDate"
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
              checked={formData.deliveryArea === "home"}
              onChange={() =>
                setFormData((prev: any) => ({ ...prev, deliveryArea: "home" }))
              }
              className="w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
            />
            <Home className="w-4 h-4" />
            <span className={textSecondary}>{t.home || "Home"}</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="deliveryArea"
              checked={formData.deliveryArea === "office"}
              onChange={() =>
                setFormData((prev: any) => ({
                  ...prev,
                  deliveryArea: "office",
                }))
              }
              className="w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
            />
            <Briefcase className="w-4 h-4" />
            <span className={textSecondary}>{t.office || "Office"}</span>
          </label>
        </div>
      </div>

      {/* Content (Multi-Language) */}
      <div>
        <h3 className={`text-lg ${textPrimary} mb-4 flex items-center gap-2`}>
          <Globe className="w-5 h-5" />
          {t.content || "Content"} ({t.multiLanguage || "Multi-Language"})
        </h3>

        <div className="mb-4">
          <div className="flex gap-2">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, contentLanguage: "en" }))
                }
                className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${
                formData.contentLanguage === "en"
                  ? "bg-purple-600 text-white shadow-md"
                  : `${bgSecondary} ${textSecondary} hover:bg-purple-100/50`
              }
            `}
              >
                English
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, contentLanguage: "he" }))
                }
                className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${
                formData.contentLanguage === "he"
                  ? "bg-purple-600 text-white shadow-md"
                  : `${bgSecondary} ${textSecondary} hover:bg-purple-100/50`
              }
            `}
              >
                עברית
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, contentLanguage: "ar" }))
                }
                className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${
                  formData.contentLanguage === "ar"
                    ? "bg-purple-600 text-white shadow-md"
                    : `${bgSecondary} ${textSecondary} hover:bg-purple-100/50`
                }
               `}
              >
                العربية
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t.title || "Title"}
            </label>
            <input
              type="text"
              value={formData.contentTitle[formData.contentLanguage] ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contentTitle: {
                    ...prev.contentTitle,
                    [prev.contentLanguage]: e.target.value,
                  },
                }))
              }
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder={
                formData.contentLanguage === "en"
                  ? "Welcome to our campaign"
                  : formData.contentLanguage === "he"
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
              value={formData.contentSubtitle[formData.contentLanguage] ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contentSubtitle: {
                    ...prev.contentSubtitle,
                    [prev.contentLanguage]: e.target.value,
                  },
                }))
              }
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder={
                formData.contentLanguage === "en"
                  ? "Enjoy exclusive offers"
                  : formData.contentLanguage === "he"
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
              value={formData.contentGreeting[formData.contentLanguage] ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contentGreeting: {
                    ...prev.contentGreeting,
                    [prev.contentLanguage]: e.target.value,
                  },
                }))
              }
              rows={4}
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder={
                formData.contentLanguage === "en"
                  ? "Thank you for participating..."
                  : formData.contentLanguage === "he"
                    ? "תודה על ההשתתתפות..."
                    : "شكرا لمشاركتك..."
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
