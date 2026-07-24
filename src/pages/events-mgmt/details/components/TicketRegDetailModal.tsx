import { ModalWrapper } from "@/components/wrapper";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import clsx from "clsx";
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
} from "lucide-react";

interface TicketRegDetailModalProps {
  setIsOpen: (v: boolean) => void;
  ticketDetails: IEventTicket | null;
}

const TicketRegDetailModal = ({
  setIsOpen,
  ticketDetails,
}: TicketRegDetailModalProps) => {
  const { t } = useTranslation("events");
  const {
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    cardClasses,
    isDark,
  } = useThemeClasses();
  if (!ticketDetails) return null;

  const handleResendEmail = () => {
    console.log("Resending email to:", ticketDetails.email);
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
    <ModalWrapper
      onClose={() => setIsOpen(false)}
      height="h-max-[40vh]"
      maxWidth="max-w-3xl"
    >
      <div className="p-6 sm:p-7">
        <div className="mb-5">
          <h1 className={clsx("text-2xl font-semibold", textPrimary)}>
            {t("ticket_reg_detail_title")}
          </h1>
          <p className={clsx("text-sm mt-1", textTertiary)}>
            {ticketDetails.firstName} {ticketDetails.lastName || ""} ·{" "}
            {ticketDetails.ticketName}
          </p>
        </div>

        <div className="space-y-4">
          <Section title={t("customer_information")}>
            <Field
              icon={User}
              label={t("full_name")}
              value={`${ticketDetails.firstName} ${ticketDetails.lastName || ""}`}
            />
            <Field icon={Mail} label={t("email")} value={ticketDetails.email} />
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
                <span className="font-mono text-xs">{ticketDetails._id}</span>
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
                    ticketDetails.status === "active" ? "success" : "neutral",
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
                    {ticketDetails.orderProductId}
                  </span>
                }
              />
            )}
          </Section>

          <div className={clsx("flex justify-end pt-3 border-t", borderColor)}>
            <button
              onClick={handleResendEmail}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Send className="h-4 w-4" />
              {t("resend_email_to_customer")}
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default TicketRegDetailModal;
