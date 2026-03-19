import { useThemeClasses } from "@/hooks/useThemeClasses";

interface Props {
  formData: any;
  campaigns: {
    datas?: {
      data?: any[];
    };
  };
  xlsValidation: any;
  t: (key: string) => string;
}

const VoucherReview = ({
  formData,
  campaigns,
  xlsValidation,
  t,
}: Props) => {
  const {isDark}=useThemeClasses()

  const selectedCampaign = campaigns?.datas?.data?.find(
    (c: any) => c.id === formData.campaign,
  );

  return (
    <div className="space-y-6">
      <h3
        className={`text-sm mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}
      >
        {t("review_and_confirm")}
      </h3>

      <div
        className={`rounded-lg p-4 space-y-4 border ${isDark ? "bg-gray-800 border-gray-800" : "bg-white border-gray-200"
          }`}
      >
        {/* Websites */}
        <div>
          <label
            className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {t("websites")}
          </label>
        </div>

        {/* Campaign */}
        {selectedCampaign && (
          <div>
            <label
              className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {t("campaign")}
            </label>
            <div className={`${isDark ? "text-gray-100" : "text-gray-900"}`}>
              {selectedCampaign.name}
            </div>
          </div>
        )}

        {/* Amount */}
        <div>
          <label
            className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {t("amount_per_voucher")}
          </label>
          <div className={`${isDark ? "text-gray-100" : "text-gray-900"}`}>
            ₪{formData.amount}
          </div>
        </div>

        {/* Expiration */}
        {formData.expirationDate && (
          <div>
            <label
              className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {t("expiration_date")}
            </label>
            <div className={`${isDark ? "text-gray-100" : "text-gray-900"}`}>
              {formData.expirationDate}
            </div>
          </div>
        )}

        {/* Purchaser */}
        {(formData.purchaserEmail ||
          formData.purchaserName ||
          formData.purchaserPhone) && (
            <div
              className={`pt-4 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}
            >
              <label
                className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                {t("purchaser_details")}
              </label>
              <div className={`${isDark ? "text-gray-100" : "text-gray-900"}`}>
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

        {/* Creation Type */}
        <div>
          <label
            className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {t("creation_type")}
          </label>
          <div
            className={`${isDark ? "text-gray-100" : "text-gray-900"} capitalize`}
          >
            {t(`creation_type_${formData.creationType}`)}
          </div>
        </div>

        {/* Single */}
        {formData.creationType === "single" && (
          <div>
            <label
              className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {t("assignee")}
            </label>
            <div className={`${isDark ? "text-gray-100" : "text-gray-900"}`}>
              {formData.assigneeName || "-"}
              <br />
              {formData.assigneeEmail || "-"}
              <br />
              {formData.assigneePhone || "-"}
            </div>
          </div>
        )}

        {/* Bulk */}
        {formData.creationType === "bulk" && (
          <>
            <div>
              <label
                className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                {t("quantity")}
              </label>
              <div className={`${isDark ? "text-gray-100" : "text-gray-900"}`}>
                {formData.bulkCount} {t("vouchers")}
              </div>
            </div>

            {formData.bulkCreateAssigned && (
              <div>
                <label
                  className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  {t("assignee")}
                </label>
                <div
                  className={`${isDark ? "text-gray-100" : "text-gray-900"}`}
                >
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

        {/* Upload */}
        {formData.creationType === "upload" &&
          formData.xlsFile &&
          xlsValidation && (
            <div>
              <label
                className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                {t("upload_results")}
              </label>
              <div className={`${isDark ? "text-gray-100" : "text-gray-900"}`}>
                {xlsValidation.valid} {t("valid_vouchers_will_be_created")}
              </div>
            </div>
          )}
      </div>

      <div
        className={`p-4 rounded-lg border ${isDark
            ? "bg-teal-900/20 border-teal-800"
            : "bg-teal-50 border-teal-200"
          }`}
      >
        <p className={`${isDark ? "text-teal-100" : "text-teal-900"} text-sm`}>
          {t("click_create_vouchers_to_proceed")}
        </p>
      </div>
    </div>
  );
};

export default VoucherReview;
