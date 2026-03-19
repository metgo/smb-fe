interface Props {
  formData: any;
  campaigns: {
    datas?: {
      data?: any[];
    };
  };
  xlsValidation: any;
  t: any;
}

const VoucherReview = ({ formData, campaigns, xlsValidation, t }: Props) => {
  const selectedCampaign = campaigns?.datas?.data?.find(
    (c: any) => c.id === formData.campaign,
  );

  return (
    <div className="space-y-6">
      <h3 className="text-sm text-gray-700 dark:text-gray-300 mb-4">
        {t("review_and_confirm")}
      </h3>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-4">
        {/* Websites */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            {t("websites")}
          </label>
        </div>

        {/* Campaign */}
        {selectedCampaign && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              {t("campaign")}
            </label>

            <div className="text-gray-900 dark:text-gray-100">
              {selectedCampaign.name}
            </div>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            {t("amount_per_voucher")}
          </label>

          <div className="text-gray-900 dark:text-gray-100">
            ₪{formData.amount}
          </div>
        </div>

        {/* Expiration */}
        {formData.expirationDate && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              {t("expiration_date")}
            </label>

            <div className="text-gray-900 dark:text-gray-100">
              {formData.expirationDate}
            </div>
          </div>
        )}

        {/* Purchaser */}
        {(formData.purchaserEmail ||
          formData.purchaserName ||
          formData.purchaserPhone) && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <label className="block text-xs text-gray-500 mb-1">
              {t("purchaser_details")}
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

        {/* Creation Type */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            {t("creation_type")}
          </label>

          <div className="text-gray-900 dark:text-gray-100 capitalize">
            {t(`creation_type_${formData.creationType}`)}
          </div>
        </div>

        {/* Single */}
        {formData.creationType === "single" && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              {t("assignee")}
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

        {/* Bulk */}
        {formData.creationType === "bulk" && (
          <>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                {t("quantity")}
              </label>

              <div className="text-gray-900 dark:text-gray-100">
                {formData.bulkCount} {t("vouchers")}
              </div>
            </div>

            {formData.bulkCreateAssigned && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {t("assignee")}
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

        {/* Upload */}
        {formData.creationType === "upload" &&
          formData.xlsFile &&
          xlsValidation && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                {t("upload_results")}
              </label>

              <div className="text-gray-900 dark:text-gray-100">
                {xlsValidation.valid} {t("valid_vouchers_will_be_created")}
              </div>
            </div>
          )}
      </div>

      <div className="p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">
        <p className="text-sm text-teal-900 dark:text-teal-100">
          {t("click_create_vouchers_to_proceed")}
        </p>
      </div>
    </div>
  );
};

export default VoucherReview;
