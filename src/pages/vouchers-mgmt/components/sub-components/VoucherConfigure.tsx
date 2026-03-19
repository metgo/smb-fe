interface Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  t: any;
  errors?: any;
  isDark?: boolean;
}

const VoucherConfigure = ({
  formData,
  setFormData,
  isDark,
  t,
  errors = {},
}: Props) => {
  if (formData.creationType === "single") {
    return (
      <div className="space-y-4">
        <h3
          className={`text-sm mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("assignee_details")}
        </h3>

        {/* Name */}
        <div>
          <label
            className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
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
            className={`w-full border rounded px-3 py-2 ${
              isDark
                ? "bg-gray-800 text-white border-gray-600 placeholder-gray-400"
                : "bg-white text-black border-gray-300"
            }`}
          />

          {errors.assigneeName && (
            <p className="text-red-500 text-xs mt-1">{errors.assigneeName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
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
            className={`w-full border rounded px-3 py-2 ${
              isDark
                ? "bg-gray-800 text-white border-gray-600 placeholder-gray-400"
                : "bg-white text-black border-gray-300"
            }`}
          />

          {errors.assigneeEmail && (
            <p className="text-red-500 text-xs mt-1">{errors.assigneeEmail}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label
            className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
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
            className={`w-full border rounded px-3 py-2 ${
              isDark
                ? "bg-gray-800 text-white border-gray-600 placeholder-gray-400"
                : "bg-white text-black border-gray-300"
            }`}
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
        <h3
          className={`text-sm mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("bulk_creation_settings")}
        </h3>

        {/* Bulk Count */}
        <div>
          <label
            className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
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
            className={`w-full border rounded px-3 py-2 ${
              isDark
                ? "bg-gray-800 text-white border-gray-600 placeholder-gray-400"
                : "bg-white text-black border-gray-300"
            }`}
          />

          {errors.bulkCount && (
            <p className="text-red-500 text-xs mt-1">{errors.bulkCount}</p>
          )}
        </div>

        {/* Assigned Checkbox */}
        <div
          className={`pt-3 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}
        >
          <label
            className={`flex text-sm mb-1 gap-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
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

          <p
            className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {t("assign_all_vouchers_to_person")}
          </p>
        </div>

        {/* Assigned Inputs */}
        {formData.bulkCreateAssigned && (
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label
                className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
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
                className={`w-full border rounded px-3 py-2 ${
                  isDark
                    ? "bg-gray-800 text-white border-gray-600 placeholder-gray-400"
                    : "bg-white text-black border-gray-300"
                }`}
              />

              {errors.assigneeName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.assigneeName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
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
                className={`w-full border rounded px-3 py-2 ${
                  isDark
                    ? "bg-gray-800 text-white border-gray-600 placeholder-gray-400"
                    : "bg-white text-black border-gray-300"
                }`}
              />

              {errors.assigneeEmail && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.assigneeEmail}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
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
                className={`w-full border rounded px-3 py-2 ${
                  isDark
                    ? "bg-gray-800 text-white border-gray-600 placeholder-gray-400"
                    : "bg-white text-black border-gray-300"
                }`}
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

  return null;
};

export default VoucherConfigure;
