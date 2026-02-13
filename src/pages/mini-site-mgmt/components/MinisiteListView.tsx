import { CheckSquare, Square } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { getStatusColor } from "../mini-site.utils";

interface MiniSite {
  id: string;
  campaignCode: string;
  campaignName: string;
  companyName: string;
  website: string;
  status: string;
  voucherAmount: number;
  totalVouchers: number;
  usedVouchers: number;
  revenue: number;
}

interface MinisiteListViewProps {
  filteredMiniSites: MiniSite[];
  selectedRows: Set<string>;
  toggleRowSelection: (id: string) => void;
  toggleSelectAll: () => void;
  handleRowClick: (site: MiniSite) => void;
}

const MinisiteListView = ({
  filteredMiniSites,
  selectedRows,
  toggleRowSelection,
  toggleSelectAll,
  handleRowClick,
}: MinisiteListViewProps) => {
  const { t } = useTranslation("mini_site");

  const {
    bgPrimary,
    bgSecondary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    isDark,
  } = useThemeClasses();

  const isAllSelected =
    selectedRows.size === filteredMiniSites.length &&
    filteredMiniSites.length > 0;

  return (
    <div
      className={`${bgPrimary} rounded-xl border ${borderColor} overflow-hidden`}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead className={`${bgSecondary} border-b ${borderColor}`}>
            <tr>
              <th className="px-4 py-3 w-12">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center justify-center"
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-5 h-5 text-purple-600" />
                  ) : (
                    <Square className={`w-5 h-5 ${textTertiary}`} />
                  )}
                </button>
              </th>

              <th className={`px-4 py-3 text-left text-sm ${textSecondary}`}>
                {t("campaign_code")}
              </th>
              <th className={`px-4 py-3 text-left text-sm ${textSecondary}`}>
                {t("campaign_name")}
              </th>
              <th className={`px-4 py-3 text-left text-sm ${textSecondary}`}>
                {t("company_name")}
              </th>
              <th className={`px-4 py-3 text-left text-sm ${textSecondary}`}>
                {t("website")}
              </th>
              <th className={`px-4 py-3 text-left text-sm ${textSecondary}`}>
                {t("status")}
              </th>
              <th className={`px-4 py-3 text-left text-sm ${textSecondary}`}>
                {t("voucher_amount")}
              </th>
              <th className={`px-4 py-3 text-left text-sm ${textSecondary}`}>
                {t("total_vouchers")}
              </th>
              <th className={`px-4 py-3 text-left text-sm ${textSecondary}`}>
                {t("used_vouchers")}
              </th>
              <th className={`px-4 py-3 text-left text-sm ${textSecondary}`}>
                {t("revenue")}
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {filteredMiniSites.map((site) => {
              const percentage =
                site.totalVouchers > 0
                  ? (site.usedVouchers / site.totalVouchers) * 100
                  : 0;

              return (
                <tr
                  key={site.id}
                  className={`border-b ${borderColor} ${
                    isDark ? "hover:bg-gray-900/50" : "hover:bg-gray-50"
                  } transition-colors cursor-pointer`}
                  onClick={() => handleRowClick(site)}
                >
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => toggleRowSelection(site.id)}
                      className="flex items-center justify-center"
                    >
                      {selectedRows.has(site.id) ? (
                        <CheckSquare className="w-5 h-5 text-purple-600" />
                      ) : (
                        <Square className={`w-5 h-5 ${textTertiary}`} />
                      )}
                    </button>
                  </td>

                  <td className={`px-4 py-3 ${textPrimary} font-mono text-sm`}>
                    {site.campaignCode}
                  </td>

                  <td className={`px-4 py-3 ${textPrimary}`}>
                    {site.campaignName}
                  </td>

                  <td className={`px-4 py-3 ${textSecondary}`}>
                    {site.companyName}
                  </td>

                  <td className={`px-4 py-3 ${textSecondary}`}>
                    {site.website}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs border ${getStatusColor(
                        site.status,
                        isDark,
                      )}`}
                    >
                      {t(`status_${site.status}`)}
                    </span>
                  </td>

                  <td className={`px-4 py-3 ${textPrimary}`}>
                    ₪{site.voucherAmount}
                  </td>

                  <td className={`px-4 py-3 ${textPrimary}`}>
                    {site.totalVouchers}
                  </td>

                  <td className={`px-4 py-3 ${textPrimary}`}>
                    {site.usedVouchers}
                    <span className={`ml-2 text-xs ${textTertiary}`}>
                      ({percentage.toFixed(0)}%)
                    </span>
                  </td>

                  <td className={`px-4 py-3 ${textPrimary}`}>
                    ₪{site.revenue.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MinisiteListView;
