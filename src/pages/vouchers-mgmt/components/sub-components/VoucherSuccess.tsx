import { useThemeClasses } from "@/hooks/useThemeClasses";
import clsx from "clsx";
import { Download } from "lucide-react";
interface IVoucherResponse {
  name: string;
  campCode: string;
  amount: number;
  email: string;
  countryCode: string | null;
  phone: string;
  emailSent: string;
  paymentStatus: string;
  smsSent: string;
}
interface Props {
  t: (key: string) => string;
  response: IVoucherResponse[];
}

const VoucherSuccess = ({
  t,

  response,
}: Props) => {
  const { isDark } = useThemeClasses();

  const handleDownload = () => {
    const headers = [
      "Voucher Code",
      "Assignee Name",
      "Email",
      "Amount",
      "Status",
    ];
    const rows = response.map((v) => [
      v.campCode || "-",
      v.name || "-",
      v.email || "-",
      v.amount ?? "-",
      v.paymentStatus || "-",
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

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="text-center py-6">
        <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
          {response?.length}{" "}
          {response?.length === 1 ? t("voucher") : t("vouchers")}
        </p>
      </div>

      {/* Voucher Table */}
      <div
        className={`rounded-lg overflow-hidden border ${
          isDark ? " border-gray-800" : "bg-white border-gray-200"
        }`}
      >
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead
              className={`sticky top-0 border-b ${
                isDark ? " border-gray-700" : "bg-gray-50 border-gray-200"
              }`}
            >
              <tr>
                {["voucher_code", "name", "email", "amount", "status"].map(
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
              {!response?.length ? (
                <tr>
                  <td
                    colSpan={5}
                    className={`px-4 py-6 text-center text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {t("no_vouchers")}
                  </td>
                </tr>
              ) : (
                response.map((item, index) => (
                  <tr key={index}>
                    <td
                      className={`${isDark ? "text-gray-100" : "text-gray-900"} px-4 py-3 text-sm`}
                    >
                      {item.campCode || "-"}
                    </td>
                    <td
                      className={`${isDark ? "text-gray-100" : "text-gray-900"} px-4 py-3 text-sm`}
                    >
                      {item.name || "-"}
                    </td>
                    <td
                      className={`${isDark ? "text-gray-400" : "text-gray-600"} px-4 py-3 text-sm`}
                    >
                      {item.email || "-"}
                    </td>
                    <td
                      className={`${isDark ? "text-gray-100" : "text-gray-900"} px-4 py-3 text-sm`}
                    >
                      {item.amount ? `₪${item.amount}` : "-"}
                    </td>
                    <td
                      className={`${isDark ? "text-gray-400" : "text-gray-600"} px-4 py-3 text-sm`}
                    >
                      {item?.paymentStatus || "-"}
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
          disabled={response.length === 0}
          className={clsx(
            "flex-1 px-4 py-2 rounded-lg border flex items-center justify-center gap-2 transition-colors ",
            isDark
              ? " border-gray-700 text-gray-300 "
              : "bg-white border-gray-300 text-gray-700 ",
            response?.length === 0 ? " cursor-not-allowed " : " cursor-pointer",
          )}
        >
          <Download className="w-4 h-4" />
          {t("download_results")}
        </button>
      </div>
    </div>
  );
};

export default VoucherSuccess;
