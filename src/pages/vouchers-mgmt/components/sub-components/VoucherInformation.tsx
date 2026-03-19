import { User } from "lucide-react";

interface VoucherInformationProps {
  formData: any;
  setFormData: any;
  errors: Record<string, string>;
  campaigns: {
    datas?: {
      data?: any[];
    };
  };
  handleCampaignChange: (id: string) => void;

  t?: any;
  purchaserDropdownRef: any;

  handlePurchaserEmailChange: (email: string) => void;
}

const VoucherInformation = ({
  formData,
  t,
  setFormData,
  errors,
  campaigns,
  handleCampaignChange,

  purchaserDropdownRef,

  handlePurchaserEmailChange,
}: VoucherInformationProps) => {
  return (
    <div className="space-y-6">
      {/* Campaign */}
      <div>
        <label className="block text-sm mb-2">
          {t("select_campaign_optional")}
        </label>

        <select
          value={formData.campaign}
          onChange={(e) => handleCampaignChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="">{t("no_campaign")}</option>

          {campaigns?.datas?.data?.map((campaign: any) => (
            <option key={campaign._id} value={campaign._id}>
              {campaign.name} (₪{campaign.defaultAmount})
            </option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm mb-2">{t("voucher_amount")}</label>

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
          className="w-full px-3 py-2 border rounded-lg"
        />

        {errors.amount && (
          <p className="text-red-500 text-xs mt-1">
            {t("error_invalid_amount")}
          </p>
        )}
      </div>

      {/* Expiration */}
      <div>
        <label className="block text-sm mb-2">{t("expiration_date")}</label>

        <input
          type="date"
          value={formData.expirationDate}
          onChange={(e) =>
            setFormData((prev: any) => ({
              ...prev,
              expirationDate: e.target.value,
            }))
          }
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      {/* Purchaser */}
      <div className="border-t pt-6">
        <h3 className="text-sm mb-4 flex items-center gap-2">
          <User className="w-4 h-4" />
          {t("purchaser_details_optional")}
        </h3>

        {/* Email */}
        <div>
          <label className="block text-sm mb-2">{t("email")}</label>

          <div className="relative" ref={purchaserDropdownRef}>
            <input
              type="email"
              value={formData.purchaserEmail}
              onChange={(e) => handlePurchaserEmailChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Name */}
        <div className="mt-4">
          <label className="block text-sm mb-2">{t("name")}</label>

          <input
            type="text"
            value={formData.purchaserName}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                purchaserName: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Phone */}
        <div className="mt-4">
          <label className="block text-sm mb-2">{t("phone")}</label>

          <input
            type="tel"
            value={formData.purchaserPhone}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                purchaserPhone: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default VoucherInformation;
