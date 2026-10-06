import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

import { ModalWrapper } from "@/components/wrapper";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetEmailActivityContentQuery } from "@/store/api/emailActivityQueryApi";

interface EmailActivityContentModalProps {
  activity: IEmailActivity;
  onClose: () => void;
}

const EmailActivityContentModal = ({
  activity,
  onClose,
}: EmailActivityContentModalProps) => {
  const { t } = useTranslation("email_activity");
  const { textPrimary, textTertiary, borderColor } = useThemeClasses();

  const { data, isLoading, isError } = useGetEmailActivityContentQuery(
    activity.mandrillMessageId,
  );

  const html: string = data?.datas?.html ?? "";
  const subject: string = data?.datas?.subject ?? activity.subject;

  return (
    <ModalWrapper onClose={onClose} maxWidth="max-w-3xl" height="max-content">
      <div className="flex flex-col">
        <div className={`px-5 pt-5 pb-4 border-b ${borderColor}`}>
          <h2 className={`text-base font-bold ${textPrimary}`}>
            {t("email_content")}
          </h2>
          <p className={`text-xs ${textTertiary} mt-1`}>{subject}</p>
          <p className={`text-xs ${textTertiary}`}>{t("content_note")}</p>
        </div>

        <div className="p-5">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
            </div>
          )}

          {isError && (
            <div className="flex items-center justify-center py-16 text-center text-sm text-gray-500">
              {t("content_unavailable")}
            </div>
          )}

          {!isLoading && !isError && (
            <iframe
              title={t("email_content")}
              srcDoc={html}
              sandbox=""
              className="w-full h-[60vh] rounded-lg border border-gray-200 dark:border-gray-800 bg-white"
            />
          )}
        </div>

        <div
          className={`flex justify-end gap-2 px-5 py-4 border-t ${borderColor}`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-lg border ${borderColor} text-sm font-medium ${textPrimary} transition`}
          >
            {t("close")}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default EmailActivityContentModal;
