import clsx from "clsx";
import { toast } from "sonner";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  User,
  Mail,
  Phone,
  CalendarClock,
  Ticket,
  Hash,
  Layers,
  DollarSign,
  CreditCard,
  Package,
  Send,
  HelpCircle,
} from "lucide-react";
import { useNotifyTicketCustomerByEmailSmsMutation } from "@/store/api/eventMutationApi";
import { useGetEventTicketAnswersQuery } from "@/store/api/eventQueryApi";
import { ModalWrapper } from "@/components/wrapper";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface TicketRegDetailModalProps {
  setIsOpen: (v: boolean) => void;
  ticketDetails: IEventTicket | null;
}

const TicketRegDetailModal = ({
  setIsOpen,
  ticketDetails,
}: TicketRegDetailModalProps) => {
  const { t } = useTranslation("events");
  const { t: tt } = useTranslation("toast");

  const {
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    cardClasses,
    isDark,
  } = useThemeClasses();
  const [notifyTicketCustomer, { isLoading: isResendingEmail }] =
    useNotifyTicketCustomerByEmailSmsMutation();
  const [activeTab, setActiveTab] = useState<"general" | "answers">("general");

  const { data: ticketAnswersData } = useGetEventTicketAnswersQuery(
    {
      ticketId: ticketDetails?.ticketId as string,
      email: ticketDetails?.email,
      phone: ticketDetails?.phone,
      orderId: ticketDetails?._id,
    },
    { skip: !ticketDetails?.ticketId },
  );

  if (!ticketDetails) return null;

  // one record per purchase submission, each carrying its own Q&A set -
  // flatten since a single ticket normally has exactly one submission
  const ticketAnswers = (ticketAnswersData?.data ?? []).flatMap(
    (record) => record.questionAnswer,
  );

  const handleResendEmailSms = async (type: "email" | "sms") => {
    try {
      await notifyTicketCustomer({
        ordersId: [ticketDetails.orderProductId!],
        emailRecipient: "CUSTOMER",
        type,
      }).unwrap();
      toast.success(
        type === "email"
          ? tt("ticket_email_resend_success")
          : tt("ticket_sms_resend_success"),
      );
    } catch (error) {
      toast.error(
        type === "email"
          ? tt("ticket_email_resend_failed")
          : tt("ticket_sms_resend_faild"),
      );
      console.error(`Failed to resend ${type}:`, error);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const pillClasses = (variant: "success" | "neutral" | "warning") =>
    clsx(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize",
      variant === "success" && "bg-green-500/15 text-green-500",
      variant === "warning" && "bg-yellow-500/15 text-yellow-600",
      variant === "neutral" &&
        (isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"),
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
        <p className={clsx(textPrimary, "font-medium text-sm wrap-break-word")}>
          {value}
        </p>
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

  return (
    <ModalWrapper onClose={() => setIsOpen(false)} maxWidth="max-w-3xl">
      <div className="flex flex-col h-full overflow-hidden">
        <div className="shrink-0 p-6 pb-0 sm:p-7 sm:pb-0">
          <h1 className={clsx("text-2xl font-semibold", textPrimary)}>
            {t("ticket_reg_detail_title")}
          </h1>
          <p className={clsx("text-sm mt-1", textTertiary)}>
            {ticketDetails.firstName} {ticketDetails.lastName || ""} ·{" "}
            {ticketDetails.ticketName}
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
            className={clsx(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === "general"
                ? "border-teal-500 text-teal-500"
                : clsx("border-transparent", textTertiary),
            )}
          >
            {t("general_info")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("answers")}
            className={clsx(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === "answers"
                ? "border-teal-500 text-teal-500"
                : clsx("border-transparent", textTertiary),
            )}
          >
            {t("registration_answers")}
            {ticketAnswers.length > 0 && ` (${ticketAnswers.length})`}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-4">
          {activeTab === "answers" ? (
            ticketAnswers.length > 0 ? (
              <div className="space-y-3">
                {ticketAnswers.map((qa) => (
                  <div
                    key={qa._id}
                    className={clsx(
                      "rounded-xl border p-4",
                      cardClasses,
                      borderColor,
                    )}
                  >
                    <p className={clsx("text-xs mb-1.5", textTertiary)}>
                      {qa.question}
                    </p>
                    <p
                      className={clsx(
                        textPrimary,
                        "font-medium text-sm wrap-break-word",
                      )}
                    >
                      {qa.answer}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <HelpCircle
                  className={clsx(
                    "w-16 h-16 mx-auto mb-4 opacity-50",
                    textTertiary,
                  )}
                />
                <p className={textTertiary}>{t("no_registration_answers")}</p>
              </div>
            )
          ) : (
            <>
              <Section title={t("customer_information")}>
                <Field
                  icon={User}
                  label={t("full_name")}
                  value={`${ticketDetails.firstName} ${ticketDetails.lastName || ""}`}
                />
                <Field
                  icon={Mail}
                  label={t("email")}
                  value={ticketDetails.email}
                />
                <Field
                  icon={Phone}
                  label={t("phone")}
                  value={ticketDetails.phone}
                />
                <Field
                  icon={CalendarClock}
                  label={t("registration_date")}
                  value={formatDate(ticketDetails.createdAt)}
                />
              </Section>

              <Section title={t("ticket_information")}>
                <Field
                  icon={Ticket}
                  label={t("ticket_name")}
                  value={ticketDetails.ticketName}
                />
                <Field
                  icon={Hash}
                  label={t("ticket_id")}
                  value={
                    <span className="font-mono text-xs">
                      {ticketDetails.ticketId}
                    </span>
                  }
                />
                {ticketDetails.quantity && (
                  <Field
                    icon={Layers}
                    label={t("quantity")}
                    value={ticketDetails.quantity}
                  />
                )}
                <Field
                  icon={DollarSign}
                  label={t("amount")}
                  value={`₪${ticketDetails?.amount?.toFixed(2)}`}
                />
                <Field
                  icon={Package}
                  label={t("status")}
                  value={
                    <span
                      className={pillClasses(
                        ticketDetails.status === "active"
                          ? "success"
                          : "neutral",
                      )}
                    >
                      {ticketDetails.status}
                    </span>
                  }
                />
                {ticketDetails.paymentStatus && (
                  <Field
                    icon={CreditCard}
                    label={t("payment_status")}
                    value={
                      <span
                        className={pillClasses(
                          ticketDetails.paymentStatus === "completed"
                            ? "success"
                            : "warning",
                        )}
                      >
                        {ticketDetails.paymentStatus}
                      </span>
                    }
                  />
                )}
              </Section>

              <Section title={t("payment_information")}>
                <Field
                  icon={CreditCard}
                  label={t("payment_mode")}
                  value={ticketDetails.paymentMode.join(", ")}
                />
                <Field
                  icon={CalendarClock}
                  label={t("payment_date")}
                  value={formatDate(ticketDetails.paymentDate)}
                />
                {ticketDetails.orderProductId && (
                  <Field
                    icon={Hash}
                    label={t("order_product_id")}
                    value={
                      <span className="font-mono text-xs">
                        {ticketDetails._id}
                      </span>
                    }
                  />
                )}
              </Section>
            </>
          )}
        </div>

        <div
          className={clsx(
            "shrink-0 flex justify-between items-center p-6 pt-3 sm:p-7 sm:pt-3 border-t",
            borderColor,
          )}
        >
          <div className={textPrimary}>{t("notify_customer_by")}:</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleResendEmailSms("email")}
              disabled={isResendingEmail}
              className={clsx(
                "px-4 py-2 cursor-pointer bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors flex items-center gap-2 shadow-sm",
                isResendingEmail && "opacity-50 cursor-not-allowed",
              )}
            >
              <Mail className="h-4 w-4" />
              {t("email")}
            </button>
            <button
              onClick={() => handleResendEmailSms("sms")}
              disabled={isResendingEmail}
              className={clsx(
                "px-4 py-2 cursor-pointer bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center gap-2 shadow-sm",
                isResendingEmail && "opacity-50 cursor-not-allowed",
              )}
            >
              <Send className="h-4 w-4" />
              {t("sms")}
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default TicketRegDetailModal;
