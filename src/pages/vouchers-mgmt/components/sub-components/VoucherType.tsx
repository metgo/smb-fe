interface VoucherTypeProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
  t?: any;
}

const VoucherType = ({
  formData,
  setFormData,
  errors,
  t,
}: VoucherTypeProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm text-gray-700 dark:text-gray-300 mb-4">
        {t("choose_creation_type")}
      </h3>

      {/* Single Voucher */}
      <label className="flex items-start gap-4 p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-teal-500 cursor-pointer transition-colors">
        <input
          type="radio"
          name="creationType"
          checked={formData.creationType === "single"}
          onChange={() =>
            setFormData((prev: any) => ({ ...prev, creationType: "single" }))
          }
          className="mt-1 text-teal-600 focus:ring-teal-500"
        />

        <div className="flex-1">
          <div className="text-gray-900 dark:text-gray-100 mb-1">
            {t("single_voucher")}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("single_voucher_description")}
          </p>
        </div>
      </label>

      {/* Bulk Voucher */}
      <label className="flex items-start gap-4 p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-teal-500 cursor-pointer transition-colors">
        <input
          type="radio"
          name="creationType"
          checked={formData.creationType === "bulk"}
          onChange={() =>
            setFormData((prev: any) => ({ ...prev, creationType: "bulk" }))
          }
          className="mt-1 text-teal-600 focus:ring-teal-500"
        />

        <div className="flex-1">
          <div className="text-gray-900 dark:text-gray-100 mb-1">
            {t("bulk_creation")}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("bulk_creation_description")}
          </p>
        </div>
      </label>

      {/* Upload XLS */}
      {/* <label className="flex items-start gap-4 p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-teal-500 cursor-pointer transition-colors">
        <input
          type="radio"
          name="creationType"
          checked={formData.creationType === "upload"}
          onChange={() =>
            setFormData((prev: any) => ({ ...prev, creationType: "upload" }))
          }
          className="mt-1 text-teal-600 focus:ring-teal-500"
        />

        <div className="flex-1">
          <div className="text-gray-900 dark:text-gray-100 mb-1">
            {t("upload_xls")}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("upload_xls_description")}
          </p>
        </div>
      </label> */}

      {errors.creationType && (
        <p className="text-red-500 text-xs">
          {t("error_select_creation_type")}
        </p>
      )}
    </div>
  );
};

export default VoucherType;
