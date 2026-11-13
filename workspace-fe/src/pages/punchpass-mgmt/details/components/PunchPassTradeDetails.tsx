import clsx from "clsx";
import { useMemo, useState } from "react";
import { ArrowLeftRight, Search } from "lucide-react";

import { formatDateTime } from "@/helpers/formatter";
import { ReordableDataTable } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetPunchPassTradesQuery } from "@/store/api/punchPassApi";
import PunchPassTradeDetailModal, {
  getTradeStatusColor,
} from "./PunchPassTradeDetailModal";

interface PunchPassTradeDetailsProps {
  t: (key: string, options?: Record<string, unknown>) => string;
  punchPassId: string;
}

const matchesSearch = (trade: IPunchPassTrade, query: string) => {
  const fields = [
    `${trade.firstName} ${trade.lastName || ""}`,
    trade.email,
    trade.phone,
    trade.cardNumber,
    trade.orderId,
  ];
  return fields.some((field) => field?.toLowerCase().includes(query));
};

const PunchPassTradeDetails: React.FC<PunchPassTradeDetailsProps> = ({
  t,
  punchPassId,
}) => {
  const { isDark, isRTL, language, textTertiary } = useThemeClasses();
  const { data: tradesRes, isLoading } = useGetPunchPassTradesQuery(
    punchPassId,
    { skip: !punchPassId },
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrade, setSelectedTrade] = useState<IPunchPassTrade | null>(
    null,
  );

  const filteredTrades = useMemo(() => {
    const trades = tradesRes?.data ?? [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return trades;
    return trades.filter((trade) => matchesSearch(trade, query));
  }, [tradesRes, searchQuery]);

  const renderPill = (value: string) => (
    <span
      className={clsx(
        "inline-flex px-2.5 py-1 rounded-full text-xs font-medium border capitalize",
        getTradeStatusColor(value, isDark),
      )}
    >
      {t(value.toLowerCase(), { defaultValue: value })}
    </span>
  );

  const renderMuted = (value: React.ReactNode, className = "") => (
    <span
      className={clsx(
        "text-sm",
        isDark ? "text-gray-400" : "text-gray-500",
        className,
      )}
    >
      {value}
    </span>
  );

  return (
    <div
      className={clsx(
        "rounded-xl border p-3 md:p-6",
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
      )}
    >
      <h3
        className={clsx(
          "text-xs md:text-sm font-semibold uppercase tracking-wide mb-2 md:mb-4",
          isDark ? "text-gray-400" : "text-gray-600",
        )}
      >
        {t("trades")}
      </h3>

      <div className="relative mb-6">
        <Search
          className={`absolute ${isRTL ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-5 h-5 ${textTertiary}`}
        />
        <input
          type="text"
          placeholder={t("search_trades_placeholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"} py-3 rounded-xl border text-base ${
            isDark
              ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
          } focus:ring-2 focus:ring-teal-500/20 transition-all`}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredTrades.length === 0 ? (
        <div className="text-center py-16">
          <ArrowLeftRight
            className={`w-20 h-20 mx-auto mb-5 opacity-50 ${textTertiary}`}
          />
          <p className={`text-lg ${textTertiary}`}>
            {searchQuery ? t("no_trades_match") : t("no_trades_yet")}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <ReordableDataTable
            rowKey="_id"
            data={filteredTrades}
            storageKey="punchPassTradesTableColumnOrder"
            onRowClick={setSelectedTrade}
            columns={[
              {
                key: "purchaser",
                label: t("purchaser"),
                sortable: true,
                render: (trade: IPunchPassTrade) => (
                  <div className="flex flex-col">
                    <span
                      className={clsx(
                        "text-sm font-medium",
                        isDark ? "text-gray-100" : "text-gray-900",
                      )}
                    >
                      {`${trade.firstName} ${trade.lastName || ""}`.trim()}
                    </span>
                    {trade.email && (
                      <span
                        className={clsx(
                          "text-xs",
                          isDark ? "text-gray-400" : "text-gray-500",
                        )}
                      >
                        {trade.email}
                      </span>
                    )}
                    {trade.phone && (
                      <span
                        className={clsx(
                          "text-xs",
                          isDark ? "text-gray-400" : "text-gray-500",
                        )}
                      >
                        {trade.phone}
                      </span>
                    )}
                  </div>
                ),
              },
              {
                key: "card_number",
                label: t("card_number"),
                render: (trade: IPunchPassTrade) =>
                  renderMuted(trade.cardNumber || "-", "font-mono"),
              },
              {
                key: "usage",
                label: t("usage"),
                render: (trade: IPunchPassTrade) =>
                  renderMuted(
                    trade.totalItems != null
                      ? `${trade.remainingItems} / ${trade.totalItems}`
                      : "-",
                  ),
              },
              {
                key: "payment_mode",
                label: t("payment_mode"),
                render: (trade: IPunchPassTrade) =>
                  renderMuted(
                    trade.paymentMode?.join(", ") || "-",
                    "capitalize",
                  ),
              },
              {
                key: "amount",
                label: t("amount"),
                sortable: true,
                render: (trade: IPunchPassTrade) => (
                  <span
                    className={clsx(
                      "text-sm font-medium",
                      isDark ? "text-gray-100" : "text-gray-900",
                    )}
                  >
                    {trade.amount != null
                      ? isRTL
                        ? `${trade.quantity + "x "}${trade.amount}₪`
                        : `₪ ${trade.amount} x${trade.quantity}`
                      : "-"}
                  </span>
                ),
              },
              {
                key: "card_status",
                label: t("card_status"),
                render: (trade: IPunchPassTrade) =>
                  trade.cardStatus
                    ? renderPill(trade.cardStatus)
                    : renderMuted("-"),
              },
              {
                key: "payment_status",
                label: t("payment_status"),
                render: (trade: IPunchPassTrade) =>
                  trade.paymentStatus
                    ? renderPill(trade.paymentStatus)
                    : renderMuted("-"),
              },
              {
                key: "purchased_date",
                label: t("purchased_date"),
                sortable: true,
                render: (trade: IPunchPassTrade) =>
                  renderMuted(
                    trade.paymentDate
                      ? formatDateTime(trade.paymentDate, language)
                      : "-",
                  ),
              },
            ]}
          />
        </div>
      )}

      {selectedTrade && (
        <PunchPassTradeDetailModal
          t={t}
          trade={selectedTrade}
          onClose={() => setSelectedTrade(null)}
        />
      )}
    </div>
  );
};

export default PunchPassTradeDetails;
