import clsx from "clsx";
import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  CalendarClock,
  CreditCard,
  Hash,
  Layers,
  DollarSign,
  Package,
  Ticket,
  ChevronDown,
  History,
} from "lucide-react";

import { ModalWrapper } from "@/components/wrapper";
import { formatDateTime } from "@/helpers/formatter";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetPunchCardRedemptionsQuery } from "@/store/api/punchPassApi";

export const getTradeStatusColor = (status: string, isDark: boolean) => {
  switch (status?.toLowerCase()) {
    case "paid":
    case "success":
    case "active":
    case "completed":
      return clsx(
        "bg-green-500/20",
        isDark
          ? "text-green-400 border-green-700"
          : "text-green-600 border-green-300",
      );
    case "pending":
      return clsx(
        "bg-yellow-500/20",
        isDark
          ? "text-yellow-400 border-yellow-700"
          : "text-yellow-600 border-yellow-300",
      );
    case "failure":
    case "refunded":
    case "canceled":
    case "expired":
      return clsx(
        "bg-red-500/20",
        isDark ? "text-red-400 border-red-700" : "text-red-600 border-red-300",
      );
    default:
      return clsx(
        "bg-blue-500/20",
        isDark ? "text-white border-gray-700" : "text-gray-600 border-gray-300",
      );
  }
};

type TRedemptionItem = IPunchCardRedemptionsRes["items"][number];

interface RedemptionItemProps {
  t: PunchPassTradeDetailModalProps["t"];
  item: TRedemptionItem;
}

const RedemptionItem: React.FC<RedemptionItemProps> = ({ t, item }) => {
  const {
    textPrimary,
    textTertiary,
    borderColor,
    cardClasses,
    isDark,
    language,
  } = useThemeClasses();
  const [isOpen, setIsOpen] = useState(false);

  const redemptions = item.redemptions ?? [];
  const isFullyUsed = item.quantity > 0 && item.usedCount >= item.quantity;

  const badge = (content: React.ReactNode, className?: string | false) => (
    <span
      className={clsx(
        "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
        isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600",
        className,
      )}
    >
      {content}
    </span>
  );

  return (
    <div className={clsx("rounded-xl border", cardClasses, borderColor)}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 p-4 text-start"
      >
        <div className="min-w-0 flex-1">
          <p className={clsx("font-medium text-sm truncate", textPrimary)}>
            {item.label}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {item.type &&
              badge(
                t(`catalogue_type_${item.type.toLowerCase()}`, {
                  defaultValue: item.type,
                }),
              )}
            {badge(`${t("quantity")}: ${item.quantity}`)}
            {badge(
              `${t("used")}: ${item.usedCount}`,
              isFullyUsed &&
                (isDark
                  ? "bg-red-900/40 text-red-300"
                  : "bg-red-100 text-red-700"),
            )}
            {badge(`${t("redemptions")}: ${redemptions.length}`)}
          </div>
        </div>
        <ChevronDown
          className={clsx(
            "w-4 h-4 shrink-0 transition-transform",
            textTertiary,
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className={clsx("border-t px-4 py-4", borderColor)}>
          {redemptions.length === 0 ? (
            <p className={clsx("text-sm text-center py-2", textTertiary)}>
              {t("no_redemptions_yet")}
            </p>
          ) : (
            <div>
              {redemptions.map((redemption, idx) => {
                const isLast = idx === redemptions.length - 1;
                const by = redemption.redeemedBy;
                const name = [by?.firstName, by?.lastName]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <div
                    key={`${redemption.redeemedAt}-${idx}`}
                    className={clsx(
                      "relative ps-3 border-s-2",
                      isDark ? "border-teal-700" : "border-teal-300",
                      !isLast && "pb-3",
                    )}
                  >
                    <span className="absolute -inset-s-1.25 top-1 w-2 h-2 rounded-full bg-teal-500" />
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className={clsx(
                          "text-xs font-semibold",
                          isDark ? "text-teal-300" : "text-teal-700",
                        )}
                      >
                        {t("redeemed")} #{idx + 1}
                      </span>
                      <span className={clsx("text-xs", textTertiary)}>
                        {redemption.redeemedAt
                          ? formatDateTime(redemption.redeemedAt, language)
                          : "-"}
                      </span>
                    </div>
                    {(name || by?.email) && (
                      <p className={clsx("text-xs mt-1", textTertiary)}>
                        {t("redeemed_by")}:{" "}
                        <span className={clsx("font-medium", textPrimary)}>
                          {name || by?.email}
                        </span>
                        {name && by?.email && ` · ${by.email}`}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface PunchPassTradeDetailModalProps {
  t: (key: string, options?: Record<string, unknown>) => string;
  trade: IPunchPassTrade;
  onClose: () => void;
}

const PunchPassTradeDetailModal: React.FC<PunchPassTradeDetailModalProps> = ({
  t,
  trade,
  onClose,
}) => {
  const {
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    cardClasses,
    isDark,
    language,
  } = useThemeClasses();

  const [activeTab, setActiveTab] = useState<"general" | "redemptions">(
    "general",
  );
  const { data: punchCardRedemptions, isLoading: isRedemptionsLoading } =
    useGetPunchCardRedemptionsQuery(
      { punchCardId: trade.punchCardId, language },
      {
        skip: !trade.punchCardId,
      },
    );
  const redemptionItems = punchCardRedemptions?.items ?? [];

  const fullName = `${trade.firstName} ${trade.lastName || ""}`.trim();

  const formatDate = (dateString?: string | null) =>
    dateString ? formatDateTime(dateString, language) : "-";

  const renderPill = (value?: string) =>
    value ? (
      <span
        className={clsx(
          "inline-flex px-2.5 py-1 rounded-full text-xs font-medium border capitalize",
          getTradeStatusColor(value, isDark),
        )}
      >
        {t(value.toLowerCase(), { defaultValue: value })}
      </span>
    ) : (
      "-"
    );

  const Field = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
  }) => (
    <div className="flex items-start gap-2.5">
      <Icon className={clsx("h-4 w-4 mt-0.5 shrink-0", textTertiary)} />
      <div className="min-w-0">
        <p className={clsx("text-xs", textTertiary)}>{label}</p>
        <div
          className={clsx(textPrimary, "font-medium text-sm wrap-break-word")}
        >
          {value || "-"}
        </div>
      </div>
    </div>
  );

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className={clsx("rounded-xl border p-4", cardClasses, borderColor)}>
      <h3
        className={clsx(
          "text-sm font-semibold mb-4 tracking-wide uppercase",
          textSecondary,
        )}
      >
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {children}
      </div>
    </div>
  );

  const tabClass = (tab: typeof activeTab) =>
    clsx(
      "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
      activeTab === tab
        ? "border-teal-500 text-teal-500"
        : clsx("border-transparent", textTertiary),
    );

  return (
    <ModalWrapper onClose={onClose} maxWidth="max-w-3xl">
      <div className="flex flex-col h-full overflow-hidden">
        <div className="shrink-0 p-6 pb-0 sm:p-7 sm:pb-0">
          <h1 className={clsx("text-2xl font-semibold", textPrimary)}>
            {t("trade_details")}
          </h1>
          <p className={clsx("text-sm mt-1", textTertiary)}>
            {fullName}
            {trade.cardNumber && ` · ${trade.cardNumber}`}
          </p>
        </div>

        <div
          className={clsx(
            "flex border-b mt-4 px-6 sm:px-7 shrink-0",
            borderColor,
          )}
        >
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={tabClass("general")}
          >
            {t("general_info")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("redemptions")}
            className={tabClass("redemptions")}
          >
            {t("redemptions")}
            {redemptionItems.length > 0 && ` (${redemptionItems.length})`}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-4">
          {activeTab === "redemptions" ? (
            isRedemptionsLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : redemptionItems.length === 0 ? (
              <div className="text-center py-16">
                <History
                  className={clsx(
                    "w-16 h-16 mx-auto mb-4 opacity-50",
                    textTertiary,
                  )}
                />
                <p className={textTertiary}>{t("no_redemption_items")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {redemptionItems.map((item) => (
                  <RedemptionItem key={item._id} t={t} item={item} />
                ))}
              </div>
            )
          ) : (
            <>
              <Section title={t("customer_information")}>
                <Field icon={User} label={t("full_name")} value={fullName} />
                <Field icon={Mail} label={t("email")} value={trade.email} />
                <Field icon={Phone} label={t("phone")} value={trade.phone} />
                <Field
                  icon={CalendarClock}
                  label={t("purchased_date")}
                  value={formatDate(trade.createdAt)}
                />
              </Section>

              <Section title={t("card_information")}>
                <Field
                  icon={Ticket}
                  label={t("card_number")}
                  value={
                    trade.cardNumber && (
                      <span className="font-mono text-xs">
                        {trade.cardNumber}
                      </span>
                    )
                  }
                />
                <Field
                  icon={Package}
                  label={t("card_status")}
                  value={renderPill(trade.cardStatus)}
                />
                <Field
                  icon={Layers}
                  label={t("remaining_items")}
                  value={
                    trade.totalItems != null
                      ? `${trade.remainingItems} / ${trade.totalItems}`
                      : "-"
                  }
                />
                <Field
                  icon={Package}
                  label={t("order_status")}
                  value={renderPill(trade.status)}
                />
              </Section>

              <Section title={t("payment_information")}>
                <Field
                  icon={DollarSign}
                  label={t("amount")}
                  value={
                    trade.amount != null
                      ? `₪${trade.amount.toFixed(2)} x${trade.quantity}`
                      : "-"
                  }
                />
                <Field
                  icon={CreditCard}
                  label={t("payment_mode")}
                  value={
                    <span className="capitalize">
                      {trade.paymentMode?.join(", ") || "-"}
                    </span>
                  }
                />
                <Field
                  icon={CreditCard}
                  label={t("payment_status")}
                  value={renderPill(trade.paymentStatus)}
                />
                <Field
                  icon={CalendarClock}
                  label={t("payment_date")}
                  value={formatDate(trade.paymentDate)}
                />
                <Field
                  icon={Hash}
                  label={t("order_id")}
                  value={
                    trade.orderId && (
                      <span className="font-mono text-xs">{trade.orderId}</span>
                    )
                  }
                />
              </Section>
            </>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};

export default PunchPassTradeDetailModal;
