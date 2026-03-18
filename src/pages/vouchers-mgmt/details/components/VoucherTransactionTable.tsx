// VoucherTransactionTable.tsx
import React from "react";

export interface Voucher {
  amount: number;
  remainingAmount: number;
}

export interface Transaction {
  id: string | number;
  type: "credit" | "debit" | string;
  referenceId: string;
  referenceName: string;
  date: string | Date;
  status: "completed" | "cancelled" | "pending" | string;
}

interface VoucherTransactionTableProps {
  transactions: Transaction[];
  isDark?: boolean;
  voucher?: Voucher;
  formatDate: (date: string | Date) => string;
}

const VoucherTransactionTable: React.FC<VoucherTransactionTableProps> = ({
  transactions,
  isDark = false,
  voucher,
  formatDate,
}) => {
  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "credit":
        return "Credit";
      case "debit":
        return "Debit";
      default:
        return type;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "credit":
        return isDark
          ? "bg-teal-900/30 text-teal-400"
          : "bg-teal-100 text-teal-600";
      case "debit":
        return isDark
          ? "bg-red-900/30 text-red-400"
          : "bg-red-100 text-red-600";
      default:
        return isDark
          ? "bg-gray-900/30 text-gray-400"
          : "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div
      className={`rounded-lg border overflow-hidden ${
        isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
      }`}
    >
      <div
        className={`p-6 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}
      >
        <h3 className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Transaction History
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead
            className={`border-b ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}
          >
            <tr>
              {[
                "Type",
                "Reference ID",
                "Description",
                "Amount Used",
                "Date",
                "Status",
              ].map((header) => (
                <th
                  key={header}
                  className={`px-6 py-3 text-left text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            className={`divide-y ${isDark ? "divide-gray-800" : "divide-gray-200"}`}
          >
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className={isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"}
              >
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getTransactionTypeColor(
                      transaction.type,
                    )}`}
                  >
                    {getTransactionTypeLabel(transaction.type)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <a
                    href="#"
                    className={`text-sm hover:underline ${isDark ? "text-teal-400" : "text-teal-600"}`}
                  >
                    {transaction.referenceId}
                  </a>
                </td>
                <td
                  className={`px-6 py-4 text-sm ${isDark ? "text-gray-100" : "text-gray-900"}`}
                >
                  {transaction.referenceName}
                </td>
                <td
                  className={`px-6 py-4 text-sm ${isDark ? "text-gray-100" : "text-gray-900"}`}
                >
                  {voucher?.amount !== voucher?.remainingAmount ? (
                    <>₪{voucher?.amount - voucher?.remainingAmount}</>
                  ) : (
                    <>₪{voucher?.amount}</>
                  )}
                </td>
                <td
                  className={`px-6 py-4 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  {formatDate(transaction.date)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      transaction.status === "completed"
                        ? isDark
                          ? "bg-green-900/30 text-green-300"
                          : "bg-green-100 text-green-800"
                        : transaction.status === "cancelled"
                          ? isDark
                            ? "bg-red-900/30 text-red-300"
                            : "bg-red-100 text-red-800"
                          : isDark
                            ? "bg-yellow-900/30 text-yellow-300"
                            : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {transaction.status.charAt(0).toUpperCase() +
                      transaction.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {transactions.length === 0 && (
        <div className="text-center py-12">
          <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
            No transactions found
          </p>
        </div>
      )}
    </div>
  );
};

export default VoucherTransactionTable;
