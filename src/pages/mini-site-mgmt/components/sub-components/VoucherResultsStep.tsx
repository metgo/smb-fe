// VoucherResultsStep.tsx
import React from "react";
import { CheckCircle, XCircle, Download, Send } from "lucide-react"; // adjust imports based on your icon library

interface VoucherResult {
  name: string;
  email: string;
  phone: string;
  emailSent: boolean;
  smsSent: boolean;
  // add any other fields if your actual data has more (e.g. voucherCode, errorMessage, etc.)
}

interface VoucherResultsStepProps {
  t: any;
  voucherResults: VoucherResult[];
  downloadSampleXLS: () => void; // note: probably should be renamed to downloadResultsXLS in real code
  retryFailedSends: () => void; // you'll need to implement/pass this handler
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  bgSecondary: string;
  bgTertiary: string;
  borderColor: string;
}

export const VoucherResultsStep: React.FC<VoucherResultsStepProps> = ({
  t,
  voucherResults,
  downloadSampleXLS,
  retryFailedSends,
  textPrimary,
  textSecondary,
  textTertiary,
  bgSecondary,
  bgTertiary,
  borderColor,
}) => {
  const hasResults = voucherResults.length > 0;

  return (
    <div className="space-y-6">
      <h3 className={`text-lg ${textPrimary} mb-4`}>
        {t.voucherGenerationResults || "Voucher Generation Results"}
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
                    {t.assigneeName || "Assignee Name"}
                  </th>
                  <th
                    scope="col"
                    className={`px-4 py-3 text-left text-sm font-medium ${textSecondary}`}
                  >
                    {t.email || "Email"}
                  </th>
                  <th
                    scope="col"
                    className={`px-4 py-3 text-left text-sm font-medium ${textSecondary}`}
                  >
                    {t.phone || "Phone"}
                  </th>
                  <th
                    scope="col"
                    className={`px-4 py-3 text-center text-sm font-medium ${textSecondary}`}
                  >
                    {t.emailSent || "Email Sent"}
                  </th>
                  <th
                    scope="col"
                    className={`px-4 py-3 text-center text-sm font-medium ${textSecondary}`}
                  >
                    {t.smsSent || "SMS Sent"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {voucherResults.map((recipient, index) => (
                  <tr
                    key={index}
                    className={`border-b ${borderColor} last:border-b-0`}
                  >
                    <td className={`px-4 py-3 text-sm ${textPrimary}`}>
                      {recipient.name || "-"}
                    </td>
                    <td className={`px-4 py-3 text-sm ${textSecondary}`}>
                      {recipient.email || "-"}
                    </td>
                    <td className={`px-4 py-3 text-sm ${textSecondary}`}>
                      {recipient.phone || "-"}
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

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={downloadSampleXLS} // ← should probably be renamed to downloadResults or similar
              className={`px-4 py-2 rounded-lg ${bgSecondary} ${textSecondary} hover:${textPrimary} transition-colors flex items-center justify-center gap-2 flex-1 sm:flex-none`}
            >
              <Download className="w-4 h-4" />
              {t.downloadResults || "Download Results"}
            </button>
            <button
              onClick={retryFailedSends}
              className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 flex-1 sm:flex-none"
              disabled={!voucherResults.some((r) => !r.emailSent || !r.smsSent)}
            >
              <Send className="w-4 h-4" />
              {t.retryFailed || "Retry Failed Sends"}
            </button>
          </div>
        </>
      ) : (
        /* Empty State */
        <div
          className={`${bgSecondary} rounded-lg p-8 text-center border ${borderColor}`}
        >
          <p className={`text-base ${textTertiary}`}>
            {t.noVouchersCreated ||
              "No vouchers have been created yet. Go back to Step 4 to create vouchers."}
          </p>
        </div>
      )}
    </div>
  );
};
