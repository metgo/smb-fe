import clsx from "clsx";
import { toast } from "sonner";
import React, { useEffect, useRef, useState } from "react";
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
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import {
  useNotifyTicketCustomerByEmailSmsMutation,
  useUpdateEventTicketStatusMutation,
  useSetEventTicketAttendanceMutation,
} from "@/store/api/eventMutationApi";
import { useGetEventTicketAnswersQuery } from "@/store/api/eventQueryApi";
import { ModalWrapper } from "@/components/wrapper";
import { useThemeClasses } from "@/hooks/useThemeClasses";

const STATUS_OPTIONS = [
  { value: "attended", label: "attended" },
  { value: "completed", label: "completed" },
  { value: "canceled", label: "cancelled" },
];

const getStatusColor = (status: string, isDark: boolean) => {
  switch (status?.toLowerCase()) {
    case "paid":
    case "success":
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
      return clsx(
        "bg-red-500/20",
        isDark ? "text-red-400 border-red-700" : "text-red-600 border-red-300",
      );
    case "refunded":
    case "canceled":
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

interface CancelDialogProps {
  isDark: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const CancelDialog: React.FC<CancelDialogProps> = ({
  isDark,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  const { t } = useTranslation("events");
  const [reason, setReason] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={clsx(
          "w-full max-w-md mx-4 rounded-xl border shadow-xl p-6",
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
        )}
      >
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <h3
              className={clsx(
                "font-semibold text-base",
                isDark ? "text-white" : "text-gray-900",
              )}
            >
              {t("cancel_order")}
            </h3>
            <p
              className={clsx(
                "text-sm mt-1",
                isDark ? "text-gray-400" : "text-gray-500",
              )}
            >
              {t("cancel_order_reason_prompt")}
            </p>
          </div>
        </div>

        <textarea
          ref={inputRef}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t("cancel_reason_placeholder")}
          rows={3}
          className={clsx(
            "w-full rounded-lg border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/30",
            isDark
              ? "bg-gray-900 border-gray-600 text-white placeholder-gray-500"
              : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400",
          )}
        />

        <div className="flex gap-3 mt-4 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isDark
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700",
            )}
          >
            {t("cancel")}
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t("updating") : t("confirm_cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

interface StatusCellProps {
  ticket: IEventTicket;
  isDark: boolean;
  onUpdate: (
    orderId: string,
    status: string,
    cancelReason?: string,
  ) => Promise<void>;
  onAttendance: (orderId: string, attended: boolean) => Promise<void>;
  isUpdating: boolean;
  updatingId: string | null;
}

const StatusCell: React.FC<StatusCellProps> = ({
  ticket,
  onUpdate,
  onAttendance,
  isUpdating,
  updatingId,
  isDark,
}) => {
  const { t } = useTranslation("events");

  const [open, setOpen] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const ticketOrderId = ticket.orderProductId ?? ticket._id;
  const isThisUpdating = isUpdating && updatingId === ticketOrderId;

  // "attended" is a check-in marker, not an order status - show it ahead of
  // the underlying status ("completed"), which stays untouched underneath.
  // (canceled rows return early below, so this only applies to live ones.)
  const currentValue = ticket.attended ? "attended" : ticket.status;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = async (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    setOpen(false);
    if (value === currentValue) return;
    if (value === "canceled") {
      setShowCancelDialog(true);
      return;
    }
    if (value === "attended") {
      await onAttendance(ticketOrderId, true);
      return;
    }
    if (value === "completed") {
      // leaving the "attended" marker -> just clear check-in; status is
      // already "completed" underneath
      if (ticket.attended) {
        await onAttendance(ticketOrderId, false);
      } else {
        await onUpdate(ticketOrderId, value);
      }
      return;
    }
    await onUpdate(ticketOrderId, value);
  };

  const handleCancelConfirm = async (reason: string) => {
    await onUpdate(ticketOrderId, "canceled", reason);
    setShowCancelDialog(false);
  };

  if (!ticket.status) {
    const fallback =
      ticket.paymentStatus === "pending" || ticket.paymentStatus === "failure"
        ? ticket.paymentStatus
        : "failure";
    return (
      <span
        className={clsx(
          "inline-flex px-2.5 py-1 rounded-full text-xs font-medium border capitalize",
          getStatusColor(fallback, isDark),
        )}
      >
        {t(fallback, { defaultValue: fallback })}
      </span>
    );
  }

  // canceled is terminal - no status change possible from here
  if (ticket.status?.toLowerCase() === "canceled") {
    return (
      <span
        className={clsx(
          "inline-flex px-2.5 py-1 rounded-full text-xs font-medium border capitalize",
          getStatusColor("canceled", isDark),
        )}
      >
        {t("canceled", { defaultValue: "canceled" })}
      </span>
    );
  }

  // once checked in, "attended" is terminal too - show a static pill, no dropdown
  if (ticket.attended) {
    return (
      <span
        className={clsx(
          "inline-flex px-2.5 py-1 rounded-full text-xs font-medium border capitalize",
          getStatusColor("attended", isDark),
        )}
      >
        {t("attended")}
      </span>
    );
  }

  return (
    <>
      <div
        ref={dropdownRef}
        className="relative inline-block"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          disabled={isThisUpdating}
          className={clsx(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-opacity capitalize",
            getStatusColor(currentValue, isDark),
            isThisUpdating && "opacity-60 cursor-not-allowed",
          )}
        >
          {isThisUpdating
            ? t("updating")
            : t(currentValue, { defaultValue: currentValue })}
          {!isThisUpdating && <ChevronDown className="w-3 h-3" />}
        </button>

        {open && (
          <div
            className={clsx(
              "absolute z-100 bottom-full mb-1 left-0 min-w-32.5 rounded-lg border shadow-lg overflow-hidden ",
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200",
            )}
          >
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={(e) => handleSelect(e, opt.value)}
                className={clsx(
                  "w-full text-left px-3 py-2 text-xs transition-colors capitalize",
                  currentValue === opt.value
                    ? isDark
                      ? "bg-gray-700 font-semibold text-white"
                      : "bg-gray-100 font-semibold text-gray-900"
                    : isDark
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-700 hover:bg-gray-50",
                  opt.value === "cancelled" &&
                    "text-red-500 hover:text-red-500",
                )}
              >
                {t(opt.value)}
              </button>
            ))}
          </div>
        )}
      </div>

      {showCancelDialog && (
        <div onClick={(e) => e.stopPropagation()}>
          <CancelDialog
            isDark={isDark}
            isLoading={isThisUpdating}
            onConfirm={handleCancelConfirm}
            onCancel={() => setShowCancelDialog(false)}
          />
        </div>
      )}
    </>
  );
};

interface TicketRegDetailModalProps {
  setIsOpen: (v: boolean) => void;
  ticketDetails: IEventTicket | null;
  onStatusUpdated?: () => void;
}

const TicketRegDetailModal = ({
  setIsOpen,
  ticketDetails,
  onStatusUpdated,
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
  const [updateStatus, { isLoading: isStatusUpdating }] =
    useUpdateEventTicketStatusMutation();
  const [setAttendance, { isLoading: isAttendanceUpdating }] =
    useSetEventTicketAttendanceMutation();
  const isUpdating = isStatusUpdating || isAttendanceUpdating;
  const [updatingId, setUpdatingId] = useState<string | null>(null);
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

  const handleStatusUpdate = async (
    orderId: string,
    status: string,
    cancelReason?: string,
  ) => {
    setUpdatingId(orderId);
    try {
      await updateStatus({ orderId, status, cancelReason }).unwrap();
      toast.success(
        t("order_status_updated", {
          status: t(status, { defaultValue: status }),
        }),
      );
      onStatusUpdated?.();
    } catch {
      toast.error(t("failed_to_update_order_status"));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAttendanceUpdate = async (orderId: string, attended: boolean) => {
    setUpdatingId(orderId);
    try {
      await setAttendance({ orderId, attended }).unwrap();
      toast.success(
        t("order_status_updated", {
          status: t(attended ? "attended" : "completed"),
        }),
      );
      onStatusUpdated?.();
    } catch {
      toast.error(t("failed_to_update_order_status"));
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

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
                  label={t("order_status")}
                  value={
                    <StatusCell
                      ticket={ticketDetails}
                      isDark={isDark}
                      onUpdate={handleStatusUpdate}
                      onAttendance={handleAttendanceUpdate}
                      isUpdating={isUpdating}
                      updatingId={updatingId}
                    />
                  }
                />
                {ticketDetails.paymentStatus && (
                  <Field
                    icon={CreditCard}
                    label={t("payment_status")}
                    value={
                      <span
                        className={clsx(
                          "inline-flex px-2.5 py-1 rounded-full text-xs font-medium border capitalize",
                          getStatusColor(ticketDetails.paymentStatus, isDark),
                        )}
                      >
                        {t(ticketDetails.paymentStatus, {
                          defaultValue: ticketDetails.paymentStatus,
                        })}
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
                    label={t("order_id")}
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
