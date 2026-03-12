import { Check, Download } from "lucide-react";

interface Props {
  createdVouchers: any[];
  onVoucherCreated: () => void;
  t: any;
}

const VoucherSuccess = ({ createdVouchers, onVoucherCreated, t }: Props) => {
  const voucherCount = createdVouchers.length;

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>

        <h3 className="text-xl text-gray-900 dark:text-gray-100 mb-2">
          {t("vouchers_created_successfully")}
        </h3>

        <p className="text-gray-600 dark:text-gray-400">
          {voucherCount} {t("voucher", { count: voucherCount })}
        </p>
      </div>

      {/* Voucher Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-600 dark:text-gray-400">
                  {t("voucher_code")}
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-600 dark:text-gray-400">
                  {t("assignee")}
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-600 dark:text-gray-400">
                  {t("email")}
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-600 dark:text-gray-400">
                  {t("amount")}
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-600 dark:text-gray-400">
                  {t("status")}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {createdVouchers.map((voucher, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {voucher.code}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {voucher.assigneeName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {voucher.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    ₪{voucher.amount}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      {voucher.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          {t("download_results")}
        </button>

        <button
          onClick={onVoucherCreated}
          className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
        >
          {t("done")}
        </button>
      </div>
    </div>
  );
};

export default VoucherSuccess;
