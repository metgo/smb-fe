import { useTranslation } from "react-i18next";
import {
  Building2,
  DollarSign,
  Ticket,
  Home,
  Briefcase,
  Globe,
  Upload,
} from "lucide-react";

import { WebsiteSelect } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import type { MiniCampaignFormData } from "../../hooks/useMiniCampaignWizard";

interface WebsitePurchaserInfoStepProps {
  formData: MiniCampaignFormData;
  setFormData: React.Dispatch<React.SetStateAction<MiniCampaignFormData>>;
  marketplaceWebsites: { _id: string; name: string; logo: string }[];
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function WebsitePurchaserInfoStep({
  formData,
  setFormData,
  marketplaceWebsites,
  handleLogoUpload,
}: WebsitePurchaserInfoStepProps) {
  const { t } = useTranslation("mini_campaign");
  const {
    textPrimary,
    textSecondary,
    textTertiary,
    bgSecondary,
    bgTertiary,
    borderColor,
    language,
  } = useThemeClasses();

  // Get correct field name based on current global language (mirrors
  // CreateBusinessWizard's BusinessContentForm behavior)
  const getFieldName = (baseField: string): string => {
    if (language === "en") return baseField;
    const suffix = language.charAt(0).toUpperCase() + language.slice(1);
    return `${baseField}${suffix}`;
  };

  const titleField = getFieldName("contentTitle") as keyof typeof formData;
  const subtitleField = getFieldName(
    "contentSubtitle",
  ) as keyof typeof formData;
  const greetingField = getFieldName(
    "contentGreeting",
  ) as keyof typeof formData;

  return (
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
              checked={formData.createMiniSite}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  createMiniSite: e.target.checked,
                }))
              }
              className="w-5 h-5 text-purple-600 focus:ring-2 focus:ring-purple-500 rounded"
            />
            <div>
              <span className={`${textPrimary}`}>{t("create_mini_site")}</span>
              <p className={`text-xs ${textTertiary} mt-1`}>
                {t("create_mini_site_desc")}
              </p>
            </div>
          </label>
        </div>

        {/* Campaign Type */}
        <div className={`${bgSecondary} rounded-lg p-4 border ${borderColor}`}>
          <h3 className={`text-sm ${textPrimary} mb-3 flex items-center gap-2`}>
            <DollarSign className="w-4 h-4" />
            {t("campaign_type")}
          </h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="campaignType"
                checked={formData.campaignType === "cash-back"}
                onChange={() =>
                  setFormData((prev) => ({
                    ...prev,
                    campaignType: "cash-back",
                  }))
                }
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
                checked={formData.campaignType === "cash-in"}
                onChange={() =>
                  setFormData((prev) => ({ ...prev, campaignType: "cash-in" }))
                }
                className="w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex-1">
                <span className={`text-sm ${textPrimary}`}>{t("cash_in")}</span>
                <p className={`text-xs ${textTertiary}`}>{t("cash_in_desc")}</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Website Selection */}
      <div>
        <h3 className={`text-lg ${textPrimary} mb-4 flex items-center gap-2`}>
          <Globe className="w-5 h-5" />
          {t("website_selection")}
        </h3>
        <WebsiteSelect
          websites={marketplaceWebsites}
          value={formData.selectedWebsite}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, selectedWebsite: value }))
          }
          isClearable
          placeholder={t("select_website")}
        />
      </div>

      {/* Purchaser Info */}
      <div>
        <h3 className={`text-lg ${textPrimary} mb-4 flex items-center gap-2`}>
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
              value={formData.companyName}
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
              {t("contact_name")}
            </label>
            <input
              type="text"
              value={formData.contactName}
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
              {t("email")}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
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
                value={formData.phoneCountryCode}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phoneCountryCode: e.target.value,
                  }))
                }
                className={`px-3 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              >
                <option value="+972">+972</option>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
              </select>
              <input
                type="tel"
                value={formData.phoneNumber}
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
              {t("office_address")}
            </label>
            <input
              type="text"
              value={formData.officeAddress}
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
              {t("company_logo")}
            </label>
            <div className="flex items-center gap-4">
              {formData.logoFile && (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500">
                  <img
                    src={formData.logoFile}
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
        <h3 className={`text-lg ${textPrimary} mb-4 flex items-center gap-2`}>
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
              value={formData.campaignName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  campaignName: e.target.value,
                }))
              }
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
              value={formData.campaignCode}
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
              value={formData.voucherAmount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  voucherAmount: e.target.value,
                }))
              }
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
              value={formData.totalVouchers}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  totalVouchers: e.target.value,
                }))
              }
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
              value={formData.startDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
          </div>
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t("end_date")} ({t("optional")})
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
          </div>
        </div>
      </div>

      {/* Delivery Area - Only show if createMiniSite is checked */}
      {formData.createMiniSite && (
        <div>
          <h3 className={`text-lg ${textPrimary} mb-4`}>
            {t("delivery_area")}
          </h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="deliveryArea"
                checked={formData.deliveryArea === "home"}
                onChange={() =>
                  setFormData((prev) => ({ ...prev, deliveryArea: "home" }))
                }
                className="w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
              />
              <Home className="w-4 h-4" />
              <span className={textSecondary}>{t("home")}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="deliveryArea"
                checked={formData.deliveryArea === "office"}
                onChange={() =>
                  setFormData((prev) => ({ ...prev, deliveryArea: "office" }))
                }
                className="w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
              />
              <Briefcase className="w-4 h-4" />
              <span className={textSecondary}>{t("office")}</span>
            </label>
          </div>
        </div>
      )}

      {/* Content (Multi-Language) - Only show if createMiniSite is checked */}
      {formData.createMiniSite && (
        <div>
          <h3 className={`text-lg ${textPrimary} mb-4 flex items-center gap-2`}>
            <Globe className="w-5 h-5" />
            {t("content")} ({t("multi_language")})
          </h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm ${textSecondary} mb-2`}>
                {t("title")}
              </label>
              <input
                type="text"
                value={(formData[titleField] as string) || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    [titleField]: e.target.value,
                  }))
                }
                className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                placeholder={
                  language === "en"
                    ? "Welcome to our campaign"
                    : language === "he"
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
                value={(formData[subtitleField] as string) || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    [subtitleField]: e.target.value,
                  }))
                }
                className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                placeholder={
                  language === "en"
                    ? "Enjoy exclusive offers"
                    : language === "he"
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
                value={(formData[greetingField] as string) || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    [greetingField]: e.target.value,
                  }))
                }
                rows={4}
                className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                placeholder={
                  language === "en"
                    ? "Thank you for participating..."
                    : language === "he"
                      ? "תודה על ההשתתפות..."
                      : "شكرا لمشاركتك..."
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
