import { Building2, CheckSquare, Square } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { getStatusColor } from "../mini-site.utils";

interface MiniSite {
  id: string;
  campaignName: string;
  status: string;
  usedVouchers: number;
  totalVouchers: number;
  voucherAmount: number;
  revenue: number;
}

interface MinisiteGridViewProps {
  filteredMiniSites: MiniSite[];
  selectedRows: Set<string>;
  toggleRowSelection: (id: string) => void;
  handleRowClick: (site: MiniSite) => void;
}

const MinisiteGridView = ({
  filteredMiniSites,
  selectedRows,
  toggleRowSelection,
  handleRowClick,
}: MinisiteGridViewProps) => {
  const { t } = useTranslation("mini_site");

  const {
    bgPrimary,
    bgSecondary,
    textPrimary,
    textTertiary,
    borderColor,
    isDark,
  } = useThemeClasses();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredMiniSites.map((site) => {
        const percentage =
          site.totalVouchers > 0
            ? (site.usedVouchers / site.totalVouchers) * 100
            : 0;

        return (
          <div
            key={site.id}
            className={`${bgPrimary} rounded-xl p-5 border ${borderColor} hover:shadow-lg transition-all relative cursor-pointer`}
            onClick={() => handleRowClick(site)}
          >
            {/* Checkbox */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleRowSelection(site.id);
              }}
              className="absolute top-4 right-4 z-10"
            >
              {selectedRows.has(site.id) ? (
                <CheckSquare className="w-5 h-5 text-purple-600" />
              ) : (
                <Square className={`w-5 h-5 ${textTertiary}`} />
              )}
            </button>

            {/* Header */}
            <div className="flex items-start gap-4 mb-4 pr-8">
              <div
                className={`w-16 h-16 rounded-lg ${bgSecondary} flex items-center justify-center shrink-0 border ${borderColor}`}
              >
                <Building2 className={`w-8 h-8 ${textTertiary}`} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className={`${textPrimary} mb-1 truncate`}>
                  {site.campaignName}
                </h3>

                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs border ${getStatusColor(
                    site.status,
                    isDark,
                  )}`}
                >
                  {t(`status_${site.status}`)}
                </span>
              </div>
            </div>

            {/* Voucher Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className={textTertiary}>{t("vouchers")}:</span>
                <span className={textPrimary}>
                  {site.usedVouchers} / {site.totalVouchers}
                </span>
              </div>

              <div
                className={`w-full h-2 ${bgSecondary} rounded-full overflow-hidden`}
              >
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-600 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <p className={`text-xs ${textTertiary} mt-1 text-right`}>
                {percentage.toFixed(0)}% {t("used")}
              </p>
            </div>

            {/* Metrics */}
            <div
              className={`grid grid-cols-2 gap-3 pt-4 border-t ${borderColor}`}
            >
              <div>
                <p className={`text-xs ${textTertiary} mb-1`}>
                  {t("voucher_amount")}
                </p>
                <p className={textPrimary}>₪{site.voucherAmount}</p>
              </div>

              <div>
                <p className={`text-xs ${textTertiary} mb-1`}>{t("revenue")}</p>
                <p className={textPrimary}>₪{site.revenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MinisiteGridView;
