import { useThemeClasses } from "@/hooks/useThemeClasses";

interface Campaigns {
  _id: string;
  name: string;
}
interface Props {
  formData: IVoucherFormData;
  setFormData: React.Dispatch<React.SetStateAction<IVoucherFormData>>;
  campaigns: {
    datas?: {
      data?: Campaigns[];
    };
  };
  xlsValidation?: any;
  t: (key: string) => string;
}

const VoucherReview = ({ formData, setFormData, campaigns, t }: Props) => {
  const { isDark } = useThemeClasses();

  const campaignList = campaigns?.datas?.data ?? [];
  const campaignName = (id: string) =>
    campaignList.find((c) => c._id === id)?.name ?? "—";

  const activeAssignees = formData.assignees;

  const labelCls = `block text-xs mb-1 ${
    isDark ? "text-gray-400" : "text-gray-500"
  }`;
  const valueCls = isDark ? "text-gray-100" : "text-gray-900";

  return (
    <div className="space-y-6">
      <h3
        className={`text-sm mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}
      >
        {t("review_and_confirm")}
      </h3>

      <div
        className={`rounded-lg p-4 space-y-4 border ${
          isDark ? "border-gray-800" : "bg-white border-gray-200"
        }`}
      >
        {/* Purchaser */}
        {(formData.purchaserName ||
          formData.purchaserEmail ||
          formData.purchaserPhone) && (
          <div>
            <label className={labelCls}>{t("purchaser_details")}</label>
            <div className={valueCls}>
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
              {formData.purchaserPhone && (
                <>
                  {formData.purchaserCountryCode} {formData.purchaserPhone}
                </>
              )}
            </div>
          </div>
        )}

        {/* Assignees */}
        <div
          className={`pt-4 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}
        >
          <label className={labelCls}>
            {t("assignees")} ({activeAssignees.length})
          </label>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className={`text-xs uppercase ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <th className="px-3 py-2 text-left">{t("name")}</th>
                  <th className="px-3 py-2 text-left">{t("email")}</th>
                  <th className="px-3 py-2 text-left">{t("phone")}</th>
                  <th className="px-3 py-2 text-left">{t("campaign")}</th>
                  <th className="px-3 py-2 text-left">{t("amount")}</th>
                  <th className="px-3 py-2 text-left">
                    {t("expiration_date")}
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark ? "divide-gray-800" : "divide-gray-100"
                }`}
              >
                {activeAssignees.map((a) => (
                  <tr key={a.id} className={valueCls}>
                    <td className="px-3 py-2">{a.name || "—"}</td>
                    <td className="px-3 py-2">{a.email || "—"}</td>
                    <td className="px-3 py-2">
                      {a.phone ? `${a.countryCode} ${a.phone}` : "—"}
                    </td>
                    <td className="px-3 py-2">{campaignName(a.campaignId)}</td>
                    <td className="px-3 py-2">
                      {a.amount ? `₪${Number(a.amount).toLocaleString()}` : "—"}
                    </td>
                    <td className="px-3 py-2">{a.expireDate || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Greeting */}
        <div
          className={`pt-4 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}
        >
          <div className="flex items-center justify-between mb-1">
            <label className={labelCls}>{t("greeting_message")}</label>
            <span
              className={`text-xs ${
                formData.greeting.length > 450
                  ? "text-orange-500"
                  : isDark
                    ? "text-gray-400"
                    : "text-gray-500"
              }`}
            >
              {formData.greeting.length} / 500
            </span>
          </div>
          <textarea
            value={formData.greeting}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                greeting: e.target.value.slice(0, 500),
              }))
            }
            placeholder={t("greeting_placeholder")}
            rows={4}
            className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors resize-none focus:ring-1 focus:ring-teal-500 ${
              isDark
                ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
            }`}
          />
        </div>
      </div>

      <div
        className={`p-4 rounded-lg border ${
          isDark
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
