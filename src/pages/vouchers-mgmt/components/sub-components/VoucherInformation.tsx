import { useThemeClasses } from "@/hooks/useThemeClasses";
import { User } from "lucide-react";

interface VoucherInformationProps {
  formData: IVoucherFormData;
  setFormData: React.Dispatch<React.SetStateAction<IVoucherFormData>>;
  errors: Record<string, string>;
  campaigns: {
    datas?: {
      data?: any[];
    };
  };
  handleCampaignChange: (id: string) => void;

  t: (key: string) => string;
  handlePurchaserEmailChange: (email: string) => void;
}

const VoucherInformation = ({
  formData,
  t,
  setFormData,
  errors,
  campaigns,
  handleCampaignChange,

  handlePurchaserEmailChange,
}: VoucherInformationProps) => {
  const { isDark } = useThemeClasses();

  return (
    <div className="space-y-6">
      {/* Campaign */}
      <div>
        <label
          className={`block text-sm mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("select_campaign_optional")}
        </label>
        <select
          value={formData.campaign}
          onChange={(e) => handleCampaignChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg ${
            isDark
              ? "bg-gray-800 text-white border-gray-600"
              : "bg-white text-black border-gray-300"
          }`}
        >
          <option value="">{t("no_campaign")}</option>
          {campaigns?.datas?.data?.map((campaign: any) => (
            <option key={campaign._id} value={campaign._id}>
              {campaign.name} (₪{campaign.defaultAmount})
            </option>
          ))}
        </select>
      </div>

      {/* Amount + Expiration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            className={`block text-sm mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            {t("voucher_amount")}
          </label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                amount: Number(e.target.value),
                customAmount: true,
              }))
            }
            className={`w-full px-3 py-2 border rounded-lg ${
              isDark
                ? "bg-gray-800 text-white border-gray-600 placeholder-gray-400"
                : "bg-white text-black border-gray-300"
            }`}
          />
          {errors.amount && (
            <p className="text-red-500 text-xs mt-1">
              {t("error_invalid_amount")}
            </p>
          )}
        </div>

        <div>
          <label
            className={`block text-sm mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            {t("expiration_date")}
          </label>
          <input
            type="date"
            value={formData.expirationDate}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                expirationDate: e.target.value,
              }))
            }
            className={`w-full px-3 py-2 border rounded-lg ${
              isDark
                ? "bg-gray-800 text-white border-gray-600 placeholder-gray-400"
                : "bg-white text-black border-gray-300"
            }`}
          />
        </div>
      </div>

      {/* Purchaser */}
      <div
        className={`border-t pt-6 ${isDark ? "border-gray-700" : "border-gray-200"}`}
      >
        <h3
          className={`text-sm mb-4 flex items-center gap-2 ${isDark ? "text-gray-200" : "text-gray-800"}`}
        >
          <User className="w-4 h-4" />
          {t("purchaser_details_optional")}
        </h3>

        {/* Email */}
        <div>
          <label
            className={`block text-sm mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            {t("email")}
          </label>
          <div className="relative">
            <input
              type="email"
              value={formData.purchaserEmail}
              onChange={(e) => handlePurchaserEmailChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${
                isDark
                  ? "bg-gray-800 text-white border-gray-600 placeholder-gray-400"
                  : "bg-white text-black border-gray-300"
              }`}
            />
          </div>
        </div>

        {/* Name + Phone */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label
              className={`block text-sm mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {t("name")}
            </label>
            <input
              type="text"
              value={formData.purchaserName}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  purchaserName: e.target.value,
                }))
              }
              className={`w-full px-3 py-2 border rounded-lg ${
                isDark
                  ? "bg-gray-800 text-white border-gray-600 placeholder-gray-400"
                  : "bg-white text-black border-gray-300"
              }`}
            />
          </div>

          <div>
            <label
              className={`block text-sm mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {t("phone")}
            </label>
            <input
              type="tel"
              value={formData.purchaserPhone}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  purchaserPhone: e.target.value,
                }))
              }
              className={`w-full px-3 py-2 border rounded-lg ${
                isDark
                  ? "bg-gray-800 text-white border-gray-600 placeholder-gray-400"
                  : "bg-white text-black border-gray-300"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherInformation;
