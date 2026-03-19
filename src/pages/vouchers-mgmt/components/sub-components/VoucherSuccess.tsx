import { Download } from "lucide-react";

interface Props {
  createdVouchers: any[];
  // onVoucherCreated: () => void;
  t: any;
  isDark?: boolean;
}

const VoucherSuccess = ({
  createdVouchers,
  // onVoucherCreated,
  t,
  isDark,
}: Props) => {
  const handleDownload = () => {
    if (createdVouchers.length === 0) return;

    const headers = [
      "Voucher Code",
      "Assignee Name",
      "Email",
      "Amount",
      "Status",
    ];
    const rows = createdVouchers.map((v) => [
      v.code,
      v.assigneeName,
      v.email,
      v.amount,
      v.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vouchers_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const voucherCount = createdVouchers.length;

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="text-center py-6">
        <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
          {voucherCount} {t("voucher", { count: voucherCount })}
        </p>
      </div>

      {/* Voucher Table */}
      <div
        className={`rounded-lg overflow-hidden border ${
          isDark ? "bg-gray-800 border-gray-800" : "bg-white border-gray-200"
        }`}
      >
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead
              className={`sticky top-0 border-b ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <tr>
                {["voucher_code", "assignee", "email", "amount", "status"].map(
                  (key) => (
                    <th
                      key={key}
                      className={`px-4 py-3 text-left text-xs ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {t(key)}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody
              className={`${isDark ? "divide-gray-800" : "divide-gray-200"} divide-y`}
            >
              {createdVouchers?.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className={`px-4 py-6 text-center text-sm ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {t("no_vouchers")}
                  </td>
                </tr>
              ) : (
                createdVouchers.map((voucher, index) => (
                  <tr key={index}>
                    <td
                      className={`${isDark ? "text-gray-100" : "text-gray-900"} px-4 py-3 text-sm`}
                    >
                      {voucher.code || "-"}
                    </td>
                    <td
                      className={`${isDark ? "text-gray-100" : "text-gray-900"} px-4 py-3 text-sm`}
                    >
                      {voucher.assigneeName || "-"}
                    </td>
                    <td
                      className={`${isDark ? "text-gray-400" : "text-gray-600"} px-4 py-3 text-sm`}
                    >
                      {voucher.email || "-"}
                    </td>
                    <td
                      className={`${isDark ? "text-gray-100" : "text-gray-900"} px-4 py-3 text-sm`}
                    >
                      {voucher.amount ? `₪${voucher.amount}` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {voucher.status ? (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            isDark
                              ? "bg-green-900/30 text-green-300"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {voucher.status}
                        </span>
                      ) : (
                        <span
                          className={`${isDark ? "text-gray-100" : "text-gray-900"} text-sm`}
                        >
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          className={`flex-1 px-4 py-2 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
            isDark
              ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Download className="w-4 h-4" />
          {t("download_results")}
        </button>

        {/* <button
          onClick={onVoucherCreated}
          className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
        >
          {t("done")}
        </button> */}
      </div>
    </div>
  );
};

export default VoucherSuccess;
