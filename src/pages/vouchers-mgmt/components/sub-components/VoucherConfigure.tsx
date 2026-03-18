import { Download, Upload } from "lucide-react";

interface Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  xlsValidation: any;
  t: any;
  errors?: any;
}

const VoucherConfigure = ({
  formData,
  setFormData,
  handleFileUpload,
  xlsValidation,
  t,
  errors = {},
}: Props) => {
  if (formData.creationType === "single") {
    return (
      <div className="space-y-4">
        <h3 className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          {t("assignee_details")}
        </h3>
        <div>
          <label className="block text-sm mb-1">
            {t("number_of_vouchers")}
          </label>

          <input
            type="number"
            value={1}
            disabled
            className="w-full border rounded px-3 py-2"
          />

          {errors.bulkCount && (
            <p className="text-red-500 text-xs mt-1">{errors.bulkCount}</p>
          )}
        </div>
        {/* Name */}
        <div>
          <label className="block text-sm mb-1">{t("assignee_name")} *</label>

          <input
            type="text"
            value={formData.assigneeName}
            placeholder={t("enter_assignee_name")}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                assigneeName: e.target.value,
              }))
            }
            className="w-full border rounded px-3 py-2"
          />

          {errors.assigneeName && (
            <p className="text-red-500 text-xs mt-1">{errors.assigneeName}</p>
          )}
        </div>
        {/* Email */}
        <div>
          <label className="block text-sm mb-1">{t("assignee_email")} *</label>

          <input
            type="email"
            value={formData.assigneeEmail}
            placeholder="email@example.com"
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                assigneeEmail: e.target.value,
              }))
            }
            className="w-full border rounded px-3 py-2"
          />

          {errors.assigneeEmail && (
            <p className="text-red-500 text-xs mt-1">{errors.assigneeEmail}</p>
          )}
        </div>
        {/* Phone */}
        <div>
          <label className="block text-sm mb-1">{t("assignee_phone")} *</label>

          <input
            type="tel"
            value={formData.assigneePhone}
            placeholder="+972-XX-XXXXXXX"
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                assigneePhone: e.target.value,
              }))
            }
            className="w-full border rounded px-3 py-2"
          />

          {errors.assigneePhone && (
            <p className="text-red-500 text-xs mt-1">{errors.assigneePhone}</p>
          )}
        </div>
      </div>
    );
  }

  if (formData.creationType === "bulk") {
    return (
      <div className="space-y-4">
        <h3 className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          {t("bulk_creation_settings")}
        </h3>

        {/* Bulk Count */}
        <div>
          <label className="block text-sm mb-1">
            {t("number_of_vouchers")}
          </label>

          <input
            type="number"
            value={formData.bulkCount}
            min={1}
            max={1000}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                bulkCount: Number(e.target.value),
              }))
            }
            className="w-full border rounded px-3 py-2"
          />

          {errors.bulkCount && (
            <p className="text-red-500 text-xs mt-1">{errors.bulkCount}</p>
          )}
        </div>

        {/* Assigned Checkbox */}
        <div className="pt-3 border-t">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.bulkCreateAssigned}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  bulkCreateAssigned: e.target.checked,
                }))
              }
            />

            {t("create_assigned_voucher")}
          </label>

          <p className="text-xs text-gray-500 mt-1">
            {t("assign_all_vouchers_to_person")}
          </p>
        </div>

        {/* Assigned Inputs */}
        {formData.bulkCreateAssigned && (
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm mb-1">
                {t("assignee_name")} *
              </label>

              <input
                type="text"
                value={formData.assigneeName}
                placeholder={t("enter_assignee_name")}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    assigneeName: e.target.value,
                  }))
                }
                className="w-full border rounded px-3 py-2"
              />

              {errors.assigneeName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.assigneeName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm mb-1">
                {t("assignee_email")} *
              </label>

              <input
                type="email"
                value={formData.assigneeEmail}
                placeholder="email@example.com"
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    assigneeEmail: e.target.value,
                  }))
                }
                className="w-full border rounded px-3 py-2"
              />

              {errors.assigneeEmail && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.assigneeEmail}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm mb-1">
                {t("assignee_phone")} *
              </label>

              <input
                type="tel"
                value={formData.assigneePhone}
                placeholder="+972-XX-XXXXXXX"
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    assigneePhone: e.target.value,
                  }))
                }
                className="w-full border rounded px-3 py-2"
              />

              {errors.assigneePhone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.assigneePhone}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (formData.creationType === "upload") {
    return (
      <div className="space-y-4">
        <h3 className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          {t("upload_xls_file")}
        </h3>

        <div className="p-4 border rounded">
          <button className="flex items-center gap-2 text-teal-600 text-sm">
            <Download className="w-4 h-4" />
            {t("download_sample_xls_template")}
          </button>

          <p className="text-xs text-gray-500 mt-1">
            {t("use_template_for_correct_format")}
          </p>
        </div>

        {/* Upload */}
        <div className="border-2 border-dashed rounded p-6 text-center">
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />

          <label className="cursor-pointer">
            <span className="text-teal-600">{t("click_to_upload")}</span>

            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {errors.xlsFile && (
            <p className="text-red-500 text-xs mt-2">{errors.xlsFile}</p>
          )}
        </div>

        {/* File preview */}
        {formData.xlsFile && (
          <div className="p-4 border rounded">
            <p className="text-sm mb-2">
              {t("file")}: {formData.xlsFile.name}
            </p>

            {xlsValidation && (
              <div className="space-y-2 text-sm">
                <span className="text-green-600">
                  ✓ {t("valid_rows")}: {xlsValidation.valid}
                </span>

                <span className="text-red-600 block">
                  ✗ {t("invalid_rows")}: {xlsValidation.invalid}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default VoucherConfigure;
