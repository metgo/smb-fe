import React from "react";
import {
  Globe,
  Building2,
  Ticket,
  Home,
  Briefcase,
  Upload,
} from "lucide-react";

interface Step1WebsiteAndInfoProps {
  // miniSiteId: string | number;
  // selectedDmoId: string | number | null;
  // setSelectDmoId: React.Dispatch<React.SetStateAction<any>>;
  // selectedAuthorityId: string | number | null;
  // setSelectAuthorityId: React.Dispatch<React.SetStateAction<any>>;
  // websiteVisibilityIds: IWebsiteVisibilityIds;
  // setWebsiteVisibilityIds: (v: any) => void;

  currentStep: number;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;

  handleLogoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;

  t: any;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  bgSecondary: string;
  bgTertiary: string;
  borderColor: string;
  // businessAssociatedWebsites: any;
}

export default function Step1WebsiteAndInfo({
  // miniSiteId,
  // selectedDmoId,
  // setSelectDmoId,
  // selectedAuthorityId,
  // setSelectAuthorityId,
  // websiteVisibilityIds,
  // setWebsiteVisibilityIds,

  currentStep,
  formData,
  setFormData,
  handleLogoUpload,

  t,
  textPrimary,
  textSecondary,
  textTertiary,
  bgSecondary,
  bgTertiary,
  borderColor,
  // businessAssociatedWebsites = [],
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
          {t("purchaser_info") || "Purchaser (Company) - Required"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t("company_name")}
            </label>
            <input
              type="text"
              value={formData.companyName}
              name="companyName"
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  companyName: e.target.value,
                }))
              }
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder={t("company_name_placeholder")}
            />
          </div>

          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t("contact_name")}
            </label>
            <input
              type="text"
              value={formData.contactName}
              name="contactName"
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  contactName: e.target.value,
                }))
              }
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder={t("contact_name_placeholder")}
            />
          </div>

          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t("email")}
            </label>
            <input
              type="email"
              value={formData.email}
              name="email"
              onChange={(e) =>
                setFormData((prev: any) => ({ ...prev, email: e.target.value }))
              }
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder={t("email_placeholder")}
            />
          </div>

          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t("phone") || "Phone"}
            </label>
            <div className="flex gap-2">
              <select
                name="phoneCountryCode"
                value={formData.phoneCountryCode}
                onChange={(e) =>
                  setFormData((prev: any) => ({
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
                  setFormData((prev: any) => ({
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
              {t("office_address") || "Office Address"}
            </label>
            <input
              type="text"
              value={formData.officeAddress}
              name="officeAddress"
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  officeAddress: e.target.value,
                }))
              }
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder={t("office_address_placeholder")}
            />
          </div>

          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t("company_logo") || "Company Logo"}
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
                {t("upload_logo") || "Upload Logo"}
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
          {t("campaign_info") || "Campaign Info - Required"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t("campaign_name")}
            </label>
            <input
              type="text"
              name="campaignName"
              value={formData.campaignName}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }))
              }
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder={t("campaign_name_placeholder")}
            />
          </div>

          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t("campaign_code")}
            </label>
            <input
              type="text"
              value={formData.campaignCode}
              name="campaignCode"
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  campaignCode: e.target.value,
                }))
              }
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgTertiary} ${textTertiary} font-mono`}
              placeholder={t("campaign_code_placeholder")}
            />
          </div>

          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t("voucher_amount")}
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
              {t("total_vouchers")}
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
              {t("start_date")}
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
              {t("end_date")} ({t("optional")})
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
        <h3 className={`text-lg ${textPrimary} mb-4`}>{t("delivery_area")}</h3>

        <div className="flex gap-4">
          {/* Home Option */}
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
            <span className={textSecondary}>{t("home")}</span>
          </label>

          {/* Office Option */}
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
            <span className={textSecondary}>{t("office")}</span>
          </label>
        </div>
      </div>

      {/* Content (Multi-Language) */}
      <div>
        <h3 className={`text-lg ${textPrimary} mb-4 flex items-center gap-2`}>
          <Globe className="w-5 h-5" />
          {t("content") || "Content"} ({t("multi_language") || "Multi-Language"}
          )
        </h3>

        <div className="mb-4">
          <div className="flex gap-2">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev: any) => ({
                    ...prev,
                    contentLanguage: "en",
                  }))
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
                  setFormData((prev: any) => ({
                    ...prev,
                    contentLanguage: "he",
                  }))
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
                  setFormData((prev: any) => ({
                    ...prev,
                    contentLanguage: "ar",
                  }))
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
          {/* Title */}
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t("title")}
            </label>
            <input
              type="text"
              value={formData.contentTitle[formData.contentLanguage] ?? ""}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  contentTitle: {
                    ...prev.contentTitle,
                    [prev.contentLanguage]: e.target.value,
                  },
                }))
              }
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder={t(`title_placeholder_${formData.contentLanguage}`)}
            />
          </div>

          {/* Sub-title */}
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t("subtitle")}
            </label>
            <input
              type="text"
              value={formData.contentSubtitle[formData.contentLanguage] ?? ""}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  contentSubtitle: {
                    ...prev.contentSubtitle,
                    [prev.contentLanguage]: e.target.value,
                  },
                }))
              }
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder={t(
                `subtitle_placeholder_${formData.contentLanguage}`,
              )}
            />
          </div>

          {/* Greeting */}
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t("greeting")}
            </label>
            <textarea
              value={formData.contentGreeting[formData.contentLanguage] ?? ""}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  contentGreeting: {
                    ...prev.contentGreeting,
                    [prev.contentLanguage]: e.target.value,
                  },
                }))
              }
              rows={4}
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${bgSecondary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder={t(
                `greeting_placeholder_${formData.contentLanguage}`,
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
