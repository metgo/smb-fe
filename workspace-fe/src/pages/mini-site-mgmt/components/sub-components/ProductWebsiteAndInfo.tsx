import React from "react";
import { Globe, Building2, Ticket, Home, Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import RichTextEditor from "@/components/shared/RichTextEditor";
import clsx from "clsx";

interface Step1WebsiteAndInfoProps {
  currentStep: number;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleLogoUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditMode?: boolean;
}

export default function Step1WebsiteAndInfo({
  currentStep,
  formData,
  setFormData,
  isEditMode,
}: Step1WebsiteAndInfoProps) {
  const { t } = useTranslation("minisites");
  const {
    bgSecondary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    bgTertiary,
  } = useThemeClasses();

  if (currentStep !== 1) return null;

  const Required = () => <span className="text-red-500">*</span>;

  return (
    <div className="space-y-6">
      {/* Purchaser Info */}
      <div>
        <h3 className={`text-lg ${textPrimary} mb-4 flex items-center gap-2`}>
          <Building2 className="w-5 h-5" />
          {t("purchaser_info") || "Purchaser (Company) - Required"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t("company_name")} <Required />
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
              {t("contact_name")} <Required />
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
              {t("email")} <Required />
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
              {t("campaign_name")} <Required />
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
              {t("campaign_code")} <Required />
            </label>
            <input
              type="text"
              value={formData.campaignCode}
              name="campaignCode"
              readOnly={isEditMode}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  campaignCode: e.target.value,
                }))
              }
              className={clsx(
                `w-full px-4 py-2 rounded-lg border ${borderColor} ${bgTertiary} ${textTertiary} font-mono`,
                isEditMode && "cursor-not-allowed opacity-70",
              )}
              placeholder={t("campaign_code_placeholder")}
            />
          </div>

          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t("voucher_amount")} <Required />
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
              {t("start_date")} <Required />
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
              {t("end_date")} <Required />
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
            <Home className={clsx("w-4 h-4", textPrimary)} />
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
            <Briefcase className={clsx("w-4 h-4", textPrimary)} />
            <span className={textSecondary}>{t("office")}</span>
          </label>
        </div>
      </div>

      {/* Content */}
      <div>
        <h3 className={`text-lg ${textPrimary} mb-4 flex items-center gap-2`}>
          <Globe className="w-5 h-5" />
          {t("content") || "Content"}
        </h3>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t("title")} <Required />
            </label>
            <RichTextEditor
              value={formData.contentTitle}
              onChange={(html) =>
                setFormData((prev: any) => ({
                  ...prev,
                  contentTitle: html,
                }))
              }
              placeholder={t("title_placeholder")}
            />
          </div>

          {/* Sub-title */}
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t("subtitle")} <Required />
            </label>
            <RichTextEditor
              value={formData.contentSubtitle}
              onChange={(html) =>
                setFormData((prev: any) => ({
                  ...prev,
                  contentSubtitle: html,
                }))
              }
              placeholder={t("subtitle_placeholder")}
            />
          </div>

          {/* Greeting */}
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t("greeting")} <Required />
            </label>
            <RichTextEditor
              value={formData.contentGreeting}
              onChange={(html) =>
                setFormData((prev: any) => ({
                  ...prev,
                  contentGreeting: html,
                }))
              }
              placeholder={t("greeting_placeholder")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
