import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Eye, RotateCw } from "lucide-react";

import { ReordableDataTable } from "@/components/shared";
import { formatDate, timeAgo } from "@/helpers";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useResendEmailActivityMutation } from "@/store/api/emailActivityMutationApi";

import EmailActivityStatusBadge from "./EmailActivityStatusBadge";
import EmailActivityDetailModal from "./EmailActivityDetailModal";
import EmailActivityContentModal from "./EmailActivityContentModal";

interface EmailActivityListProps {
  data: IEmailActivity[];
  isLoading: boolean;
  hasMore?: boolean;
  next?: () => void;
  canViewContent?: boolean;
}

const EmailActivityList = ({
  data,
  isLoading,
  hasMore,
  next,
  canViewContent = true,
}: EmailActivityListProps) => {
  const { t } = useTranslation("email_activity");
  const { textTertiary, language } = useThemeClasses();

  const [detailTarget, setDetailTarget] = useState<IEmailActivity | null>(null);
  const [contentTarget, setContentTarget] = useState<IEmailActivity | null>(
    null,
  );
  const [resendingId, setResendingId] = useState<string | null>(null);

  const [resendEmailActivity] = useResendEmailActivityMutation();

  const groupByDay = useCallback(
    (item: IEmailActivity) => {
      const sent = new Date(item.tsSent);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const isSameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

      const weekday = sent.toLocaleDateString(language, {
        weekday: "long",
      });

      if (isSameDay(sent, today)) return `${weekday}, ${t("today")}`;
      if (isSameDay(sent, yesterday)) return `${weekday}, ${t("yesterday")}`;

      const date = sent.toLocaleDateString(language, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return `${weekday}, ${date}`;
    },
    [t, language],
  );

  const handleResend = useCallback(
    async (item: IEmailActivity) => {
      setResendingId(item._id);
      try {
        await resendEmailActivity(item.mandrillMessageId).unwrap();
        toast.success(t("resend_success"));
      } catch {
        toast.error(t("resend_failed"));
      } finally {
        setResendingId(null);
      }
    },
    [resendEmailActivity, t],
  );

  const columns = useMemo(
    () => [
      {
        key: "subject",
        label: t("subject"),
        render: (item: IEmailActivity) => (
          <div className="flex flex-col w-80">
            <span className="font-medium">{item.subject}</span>
            <span className={`text-xs ${textTertiary}`}>
              {item.templateName}
            </span>
          </div>
        ),
      },
      {
        key: "email",
        label: t("recipient_email"),
        sortable: true,
      },
      {
        key: "status",
        label: t("status"),
        render: (item: IEmailActivity) => (
          <EmailActivityStatusBadge status={item.status} />
        ),
      },
      {
        key: "tsSent",
        label: t("sent_at"),
        sortable: true,
        render: (item: IEmailActivity) => (
          <span className={`text-sm ${textTertiary}`}>
            {formatDate(item.tsSent)}
          </span>
        ),
      },
      {
        key: "lastEventAt",
        label: t("last_event_at"),
        render: (item: IEmailActivity) => (
          <span className={`text-sm ${textTertiary}`}>
            {item.lastEventAt
              ? `${t(`status_${item.status}`)} ${timeAgo(item.lastEventAt)}`
              : "—"}
          </span>
        ),
      },
      {
        key: "opens",
        label: t("opens"),
        width: "70px",
        render: (item: IEmailActivity) => (
          <span className={`text-sm ${textTertiary}`}>{item.opens ?? "—"}</span>
        ),
      },
      {
        key: "clicks",
        label: t("clicks"),
        width: "70px",
        render: (item: IEmailActivity) => (
          <span className={`text-sm ${textTertiary}`}>
            {item.clicks ?? "—"}
          </span>
        ),
      },
      {
        key: "actions",
        label: t("actions"),
        width: "110px",
        render: (item: IEmailActivity) => (
          <div className="flex items-center gap-1">
            {canViewContent && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setContentTarget(item);
                }}
                title={t("view_content")}
                className="p-1.5 rounded-lg text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              disabled={resendingId === item._id}
              onClick={(e) => {
                e.stopPropagation();
                handleResend(item);
              }}
              title={t("resend")}
              className="p-1.5 rounded-lg text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCw
                className={`w-4 h-4 ${resendingId === item._id ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        ),
      },
    ],
    [t, textTertiary, canViewContent, resendingId, handleResend],
  );

  return (
    <>
      <ReordableDataTable<IEmailActivity>
        rowKey="_id"
        columns={columns}
        data={data}
        isDataLoading={isLoading}
        onRowClick={(item) => setDetailTarget(item)}
        hasMore={hasMore}
        next={next}
        groupBy={groupByDay}
      />

      {detailTarget && (
        <EmailActivityDetailModal
          activity={detailTarget}
          onClose={() => setDetailTarget(null)}
        />
      )}

      {contentTarget && (
        <EmailActivityContentModal
          activity={contentTarget}
          onClose={() => setContentTarget(null)}
        />
      )}
    </>
  );
};

export default EmailActivityList;
