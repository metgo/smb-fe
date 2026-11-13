import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { RotateCw } from "lucide-react";

import { ModalWrapper } from "@/components/wrapper";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useUserRoles } from "@/hooks/useUserRoles";
import { formatDate, timeAgo } from "@/helpers";
import { useResendEmailActivityMutation } from "@/store/api/emailActivityMutationApi";

import EmailActivityStatusBadge from "./EmailActivityStatusBadge";

interface EmailActivityDetailModalProps {
  activity: IEmailActivity;
  onClose: () => void;
}

const EmailActivityDetailModal = ({
  activity,
  onClose,
}: EmailActivityDetailModalProps) => {
  const { t } = useTranslation("email_activity");
  const { textPrimary, textTertiary, borderColor } = useThemeClasses();
  const { isSuperadmin } = useUserRoles();

  const [isResending, setIsResending] = useState(false);
  const [resendEmailActivity] = useResendEmailActivityMutation();

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendEmailActivity(activity.mandrillMessageId).unwrap();
      toast.success(t("resend_success"));
    } catch {
      toast.error(t("resend_failed"));
    } finally {
      setIsResending(false);
    }
  };

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex flex-col gap-0.5">
      <span className={`text-xs font-medium ${textTertiary}`}>{label}</span>
      <span className={`text-sm ${textPrimary}`}>{value}</span>
    </div>
  );

  return (
    <ModalWrapper onClose={onClose} maxWidth="max-w-xl" height="max-content">
      <div className="flex flex-col">
        <div className={`px-5 pt-5 pb-4 border-b ${borderColor}`}>
          <h2 className={`text-base font-bold ${textPrimary}`}>
            {t("activity_detail")}
          </h2>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {row(t("recipient_email"), activity.email)}
            {row(
              t("status"),
              <EmailActivityStatusBadge status={activity.status} />,
            )}
            {row(t("event_key"), activity.eventKey ?? "—")}
            {row(t("template_name"), activity.templateName)}
            {row(t("subject"), activity.subject)}
            {row(t("mandrill_message_id"), activity.mandrillMessageId)}
            {row(t("opens"), activity.opens ?? 0)}
            {row(t("clicks"), activity.clicks ?? 0)}
            {row(t("sent_at"), formatDate(activity.tsSent))}
            {row(
              t("last_event_at"),
              activity.lastEventAt
                ? `${timeAgo(activity.lastEventAt)} (${formatDate(activity.lastEventAt)})`
                : "—",
            )}
          </div>

          {activity.rejectReason && (
            <div className="pt-2">
              {row(t("reject_reason"), activity.rejectReason)}
            </div>
          )}

          {activity.bounceDescription && (
            <div className="pt-2">
              {row(t("bounce_description"), activity.bounceDescription)}
            </div>
          )}

          {isSuperadmin && activity.rawPayload != null && (
            <div className="pt-2">
              <span className={`text-xs font-medium ${textTertiary}`}>
                {t("raw_payload")}
              </span>
              <pre
                className={`mt-1 p-3 rounded-lg border ${borderColor} text-xs overflow-x-auto ${textPrimary} bg-black/5 dark:bg-white/5`}
              >
                {JSON.stringify(activity.rawPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div
          className={`flex justify-end gap-2 px-5 py-4 border-t ${borderColor}`}
        >
          <button
            type="button"
            disabled={isResending}
            onClick={handleResend}
            className="flex items-center gap-1.5 cursor-pointer px-4 py-2 rounded-lg text-sm font-medium bg-violet-500/40 text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCw
              className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`}
            />
            {t("resend")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-lg border ${borderColor} text-sm font-medium ${textPrimary} transition cursor-pointer`}
          >
            {t("close")}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default EmailActivityDetailModal;
