import { User } from "lucide-react";

interface VoucherInformationProps {
  formData: any;
  setFormData: any;
  errors: Record<string, string>;
  campaigns: any[];
  handleCampaignChange: (id: string) => void;

  t?: any;
  purchaserDropdownRef: any;
  purchaserSuggestions: any[];
  showPurchaserSuggestions: boolean;
  handlePurchaserEmailChange: (email: string) => void;
  handlePurchaserSelect: (user: any) => void;
}

const VoucherInformation = ({
  formData,
  t,
  setFormData,
  errors,
  campaigns,
  handleCampaignChange,

  purchaserDropdownRef,
  purchaserSuggestions,
  showPurchaserSuggestions,
  handlePurchaserEmailChange,
  handlePurchaserSelect,
}: VoucherInformationProps) => {
  return (
    <div className="space-y-6">
      {/* Websites */}
      {/* <div>
        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-3">
          {t("select_websites_multi_select")}
        </label>

        <div className="relative" ref={websiteDropdownRef}>
          <button
            type="button"
            onClick={() => setIsWebsiteDropdownOpen(!isWebsiteDropdownOpen)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg flex justify-between"
          >
            <span className="text-sm">
              {formData.websites.length === 0
                ? t("select_websites_placeholder")
                : `${formData.websites.length} ${t("websites_selected")}`}
            </span>

            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isWebsiteDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isWebsiteDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {websites.map((website) => (
                <label
                  key={website.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.websites.includes(website.id)}
                    onChange={() => handleWebsiteToggle(website.id)}
                  />

                  <span className="text-sm">{website.name}</span>

                  {formData.websites.includes(website.id) && (
                    <Check className="w-4 h-4 ml-auto text-teal-600" />
                  )}
                </label>
              ))}
            </div>
          )}
        </div>

        {errors.websites && (
          <p className="text-red-500 text-xs mt-1">
            {t("error_select_website")}
          </p>
        )}
      </div> */}

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

            {showPurchaserSuggestions && purchaserSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                {purchaserSuggestions.map((user, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePurchaserSelect(user)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50"
                  >
                    {user.name} ({user.email})
                  </button>
                ))}
              </div>
            )}
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
