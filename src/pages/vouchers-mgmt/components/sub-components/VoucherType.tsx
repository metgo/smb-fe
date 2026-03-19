interface VoucherTypeProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
  t?: any;
  isDark?: boolean;
}

const VoucherType = ({
  formData,
  setFormData,
  errors,
  t,
  isDark,
}: VoucherTypeProps) => {
  return (
    <div className="space-y-4">
      <h3
        className={`text-sm mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}
      >
        {t("choose_creation_type")}
      </h3>

      {/* Single Voucher */}
      <label
        className={`flex items-start gap-4 p-4 border-2 rounded-lg hover:border-teal-500 cursor-pointer transition-colors ${
          isDark ? "border-gray-700" : "border-gray-300"
        }`}
      >
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
          <div className={`mb-1 ${isDark ? "text-gray-100" : "text-gray-900"}`}>
            {t("single_voucher")}
          </div>

          <p
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            {t("single_voucher_description")}
          </p>
        </div>
      </label>

      {/* Bulk Voucher */}
      <label
        className={`flex items-start gap-4 p-4 border-2 rounded-lg hover:border-teal-500 cursor-pointer transition-colors ${
          isDark ? "border-gray-700" : "border-gray-300"
        }`}
      >
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
          <div className={`mb-1 ${isDark ? "text-gray-100" : "text-gray-900"}`}>
            {t("bulk_creation")}
          </div>

          <p
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            {t("bulk_creation_description")}
          </p>
        </div>
      </label>

      {/* Upload XLS (commented out) */}
      {/*
      <label
        className={`flex items-start gap-4 p-4 border-2 rounded-lg hover:border-teal-500 cursor-pointer transition-colors ${
          isDark ? "border-gray-700" : "border-gray-300"
        }`}
      >
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
          <div className={`mb-1 ${isDark ? "text-gray-100" : "text-gray-900"}`}>
            {t("upload_xls")}
          </div>

          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {t("upload_xls_description")}
          </p>
        </div>
      </label>
      */}

      {errors.creationType && (
        <p className="text-red-500 text-xs">
          {t("error_select_creation_type")}
        </p>
      )}
    </div>
  );
};

export default VoucherType;
