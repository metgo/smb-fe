import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import type { VoucherRecipient } from "../../hooks/useMiniCampaignWizard";

interface VoucherResultsStepProps {
  voucherResults: VoucherRecipient[];
}

export default function VoucherResultsStep({
  voucherResults,
}: VoucherResultsStepProps) {
  const { t } = useTranslation("mini_campaign");
  const {
    textPrimary,
    textSecondary,
    textTertiary,
    bgSecondary,
    bgTertiary,
    borderColor,
  } = useThemeClasses();

  return (
    <div className="space-y-6">
      <h3 className={`text-lg ${textPrimary} mb-4`}>{t("voucher_results")}</h3>

      {voucherResults.length === 0 ? (
        <div className={`${bgSecondary} rounded-lg p-8 text-center`}>
          <p className={textTertiary}>{t("no_results")}</p>
        </div>
      ) : (
        <div
          className={`${bgSecondary} rounded-lg overflow-hidden border ${borderColor}`}
        >
          <table className="w-full">
            <thead className={bgTertiary}>
              <tr>
                <th className={`px-4 py-3 text-left text-sm ${textSecondary}`}>
                  {t("name")}
                </th>
                <th className={`px-4 py-3 text-left text-sm ${textSecondary}`}>
                  {t("email")}
                </th>
                <th className={`px-4 py-3 text-left text-sm ${textSecondary}`}>
                  {t("phone")}
                </th>
                <th
                  className={`px-4 py-3 text-center text-sm ${textSecondary}`}
                >
                  {t("email_status")}
                </th>
                <th
                  className={`px-4 py-3 text-center text-sm ${textSecondary}`}
                >
                  {t("sms_status")}
                </th>
              </tr>
            </thead>
            <tbody>
              {voucherResults.map((recipient, index) => (
                <tr key={index} className={`border-t ${borderColor}`}>
                  <td className={`px-4 py-3 ${textPrimary}`}>
                    {recipient.name}
                  </td>
                  <td className={`px-4 py-3 ${textSecondary}`}>
                    {recipient.email}
                  </td>
                  <td className={`px-4 py-3 ${textSecondary}`}>
                    {recipient.phone}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {recipient.emailSent ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {recipient.smsSent ? (
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
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div
          className={`${bgSecondary} rounded-lg p-4 border ${borderColor} text-center`}
        >
          <p className={`text-2xl ${textPrimary} mb-1`}>
            {voucherResults.length}
          </p>
          <p className={`text-sm ${textTertiary}`}>{t("total_recipients")}</p>
        </div>
        <div
          className={`${bgSecondary} rounded-lg p-4 border ${borderColor} text-center`}
        >
          <p className={`text-2xl text-green-500 mb-1`}>
            {voucherResults.filter((r) => r.emailSent).length}
          </p>
          <p className={`text-sm ${textTertiary}`}>{t("emails_sent")}</p>
        </div>
        <div
          className={`${bgSecondary} rounded-lg p-4 border ${borderColor} text-center`}
        >
          <p className={`text-2xl text-green-500 mb-1`}>
            {voucherResults.filter((r) => r.smsSent).length}
          </p>
          <p className={`text-sm ${textTertiary}`}>{t("sms_sent")}</p>
        </div>
      </div>
    </div>
  );
}
