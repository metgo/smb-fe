import * as XLSX from "xlsx";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Download } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";

interface VoucherResultsStepProps {
  voucherResults: IMinisiteVoucherUploadRes[] | null;
}

export const VoucherResultsStep: React.FC<VoucherResultsStepProps> = ({
  voucherResults,
}) => {
  const { t } = useTranslation("minisites");
  const {
    bgSecondary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    bgTertiary,
  } = useThemeClasses();

  const vouchers = voucherResults ?? [];
  const hasResults = vouchers?.length > 0;

  const downloadResultsXLS = () => {
    if (!hasResults) return;
    const rows = vouchers?.map((v) => ({
      [t("assignee_name") || "Assignee Name"]: v.assigneeInfo?.name || "",
      [t("email") || "Email"]: v.assigneeInfo?.email || "",
      [t("phone") || "Phone"]:
        v.assigneeInfo?.countryCode && v.assigneeInfo?.phone
          ? `${v.assigneeInfo.countryCode}${v.assigneeInfo.phone}`
          : v.assigneeInfo?.phone || "",
      [t("email_sent") || "Email Sent"]:
        v.emailSent === "SUCCESS" ? "Yes" : "No",
      [t("sms_sent") || "SMS Sent"]: v.smsReceived === "SUCCESS" ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vouchers");
    XLSX.writeFile(
      workbook,
      `voucher-results_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  return (
    <div className="space-y-6">
      <h3 className={`text-lg ${textPrimary} mb-4`}>
        {t("voucher_generation_results") || "Voucher Generation Results"}
      </h3>

      {hasResults ? (
        <>
          {/* Results Table */}
          <div
            className={`${bgSecondary} rounded-lg overflow-hidden border ${borderColor}`}
          >
            <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={`${bgTertiary} border-b ${borderColor}`}>
                <tr>
                  <th
                    scope="col"
                    className={`px-4 py-3 text-left text-sm font-medium ${textSecondary}`}
                  >
                    {t("assignee_name") || "Assignee Name"}
                  </th>
                  <th
                    scope="col"
                    className={`px-4 py-3 text-left text-sm font-medium ${textSecondary}`}
                  >
                    {t("email") || "Email"}
                  </th>
                  <th
                    scope="col"
                    className={`px-4 py-3 text-left text-sm font-medium ${textSecondary}`}
                  >
                    {t("phone") || "Phone"}
                  </th>
                  <th
                    scope="col"
                    className={`px-4 py-3 text-center text-sm font-medium ${textSecondary}`}
                  >
                    {t("email_sent") || "Email Sent"}
                  </th>
                  <th
                    scope="col"
                    className={`px-4 py-3 text-center text-sm font-medium ${textSecondary}`}
                  >
                    {t("sms_sent") || "SMS Sent"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {vouchers.map((v) => (
                  <tr
                    key={v._id}
                    className={`border-b ${borderColor} last:border-b-0`}
                  >
                    <td className={`px-4 py-3 text-sm ${textPrimary}`}>
                      {v.assigneeInfo?.name || "-"}
                    </td>
                    <td className={`px-4 py-3 text-sm ${textSecondary}`}>
                      {v.assigneeInfo?.email || "-"}
                    </td>
                    <td className={`px-4 py-3 text-sm ${textSecondary}`}>
                      {v.assigneeInfo?.phone
                        ? `${v.assigneeInfo.countryCode || ""}${v.assigneeInfo.phone}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {v.emailSent === "SUCCESS" ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {v.smsReceived === "SUCCESS" ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <button
            onClick={downloadResultsXLS}
            className={`px-4 py-2 rounded-lg ${bgSecondary} ${textSecondary} hover:${textPrimary} transition-colors flex items-center justify-center gap-2 flex-1 sm:flex-none`}
          >
            <Download className="w-4 h-4" />
            {t("download_results") || "Download Results"}
          </button>
        </>
      ) : (
        /* Empty State */
        <div
          className={`${bgSecondary} rounded-lg p-8 text-center border ${borderColor}`}
        >
          <p className={`text-base ${textTertiary}`}>
            {t("no_vouchers_created") ||
              "No vouchers have been created yet. Go back to Step 4 to create vouchers."}
          </p>
        </div>
      )}
    </div>
  );
};
